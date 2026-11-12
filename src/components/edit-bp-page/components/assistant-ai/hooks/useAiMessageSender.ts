"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AiConversation, AiMessage, AiModificationRequestResult } from "@/types/ai";
import { ApiError, sendAiMessage } from "../api";

type MessagesApi = {
    conversationId: string | null;
    isReady: boolean;
    isLoading: boolean;
    error: ApiError | null;
    appendMessage: (message: AiMessage) => boolean;
    reloadMessages: () => Promise<void>;
};

type UseAiMessageSenderOptions = {
    businessPlanId: string;
    activeConversationId: string | null;
    beforeSend: () => Promise<void>;
    createConversation: () => Promise<AiConversation | null>;
    reloadConversations: () => Promise<void>;
    messages: MessagesApi;
    modificationMode: boolean;
    modificationProposals: {
        conversationId: string | null;
        createProposal: (content: string) => Promise<AiModificationRequestResult>;
        reloadProposals: () => Promise<void>;
    };
};

type PendingInitialSend = {
    conversationId: string;
    content: string;
    modificationMode: boolean;
    resolve: (accepted: boolean) => void;
};

function localMessageId(): string {
    const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return `local-user-${id}`;
}

function sendErrorMessage(error: unknown, modificationMode: boolean): string {
    if (error instanceof ApiError) {
        if (error.status === 401) return "Votre session a expiré. Reconnectez-vous pour continuer.";
        if (error.status === 403) return "Vous n'avez pas accès à cette conversation.";
        if (error.status === 404) return "Cette conversation est introuvable.";
        if (error.status === 0 || error.code === "NETWORK_ERROR") {
            return "Le réseau est indisponible. Vérifiez votre connexion puis réessayez.";
        }
        if (error.status >= 500) {
            return modificationMode
                ? "Impossible de générer une proposition pour le moment."
                : "Impossible d'obtenir une réponse de l'assistant pour le moment.";
        }
    }
    return modificationMode
        ? "Impossible de générer la proposition. L'historique a été resynchronisé."
        : "Impossible d'obtenir une réponse de l'assistant. L'historique a été resynchronisé.";
}

export default function useAiMessageSender({
    businessPlanId, activeConversationId, beforeSend, createConversation,
    reloadConversations, messages, modificationMode, modificationProposals,
}: UseAiMessageSenderOptions) {
    const [isSending, setIsSending] = useState(false);
    const [isPreparing, setIsPreparing] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const mounted = useRef(false);
    const generation = useRef(0);
    const sendLock = useRef(false);
    const pendingInitialSend = useRef<PendingInitialSend | null>(null);
    const latest = useRef({
        activeConversationId, messages, reloadConversations, modificationMode, modificationProposals,
    });
    latest.current = {
        activeConversationId, messages, reloadConversations, modificationMode, modificationProposals,
    };

    useEffect(() => {
        mounted.current = true;
        generation.current += 1;
        setIsSending(false);
        setIsPreparing(false);
        setSendError(null);

        return () => {
            mounted.current = false;
            generation.current += 1;
            sendLock.current = false;
            pendingInitialSend.current?.resolve(false);
            pendingInitialSend.current = null;
        };
    }, [businessPlanId]);

    const finish = useCallback((requestGeneration: number) => {
        if (!mounted.current || generation.current !== requestGeneration) return;
        sendLock.current = false;
        setIsSending(false);
        setIsPreparing(false);
    }, []);

    const startRequest = useCallback((
        conversationId: string,
        content: string,
        requestModificationMode: boolean,
    ): boolean => {
        const requestGeneration = generation.current;
        const current = latest.current;
        if (!mounted.current || current.activeConversationId !== conversationId
            || !current.messages.isReady || current.messages.conversationId !== conversationId
            || (requestModificationMode
                && current.modificationProposals.conversationId !== conversationId)) return false;

        setSendError(null);
        if (!current.messages.appendMessage({
            id: localMessageId(), role: "user", content, createdAt: new Date().toISOString(),
        })) return false;
        setIsPreparing(false);
        setIsSending(true);

        void (async () => {
            try {
                if (requestModificationMode) {
                    await latest.current.modificationProposals.createProposal(content);
                } else {
                    const assistantMessage = await sendAiMessage(conversationId, content);
                    const latestState = latest.current;
                    if (!mounted.current || generation.current !== requestGeneration
                        || latestState.activeConversationId !== conversationId
                        || latestState.messages.conversationId !== conversationId) return;
                    latestState.messages.appendMessage(assistantMessage);
                }
                const latestState = latest.current;
                if (!mounted.current || generation.current !== requestGeneration
                    || latestState.activeConversationId !== conversationId
                    || latestState.messages.conversationId !== conversationId) return;
                if (requestModificationMode) {
                    await Promise.all([
                        latestState.messages.reloadMessages(),
                        latestState.modificationProposals.reloadProposals(),
                    ]);
                }
                await latestState.reloadConversations();
            } catch (error) {
                const latestState = latest.current;
                if (!mounted.current || generation.current !== requestGeneration
                    || latestState.activeConversationId !== conversationId
                    || latestState.messages.conversationId !== conversationId) return;
                // The backend may have saved USER before xAI failed, so its history
                // is the only safe source of truth after a failed request.
                await latestState.messages.reloadMessages();
                if (requestModificationMode) {
                    await latestState.modificationProposals.reloadProposals();
                }
                await latestState.reloadConversations();
                if (mounted.current && generation.current === requestGeneration) {
                    setSendError(sendErrorMessage(error, requestModificationMode));
                }
            } finally {
                finish(requestGeneration);
            }
        })();

        return true;
    }, [finish]);

    useEffect(() => {
        const pending = pendingInitialSend.current;
        if (!pending || activeConversationId !== pending.conversationId) return;

        if (messages.isReady && messages.conversationId === pending.conversationId) {
            pendingInitialSend.current = null;
            pending.resolve(startRequest(
                pending.conversationId,
                pending.content,
                pending.modificationMode,
            ));
        } else if (!messages.isLoading && messages.error) {
            pendingInitialSend.current = null;
            setSendError("Impossible de préparer la nouvelle conversation. Réessayez avant d'envoyer votre message.");
            finish(generation.current);
            pending.resolve(false);
        }
    }, [activeConversationId, finish, messages.conversationId, messages.error, messages.isLoading, messages.isReady, startRequest]);

    const sendMessage = useCallback(async (rawContent: string): Promise<boolean> => {
        const content = rawContent.trim();
        if (!content || sendLock.current) return false;
        sendLock.current = true;
        setIsPreparing(true);
        setSendError(null);
        const requestModificationMode = latest.current.modificationMode;

        try {
            await beforeSend();
        } catch {
            if (mounted.current) {
                setSendError("Impossible d'enregistrer les dernières modifications du Business Plan. Réessayez avant d'envoyer votre message.");
            }
            finish(generation.current);
            return false;
        }

        const currentConversationId = latest.current.activeConversationId;
        if (currentConversationId) {
            const accepted = startRequest(currentConversationId, content, requestModificationMode);
            if (!accepted) {
                setSendError("La conversation n'est pas encore prête. Réessayez dans un instant.");
                finish(generation.current);
            }
            return accepted;
        }

        const conversation = await createConversation();
        if (!conversation) {
            if (mounted.current) setSendError("Impossible de créer une conversation. Réessayez avant d'envoyer votre message.");
            finish(generation.current);
            return false;
        }

        return new Promise<boolean>((resolve) => {
            pendingInitialSend.current = {
                conversationId: conversation.id,
                content,
                modificationMode: requestModificationMode,
                resolve,
            };
        });
    }, [beforeSend, createConversation, finish, startRequest]);

    return { isSending, isPreparing, sendError, sendMessage };
}
