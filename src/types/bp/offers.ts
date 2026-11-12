export type OffreTypeOffre = "PRODUIT" | "SERVICE";

export type HypotheseVenteFrequence =
  | "QUOTIDIENNE"
  | "HEBDOMADAIRE"
  | "MENSUELLE"
  | "TRIMESTRIELLE"
  | "ANNUELLE";

export interface HypotheseVentePremiereAnneesType {
  nbrVente?: number;
  frequenceVente?: HypotheseVenteFrequence;
}

export interface PrixDeVenteOffresType {
  prixDeVenteHT?: number;
  TVA?: number;
  prixDeVenteTTC?: number;
}

export interface OffreType {
  offerId?: string;
  nomOffre?: string;
  prixVente?: PrixDeVenteOffresType;
  descriptionOffre?: string;
  typeOffre?: OffreTypeOffre;
  coutUnitaireHT?: number;
  TVA?: number;
  coutUnitaireTTC?: number;
  hypotheseVentePremiereAnnee?: HypotheseVentePremiereAnneesType;
}
