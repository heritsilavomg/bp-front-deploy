"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import { useNomacWizard } from "@/components/nomac/NomacWizardProvider";
import type { GlobalNomacResult } from "@/types/nomac";
import { buildSelectionFromResult, getNomacErrorMessage } from "./nomacWizard";

export function useNomacDirectSearch() {
  const { replaceSelection } = useNomacWizard();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [directResults, setDirectResults] = useState<GlobalNomacResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const applyGlobalResult = useCallback(
    (result: GlobalNomacResult) => {
      replaceSelection(buildSelectionFromResult(result));
    },
    [replaceSelection],
  );

  const handleDirectSearch = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) {
        setDirectResults([]);
        return;
      }

      setSearchLoading(true);
      setSearchError(null);

      try {
        const response = await fetch(
          `/api/nomac/search-global?searchKey=${encodeURIComponent(trimmedQuery)}&limit=12`,
          {
            cache: "no-store",
          },
        );

        const data = (await response.json()) as GlobalNomacResult[] | { message?: string; description?: string };

        if (!response.ok) {
          throw new Error(getNomacErrorMessage(data, "Recherche impossible"));
        }

        setDirectResults(Array.isArray(data) ? data : []);
      } catch (searchError) {
        setSearchError(searchError instanceof Error ? searchError.message : "Recherche impossible");
        setDirectResults([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [searchQuery],
  );

  return {
    searchQuery,
    setSearchQuery,
    searchLoading,
    directResults,
    searchError,
    handleDirectSearch,
    applyGlobalResult,
  };
}
