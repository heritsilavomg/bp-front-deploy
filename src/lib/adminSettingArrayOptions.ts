import type { TypeApport } from "@/types/bp/finance";
import type { MultiSelectOption } from "@/components/admin/MultiSelect";

const IMMOBILISATIONS_INCORPORELLES: TypeApport[] = [
  "NATURE_FOND_DE_COMMERCE",
  "NATURE_DROIT_AU_BAIL_OU_PAS_DE_PORTE",
  "NATURE_BREVET_MARQUE",
  "NATURE_CREATION_SITE_WEB_APPLICATION",
  "NATURE_LOGICIEL_DEVELOPPE",
  "NATURE_FRAIS_CREATION_SOCIETE",
];

const IMMOBILISATIONS_CORPORELLES: TypeApport[] = [
  "NATURE_ACHAT_IMMOBILIERE",
  "NATURE_FRAIS_ACQUISITION_IMMOBILIERE",
  "NATURE_TERRAIN",
  "NATURE_VEHICULE_UTILITAIRE",
  "NATURE_VEHICULE_TOURISME",
  "NATURE_MACHINE",
  "NATURE_OUTIL_ET_MATERIEL_NECESSAIRE_ACTIVITE",
  "NATURE_MAT_INFORMATIQUE",
  "NATURE_MEUBLE_DESTINEE_A_AMENAGEMENTS",
  "NATURE_TRAVAUX_AGENCEMENT",
];

const NON_AMORTISSABLES = [
  "PERSONEL",
  "COMPTE_COURANT",
  "NATURE_TERRAIN",
  "STOCK_DE_DEPART",
  "GARANTIE_LOYER",
  "TRESORERIE_DEPART",
  "FRAIS_GENERAUX",
] as const;

const labels: Partial<Record<TypeApport, string>> = {
  NATURE_FOND_DE_COMMERCE: "Fonds de commerce",
  NATURE_DROIT_AU_BAIL_OU_PAS_DE_PORTE: "Droit au bail / pas de porte",
  NATURE_BREVET_MARQUE: "Brevet / marque",
  NATURE_ACHAT_IMMOBILIERE: "Achat immobilier",
  NATURE_FRAIS_ACQUISITION_IMMOBILIERE: "Frais d'acquisition immobiliere",
  NATURE_TERRAIN: "Terrain",
  NATURE_VEHICULE_UTILITAIRE: "Vehicule utilitaire",
  NATURE_VEHICULE_TOURISME: "Vehicule tourisme",
  NATURE_MACHINE: "Machine",
  NATURE_OUTIL_ET_MATERIEL_NECESSAIRE_ACTIVITE: "Outil et materiel necessaire a l'activite",
  NATURE_MAT_INFORMATIQUE: "Materiel informatique",
  NATURE_MEUBLE_DESTINEE_A_AMENAGEMENTS: "Meuble destine aux amenagements",
  NATURE_TRAVAUX_AGENCEMENT: "Travaux d'agencement",
  NATURE_CREATION_SITE_WEB_APPLICATION: "Creation site web / application",
  NATURE_LOGICIEL_DEVELOPPE: "Logiciel developpe",
  NATURE_FRAIS_CREATION_SOCIETE: "Frais de creation de societe",
};

function toOptions(values: readonly string[]): MultiSelectOption[] {
  return values.map((value) => ({
    value,
    label: labels[value as TypeApport] ?? value.replaceAll("_", " ").toLowerCase(),
  }));
}

export const ADMIN_ARRAY_SETTING_OPTIONS: Record<string, MultiSelectOption[]> = {
  TYPES_IMMOB_INCORPORELLES: toOptions(IMMOBILISATIONS_INCORPORELLES),
  TYPES_IMMOB_CORPORELLES: toOptions(IMMOBILISATIONS_CORPORELLES),
  INVESTISSEMENTS_NON_AMORTISSABLES: toOptions(NON_AMORTISSABLES),
};
