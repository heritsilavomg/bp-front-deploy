"use client";

import { applyConfirmedProposal } from "@/lib/applyConfirmedProposal";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
    AiModificationRequestResult,
    AiStoredModificationProposal,
} from "@/types/ai";
import {
    ApiError,
    applyAiModificationProposal,
    createAiModificationProposal,
    listAiModificationProposals,
} from "../api";

export type ProposalApplyError = {
    message: string;
    terminal: boolean;
};

type ProposalState = {
    conversationId: string | null;
    proposals: AiStoredModificationProposal[];
    isLoading: boolean;
    error: ApiError | null;
    applyingProposalIds: Set<string>;
    applyErrors: Record<string, ProposalApplyError>;
};

type UseAiModificationProposalsOptions = {
    beforeApply: () => Promise<void>;
    onApplied: (proposal: AiStoredModificationProposal) => Promise<void>;
    onApplySettled: () => void;
};

function initialState(conversationId: string | null): ProposalState {
    return {
        conversationId,
        proposals: [],
        isLoading: Boolean(conversationId?.trim()),
        error: null,
        applyingProposalIds: new Set(),
        applyErrors: {},
    };
}

function asApiError(error: unknown): ApiError {
    return error instanceof ApiError
        ? error
        : new ApiError(0, null, "Impossible de charger les propositions.", "UNEXPECTED_ERROR");
}

function applyError(error: unknown, phase: "flush" | "apply" | "refresh"): ProposalApplyError {
    if (phase === "flush") {
        return {
            message: "Impossible d'enregistrer les modifications en attente. La proposition n'a pas été appliquée.",
            terminal: false,
        };
    }
    if (phase === "refresh") {
        return {
            message: "La modification a été appliquée, mais le Business Plan n'a pas pu être rechargé. Rechargez la page.",
            terminal: true,
        };
    }
    if (error instanceof ApiError) {
        if (error.status === 401 || error.status === 403) {
            return { message: "Votre session ou vos droits ne permettent pas cette action.", terminal: false };
        }
        if (error.status === 404) {
            return { message: "Cette proposition ou sa conversation est introuvable.", terminal: true };
        }
        if (error.status === 409) {
            return {
                message: "Cette proposition n'est plus applicable : elle a expiré, a été rejetée ou le Business Plan a changé. Générez une nouvelle proposition pour utiliser les données actuelles.",
                terminal: true,
            };
        }
        if (error.status >= 500) {
            return { message: "Le serveur n'a pas pu appliquer cette proposition. Réessayez plus tard.", terminal: false };
        }
        if (error.status === 0 || error.code === "NETWORK_ERROR") {
            return { message: "Le réseau est indisponible. Vérifiez votre connexion puis réessayez.", terminal: false };
        }
    }
    return { message: "La proposition n'a pas pu être appliquée.", terminal: false };
}

function replaceProposal(
    proposals: AiStoredModificationProposal[],
    proposal: AiStoredModificationProposal,
): AiStoredModificationProposal[] {
    return [proposal, ...proposals.filter((item) => item.id !== proposal.id)]
        .sort((first, second) => Date.parse(first.createdAt) - Date.parse(second.createdAt));
}

export default function useAiModificationProposals(
    conversationId: string | null,
    { beforeApply, onApplied, onApplySettled }: UseAiModificationProposalsOptions,
) {
    const [state, setState] = useState(() => initialState(conversationId));
    const mounted = useRef(false);
    const generation = useRef(0);
    const pendingLoad = useRef<{
        conversationId: string;
        promise: Promise<AiStoredModificationProposal[]>;
    } | null>(null);
    const applyLocks = useRef(new Set<string>());

    const reloadProposals = useCallback(async (): Promise<void> => {
        if (!mounted.current || !conversationId?.trim()) return;
        const requestGeneration = generation.current;
        const request = pendingLoad.current?.conversationId === conversationId
            ? pendingLoad.current
            : { conversationId, promise: listAiModificationProposals(conversationId) };
        pendingLoad.current = request;
        setState((current) => current.conversationId === conversationId
            ? { ...current, isLoading: true, error: null }
            : current);

        try {
            const proposals = await request.promise;
            if (!mounted.current || generation.current !== requestGeneration) return;
            setState((current) => current.conversationId === conversationId
                ? { ...current, proposals, error: null }
                : current);
        } catch (error) {
            if (!mounted.current || generation.current !== requestGeneration) return;
            setState((current) => current.conversationId === conversationId
                ? { ...current, error: asApiError(error) }
                : current);
        } finally {
            if (pendingLoad.current === request) pendingLoad.current = null;
            if (mounted.current && generation.current === requestGeneration) {
                setState((current) => current.conversationId === conversationId
                    ? { ...current, isLoading: false }
                    : current);
            }
        }
    }, [conversationId]);

    useEffect(() => {
        mounted.current = true;
        generation.current += 1;
        applyLocks.current.clear();
        if (pendingLoad.current?.conversationId !== conversationId) pendingLoad.current = null;
        setState(initialState(conversationId));
        void reloadProposals();

        return () => {
            mounted.current = false;
            generation.current += 1;
            applyLocks.current.clear();
        };
    }, [conversationId, reloadProposals]);

    const createProposal = useCallback(async (content: string): Promise<AiModificationRequestResult> => {
        if (!conversationId?.trim()) {
            throw new ApiError(0, null, "La conversation n'est pas prête.", "INVALID_ARGUMENT");
        }
        const requestGeneration = generation.current;
        const result = await createAiModificationProposal(conversationId, content);
        if (mounted.current && generation.current === requestGeneration && result.proposal) {
            setState((current) => current.conversationId === conversationId
                ? { ...current, proposals: replaceProposal(current.proposals, result.proposal!) }
                : current);
        }
        return result;
    }, [conversationId]);

    const applyProposal = useCallback(async (proposalId: string): Promise<void> => {
        if (!conversationId?.trim() || applyLocks.current.has(proposalId)) return;
        const requestGeneration = generation.current;
        applyLocks.current.add(proposalId);
        setState((current) => current.conversationId === conversationId
            ? {
                ...current,
                applyingProposalIds: new Set(current.applyingProposalIds).add(proposalId),
                applyErrors: Object.fromEntries(
                    Object.entries(current.applyErrors).filter(([id]) => id !== proposalId),
                ),
            }
            : current);

        const progress: { phase: "flush" | "apply" | "refresh" } = { phase: "flush" };
        try {
            await applyConfirmedProposal({
                flush: beforeApply,
                apply: () => applyAiModificationProposal(proposalId),
                isCurrent: () => mounted.current && generation.current === requestGeneration,
                remember: proposal => setState(current => current.conversationId === conversationId
                    ? { ...current, proposals: replaceProposal(current.proposals, proposal) } : current),
                reload: onApplied,
                phase: next => { progress.phase = next; },
            });
        } catch (error) {
            if (!mounted.current || generation.current !== requestGeneration) return;
            const displayError = applyError(error, progress.phase);
            if (progress.phase === "apply" && error instanceof ApiError && error.status === 409) {
                await reloadProposals();
            }
            if (mounted.current && generation.current === requestGeneration) {
                setState((current) => current.conversationId === conversationId
                    ? {
                        ...current,
                        applyErrors: { ...current.applyErrors, [proposalId]: displayError },
                    }
                    : current);
            }
        } finally {
            applyLocks.current.delete(proposalId);
            onApplySettled();
            if (mounted.current && generation.current === requestGeneration) {
                setState((current) => {
                    if (current.conversationId !== conversationId) return current;
                    const applyingProposalIds = new Set(current.applyingProposalIds);
                    applyingProposalIds.delete(proposalId);
                    return { ...current, applyingProposalIds };
                });
            }
        }
    }, [beforeApply, conversationId, onApplied, onApplySettled, reloadProposals]);

    const current = state.conversationId === conversationId ? state : initialState(conversationId);
    const proposalsByAssistantMessageId = useMemo(() => {
        const entries = current.proposals
            .filter((proposal) => Boolean(proposal.assistantMessageId?.trim()))
            .map((proposal) => [proposal.assistantMessageId!, proposal] as const);
        return new Map(entries);
    }, [current.proposals]);

    return {
        proposals: current.proposals,
        proposalsByAssistantMessageId,
        isLoading: current.isLoading,
        error: current.error,
        applyingProposalIds: current.applyingProposalIds,
        applyErrors: current.applyErrors,
        reloadProposals,
        createProposal,
        applyProposal,
    };
}
