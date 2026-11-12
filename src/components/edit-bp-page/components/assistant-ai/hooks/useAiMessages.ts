"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AiMessage, AiMessagePage } from "@/types/ai";
import { ApiError, getAiMessages } from "../api";

const PAGE_SIZE = 50;

type MessageState = {
    conversationId: string | null;
    loadedConversationId: string | null;
    messages: AiMessage[];
    currentPage: number;
    hasMore: boolean;
    isLoading: boolean;
    isLoadingOlder: boolean;
    error: ApiError | null;
    olderError: ApiError | null;
};

function initialState(conversationId: string | null): MessageState {
    return {
        conversationId, loadedConversationId: null, messages: [], currentPage: 0, hasMore: false,
        isLoading: Boolean(conversationId?.trim()), isLoadingOlder: false,
        error: null, olderError: null,
    };
}

function uniqueMessages(messages: AiMessage[]): AiMessage[] {
    const seen = new Set<string>();
    return messages.filter((message) => {
        if (seen.has(message.id)) return false;
        seen.add(message.id);
        return true;
    });
}

function asApiError(error: unknown): ApiError {
    return error instanceof ApiError
        ? error
        : new ApiError(0, null, "Impossible de charger les messages.", "UNEXPECTED_ERROR");
}

export default function useAiMessages(conversationId: string | null) {
    const [state, setState] = useState(() => initialState(conversationId));
    const generation = useRef(0);
    const mounted = useRef(false);
    const cursor = useRef<{ conversationId: string | null; page: number; hasMore: boolean }>({
        conversationId: null, page: 0, hasMore: false,
    });
    const pending = useRef<{
        conversationId: string;
        page: number;
        promise: Promise<AiMessagePage>;
    } | null>(null);

    const reloadMessages = useCallback(async (): Promise<void> => {
        if (!mounted.current || !conversationId?.trim()) return;
        const requestGeneration = generation.current;
        // Reuse only an in-flight page 0 (including Strict Mode's effect replay).
        // A reload supersedes any older-page request.
        const request = pending.current?.conversationId === conversationId && pending.current.page === 0
            ? pending.current
            : { conversationId, page: 0, promise: getAiMessages(conversationId, 0, PAGE_SIZE) };
        pending.current = request;
        cursor.current = { conversationId, page: 0, hasMore: false };
        setState(initialState(conversationId));
        const isCurrent = () => mounted.current && generation.current === requestGeneration && pending.current === request;

        try {
            const page = await request.promise;
            if (!isCurrent()) return;
            cursor.current = { conversationId, page: page.page, hasMore: page.hasMore };
            setState((current) => ({
                ...current, messages: uniqueMessages(page.messages),
                loadedConversationId: conversationId,
                currentPage: page.page, hasMore: page.hasMore,
            }));
        } catch (error) {
            if (isCurrent()) setState((current) => ({ ...current, error: asApiError(error) }));
        } finally {
            if (isCurrent()) {
                pending.current = null;
                setState((current) => ({ ...current, isLoading: false }));
            }
        }
    }, [conversationId]);

    useEffect(() => {
        mounted.current = true;
        generation.current += 1;
        cursor.current = { conversationId, page: 0, hasMore: false };
        if (pending.current?.conversationId !== conversationId) pending.current = null;
        setState(initialState(conversationId));
        void reloadMessages();

        return () => {
            mounted.current = false;
            generation.current += 1;
        };
    }, [conversationId, reloadMessages]);

    const loadOlderMessages = useCallback(async (): Promise<void> => {
        if (!mounted.current || !conversationId?.trim() || pending.current
            || cursor.current.conversationId !== conversationId || !cursor.current.hasMore) return;
        const requestGeneration = generation.current;
        // Page index increases toward older history; each page is already chronological.
        const nextPage = cursor.current.page + 1;
        const request = {
            conversationId, page: nextPage,
            promise: getAiMessages(conversationId, nextPage, PAGE_SIZE),
        };
        pending.current = request;
        setState((current) => ({ ...current, isLoadingOlder: true, olderError: null }));
        const isCurrent = () => mounted.current && generation.current === requestGeneration && pending.current === request;

        try {
            const page = await request.promise;
            if (!isCurrent()) return;
            cursor.current = { conversationId, page: page.page, hasMore: page.hasMore };
            setState((current) => ({
                ...current,
                messages: uniqueMessages([...page.messages, ...current.messages]),
                currentPage: page.page, hasMore: page.hasMore,
            }));
        } catch (error) {
            // Leave the loaded messages and cursor intact so retry requests the same page.
            if (isCurrent()) setState((current) => ({ ...current, olderError: asApiError(error) }));
        } finally {
            if (isCurrent()) {
                pending.current = null;
                setState((current) => ({ ...current, isLoadingOlder: false }));
            }
        }
    }, [conversationId]);

    const appendMessage = useCallback((message: AiMessage): boolean => {
        if (!conversationId?.trim() || !message.id.trim()) return false;
        setState((currentState) => currentState.conversationId === conversationId
            ? { ...currentState, messages: uniqueMessages([...currentState.messages, message]) }
            : currentState);
        return true;
    }, [conversationId]);

    const current = state.conversationId === conversationId ? state : initialState(conversationId);
    return {
        conversationId: current.conversationId,
        loadedConversationId: current.loadedConversationId,
        isReady: Boolean(conversationId && current.loadedConversationId === conversationId
            && !current.isLoading && !current.error),
        messages: current.messages,
        currentPage: current.currentPage,
        hasMore: current.hasMore,
        isLoading: current.isLoading,
        isLoadingOlder: current.isLoadingOlder,
        error: current.error,
        olderError: current.olderError,
        appendMessage,
        reloadMessages,
        loadOlderMessages,
    };
}
