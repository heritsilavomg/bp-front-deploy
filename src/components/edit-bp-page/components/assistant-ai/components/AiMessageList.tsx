"use client";

import { useLayoutEffect, useRef } from "react";
import { LoaderCircle } from "lucide-react";
import type { AiMessage, AiStoredModificationProposal } from "@/types/ai";
import type { ApiError } from "../api";
import type { ProposalApplyError } from "../hooks/useAiModificationProposals";
import MessageBubble from "./MessageBubble";
import ModificationProposalCard from "./ModificationProposalCard";

type AiMessageListProps = {
    conversationId: string;
    messages: AiMessage[];
    isLoading: boolean;
    isLoadingOlder: boolean;
    hasMore: boolean;
    error: ApiError | null;
    olderError: ApiError | null;
    isSending: boolean;
    proposalsByAssistantMessageId: ReadonlyMap<string, AiStoredModificationProposal>;
    proposalError: ApiError | null;
    applyingProposalIds: ReadonlySet<string>;
    proposalApplyErrors: Record<string, ProposalApplyError>;
    onLoadOlder: () => Promise<void>;
    onRetry: () => Promise<void>;
    onRetryProposals: () => Promise<void>;
    onApplyProposal: (proposalId: string) => Promise<void>;
};

function errorMessage(error: ApiError): string {
    if (error.status === 401) return "Votre session a expiré. Veuillez vous reconnecter.";
    if (error.status === 403) return "Vous n'avez pas accès à cette conversation.";
    if (error.status === 404) return "Cette conversation est introuvable.";
    if (error.status >= 500 || error.code === "NETWORK_ERROR") return "Le service est momentanément indisponible.";
    return "Impossible de charger les messages.";
}

function proposalErrorMessage(error: ApiError): string {
    if (error.status === 401) return "Votre session a expiré. Veuillez vous reconnecter.";
    if (error.status === 403) return "Vous n'avez pas accès aux propositions de cette conversation.";
    if (error.status === 404) return "Cette conversation ou ses propositions sont introuvables.";
    if (error.status === 0 || error.code === "NETWORK_ERROR") {
        return "Le réseau est indisponible. Vérifiez votre connexion puis réessayez.";
    }
    if (error.status >= 500) return "Le serveur ne peut pas charger les propositions pour le moment.";
    return "Les propositions de modification n'ont pas pu être chargées.";
}

export default function AiMessageList({
    conversationId, messages, isLoading, isLoadingOlder,
    hasMore, error, olderError, isSending, proposalsByAssistantMessageId,
    proposalError, applyingProposalIds, proposalApplyErrors,
    onLoadOlder, onRetry, onRetryProposals, onApplyProposal,
}: AiMessageListProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const initialScrollDone = useRef(false);
    const anchor = useRef<{ top: number; height: number } | null>(null);
    const previousConversation = useRef(conversationId);
    const previousMessageCount = useRef<number | null>(null);
    const visibleMessages = messages.filter((message) => message.role !== "system");

    useLayoutEffect(() => {
        if (previousConversation.current !== conversationId || isLoading) {
            initialScrollDone.current = false;
            anchor.current = null;
            previousConversation.current = conversationId;
            previousMessageCount.current = null;
        }
        const container = containerRef.current;
        if (!container || isLoading || error) return;

        if (!initialScrollDone.current) {
            container.scrollTop = container.scrollHeight;
            initialScrollDone.current = true;
        } else if (anchor.current && !isLoadingOlder) {
            container.scrollTop = anchor.current.top + (container.scrollHeight - anchor.current.height);
            anchor.current = null;
        } else if (!isLoadingOlder && previousMessageCount.current !== null
            && (messages.length > previousMessageCount.current || isSending)) {
            container.scrollTop = container.scrollHeight;
        }
        previousMessageCount.current = messages.length;
    }, [conversationId, messages, isLoading, isLoadingOlder, error, olderError, isSending]);

    const handleLoadOlder = () => {
        const container = containerRef.current;
        if (!container || isLoading || isLoadingOlder || !hasMore || anchor.current) return;
        anchor.current = { top: container.scrollTop, height: container.scrollHeight };
        void onLoadOlder();
    };

    return (
        <section aria-label="Historique de la conversation" className="flex min-h-0 flex-1 flex-col border-t border-violet-100 dark:border-violet-900">
            <div
                ref={containerRef}
                className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-3 [overflow-anchor:none]"
            >
                {isLoading ? (
                    <div role="status" className="flex items-center gap-2 py-4 text-sm text-slate-600 dark:text-slate-300">
                        <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin text-violet-600" />
                        Chargement des messages...
                    </div>
                ) : error ? (
                    <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                        <p>{errorMessage(error)}</p>
                        <button type="button" onClick={() => { void onRetry(); }} className="mt-2 font-semibold underline">
                            Réessayer
                        </button>
                    </div>
                ) : (
                    <>
                        {hasMore && (
                            <button
                                type="button"
                                onClick={handleLoadOlder}
                                disabled={isLoadingOlder}
                                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-200"
                            >
                                {isLoadingOlder && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
                                {isLoadingOlder ? "Chargement..." : olderError ? "Réessayer les messages précédents" : "Charger les messages précédents"}
                            </button>
                        )}
                        {olderError && (
                            <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                                <p>Les messages précédents n'ont pas pu être chargés.</p>
                                <p>{errorMessage(olderError)}</p>
                            </div>
                        )}
                        {visibleMessages.length === 0 ? (
                            <p className="py-4 text-sm text-slate-600 dark:text-slate-300">
                                {hasMore ? "Aucun message visible dans cette page." : "Cette conversation est vide."}
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {visibleMessages.map((message) => {
                                    const proposal = proposalsByAssistantMessageId.get(message.id);
                                    return (
                                        <div key={message.id} className="space-y-2">
                                            <MessageBubble message={message} />
                                            {proposal && (
                                                <ModificationProposalCard
                                                    proposal={proposal}
                                                    isApplying={applyingProposalIds.has(proposal.id)}
                                                    applyDisabled={applyingProposalIds.size > 0}
                                                    applyError={proposalApplyErrors[proposal.id]}
                                                    onApply={onApplyProposal}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {proposalError && (
                            <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                                <p>{proposalErrorMessage(proposalError)}</p>
                                <button type="button" onClick={() => { void onRetryProposals(); }} className="mt-2 min-h-11 font-semibold underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500">
                                    Réessayer
                                </button>
                            </div>
                        )}
                        {isSending && (
                            <div role="status" aria-live="polite" className="flex justify-start">
                                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                    <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin text-violet-600 dark:text-violet-300" />
                                    L&apos;IA réfléchit…
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
