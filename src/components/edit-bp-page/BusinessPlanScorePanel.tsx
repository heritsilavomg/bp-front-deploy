import type { BusinessPlanScoreState } from "@/hooks/useBusinessPlanScore";
import type { BusinessPlanScore } from "@/types/scoring";

const INTERPRETATIONS: Record<NonNullable<BusinessPlanScore["interpretation"]>, { label: string; color: string }> = {
  POINTS_CRITIQUES: { label: "Points critiques", color: "bg-red-500" },
  A_RENFORCER: { label: "A renforcer", color: "bg-amber-500" },
  ENCOURAGEANT: { label: "Encourageant", color: "bg-sky-600" },
  SOLIDE: { label: "Solide", color: "bg-emerald-600" },
};

export default function BusinessPlanScorePanel({ data, loading, error }: BusinessPlanScoreState) {
  const interpretation = data?.interpretation ? INTERPRETATIONS[data.interpretation] : null;
  return <section aria-label="Score de viabilite" className="mt-3 min-w-0 border-y border-slate-200 py-2 text-sm text-slate-700">
    <h3 className="text-xs font-semibold text-slate-900">Score de viabilite</h3>
    {loading ? <p role="status" className="mt-2 text-xs text-slate-500">Evaluation en cours...</p>
      : error ? <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>
      : data ? <>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
          <p className="font-semibold tabular-nums">{data.globalScore == null ? "Score non disponible" : `${data.globalScore.toFixed(2)} / 100`}</p>
          {interpretation && <p className="text-xs">{interpretation.label}</p>}
        </div>
        {data.globalScore != null && <div role="progressbar" aria-label="Score de viabilite sur 100" aria-valuemin={0} aria-valuemax={100} aria-valuenow={data.globalScore} className="mt-1 h-1 overflow-hidden rounded-full bg-slate-200">
          <div className={`h-full ${interpretation?.color ?? "bg-slate-400"}`} style={{ width: `${data.globalScore}%` }} />
        </div>}
        <div className="mt-1 flex flex-wrap justify-between gap-x-2 gap-y-1 text-xs">
          <p className="font-medium">{data.status === "COMPLETE" ? "Evaluation complete" : data.status === "PROVISIONAL" ? "Score provisoire" : "Evaluation incomplete"}</p>
          <p className="text-slate-500">Couverture : {data.assessmentCoverage.toFixed(0)} %</p>
        </div>
      </> : <p className="mt-2 text-xs text-slate-500">Score non disponible</p>}
    <details className="mt-2">
      <summary className="cursor-pointer text-xs font-semibold text-violet-700">Voir le detail</summary>
      <div role="region" aria-label="Detail de l'evaluation" tabIndex={0} className="mt-2 max-h-52 overflow-y-auto overscroll-contain pr-2 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500">
        {data?.status === "PROVISIONAL" && <p className="mb-2 text-slate-500">Certaines dimensions financieres ne sont pas encore evaluables.</p>}
        {data && data.globalScore == null && <p className="mb-2 text-slate-500">Completez davantage les donnees financieres pour obtenir un score.</p>}
        {data && <ul className="divide-y divide-slate-200">{data.dimensions.map(dimension => <li key={dimension.code} className="py-2">
            <div className="flex flex-wrap justify-between gap-2 text-xs"><span>{dimension.label}</span><span className="font-semibold tabular-nums">{dimension.score == null ? "Non evaluable" : `${dimension.score.toFixed(2)} / 100`}</span></div>
            {dimension.improvementPoints.length > 0 && <ul className="mt-1 space-y-1 text-xs text-slate-500">{dimension.improvementPoints.map((point, index) => <li key={index} className="break-words">{point}</li>)}</ul>}
          </li>)}</ul>}
        <p className="mt-2 leading-relaxed text-slate-500">Cette evaluation est basee sur les informations et previsions saisies dans votre Business Plan. Elle ne constitue pas une garantie de reussite.</p>
      </div>
    </details>
    <p className="mt-1 text-xs text-slate-500">Score indicatif base sur vos previsions.</p>
  </section>;
}
