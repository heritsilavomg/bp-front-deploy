"use client";

import { useEffect, useState } from "react";
import { getBusinessPlanScore } from "@/lib/adminScoringService";
import type { BusinessPlanScore } from "@/types/scoring";

export type BusinessPlanScoreState = { data: BusinessPlanScore | null; loading: boolean; error: string };

export function useBusinessPlanScore(bpId: string | undefined, savedRevision: number): BusinessPlanScoreState {
  const [state, setState] = useState<BusinessPlanScoreState>({ data: null, loading: true, error: "" });
  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: Boolean(bpId), error: "" });
    if (!bpId) return;
    // Coalesce successful saves and the StrictMode effect replay, never local keystrokes.
    const timer = setTimeout(() => {
      void getBusinessPlanScore(bpId, controller.signal)
        .then(data => { if (!controller.signal.aborted) setState({ data, loading: false, error: "" }); })
        .catch((caught: unknown) => {
          if (controller.signal.aborted) return;
          const code = caught instanceof Error ? caught.message : "";
          setState({ data: null, loading: false, error: code === "ACCESS_DENIED" ? "Vous n'avez pas acces a cette evaluation."
            : code === "SESSION_EXPIRED" ? "Votre session a expire." : "Le score est temporairement indisponible." });
        });
    }, 150);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [bpId, savedRevision]);
  return state;
}
