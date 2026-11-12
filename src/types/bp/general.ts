export interface ContactReferenceType {
  nomContact?: string;
  emailContact?: string;
  telephoneContact?: string;
}

export type TypeProjet = "CREATION" | "FRANCHISE" | "REPRISE" | "ENTREPRISE_EXISTANTE";

export interface AProposProjetType {
  autreTypeActivite?: string;
  typeActivite?: string;
  codeActivite?: string;
  typeProjet?: TypeProjet;
  adresseSiege?: string;
}

export interface DescriptionProjetType {
  descriptionCourte?: string;
  descriptionDetaillee?: string;
}

export interface MoyensCommunicationType {
  moyenCommunication?: string;
  descriptionMoyen?: string;
}

export interface ObjectifsType {
  objectifCourtTerme?: string;
  objectifMoyenTerme?: string;
  objectifLongTerme?: string;
}

export interface ConcurrentType {
  nomConcurrent?: string;
  pointsForts?: string;
  pointsFaibles?: string;
}

export interface ClientsType {
  descriptionClients?: string;
  zoneChalandise?: string;
}

export interface GeoLocationType {
  latitude?: number;
  longitude?: number;
}

export interface ZoneImplantationType {
  adresseComplete?: string;
  codePostal?: string;
  ville?: string;
  coordonneesGps?: GeoLocationType;
}
