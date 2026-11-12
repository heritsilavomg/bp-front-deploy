export type TypeRisque =
  | "MARCHE"
  | "TECHNIQUE"
  | "FINANCIER"
  | "CONCURRENTIEL"
  | "REGLEMENTAIRE"
  | "OPERATIONNEL";

export type ProbabiliteRisque = "FAIBLE" | "MOYEN" | "ELEVE" | "TRES_ELEVE";

export type ImpactRisque = "FAIBLE" | "MOYEN" | "ELEVE" | "CRITIQUE";

export type NiveauRisque = "ACCEPTABLE" | "MODERE" | "INACCEPTABLE";

export interface AnalyseRisquesType {
  typeRisque?: TypeRisque;
  descriptionRisque?: string;
  probabiliteRisque?: ProbabiliteRisque;
  impactRisque?: ImpactRisque;
  mesuresPalliatives?: string;
  niveauRisque?: NiveauRisque;
}

export type TypeContrainte =
  | "TEMPORELLE"
  | "FINANCIERE"
  | "TECHNIQUE"
  | "HUMAINE"
  | "REGLEMENTAIRE";

export type ImpactContrainte = "FAIBLE" | "MOYEN" | "ELEVE" | "TRES_ELEVE" | "CRITIQUE";

export interface ContraintesIdentifieesType {
  typeContrainte?: TypeContrainte;
  descriptionContrainte?: string;
  impactContrainte?: ImpactContrainte;
  solutionsEnvisagees?: string;
}

export interface PlanUrgenceType {
  scenariosRisque?: string;
  protocoleActivation?: string;
  responsableCrise?: string;
  contactsUrgence?: string[];
}
