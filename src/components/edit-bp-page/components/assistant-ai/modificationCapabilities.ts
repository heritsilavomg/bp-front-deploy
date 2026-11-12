import type { AiModificationType } from "@/types/ai";

export const AI_MODIFICATION_LABELS: Record<AiModificationType, string> = {
  PROJECT_NAME: "Nom du projet",
  PROJECT_HEADQUARTERS_ADDRESS: "Adresse du siège",
  PROJECT_DESCRIPTION_SHORT: "Description courte",
  PROJECT_DESCRIPTION_DETAILED: "Description détaillée",
  PROJECT_ACTIVITY_INFORMATION: "Informations sur l’activité",
  OBJECTIVE_SHORT_TERM: "Objectif à court terme",
  OBJECTIVE_MEDIUM_TERM: "Objectif à moyen terme",
  OBJECTIVE_LONG_TERM: "Objectif à long terme",
  CUSTOMER_DESCRIPTION: "Description de la clientèle",
  CUSTOMER_CATCHMENT_AREA: "Zone de chalandise",
  EMERGENCY_RISK_SCENARIOS: "Scénarios de risque du plan d’urgence",
  EMERGENCY_ACTIVATION_PROTOCOL: "Protocole d’activation du plan d’urgence",
  GROWTH_YEAR_2_RATE: "Taux de croissance de l’année 2",
  GROWTH_YEAR_3_RATE: "Taux de croissance de l’année 3",
  OFFER_CREATE: "AJOUT D’UNE OFFRE",
  OFFER_DELETE: "SUPPRESSION DE L’OFFRE",
  OFFER_NAME: "Nom de l’offre",
  OFFER_DESCRIPTION: "Description d’une offre",
  OFFER_SALE_PRICE_HT: "Prix de vente HT d’une offre",
  OFFER_UNIT_COST_HT: "Coût unitaire HT d’une offre",
  OFFER_FIRST_YEAR_SALES_COUNT: "Nombre de ventes en première année d’une offre",
};

export const AI_MODIFICATION_CAPABILITIES = (
  Object.keys(AI_MODIFICATION_LABELS) as AiModificationType[]
).map((type) => ({ type, label: AI_MODIFICATION_LABELS[type] }));
