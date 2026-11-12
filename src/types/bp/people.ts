export type TypeContrat = "CDI" | "CDD" | "ALTERNANCE";

export type FrequencePaiement = "MENSUELLE" | "ANNUELLE";

export interface EquipeType {
  position?: string;
  dateEmbauche?: string;
  salaire?: number;
  dureeContrat?: number;
  typeContrat?: TypeContrat;
  frequencePaiement?: FrequencePaiement;
}

export type PartenaireAvancement = "A_CONTACTER" | "DEJA_CONTACTE" | "EN_RECHERCHE";

export interface PartenaireType {
  nomPartenaire?: string;
  typePartenaire?: string;
  contact?: string;
  avancement?: PartenaireAvancement;
}

export interface FournisseurType {
  nomFournisseur?: string;
  description?: string;
}

export type SocieteStatutJuridique =
  | "EI"
  | "SARL"
  | "SA"
  | "SNC"
  | "SCS"
  | "SC"
  | "GIE"
  | "SDET";

export interface SocieteType {
  statutJuridique?: SocieteStatutJuridique;
  dateCreationPrevue?: string;
}

export type AssocieSituationActuelle = "EN_ACTIVITE" | "ETUDIANT" | "RETRAITE" | "AUTRE";

export type AssocieTypeProjetEtudiant = "SCOLAIRE" | "SORTIE_ETUDE" | "PARALLELE_ETUDE";

export type FrequencySalaire = "MENSUELLE" | "ANNUELLE";

export interface AssocieType {
  numeroAssocie: number;
  nomPrenom?: string;
  dateNaiss?: string;
  situationActuelle?: AssocieSituationActuelle;
  autreSituation?: string;
  typeProjetEtudiant?: AssocieTypeProjetEtudiant;
  parcoursEtMotivation?: string;
  fichierCV?: string;
  recevoirSalaire?: boolean;
  montantSalaire?: number;
  frequenceSalaire?: FrequencySalaire;
  anneeDebutReceptionSalaire?: number;
  moisDebutReceptionSalaire?: number;
}
