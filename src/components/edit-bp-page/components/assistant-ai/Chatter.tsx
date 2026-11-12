"use client";

import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import InfoBar from "./components/InfoBar";
import Footer from "./components/Footer";
import AiConversationList from "./components/AiConversationList";
import AiMessageList from "./components/AiMessageList";
import useAiConversations from "./hooks/useAiConversations";
import useAiMessages from "./hooks/useAiMessages";
import useAiMessageSender from "./hooks/useAiMessageSender";
import useAiModificationProposals from "./hooks/useAiModificationProposals";
import type { ApiError } from "./api";
import type { AiStoredModificationProposal } from "@/types/ai";

type ChatView = "conversations" | "messages";

type ChatterProps = {
  open?: boolean;
  expanded?: boolean;
  minimized?: boolean;
  onClose?: () => void;
  onToggleExpanded?: () => void;
  onToggleMinimize?: () => void;
  bpId: string;
  projectName?: string | null;
  beforeAiSend?: () => Promise<void>;
  beforeProposalApply?: () => Promise<void>;
  onProposalApplied?: (proposal: AiStoredModificationProposal) => Promise<void>;
  onProposalApplySettled?: () => void;
};

function conversationErrorMessage(error: ApiError | null): string | null {
  if (!error) return null;
  if (error.status === 401) return "Votre session a expiré. Veuillez vous reconnecter.";
  if (error.status === 403) return "Vous n'avez pas accès à ces conversations.";
  if (error.status === 404) return "Le Business Plan ou la conversation est introuvable.";
  if (error.status >= 500 || error.code === "NETWORK_ERROR") {
    return "Le service est momentanément indisponible. Veuillez réessayer.";
  }
  return "Impossible de charger les conversations. Veuillez réessayer.";
}

export default function Chatter({
  open = false,
  expanded = false,
  minimized = false,
  onClose,
  onToggleExpanded,
  onToggleMinimize,
  bpId,
  projectName,
  beforeAiSend = async () => undefined,
  beforeProposalApply = async () => undefined,
  onProposalApplied = async () => undefined,
  onProposalApplySettled = () => undefined,
}: ChatterProps) {
  const [view, setView] = useState<ChatView>("conversations");
  const [modificationMode, setModificationMode] = useState(false);
  const {
    conversations, activeConversation, activeConversationId,
    isLoading, isCreating, renamingConversationId, deletingConversationId, error,
    reloadConversations, createConversation, selectConversation, clearActiveConversation,
    renameConversation, deleteConversation,
  } = useAiConversations(bpId);
  const history = useAiMessages(activeConversationId);
  const modificationProposals = useAiModificationProposals(activeConversationId, {
    beforeApply: beforeProposalApply,
    onApplied: onProposalApplied,
    onApplySettled: onProposalApplySettled,
  });
  const { isSending, isPreparing, sendError, sendMessage } = useAiMessageSender({
    businessPlanId: bpId,
    activeConversationId,
    beforeSend: beforeAiSend,
    createConversation,
    reloadConversations,
    messages: history,
    modificationMode,
    modificationProposals: {
      conversationId: activeConversationId,
      createProposal: modificationProposals.createProposal,
      reloadProposals: modificationProposals.reloadProposals,
    },
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const wasVisible = useRef(false);
  const isApplyingProposal = modificationProposals.applyingProposalIds.size > 0;
  const isBusy = isSending || isPreparing || isCreating || isApplyingProposal;
  const inputDisabled = isBusy || isLoading || Boolean(error)
    || Boolean(activeConversation && !history.isReady);

  useEffect(() => {
    setView("conversations");
    setModificationMode(false);
  }, [bpId]);

  useEffect(() => {
    if (!open || minimized) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.isComposing) onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [minimized, onClose, open]);

  useEffect(() => {
    const visible = open && !minimized;
    if (visible && !wasVisible.current) {
      const frame = window.requestAnimationFrame(() => {
        const panel = panelRef.current;
        const target = panel?.querySelector<HTMLTextAreaElement>("textarea:not(:disabled)")
          ?? panel?.querySelector<HTMLButtonElement>("[data-chat-initial-focus]:not(:disabled)");
        target?.focus();
      });
      wasVisible.current = true;
      return () => window.cancelAnimationFrame(frame);
    }
    wasVisible.current = visible;
  }, [minimized, open]);

  const openConversation = (conversationId: string) => {
    if (isBusy) return;
    selectConversation(conversationId);
    setView("messages");
  };

  const startNewConversation = () => {
    if (isBusy) return;
    clearActiveConversation();
    setView("messages");
  };

  return (
    <div
      ref={panelRef}
      hidden={!open || minimized}
      role="dialog"
      aria-label="Assistant IA"
      className={[
        "fixed inset-0 z-50 overflow-hidden border border-violet-200/60 bg-white/95 shadow-[0_20px_55px_rgba(79,42,143,0.18)] backdrop-blur-md transition-all duration-300 motion-reduce:transition-none dark:border-violet-700/70 dark:bg-slate-900/95 sm:bottom-5 sm:right-5 sm:left-auto sm:top-auto",
        expanded
          ? "h-[100dvh] w-screen rounded-none sm:h-[90dvh] sm:w-[min(92vw,1100px)] sm:rounded-[30px]"
          : "h-[100dvh] w-screen rounded-none sm:h-[72vh] sm:min-h-[420px] sm:w-[min(92vw,460px)] sm:rounded-[28px] sm:h-[680px]",
      ].join(" ")}
    >
      <div className="flex h-full flex-col">
        <Header
          expanded={expanded}
          onClose={onClose}
          onToggleExpanded={onToggleExpanded}
          onToggleMinimize={onToggleMinimize}
          conversationTitle={view === "messages" ? activeConversation?.title : null}
          onBack={view === "messages" && !isBusy ? () => setView("conversations") : undefined}
        />
        <InfoBar projectName={projectName} />

        {view === "conversations" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white/80 px-4 py-3 dark:bg-slate-900/80">
            <AiConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              isLoading={isLoading}
              disabled={isBusy}
              renamingConversationId={renamingConversationId}
              deletingConversationId={deletingConversationId}
              errorMessage={conversationErrorMessage(error)}
              onSelect={openConversation}
              onNewConversation={startNewConversation}
              onRetry={() => { void reloadConversations(); }}
              onRename={renameConversation}
              onDelete={deleteConversation}
            />
          </div>
        ) : (
          <>
            {activeConversation ? (
              <AiMessageList
                key={activeConversation.id}
                conversationId={activeConversation.id}
                messages={history.messages}
                isLoading={history.isLoading}
                isLoadingOlder={history.isLoadingOlder}
                hasMore={history.hasMore}
                error={history.error}
                olderError={history.olderError}
                isSending={isSending}
                proposalsByAssistantMessageId={modificationProposals.proposalsByAssistantMessageId}
                proposalError={modificationProposals.error}
                applyingProposalIds={modificationProposals.applyingProposalIds}
                proposalApplyErrors={modificationProposals.applyErrors}
                onLoadOlder={history.loadOlderMessages}
                onRetry={history.reloadMessages}
                onRetryProposals={modificationProposals.reloadProposals}
                onApplyProposal={modificationProposals.applyProposal}
              />
            ) : (
              <section aria-label="Nouvelle conversation" className="flex min-h-0 flex-1 flex-col justify-center px-6 text-center">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Comment puis-je vous aider ?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Posez une question sur votre Business Plan. Une conversation sera créée à votre premier envoi.
                </p>
              </section>
            )}

            {sendError && <p role="alert" className="mx-4 mb-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">{sendError}</p>}
            <Footer
              disabled={inputDisabled}
              isSending={isSending}
              modificationMode={modificationMode}
              draftKey={`${bpId}:${activeConversationId ?? "new"}`}
              onModificationModeChange={setModificationMode}
              onSend={sendMessage}
            />
          </>
        )}
      </div>
    </div>
  );
}
