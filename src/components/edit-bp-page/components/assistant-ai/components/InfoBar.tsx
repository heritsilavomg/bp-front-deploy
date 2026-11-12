"use client";

import { MessageSquareText } from "lucide-react";

type InfoBarProps = {
  projectName?: string | null;
};

export default function InfoBar({ projectName }: InfoBarProps) {
  return (
    <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800/80">
      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-200">
          <MessageSquareText className="h-3.5 w-3.5" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Business Plan</div>
          <div className="font-semibold text-slate-800 dark:text-slate-100">{projectName?.trim() || "Projet en cours"}</div>
        </div>
      </div>
    </div>
  );
}
