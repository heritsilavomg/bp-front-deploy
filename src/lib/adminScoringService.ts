import type { BusinessPlanScore, ScoringConfiguration } from "@/types/scoring";

async function ensureOk(response: Response): Promise<void> {
  if (response.ok) return;
  if (response.status === 401) throw new Error("SESSION_EXPIRED");
  if (response.status === 403) throw new Error("ACCESS_DENIED");
  if (response.status === 400) throw new Error("INVALID_CONFIGURATION");
  throw new Error(`REQUEST_FAILED_${response.status}`);
}

export async function getScoringConfiguration(): Promise<ScoringConfiguration> {
  const response = await fetch("/api/admin/scoring", { cache: "no-store" });
  await ensureOk(response);
  return response.json() as Promise<ScoringConfiguration>;
}

export async function updateScoringConfiguration(configuration: ScoringConfiguration): Promise<ScoringConfiguration> {
  const response = await fetch("/api/admin/scoring", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(configuration),
  });
  await ensureOk(response);
  return response.json() as Promise<ScoringConfiguration>;
}

export async function getBusinessPlanScore(id: string, signal?: AbortSignal): Promise<BusinessPlanScore> {
  const response = await fetch(`/api/bp/${encodeURIComponent(id)}/score`, { cache: "no-store", signal });
  await ensureOk(response);
  return response.json() as Promise<BusinessPlanScore>;
}
