// NOMAC Entity Types
export interface SectionEntity {
    code: string; // 1 character
    libelle?: string;
    nomSection?: string;
    searchText?: string;
}

export interface DivisionEntity {
    code: string; // 2 characters
    libelle?: string;
    nomDivision?: string;
    searchText?: string;
}

export interface GroupeEntity {
    code: string; // 3 characters
    libelle?: string;
    nomGroupe?: string;
    searchText?: string;
}

export interface ClasseEntity {
    code: string; // 4 characters
    nom: string;
    libelle?: string;
    searchText?: string;
}

export interface CategorieEntity {
    code: string; // 5 characters
    libelle?: string;
    nom?: string;
    searchText?: string;
}

export interface GlobalNomacResult {
    type: 'SECTION' | 'DIVISION' | 'GROUPE' | 'CLASSE' | 'CATEGORIE';
    code: string;
    libelle?: string;
    nom?: string;
    sectionCode?: string;
    sectionLibelle?: string;
    divisionCode?: string;
    divisionLibelle?: string;
    groupeCode?: string;
    groupeLibelle?: string;
    classeCode?: string;
    classeLibelle?: string;
    score: number;
}

export interface ErrorResponse {
    code: string;
    message: string;
    description: string;
}
