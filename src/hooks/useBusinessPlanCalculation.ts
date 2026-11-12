"use client";

import { useEffect, useState } from "react";
import { scheduleCalculation, type CalculationData } from "@/lib/businessPlanCalculation";

export function useBusinessPlanCalculation(bpId: string | null | undefined, savedRevision: number) {
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([bpId, savedRevision, attempt]);
  const [state, setState] = useState<{ key: string; data: CalculationData | null; loading: boolean; error: boolean }>({ key: "", data: null, loading: true, error: false });
  useEffect(() => {
    setState({ key, data: null, loading: Boolean(bpId), error: false });
    if (!bpId) return;
    return scheduleCalculation(bpId,
      data => setState({ key, data, loading: false, error: false }),
      () => setState({ key, data: null, loading: false, error: true }));
  }, [bpId, key]);
  const current = state.key === key ? state : { data: null, loading: Boolean(bpId), error: false };
  return { ...current, retry: () => setAttempt(value => value + 1) };
}
