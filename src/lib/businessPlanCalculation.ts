export type CalculationYear = Record<string, unknown> & {
  chiffreAffairesHT?: number | null;
  resultatNet?: number | null;
};
export type CalculationData = {
  annee1?: CalculationYear | null;
  annee2?: CalculationYear | null;
  annee3?: CalculationYear | null;
};

export async function getBusinessPlanCalculation(bpId: string, signal: AbortSignal): Promise<CalculationData | null> {
  const response = await fetch(`/api/bp/calcul/${encodeURIComponent(bpId)}`, { cache: "no-store", signal });
  if (!response.ok) throw new Error("Impossible de charger les calculs.");
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || !("data" in payload)) throw new Error("Invalid calculation response");
  if (payload.data == null) return null;
  if (typeof payload.data !== "object" || Array.isArray(payload.data)) throw new Error("Invalid calculation data");
  return payload.data as CalculationData;
}

// Defer dispatch so React effect replay can cancel before issuing an HTTP request.
export function scheduleCalculation(
  bpId: string,
  success: (data: CalculationData | null) => void,
  failure: () => void,
  delay = 150,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    void getBusinessPlanCalculation(bpId, controller.signal)
      .then(data => { if (!controller.signal.aborted) success(data); })
      .catch(() => { if (!controller.signal.aborted) failure(); });
  }, delay);
  return () => { clearTimeout(timer); controller.abort(); };
}

export function formatCalculationAmount(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value) ? `${value.toLocaleString()} Ar` : "-";
}
