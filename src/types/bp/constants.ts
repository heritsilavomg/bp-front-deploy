export interface ConfigEntry {
    key?: string;
    value?: string;
    valueType?: string;
    group?: string;
    description?: string;
}

export interface ConfigKey {
    key: string;
    description: string;
    valueType: string;
    group: string;
}

export interface Amortissement {
    typeKey?: string;
    tauxAnnuel?: number;
    dureeAnnees?: number;
}

export interface AmortissementKey {
    typeKey: string;
    tauxAnnuel: number;
    dureeAnnees: number;
}

export interface StatutJuridique {
    code?: string;
    nom?: string;
    nombreMinimumParticipants?: number;
    nombreMaximumParticipants?: number | null;
    typeParticipants?: string;
    description?: string;
    caracteristiques?: string[];
    profilIdeal?: string;
    regles?: Record<string, unknown>;
}

export interface StatutJuridiqueKey {
    code: string;
    nom: string;
    typeParticipants: string;
}
