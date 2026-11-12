import type { LucideIcon } from "lucide-react";
import {
  BadgeInfo,
  Briefcase,
  Building2,
  Boxes,
  CircleDot,
  Code2,
  Database,
  Factory,
  GraduationCap,
  HeartPulse,
  Hotel,
  House,
  Layers3,
  LayoutGrid,
  Landmark,
  ListTree,
  MoreHorizontal,
  Palette,
  Search,
  Sparkles,
  Sprout,
  Store,
  Truck,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import type {
  CategorieEntity,
  ClasseEntity,
  DivisionEntity,
  GlobalNomacResult,
  GroupeEntity,
  SectionEntity,
} from "@/types/nomac";
import type { NomacSelectionState } from "@/components/nomac/NomacWizardProvider";

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export const STEP_TITLES: Record<WizardStep, string> = {
  1: "Quelle est votre activité ?",
  2: "Choisissez une Division",
  3: "Sélectionnez votre groupe d'activité",
  4: "Sélectionnez votre classe d'activité",
  5: "Configuration de la Catégorie",
};

export const STEP_SUBTITLES: Record<WizardStep, string> = {
  1: "Identifiez votre secteur d'activité pour une analyse sectorielle précise par notre IA.",
  2: "Étape 2 sur 5 | Identifiez la division qui correspond à votre secteur.",
  3: "Étape 3 sur 5 | Affinez votre sélection vers le groupe d'activité exact.",
  4: "Étape 4 sur 5 | Choisissez la classe la plus pertinente pour votre modèle.",
  5: "Étape 5 sur 5 | Choisir la catégorie finale avant de générer votre plan.",
};

export const STEP_PROGRESS: Record<WizardStep, number> = {
  1: 20,
  2: 40,
  3: 60,
  4: 80,
  5: 100,
};

export const STEP_ROUTE_PATHS: Record<WizardStep, string> = {
  1: "/protected/new/nomac/step1",
  2: "/protected/new/nomac/step2",
  3: "/protected/new/nomac/step3",
  4: "/protected/new/nomac/step4",
  5: "/protected/new/nomac/step5",
};

export const STEP_GRID_COLUMNS: Record<WizardStep, string> = {
  1: "md:grid-cols-2 xl:grid-cols-4",
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 xl:grid-cols-3",
  4: "md:grid-cols-2 xl:grid-cols-3",
  5: "md:grid-cols-2",
};

const SECTION_TONES: LucideIcon[] = [
  Sprout,
  Factory,
  Building2,
  Store,
  Hotel,
  Truck,
  LayoutGrid,
  Landmark,
  House,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Palette,
  MoreHorizontal,
  Zap,
];

const STEP_TONES: Record<Exclude<WizardStep, 1>, LucideIcon[]> = {
  2: [Hotel, UtensilsCrossed, Briefcase, Sparkles],
  3: [ListTree, Layers3, Boxes, CircleDot],
  4: [Code2, Layers3, Boxes, Search],
  5: [BadgeInfo, Code2, Database, LayoutGrid],
};

function trimText(value?: string | null) {
  return value?.trim() ?? "";
}

export function truncateText(value: string, limit = 110) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= limit) {
    return cleaned;
  }

  return `${cleaned.slice(0, limit - 1)}…`;
}

export function pickDescription(title: string, candidates: Array<string | null | undefined>) {
  for (const candidate of candidates) {
    const value = trimText(candidate);
    if (value && value !== title) {
      return truncateText(value);
    }
  }

  return "";
}

export function getSectionLabel(section: SectionEntity | null) {
  if (!section) {
    return "";
  }

  return trimText(section.nomSection) || trimText(section.libelle) || section.code;
}

export function getDivisionLabel(division: DivisionEntity | null) {
  if (!division) {
    return "";
  }

  return trimText(division.nomDivision) || trimText(division.libelle) || division.code;
}

export function getGroupeLabel(groupe: GroupeEntity | null) {
  if (!groupe) {
    return "";
  }

  return trimText(groupe.nomGroupe) || trimText(groupe.libelle) || groupe.code;
}

export function getClasseLabel(classe: ClasseEntity | null) {
  if (!classe) {
    return "";
  }

  return trimText(classe.nom) || trimText(classe.libelle) || classe.code;
}

export function getCategorieLabel(categorie: CategorieEntity | null) {
  if (!categorie) {
    return "";
  }

  return trimText(categorie.nom) || trimText(categorie.libelle) || categorie.code;
}

export function getSectionTone(index: number, label: string): LucideIcon {
  const normalized = label.toLowerCase();

  if (normalized.includes("agri")) {
    return SECTION_TONES[0];
  }
  if (normalized.includes("industri")) {
    return SECTION_TONES[1];
  }
  if (normalized.includes("btp") || normalized.includes("construction")) {
    return SECTION_TONES[2];
  }
  if (normalized.includes("commerce")) {
    return SECTION_TONES[3];
  }
  if (normalized.includes("héberg") || normalized.includes("heberg") || normalized.includes("hôtel")) {
    return SECTION_TONES[4];
  }
  if (normalized.includes("transport")) {
    return SECTION_TONES[5];
  }
  if (normalized.includes("information") || normalized.includes("communication")) {
    return SECTION_TONES[6];
  }
  if (normalized.includes("finance") || normalized.includes("assurance")) {
    return SECTION_TONES[7];
  }
  if (normalized.includes("immobili")) {
    return SECTION_TONES[8];
  }
  if (normalized.includes("service")) {
    return SECTION_TONES[9];
  }
  if (normalized.includes("enseignement") || normalized.includes("education")) {
    return SECTION_TONES[10];
  }
  if (normalized.includes("sant")) {
    return SECTION_TONES[11];
  }
  if (normalized.includes("art") || normalized.includes("loisir")) {
    return SECTION_TONES[12];
  }
  if (normalized.includes("énergie") || normalized.includes("energie")) {
    return SECTION_TONES[14];
  }
  if (normalized.includes("extract")) {
    return SECTION_TONES[0];
  }

  return SECTION_TONES[index % SECTION_TONES.length];
}

export function getStepTone(step: Exclude<WizardStep, 1>, index: number): LucideIcon {
  const tones = STEP_TONES[step];
  return tones[index % tones.length];
}

export function getResultIcon(resultType: GlobalNomacResult["type"]) {
  return (
    {
      SECTION: Sprout,
      DIVISION: Building2,
      GROUPE: ListTree,
      CLASSE: Layers3,
      CATEGORIE: CircleDot,
    }[resultType] ?? BadgeInfo
  );
}

export function buildHierarchyPath(result: GlobalNomacResult) {
  const segments = [
    trimText(result.sectionLibelle),
    trimText(result.divisionLibelle),
    trimText(result.groupeLibelle),
    trimText(result.classeLibelle),
    trimText(result.libelle) || trimText(result.nom),
  ].filter(Boolean);

  return segments.join(" • ");
}

export function buildSelectionFromResult(result: GlobalNomacResult): NomacSelectionState {
  const section = result.sectionCode
    ? {
        code: result.sectionCode,
        libelle: result.sectionLibelle ?? result.nom ?? result.libelle ?? "",
        nomSection: result.sectionLibelle ?? result.nom ?? result.libelle ?? "",
        searchText: "",
      }
    : null;

  const division = result.divisionCode
    ? {
        code: result.divisionCode,
        libelle: result.divisionLibelle ?? result.nom ?? result.libelle ?? "",
        nomDivision: result.divisionLibelle ?? result.nom ?? result.libelle ?? "",
        searchText: "",
      }
    : null;

  const groupe = result.groupeCode
    ? {
        code: result.groupeCode,
        libelle: result.groupeLibelle ?? result.nom ?? result.libelle ?? "",
        nomGroupe: result.groupeLibelle ?? result.nom ?? result.libelle ?? "",
        searchText: "",
      }
    : null;

  const classe = result.classeCode
    ? {
        code: result.classeCode,
        nom: result.classeLibelle ?? result.nom ?? result.libelle ?? "",
        libelle: result.classeLibelle ?? result.libelle ?? "",
        searchText: "",
      }
    : null;

  const categorie =
    result.type === "CATEGORIE"
      ? {
          code: result.code,
          libelle: result.libelle ?? "",
          nom: result.nom ?? result.libelle ?? "",
          searchText: "",
        }
      : null;

  return {
    section,
    division,
    groupe,
    classe,
    categorie,
  };
}

export function buildBreadcrumb(selection: NomacSelectionState, step: WizardStep) {
  if (step === 1) {
    return "Sections";
  }

  const parts = [
    "Sections",
    getSectionLabel(selection.section),
    getDivisionLabel(selection.division),
    getGroupeLabel(selection.groupe),
    getClasseLabel(selection.classe),
  ].filter(Boolean);

  return parts.join(" / ");
}

export function getWizardRequiredStep(selection: NomacSelectionState): WizardStep {
  if (!selection.section) {
    return 1;
  }
  if (!selection.division) {
    return 2;
  }
  if (!selection.groupe) {
    return 3;
  }
  if (!selection.classe) {
    return 4;
  }

  return 5;
}

export function canLoadWizardStep(step: WizardStep, selection: NomacSelectionState) {
  if (step === 1) {
    return true;
  }

  if (step === 2) {
    return Boolean(selection.section);
  }

  if (step === 3) {
    return Boolean(selection.division);
  }

  if (step === 4) {
    return Boolean(selection.groupe);
  }

  return Boolean(selection.classe);
}

export function getWizardStepEndpoint(step: WizardStep, selection: NomacSelectionState) {
  if (step === 1) {
    return "/api/nomac/getAllSections";
  }

  if (step === 2) {
    return `/api/nomac/getDivisionByCodeSection?codeSection=${encodeURIComponent(selection.section?.code ?? "")}`;
  }

  if (step === 3) {
    return `/api/nomac/getGroupeByCodeDivision?codeDivision=${encodeURIComponent(selection.division?.code ?? "")}`;
  }

  if (step === 4) {
    return `/api/nomac/getClasseByCodeGroupe?codeGroupe=${encodeURIComponent(selection.groupe?.code ?? "")}`;
  }

  return `/api/nomac/getCategorieByCodeClasse?codeClasse=${encodeURIComponent(selection.classe?.code ?? "")}`;
}

export function getWizardStepGridColumns(step: WizardStep) {
  return STEP_GRID_COLUMNS[step];
}

export function getWizardStepSkeletonCount(step: WizardStep) {
  if (step === 1) {
    return 12;
  }

  if (step === 3 || step === 5) {
    return 6;
  }

  return 4;
}

export function getWizardStepReferenceLabel(step: WizardStep, selection: NomacSelectionState) {
  if (step === 2) {
    return getSectionLabel(selection.section);
  }

  if (step === 3) {
    return getDivisionLabel(selection.division);
  }

  if (step === 4) {
    return getGroupeLabel(selection.groupe);
  }

  if (step === 5) {
    return getClasseLabel(selection.classe);
  }

  return "";
}

export function getNomacErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "object" && payload !== null) {
    const candidate = payload as { description?: string; message?: string };
    return candidate.description || candidate.message || fallback;
  }

  return fallback;
}
