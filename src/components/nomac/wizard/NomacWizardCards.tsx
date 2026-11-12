import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GlobalNomacResult } from "@/types/nomac";
import { buildHierarchyPath, getResultIcon, truncateText } from "./nomacWizard";

export function SelectionCard({
  icon: Icon,
  title,
  description,
  code,
  badge,
  footer,
  selected = false,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  code: string;
  badge?: string;
  footer?: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "curssor-pointer group relative flex h-full min-h-[132px] flex-col rounded-3xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-[0_16px_40px_rgba(91,33,182,0.12)]",
        selected ? "border-violet-500 bg-violet-50 shadow-[0_16px_40px_rgba(91,33,182,0.14)]" : "border-slate-200 bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 transition-colors",
            selected ? "bg-violet-600 text-white ring-violet-500/20" : "bg-violet-50 text-violet-600 ring-violet-100",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex items-center gap-2">
          {badge ? (
            <span className="rounded-full border border-violet-100 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-600">
              {badge}
            </span>
          ) : null}
          {selected ? <CheckCircle2 className="h-5 w-5 text-violet-600" /> : null}
        </div>
      </div>

      <div className="mt-4 flex-1">
        <p className="text-[15px] font-semibold leading-5 text-slate-900">{title}</p>
        {description ? <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-[10px] uppercase tracking-[0.3em] text-slate-400">
        <span>{footer ?? "Sélectionner"}</span>
        <span className="font-semibold text-slate-500">{code}</span>
      </div>
    </button>
  );
}

export function SkeletonGrid({
  count,
  columnsClassName,
}: {
  count: number;
  columnsClassName: string;
}) {
  return (
    <div className={cn("grid gap-4", columnsClassName)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-[132px] animate-pulse rounded-3xl border border-slate-200 bg-white p-4"
        >
          <div className="flex items-start justify-between">
            <div className="h-11 w-11 rounded-2xl bg-slate-100" />
            <div className="h-5 w-16 rounded-full bg-slate-100" />
          </div>
          <div className="mt-4 h-4 w-3/5 rounded-full bg-slate-100" />
          <div className="mt-3 h-3 w-full rounded-full bg-slate-100" />
          <div className="mt-2 h-3 w-4/5 rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-violet-50 pb-3 last:border-none last:pb-0">
      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{label}</span>
      <span className="text-right text-sm font-medium text-slate-800">{value || "En attente"}</span>
    </div>
  );
}

export function ResultCard({
  result,
  onClick,
}: {
  result: GlobalNomacResult;
  onClick: () => void;
}) {
  const Icon = getResultIcon(result.type);

  return (
    <SelectionCard
      icon={Icon}
      title={truncateText(result.libelle || result.nom || result.code)}
      description={buildHierarchyPath(result)}
      code={result.code}
      badge={result.type}
      footer={`Score ${result.score}`}
      onClick={onClick}
    />
  );
}
