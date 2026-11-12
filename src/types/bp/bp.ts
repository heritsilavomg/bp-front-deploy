import type {
    ContactReferenceType,
    AProposProjetType,
    DescriptionProjetType,
    MoyensCommunicationType,
    ObjectifsType,
    ConcurrentType,
    ClientsType,
    ZoneImplantationType,
} from "./general";
import type { OffreType } from "./offers";
import type {
    EquipeType,
    PartenaireType,
    FournisseurType,
    SocieteType,
    AssocieType,
} from "./people";
import type {
    VolumeVentesPrevuesType,
    CroissancesPrevuesType,
    ChargeType,
    ApportType,
    InvestissementType,
    FinancementType,
    PaiementCondition,
} from "./finance";
import type {
    AnalyseRisquesType,
    ContraintesIdentifieesType,
    PlanUrgenceType,
} from "./risques";

export type ValidationStatus = "BROUILLON" | "EN_COURS" | "VALIDE" | "REJETE";

export interface BpType {
    id?: string;
    idImageCouverture?: string;
    nomProjet?: string;
    idImageLogo?: string;
    contactReference?: ContactReferenceType;
    aProposProjet?: AProposProjetType;
    description?: DescriptionProjetType;
    offres?: OffreType[];
    canauxVente?: string[];
    moyensCommunication?: MoyensCommunicationType[];
    objectifs?: ObjectifsType;
    equipe?: EquipeType[];
    partenaires?: PartenaireType[];
    fournisseurs?: FournisseurType[];
    societe?: SocieteType;
    associe?: AssocieType[];
    informationsActivite?: string;
    zoneImplantation?: ZoneImplantationType;
    concurrents?: ConcurrentType[];
    clients?: ClientsType;
    modePayementFournisseur?: PaiementCondition;
    volumeVentesPrevues?: VolumeVentesPrevuesType;
    croissancesPrevues?: CroissancesPrevuesType;
    chargesPremiereAnnee?: ChargeType[];
    chargesDeuxiemeAnnee?: ChargeType[];
    chargesTroisiemeAnnee?: ChargeType[];
    apports?: ApportType[];
    nbrMoisCouvertParTresorerieDepart?: number;
    garantieLoyer?: number;
    stockDeDepart?: number;
    joursStockSecurite?: number;
    delaiRealisationServiceJours?: number;
    pourcentageClientsAvecDelai?: number;
    pourcentageFraisAvecDelai?: number;
    investissements?: InvestissementType[];
    financements?: FinancementType[];
    analyseRisques?: AnalyseRisquesType[];
    contraintesIdentifiees?: ContraintesIdentifieesType[];
    planUrgence?: PlanUrgenceType;
    statutValidation?: ValidationStatus;
    utilisateurCreateur: string;
    dateCreationBusinessPlan?: string;
    dateDerniereModification?: string;
    versionBusinessPlan?: string;
    fichiersJoints?: string[];
}
