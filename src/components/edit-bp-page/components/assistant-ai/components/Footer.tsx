"use client";

import { ChevronRight, Info } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { AI_MODIFICATION_CAPABILITIES } from "../modificationCapabilities";

type FooterProps = {
  disabled?: boolean;
  isSending?: boolean;
  modificationMode: boolean;
  draftKey: string;
  onModificationModeChange: (enabled: boolean) => void;
  onSend: (text: string) => Promise<boolean | void>;
  onClear?: () => void;
};

export default function Footer({
  disabled = false,
  isSending = false,
  modificationMode,
  draftKey,
  onModificationModeChange,
  onSend,
  onClear,
}: FooterProps) {
  const [text, setText] = useState("");
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const tooltipContainerRef = useRef<HTMLDivElement>(null);
  const modificationModeId = useId();
  const tooltipId = useId();

  useEffect(() => setText(""), [draftKey]);

  useEffect(() => {
    if (!isTooltipOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!tooltipContainerRef.current?.contains(event.target as Node)) {
        setIsTooltipOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [isTooltipOpen]);

  async function handleSend() {
    const content = text.trim();
    if (!content || disabled || isSending) return;
    const accepted = await onSend(content);
    if (accepted !== false) setText("");
  }

  return (
    <footer className="border-t border-slate-200 bg-slate-50/90 p-3 dark:border-slate-700 dark:bg-slate-900/90">
      <div className="mb-2 flex min-h-11 items-start gap-2 rounded-xl px-2 py-1.5 text-xs text-slate-700 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-violet-500 dark:text-slate-200">
        <input
          id={modificationModeId}
          type="checkbox"
          checked={modificationMode}
          disabled={disabled || isSending}
          onChange={(event) => onModificationModeChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-violet-700 disabled:cursor-not-allowed"
        />
        <div ref={tooltipContainerRef} className="relative min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <label htmlFor={modificationModeId} className="cursor-pointer font-semibold">
              Proposer une modification
            </label>
            <button
              type="button"
              aria-label="Voir les modifications prises en charge"
              aria-describedby={tooltipId}
              onFocus={() => setIsTooltipOpen(true)}
              onBlur={() => setIsTooltipOpen(false)}
              onClick={(event) => {
                event.stopPropagation();
                setIsTooltipOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Escape") return;
                setIsTooltipOpen(false);
                event.currentTarget.blur();
              }}
              className="peer inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-violet-300"
            >
              <Info aria-hidden="true" className="h-4 w-4" />
            </button>
            <div
              id={tooltipId}
              role="tooltip"
              className={[
                "absolute bottom-full left-0 z-30 mb-2 max-h-[min(70vh,30rem)] w-[min(360px,calc(100vw-3rem))] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 text-left text-xs leading-5 text-slate-700 shadow-xl transition-opacity dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100",
                isTooltipOpen
                  ? "visible opacity-100"
                  : "invisible opacity-0 peer-hover:visible peer-hover:opacity-100 peer-focus-visible:visible peer-focus-visible:opacity-100",
              ].join(" ")}
            >
              <p className="font-semibold text-slate-900 dark:text-white">Modifications prises en charge</p>
              <p className="mt-1">Pour l&apos;instant, l&apos;IA peut proposer des modifications sur :</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                {AI_MODIFICATION_CAPABILITIES.map(({ type, label }) => (
                  <li key={type}>{label}</li>
                ))}
              </ul>
              <p className="mt-2 font-medium">
                Toute modification doit être validée avant d&apos;être appliquée.
              </p>
            </div>
          </div>
          {modificationMode && (
            <span className="mt-0.5 block text-slate-500 dark:text-slate-400">
              L&apos;IA préparera une proposition à valider avant toute modification.
            </span>
          )}
        </div>
      </div>
      <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-inner dark:border-slate-700 dark:bg-slate-800">
        <textarea
          rows={1}
          data-chat-initial-focus
          aria-label="Votre message à l'assistant IA"
          aria-busy={isSending}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
            event.preventDefault();
            void handleSend();
          }}
          disabled={disabled || isSending}
          placeholder={modificationMode
            ? "Décrivez la modification à proposer..."
            : "Posez une question à votre assistant IA..."}
          className="max-h-28 min-h-[44px] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm text-slate-700 placeholder:text-slate-500 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-400"
        />
        <button onClick={() => { void handleSend(); }} disabled={disabled || isSending || !text.trim()} type="button" aria-label="Envoyer le message" title="Envoyer le message" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-700 text-white transition hover:bg-violet-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-50">
          <ChevronRight className="h-4 w-4" />
        </button>
        <button onClick={() => { setText(""); onClear?.(); }} disabled={disabled || isSending || !text} type="button" className="ml-1 min-h-11 text-xs text-slate-600 underline dark:text-slate-300 disabled:cursor-not-allowed disabled:opacity-50">Vider</button>
      </div>
    </footer>
  );
}
