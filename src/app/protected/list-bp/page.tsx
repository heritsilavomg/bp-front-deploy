"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBusinessPlanScore } from "@/lib/adminScoringService";
import type { BusinessPlanScore } from "@/types/scoring";

type BpItem = {
  id: string | number;
  title: string;
  description: string;
  status: string;
  date?: string;
  score: BusinessPlanScore | null;
  scoreError?: boolean;
};

const SCORE_INTERPRETATIONS = {
  POINTS_CRITIQUES: { label: "Points critiques", color: "bg-red-500" },
  A_RENFORCER: { label: "A renforcer", color: "bg-amber-500" },
  ENCOURAGEANT: { label: "Encourageant", color: "bg-sky-600" },
  SOLIDE: { label: "Solide", color: "bg-emerald-600" },
} satisfies Record<NonNullable<BusinessPlanScore["interpretation"]>, { label: string; color: string }>;

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return typeof value === "object" && value !== null ? value as UnknownRecord : {};
}

function asText(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function normalizeBp(value: unknown, index: number): BpItem {
  const item = asRecord(value);
  const about = asRecord(item.aProposProjet);
  const description = asRecord(item.description);
  const id = item.id ?? item.bpId ?? item._id ?? `bp-${index}`;
  return {
    id: typeof id === "string" || typeof id === "number" ? id : `bp-${index}`,
    title: asText(item.title) ?? asText(item.nomProjet) ?? asText(about.typeActivite) ?? asText(item.name) ?? "Business Plan",
    description: asText(item.description)
      ?? asText(description.descriptionCourte)
      ?? asText(description.descriptionDetaillee)
      ?? asText(item.resume)
      ?? asText(item.summary)
      ?? "",
    status: asText(item.status) ?? (item.closed === true ? "Fermé" : "En cours"),
    date: asText(item.date) ?? asText(item.updatedAt) ?? asText(item.createdAt),
    score: null,
  };
}

export default function Page() {
  const [items, setItems] = useState<BpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const response = await fetch("/api/bp");
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        const payload: unknown = await response.json();
        const envelope = asRecord(payload);
        const data = envelope.data;
        const listSource = Array.isArray(data) ? data : asRecord(data).content;
        const list = Array.isArray(listSource) ? listSource : [];
        const normalized = list.map(normalizeBp);
        const scoredItems = await Promise.all(normalized.map(async (item) => {
          try {
            const score = await getBusinessPlanScore(String(item.id));
            return { ...item, score };
          } catch {
            return { ...item, scoreError: true };
          }
        }));
        if (!mounted) return;
        setItems(scoredItems);
        setError(null);
      } catch (caught) {
        console.error(caught);
        if (mounted) setError("Impossible de charger les projets");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => { mounted = false; };
  }, []);

  const open = (id: string | number) => router.push(`/protected/edit-bp/${id}`);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-purple-800">Projects Dashboard</h1>
          <p className="text-sm text-gray-600">Gérez et suivez l’évolution de vos plans d’affaires boostés par l’IA.</p>
        </header>

        <div className="mb-6 flex items-center gap-4">
          <input
            placeholder="Rechercher parmi vos plans d’affaires..."
            className="min-w-0 flex-1 rounded-full border border-gray-200 bg-white px-4 py-3 shadow-sm placeholder-gray-400"
          />
          <button onClick={() => router.push("/protected/new")} className="cursor-pointer rounded-full bg-purple-700 px-4 py-2 text-white">
            Commencer un nouveau BP
          </button>
        </div>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Plans récents</h2>
          <p className="mb-4 max-w-3xl text-sm text-gray-500">
            Cette évaluation est basée sur les informations et prévisions saisies dans votre Business Plan. Elle ne constitue pas une garantie de réussite.
          </p>

          {loading ? (
            <div role="status" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((index) => <div key={index} className="h-40 animate-pulse rounded-lg border border-gray-100 bg-white p-6 shadow-sm" />)}
            </div>
          ) : error ? (
            <div role="alert" className="text-red-600">{error}</div>
          ) : items.length === 0 ? (
            <div className="text-gray-600">Aucun projet trouvé.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article
                  key={String(item.id)}
                  onClick={() => open(item.id)}
                  className="flex cursor-pointer flex-col justify-between rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-50 font-bold text-purple-700">BP</div>
                      <div className="min-w-0">
                        <h3 className="break-words font-semibold text-gray-900">{item.title}</h3>
                        <p className="break-words text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs text-gray-400">{item.date ? new Date(item.date).toLocaleDateString() : ""}</div>
                      <div className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">{item.status}</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 text-xs text-gray-500">Score Business Plan</div>
                    {item.score?.globalScore != null && <div className="h-2 w-full rounded-full bg-gray-100">
                      <div
                        className={`h-2 rounded-full ${item.score.interpretation ? SCORE_INTERPRETATIONS[item.score.interpretation].color : "bg-gray-400"}`}
                        style={{ width: `${item.score.globalScore}%` }}
                      />
                    </div>}
                    <div className="mt-2 text-right text-sm text-gray-600">
                      {item.scoreError ? "Score indisponible" : item.score?.globalScore == null
                        ? "Non évaluable" : `${item.score.globalScore.toFixed(2)} / 100`}
                      {item.score?.interpretation && <p>{SCORE_INTERPRETATIONS[item.score.interpretation].label}</p>}
                      {item.score?.status === "PROVISIONAL" && <p>Evaluation provisoire</p>}
                      {item.score?.status === "INCOMPLETE" && <p>Informations incompletes</p>}
                      {item.score && <p className="text-xs">Couverture : {item.score.assessmentCoverage.toFixed(0)} %</p>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
