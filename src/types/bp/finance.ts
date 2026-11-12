export type PaiementCondition =
  | "DIRECT"
  | "DANS_LES_30J"
  | "DANS_LES_45J"
  | "DANS_LES_60J"
  | "DANS_LES_90J";

export interface VolumeVentesPrevuesType {
  nbJourTravailleParSemaine?: number;
  modePayement?: PaiementCondition;
  activiteSaisonniere?: boolean;
  saisonNormale?: number[];
}

export interface CroissancesPrevuesType {
  tauxCroissanceAnnee1?: number;
  tauxCroissanceAnnee2?: number;
}

export type TypeCharge =
  | "ABONNEMENT_EAU_ELEC_GAZ_BOIS"
  | "ABONNEMENT_TEL_INTERNET"
  | "ABONNEMENT_LOGICIEL"
  | "ABONNEMENT_AUTRES"
  | "LOCATION_LOYER"
  | "LOCATION_VOITURE"
  | "LOCATION_MATERIEL"
  | "LOCATION_AUTRES"
  | "PERSONEL_CHARGES_SOCIALES"
  | "PERSONEL_FORMATION"
  | "PERSONEL_AUTRES"
  | "FRAIS_COMMUNICATION_PUB"
  | "FRAIS_ASSURANCE_PRO_MUTUELLE"
  | "FRAIS_HONORAIRE_COMPTABLE"
  | "FRAIS_ENTRETIEN"
  | "FRAIS_DEPLACEMENT"
  | "FRAIS_SOUS_TRAITANCE_AVEC_TVA"
  | "FRAIS_SOUS_TRAITANCE_SANT_TVA"
  | "FRAIS_ASSURANCE_VEHICULE"
  | "FRAIS_JURIDIQUES"
  | "FRAIS_AUTRES"
  | "ACHATS_NECESSAIRE_POUR_MES_SERVICES"
  | "ACHATS_AUTRE"
  | "COMMISSIONS_REDEVANCE_FRANCHISE"
  | "COMMISSIONS_TPE"
  | "COMMISSIONS_IMMOBILIERE"
  | "COMMISSIONS_PLATEFORME"
  | "COMMISSIONS_AUTRES";

export type ChargeFrequence = "MENSUELLE" | "ANNUELLE";

export interface ChargeType {
  typeCharge?: TypeCharge;
  montantCharge?: number;
  frequence?: ChargeFrequence;
}

export type TypeApport =
  | "PERSONEL"
  | "NATURE_FOND_DE_COMMERCE"
  | "NATURE_DROIT_AU_BAIL_OU_PAS_DE_PORTE"
  | "NATURE_BREVET_MARQUE"
  | "NATURE_ACHAT_IMMOBILIERE"
  | "NATURE_FRAIS_ACQUISITION_IMMOBILIERE"
  | "NATURE_TERRAIN"
  | "NATURE_VEHICULE_UTILITAIRE"
  | "NATURE_VEHICULE_TOURISME"
  | "NATURE_MACHINE"
  | "NATURE_OUTIL_ET_MATERIEL_NECESSAIRE_ACTIVITE"
  | "NATURE_MAT_INFORMATIQUE"
  | "NATURE_MEUBLE_DESTINEE_A_AMENAGEMENTS"
  | "NATURE_TRAVAUX_AGENCEMENT"
  | "NATURE_CREATION_SITE_WEB_APPLICATION"
  | "NATURE_LOGICIEL_DEVELOPPE"
  | "NATURE_FRAIS_CREATION_SOCIETE";

export interface ApportType {
  numeroAssocieApporteur?: number;
  typeApport?: TypeApport;
  montantApport?: number;
}

export interface InvestissementType {
  typeInvestissement?: string;
  montantInvestissement?: number;
  dateInvestissement?: string;
}

export type TypeFinancement = "PRET_BANCAIRE" | "SUBVENTION" | "PRET_HONNEUR";

export interface FinancementType {
  typeFinancement?: TypeFinancement;
  montantFinancement?: number;
  dureeFinancement?: number;
  tauxInteret?: number;
}

