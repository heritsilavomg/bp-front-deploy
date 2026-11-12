"use client";

import { ArrowLeft, Bot, Minimize2, Plus, Sparkles, X } from "lucide-react";

type HeaderProps = {
  expanded?: boolean;
  onClose?: () => void;
  onToggleExpanded?: () => void;
  onToggleMinimize?: () => void;
  conversationTitle?: string | null;
  onBack?: () => void;
};

export default function Header({
  expanded = false, onClose, onToggleExpanded, onToggleMinimize, conversationTitle, onBack,
}: HeaderProps) {
  return (
    <header className="border-b border-violet-100 bg-gradient-to-r from-violet-700 to-violet-600 px-4 py-3 text-white">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
            <Bot className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-base font-bold">Assistant IA</div>
            <div className="flex items-center gap-1.5 text-[11px] text-violet-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Prêt à vous aider
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button type="button" aria-label={expanded ? "Réduire la fenêtre" : "Agrandir la fenêtre"} title={expanded ? "Réduire la fenêtre" : "Agrandir la fenêtre"} onClick={onToggleExpanded} className="cursor-pointer inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
          <button type="button" aria-label="Réduire" title="Réduire" onClick={onToggleMinimize} className="cursor-pointer inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <Sparkles className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Fermer" title="Fermer" onClick={onClose} className="cursor-pointer inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      {onBack && (
        <div className="mt-2 flex min-w-0 items-center gap-2 border-t border-white/15 pt-2">
          <button type="button" onClick={onBack} aria-label="Retour aux conversations" title="Retour aux conversations" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <ArrowLeft aria-hidden="true" className="h-5 w-5" />
          </button>
          <p className="min-w-0 truncate text-sm font-semibold" title={conversationTitle ?? undefined}>
            {conversationTitle?.trim() || "Nouvelle conversation"}
          </p>
        </div>
      )}
    </header>
  );
}
