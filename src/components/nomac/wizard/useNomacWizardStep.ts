"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { NomacSelectionState } from "@/components/nomac/NomacWizardProvider";
import {
  getNomacErrorMessage,
  getWizardRequiredStep,
  STEP_ROUTE_PATHS,
  type WizardStep,
} from "./nomacWizard";

export function useNomacWizardStepGuard(step: WizardStep, hydrated: boolean, selection: NomacSelectionState) {
  const router = useRouter();
  const requiredStep = getWizardRequiredStep(selection);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (step > requiredStep) {
      router.replace(STEP_ROUTE_PATHS[requiredStep]);
    }
  }, [hydrated, requiredStep, router, step]);

  return requiredStep;
}

export function useNomacWizardStepItems<T>(
  step: WizardStep,
  selection: NomacSelectionState,
  hydrated: boolean,
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const upstreamCode =
    step === 1
      ? ""
      : step === 2
        ? selection.section?.code ?? ""
        : step === 3
          ? selection.division?.code ?? ""
          : step === 4
            ? selection.groupe?.code ?? ""
            : selection.classe?.code ?? "";
  const endpoint =
    step === 1
      ? "/api/nomac/getAllSections"
      : step === 2
        ? `/api/nomac/getDivisionByCodeSection?codeSection=${encodeURIComponent(upstreamCode)}`
        : step === 3
          ? `/api/nomac/getGroupeByCodeDivision?codeDivision=${encodeURIComponent(upstreamCode)}`
          : step === 4
            ? `/api/nomac/getClasseByCodeGroupe?codeGroupe=${encodeURIComponent(upstreamCode)}`
            : `/api/nomac/getCategorieByCodeClasse?codeClasse=${encodeURIComponent(upstreamCode)}`;

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (step !== 1 && !upstreamCode) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        const data = (await response.json()) as T[] | { message?: string; description?: string };

        if (!response.ok) {
          throw new Error(getNomacErrorMessage(data, "Impossible de charger les données"));
        }

        if (!cancelled) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Impossible de charger les données");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [endpoint, hydrated, step, upstreamCode]);

  return { items, loading, error };
}
