"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import { cn } from "@/lib/utils";
import { STEP_PROGRESS, STEP_SUBTITLES, STEP_TITLES, type WizardStep } from "./nomacWizard";

type NomacWizardShellProps = {
  step: WizardStep;
  breadcrumb: string;
  hydrated: boolean;
  canAdvance: boolean;
  onBack?: () => void;
  onNext: () => void;
  children: ReactNode;
};

export function NomacWizardShell({
  step,
  breadcrumb,
  hydrated,
  canAdvance,
  onBack,
  onNext,
  children,
}: NomacWizardShellProps) {
  if (!hydrated) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.12),_transparent_32%),linear-gradient(180deg,#f8f7ff_0%,#ffffff_100%)] text-slate-900">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3 rounded-full border border-violet-100 bg-white px-5 py-3 text-sm text-slate-600 shadow-sm">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
            Préparation de votre parcours NOMAC...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.12),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.09),_transparent_28%),linear-gradient(180deg,#f8f7ff_0%,#ffffff_32%,#fbfbff_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0)_100%)]" />

      <header className="sticky top-0 z-40 border-b border-violet-100/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-500/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-violet-700">BizPlan AI</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Nomac Wizard</div>
            </div>
          </Link>


          <div className="flex items-center gap-3">
            <a
              href="#support"
              className="hidden rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 sm:inline-flex"
            >
              Aide
            </a>
            <Link
              href="/protected/new/nomac/step1"
              className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-500/25 transition-colors hover:bg-violet-700"
            >
              New Plan
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-44 pt-8 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-violet-600">
              <span>Étape {step} sur 5</span>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-700">
                {STEP_TITLES[step]}
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <p className="text-sm font-medium text-violet-600">{breadcrumb}</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {STEP_TITLES[step]}
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                {STEP_SUBTITLES[step]}
              </p>
            </div>
          </div>
        </FadeIn>

        {children}
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-violet-100 bg-white/92 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:px-8">
          <div className="hidden lg:flex">
            {step > 1 && onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
            ) : null}
          </div>

          <a href="https://www.instat.mg/documents/upload/main/INSTAT_Nomac_27_11_2013.pdf" target="_blank" className="text-center text-[11px] font-semibold uppercase tracking-[0.35em] text-[#100357] underline decoration-dotted decoration-violet-600 underline-offset-2 transition hover:text-violet-700">
            NOMAC 2012
          </a>

          <div className="flex items-center justify-end gap-3">
            {step > 1 && onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-50 lg:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
            ) : null}
            <button
              type="button"
              onClick={onNext}
              disabled={!canAdvance}
              className={cn(
                "cursor-pointer  inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-500/25 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50",
                "bg-violet-600",
              )}
            >
              {step === 5 ? "Terminer" : "Suivant"}
              {step === 5 ? <ShieldCheck className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="h-1 bg-violet-100">
          <div className="h-1 rounded-r-full bg-violet-600" style={{ width: `${STEP_PROGRESS[step]}%` }} />
        </div>
      </footer>
    </div>
  );
}
