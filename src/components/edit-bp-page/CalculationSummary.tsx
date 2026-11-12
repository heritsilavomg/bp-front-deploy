import { RotateCw } from "lucide-react";
import { formatCalculationAmount, type CalculationData } from "@/lib/businessPlanCalculation";

type Props = {
  data: CalculationData | null;
  loading: boolean;
  error: boolean;
  retry: () => void;
  selectedYear: "annee1" | "annee2" | "annee3";
  onSelectYear: (year: "annee1" | "annee2" | "annee3") => void;
};

export default function CalculationSummary({ data, loading, error, retry, selectedYear, onSelectYear }: Props) {
  const year = data?.[selectedYear];
  const indicators = [
    ["Ventes HT", year?.chiffreAffairesHT],
    ["Marge brute", year?.margeBrute],
    ["EBE", year?.excedentBrutExploitation],
    ["Résultat net", year?.resultatNet],
    ["CAF", year?.capaciteAutofinancement],
    ["BFR", year?.bfr],
  ] as const;
  return <div data-calculation-region aria-busy={loading} className="mt-4">
    <div className="flex h-7 gap-2">
      {(["annee1", "annee2", "annee3"] as const).map((key, index) => <button key={key} type="button"
        aria-pressed={key === selectedYear} onClick={() => onSelectYear(key)}
        className={`rounded-2xl px-3 py-1 text-sm font-semibold ${key === selectedYear ? "bg-slate-800 text-white" : "bg-slate-700 text-slate-300"}`}>
        Année {index + 1}
      </button>)}
    </div>
    <div className="mt-3 divide-y divide-slate-700/60">
      {indicators.map(([label, value]) =>
        <div key={label} className="flex h-9 min-w-0 items-center justify-between gap-2">
          {loading ? <div role="status" aria-label={`Chargement : ${label}`} className="flex w-full items-center justify-between gap-2 motion-safe:animate-pulse">
            <div className="h-3 w-20 rounded bg-slate-700" />
            <div className="h-4 w-28 rounded bg-slate-700" />
          </div> : <>
            <div className="shrink-0 text-xs text-slate-400" title={label === "EBE" ? "Excédent brut d'exploitation" : label === "CAF" ? "Capacité d'autofinancement" : label === "BFR" ? "Besoin en fonds de roulement" : label}>{label}</div>
            <div className="min-w-0 truncate text-sm font-semibold tabular-nums text-white" title={formatCalculationAmount(value)}>{formatCalculationAmount(value)}</div>
          </>}
        </div>)}
    </div>
    <div className="text-sm">
      {error ? <div role="alert" className="text-red-300">
        <p>Impossible de charger les calculs.</p>
        <button type="button" onClick={retry} className="inline-flex items-center gap-1 text-slate-200 hover:text-white"><RotateCw size={14} /> Réessayer</button>
      </div> : !loading && !year ? <p className="text-slate-400">Calculs indisponibles pour cette année.</p> : null}
    </div>
  </div>;
}
