"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type {
  CategorieEntity,
  ClasseEntity,
  DivisionEntity,
  GroupeEntity,
  SectionEntity,
} from "@/types/nomac";

export type NomacSelectionState = {
  section: SectionEntity | null;
  division: DivisionEntity | null;
  groupe: GroupeEntity | null;
  classe: ClasseEntity | null;
  categorie: CategorieEntity | null;
};

type NomacWizardContextValue = {
  hydrated: boolean;
  selection: NomacSelectionState;
  replaceSelection: (nextSelection: NomacSelectionState) => void;
  setSection: (section: SectionEntity) => void;
  setDivision: (division: DivisionEntity) => void;
  setGroupe: (groupe: GroupeEntity) => void;
  setClasse: (classe: ClasseEntity) => void;
  setCategorie: (categorie: CategorieEntity) => void;
  resetWizard: () => void;
};

const STORAGE_KEY = "bp-front-nomac-wizard";

const EMPTY_SELECTION: NomacSelectionState = {
  section: null,
  division: null,
  groupe: null,
  classe: null,
  categorie: null,
};

const NomacWizardContext = createContext<NomacWizardContextValue | null>(null);

function normalizeSelection(candidate: Partial<NomacSelectionState> | null | undefined): NomacSelectionState {
  return {
    section: candidate?.section ?? null,
    division: candidate?.division ?? null,
    groupe: candidate?.groupe ?? null,
    classe: candidate?.classe ?? null,
    categorie: candidate?.categorie ?? null,
  };
}

export function NomacWizardProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [selection, setSelection] = useState<NomacSelectionState>(EMPTY_SELECTION);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSelection(normalizeSelection(JSON.parse(raw) as Partial<NomacSelectionState>));
      }
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
    } catch {
      // Ignore storage write failures.
    }
  }, [hydrated, selection]);

  const replaceSelection = (nextSelection: NomacSelectionState) => {
    setSelection(normalizeSelection(nextSelection));
  };

  const setSection = (section: SectionEntity) => {
    replaceSelection({
      section,
      division: null,
      groupe: null,
      classe: null,
      categorie: null,
    });
  };

  const setDivision = (division: DivisionEntity) => {
    setSelection((current) =>
      normalizeSelection({
        section: current.section,
        division,
        groupe: null,
        classe: null,
        categorie: null,
      }),
    );
  };

  const setGroupe = (groupe: GroupeEntity) => {
    setSelection((current) =>
      normalizeSelection({
        section: current.section,
        division: current.division,
        groupe,
        classe: null,
        categorie: null,
      }),
    );
  };

  const setClasse = (classe: ClasseEntity) => {
    setSelection((current) =>
      normalizeSelection({
        section: current.section,
        division: current.division,
        groupe: current.groupe,
        classe,
        categorie: null,
      }),
    );
  };

  const setCategorie = (categorie: CategorieEntity) => {
    setSelection((current) =>
      normalizeSelection({
        section: current.section,
        division: current.division,
        groupe: current.groupe,
        classe: current.classe,
        categorie,
      }),
    );
  };

  const resetWizard = () => {
    setSelection(EMPTY_SELECTION);

    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage removal failures.
    }
  };

  const value: NomacWizardContextValue = {
    hydrated,
    selection,
    replaceSelection,
    setSection,
    setDivision,
    setGroupe,
    setClasse,
    setCategorie,
    resetWizard,
  };

  return <NomacWizardContext.Provider value={value}>{children}</NomacWizardContext.Provider>;
}

export function useNomacWizard() {
  const context = useContext(NomacWizardContext);

  if (!context) {
    throw new Error("useNomacWizard must be used within a NomacWizardProvider");
  }

  return context;
}
