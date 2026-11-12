"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AiConversation } from "@/types/ai";
import {
    ApiError,
    createAiConversation,
    deleteAiConversation,
    getAiConversations,
    updateAiConversationTitle,
} from "../api";

type ConversationState = {
    businessPlanId: string;
    conversations: AiConversation[];
    activeConversationId: string | null;
    isLoading: boolean;
    isCreating: boolean;
    renamingConversationId: string | null;
    deletingConversationId: string | null;
    error: ApiError | null;
};

function initialState(businessPlanId: string): ConversationState {
    return {
        businessPlanId,
        conversations: [],
        activeConversationId: null,
        isLoading: Boolean(businessPlanId.trim()),
        isCreating: false,
        renamingConversationId: null,
        deletingConversationId: null,
        error: null,
    };
}

function byMostRecentlyUpdated(conversations: AiConversation[]): AiConversation[] {
    return [...conversations].sort((first, second) => {
        const firstTime = Date.parse(first.updatedAt);
        const secondTime = Date.parse(second.updatedAt);
        if (Number.isNaN(firstTime) || Number.isNaN(secondTime)) return 0;
        return secondTime - firstTime;
    });
}

function asApiError(error: unknown): ApiError {
    return error instanceof ApiError
        ? error
        : new ApiError(0, null, "Impossible de gérer les conversations.", "UNEXPECTED_ERROR");
}

export default function useAiConversations(businessPlanId: string) {
    const [state, setState] = useState(() => initialState(businessPlanId));
    const generation = useRef(0);
    const mounted = useRef(false);
    const pendingLoad = useRef<{
        businessPlanId: string;
        promise: Promise<AiConversation[]>;
    } | null>(null);
    const pendingCreation = useRef<object | null>(null);

    const reloadConversations = useCallback(async (): Promise<void> => {
        if (!mounted.current || !businessPlanId.trim() || pendingCreation.current) return;
        const requestGeneration = generation.current;
        // Share an in-flight GET, including during Strict Mode's effect replay.
        const request = pendingLoad.current?.businessPlanId === businessPlanId
            ? pendingLoad.current
            : { businessPlanId, promise: getAiConversations(businessPlanId) };
        pendingLoad.current = request;
        setState((current) => ({ ...current, isLoading: true, error: null }));

        try {
            const conversations = await request.promise;
            if (!mounted.current || generation.current !== requestGeneration) return;
            setState((current) => ({
                ...current,
                conversations,
                activeConversationId: conversations.some((item) => item.id === current.activeConversationId)
                    ? current.activeConversationId
                    : conversations[0]?.id ?? null,
                error: null,
            }));
        } catch (error) {
            if (!mounted.current || generation.current !== requestGeneration) return;
            setState((current) => ({ ...current, error: asApiError(error) }));
        } finally {
            if (pendingLoad.current === request) pendingLoad.current = null;
            if (mounted.current && generation.current === requestGeneration) {
                setState((current) => ({ ...current, isLoading: false }));
            }
        }
    }, [businessPlanId]);

    useEffect(() => {
        mounted.current = true;
        generation.current += 1;
        pendingCreation.current = null;
        setState(initialState(businessPlanId));
        void reloadConversations();

        return () => {
            mounted.current = false;
            generation.current += 1;
        };
    }, [businessPlanId, reloadConversations]);

    const createConversation = useCallback(async (): Promise<AiConversation | null> => {
        // Ref-based lock also protects two clicks before React has re-rendered.
        // Serialize GET/POST so an older list cannot erase a newly created conversation.
        if (!mounted.current || !businessPlanId.trim() || pendingCreation.current
            || pendingLoad.current?.businessPlanId === businessPlanId) return null;
        const requestGeneration = generation.current;
        const request = {};
        pendingCreation.current = request;
        setState((current) => ({ ...current, isCreating: true, error: null }));

        try {
            const conversation = await createAiConversation(businessPlanId);
            if (!mounted.current || generation.current !== requestGeneration) return null;
            setState((current) => ({
                ...current,
                conversations: [conversation, ...current.conversations.filter((item) => item.id !== conversation.id)],
                activeConversationId: conversation.id,
                error: null,
            }));
            return conversation;
        } catch (error) {
            if (mounted.current && generation.current === requestGeneration) {
                setState((current) => ({ ...current, error: asApiError(error) }));
            }
            return null;
        } finally {
            if (pendingCreation.current === request) pendingCreation.current = null;
            if (mounted.current && generation.current === requestGeneration) {
                setState((current) => ({ ...current, isCreating: false }));
            }
        }
    }, [businessPlanId]);

    const selectConversation = useCallback((conversationId: string) => {
        setState((current) => current.businessPlanId === businessPlanId
            && current.conversations.some((item) => item.id === conversationId)
            ? { ...current, activeConversationId: conversationId }
            : current);
    }, [businessPlanId]);

    const clearActiveConversation = useCallback(() => {
        setState((current) => current.businessPlanId === businessPlanId
            ? { ...current, activeConversationId: null }
            : current);
    }, [businessPlanId]);

    const renameConversation = useCallback(async (conversationId: string, title: string): Promise<AiConversation> => {
        if (!businessPlanId.trim()) {
            throw new ApiError(0, null, "BusinessPlanId ne doit pas etre vide.", "INVALID_ARGUMENT");
        }
        const requestGeneration = generation.current;
        setState((current) => current.businessPlanId === businessPlanId
            ? { ...current, renamingConversationId: conversationId }
            : current);
        try {
            const conversation = await updateAiConversationTitle(conversationId, title);
            if (mounted.current && generation.current === requestGeneration) {
                setState((current) => current.businessPlanId === businessPlanId
                    ? {
                        ...current,
                        conversations: byMostRecentlyUpdated([
                            conversation,
                            ...current.conversations.filter((item) => item.id !== conversation.id),
                        ]),
                    }
                    : current);
            }
            return conversation;
        } finally {
            if (mounted.current && generation.current === requestGeneration) {
                setState((current) => current.businessPlanId === businessPlanId
                    ? { ...current, renamingConversationId: null }
                    : current);
            }
        }
    }, [businessPlanId]);

    const deleteConversation = useCallback(async (conversationId: string): Promise<void> => {
        if (!businessPlanId.trim()) {
            throw new ApiError(0, null, "BusinessPlanId ne doit pas etre vide.", "INVALID_ARGUMENT");
        }
        const requestGeneration = generation.current;
        setState((current) => current.businessPlanId === businessPlanId
            ? { ...current, deletingConversationId: conversationId }
            : current);
        try {
            await deleteAiConversation(conversationId);
            if (mounted.current && generation.current === requestGeneration) {
                setState((current) => current.businessPlanId === businessPlanId
                    ? {
                        ...current,
                        conversations: current.conversations.filter((item) => item.id !== conversationId),
                        activeConversationId: current.activeConversationId === conversationId
                            ? null
                            : current.activeConversationId,
                    }
                    : current);
            }
        } finally {
            if (mounted.current && generation.current === requestGeneration) {
                setState((current) => current.businessPlanId === businessPlanId
                    ? { ...current, deletingConversationId: null }
                    : current);
            }
        }
    }, [businessPlanId]);

    // Never expose the previous BP, even on the render before effect cleanup/reset.
    const current = state.businessPlanId === businessPlanId ? state : initialState(businessPlanId);
    return {
        conversations: current.conversations,
        activeConversationId: current.activeConversationId,
        activeConversation: current.conversations.find((item) => item.id === current.activeConversationId) ?? null,
        isLoading: current.isLoading,
        isCreating: current.isCreating,
        renamingConversationId: current.renamingConversationId,
        deletingConversationId: current.deletingConversationId,
        error: current.error,
        reloadConversations,
        createConversation,
        selectConversation,
        clearActiveConversation,
        renameConversation,
        deleteConversation,
    };
}
