import type { FieldCompletionValidator } from "@/hooks/useBpCompletion";
import { ApportType, ChargeType, FinancementType, InvestissementType, VolumeVentesPrevuesType } from "@/types/bp/finance";
import { ConcurrentType, MoyensCommunicationType, ObjectifsType, ZoneImplantationType } from "@/types/bp/general";
import { OffreType } from "@/types/bp/offers";
import { AssocieType, EquipeType, FournisseurType, PartenaireType } from "@/types/bp/people";

export type CompletionRule = {
    item: string;
    fields?: string[];
    validator?: (getFieldValue: (field: string) => any, bpData: Record<string, any> | null) => boolean;
};

export const defaultCompletionValidators: FieldCompletionValidator[] = [];

export const defaultCompletionRules: CompletionRule[] = [
    { item: "couverture", fields: ["nomProjet", "idImageCouverture"] },
    { item: "contact de référence", fields: ["contactReference.nomContact", "contactReference.emailContact"] },
    { item: "à propos de votre projet", fields: ["aProposProjet.typeActivite", "aProposProjet.typeProjet"] },
    {
        item: "description",
        validator: (getFieldValue) => {
            const description = getFieldValue("description");
            if (typeof description !== "object"
                || description === null
                || !description.descriptionCourte
                || !description.descriptionDetaillee
            ) return false;

            const { descriptionCourte, descriptionDetaillee } = description;

            return (
                typeof descriptionCourte === "string" &&
                descriptionCourte.trim().length > 0 &&
                typeof descriptionDetaillee === "string" &&
                descriptionDetaillee.trim().length > 0
            );
        }
    },
    {
        item: "offres", validator: (getFieldValue) => {
            const offres: OffreType[] = getFieldValue("offres");
            if (!Array.isArray(offres) || offres.length === 0) return false;
            for (const offre of offres) {
                if (!offre || typeof offre !== "object") return false;
                if (!offre.nomOffre || typeof offre.nomOffre !== "string" || offre.nomOffre.trim().length === 0) return false;
                if (!offre.typeOffre || typeof offre.typeOffre !== "string" || offre.typeOffre.trim().length === 0) return false;
                if (!offre.descriptionOffre || typeof offre.descriptionOffre !== "string" || offre.descriptionOffre.trim().length === 0) return false;
            }
            return true;
        }
    },
    { item: "canaux de ventes", fields: ["canauxVente"] },
    {
        item: "moyen de communication",
        validator: (getFieldValue) => {
            const moyensCommunication: MoyensCommunicationType[] = getFieldValue("moyensCommunication");
            if (!Array.isArray(moyensCommunication) || moyensCommunication.length === 0) return false;
            for (const moyen of moyensCommunication) {
                if (!moyen || typeof moyen !== "object") return false;
                if (moyen.moyenCommunication === undefined || moyen.moyenCommunication === null || typeof moyen.moyenCommunication !== "string" || moyen.moyenCommunication.trim().length === 0) return false;
                //PAS BESOI DE DESCRIPTION POUR LE MOMENT
                //if (moyen.descriptionMoyen === undefined || moyen.descriptionMoyen === null || typeof moyen.descriptionMoyen !== "string" || moyen.descriptionMoyen.trim().length === 0) return false;
            }
            return true;
        }
    },
    {
        item: "objectifs",
        validator: (getFieldValue) => {
            const objectif: ObjectifsType = getFieldValue("objectifs");
            if (!objectif || typeof objectif !== "object") return false;
            if (objectif.objectifCourtTerme === undefined || objectif.objectifCourtTerme === null || typeof objectif.objectifCourtTerme !== "string" || objectif.objectifCourtTerme.trim().length === 0) return false;
            if (objectif.objectifMoyenTerme === undefined || objectif.objectifMoyenTerme === null || typeof objectif.objectifMoyenTerme !== "string" || objectif.objectifMoyenTerme.trim().length === 0) return false;
            if (objectif.objectifLongTerme === undefined || objectif.objectifLongTerme === null || typeof objectif.objectifLongTerme !== "string" || objectif.objectifLongTerme.trim().length === 0) return false;
            return true;
        }
    },
    {
        item: "equipe",
        validator: (getFieldValue) => {
            const equipe: EquipeType[] = getFieldValue("equipe");
            if (!Array.isArray(equipe) || equipe.length === 0) return false;
            for (const membre of equipe) {
                if (!membre || typeof membre !== "object") return false;
                if (membre.position === undefined || membre.position === null || typeof membre.position !== "string" || membre.position.trim().length === 0) return false;
                if (membre.dateEmbauche === undefined || membre.dateEmbauche === null || typeof membre.dateEmbauche !== "string" || membre.dateEmbauche.trim().length === 0) return false;
                if (membre.salaire === undefined || membre.salaire === null || typeof membre.salaire !== "number" || membre.salaire <= 0) return false;
                if (membre.typeContrat === undefined || membre.typeContrat === null || typeof membre.typeContrat !== "string" || membre.typeContrat.trim().length === 0) return false;
                if (membre.frequencePaiement === undefined || membre.frequencePaiement === null || typeof membre.frequencePaiement !== "string" || membre.frequencePaiement.trim().length === 0) return false;
                if (membre.typeContrat != "CDI" && (membre.dureeContrat === undefined || membre.dureeContrat === null || typeof membre.dureeContrat !== "number" || membre.dureeContrat <= 0)) return false;
            }
            return true;
        }
    },
    {
        item: "partenaires",
        validator: (getFieldValue) => {
            const partenaires: PartenaireType[] = getFieldValue("partenaires");
            if (!Array.isArray(partenaires) || partenaires.length === 0) return true;
            for (const partenaire of partenaires) {
                if (!partenaire || typeof partenaire !== "object") return false;
                if (partenaire.nomPartenaire === undefined || partenaire.nomPartenaire === null || typeof partenaire.nomPartenaire !== "string" || partenaire.nomPartenaire.trim().length === 0) return false;
                if (partenaire.typePartenaire === undefined || partenaire.typePartenaire === null || typeof partenaire.typePartenaire !== "string" || partenaire.typePartenaire.trim().length === 0) return false;
                if (partenaire.avancement === undefined || partenaire.avancement === null || typeof partenaire.avancement !== "string" || partenaire.avancement.trim().length === 0) return false;
            }
            return true;
        }
    },
    {
        item: "fournisseurs",
        validator: (getFieldValue) => {
            const fournisseurs: FournisseurType[] = getFieldValue("fournisseurs");
            if (!Array.isArray(fournisseurs) || fournisseurs.length === 0) return true;
            for (const fournisseur of fournisseurs) {
                if (!fournisseur || typeof fournisseur !== "object") return false;
                if (fournisseur.nomFournisseur === undefined || fournisseur.nomFournisseur === null || typeof fournisseur.nomFournisseur !== "string" || fournisseur.nomFournisseur.trim().length === 0) return false;
                if (fournisseur.description === undefined || fournisseur.description === null || typeof fournisseur.description !== "string" || fournisseur.description.trim().length === 0) return false;
            }
            return true;
        }
    },
    { item: "nature du projet", fields: ["aProposProjet.typeProjet"] },
    { item: "statut juridique", fields: ["societe.statutJuridique"] },
    {
        item: "associés",
        validator: (getFieldValue) => {
            const associes: AssocieType[] = getFieldValue("associe");
            if (!Array.isArray(associes) || associes.length === 0) return false;
            for (const associate of associes) {
                if (!associate || typeof associate !== "object") return false;
                if (associate.nomPrenom === undefined || associate.nomPrenom === null || typeof associate.nomPrenom !== "string" || associate.nomPrenom.trim().length === 0) return false;
                if (associate.dateNaiss === undefined || associate.dateNaiss === null || typeof associate.dateNaiss !== "string" || associate.dateNaiss.trim().length === 0) return false;
                if (associate.situationActuelle === undefined || associate.situationActuelle === null || typeof associate.situationActuelle !== "string" || associate.situationActuelle.trim().length === 0) return false;
                if (associate.situationActuelle === "AUTRE"
                    && (associate.autreSituation === undefined || associate.autreSituation === null || typeof associate.autreSituation !== "string" || associate.autreSituation.trim().length === 0)) return false;
                if (associate.situationActuelle === "ETUDIANT"
                    && (associate.typeProjetEtudiant === undefined || associate.typeProjetEtudiant === null || typeof associate.typeProjetEtudiant !== "string" || associate.typeProjetEtudiant.trim().length === 0)) return false;
                if (associate.parcoursEtMotivation === undefined || associate.parcoursEtMotivation === null || typeof associate.parcoursEtMotivation !== "string" || associate.parcoursEtMotivation.trim().length === 0) return false;
                if (associate.recevoirSalaire === undefined || associate.recevoirSalaire === null || typeof associate.recevoirSalaire !== "boolean") return false;
                if (associate.recevoirSalaire
                    && (associate.montantSalaire === undefined || associate.montantSalaire === null || typeof associate.montantSalaire !== "number" || associate.montantSalaire <= 0)) return false;
                if (associate.recevoirSalaire
                    && (associate.frequenceSalaire === undefined || associate.frequenceSalaire === null || typeof associate.frequenceSalaire !== "string" || associate.frequenceSalaire.trim().length === 0)) return false;
            }
            return true;
        },
    },
    { item: "informations sur mon activité", fields: ["informationsActivite"] },
    {
        item: "zone d'implantation", validator: (getFieldValue) => {
            const zoneImplantation: ZoneImplantationType = getFieldValue("zoneImplantation");
            if (!zoneImplantation || typeof zoneImplantation !== "object") return false;
            if (zoneImplantation.adresseComplete === undefined || zoneImplantation.adresseComplete === null || typeof zoneImplantation.adresseComplete !== "string" || zoneImplantation.adresseComplete.trim().length === 0) return false;
            if (zoneImplantation.codePostal === undefined || zoneImplantation.codePostal === null || typeof zoneImplantation.codePostal !== "string" || zoneImplantation.codePostal.trim().length === 0) return false;
            if (zoneImplantation.ville === undefined || zoneImplantation.ville === null || typeof zoneImplantation.ville !== "string" || zoneImplantation.ville.trim().length === 0) return false;
            if (!zoneImplantation.coordonneesGps || typeof zoneImplantation.coordonneesGps !== "object") return false;
            if (zoneImplantation.coordonneesGps.latitude === undefined || zoneImplantation.coordonneesGps.latitude === null || typeof zoneImplantation.coordonneesGps.latitude !== "number") return false;
            if (zoneImplantation.coordonneesGps.longitude === undefined || zoneImplantation.coordonneesGps.longitude === null || typeof zoneImplantation.coordonneesGps.longitude !== "number") return false;
            return true;
        }
    },
    { item: "concurrents",
        validator: (getFieldValue) => {
            const concurrents: ConcurrentType[] = getFieldValue("concurrents");
            if (!Array.isArray(concurrents) || concurrents.length === 0) return true;
            for (const concurrent of concurrents) {
                if (!concurrent || typeof concurrent !== "object") return false;
                if (concurrent.nomConcurrent === undefined || concurrent.nomConcurrent === null || typeof concurrent.nomConcurrent !== "string" || concurrent.nomConcurrent.trim().length === 0) return false;
                if (concurrent.pointsForts === undefined || concurrent.pointsForts === null || typeof concurrent.pointsForts !== "string" || concurrent.pointsForts.trim().length === 0) return false;
                if (concurrent.pointsFaibles === undefined || concurrent.pointsFaibles === null || typeof concurrent.pointsFaibles !== "string" || concurrent.pointsFaibles.trim().length === 0) return false;
            }
            return true;
        }
    },
    { item: "clients", fields: ["clients.descriptionClients"] },
    { item: "prix de vente",
        validator: (getFieldValue) => {
            const offres: OffreType[] = getFieldValue("offres");
            if (!Array.isArray(offres) || offres.length === 0) return false;
            for (const offre of offres) {
                if (!offre || typeof offre !== "object") return false;
                if (offre.prixVente === undefined || offre.prixVente === null || typeof offre.prixVente !== "object") return false;
                if (offre.prixVente.prixDeVenteHT === undefined || offre.prixVente.prixDeVenteHT === null || typeof offre.prixVente.prixDeVenteHT !== "number" || offre.prixVente.prixDeVenteHT <= 0) return false;
                if (offre.prixVente.TVA === undefined || offre.prixVente.TVA === null || typeof offre.prixVente.TVA !== "number" || offre.prixVente.TVA < 0) return false;
                if (offre.prixVente.prixDeVenteTTC === undefined || offre.prixVente.prixDeVenteTTC === null || typeof offre.prixVente.prixDeVenteTTC !== "number" || offre.prixVente.prixDeVenteTTC <= 0) return false;
            }
            return true;
        }
    },
    { item: "coût unitaire par produit",
        validator: (getFieldValue) => {
            var offres: OffreType[] = getFieldValue("offres");
            if (!Array.isArray(offres) || offres.length === 0) return true;
            for (const offre of offres.filter((offre) => offre.typeOffre === "PRODUIT")) {
                if (!offre || typeof offre !== "object") return false;
                if (offre.coutUnitaireHT === undefined || offre.coutUnitaireHT === null || typeof offre.coutUnitaireHT !== "number" || offre.coutUnitaireHT <= 0) return false;
                if (offre.TVA === undefined || offre.TVA === null || typeof offre.TVA !== "number" || offre.TVA < 0) return false;
                if (offre.coutUnitaireTTC === undefined || offre.coutUnitaireTTC === null || typeof offre.coutUnitaireTTC !== "number" || offre.coutUnitaireTTC <= 0) return false;
            }
            return true;
        }
    },
    { item: "apports",
        validator: (getFieldValue) => {
            const apports: ApportType[] = getFieldValue("apports");
            if (!Array.isArray(apports) || apports.length === 0) return true;
            for (const apport of apports) {
                if (!apport || typeof apport !== "object") return false;
                if (apport.typeApport === undefined || apport.typeApport === null || typeof apport.typeApport !== "string" || apport.typeApport.trim().length === 0) return false;
                if ((apport.typeApport != "PERSONEL")
                    && (apport.montantApport === undefined || apport.montantApport === null || typeof apport.montantApport !== "number" || apport.montantApport <= 0)) return false;
            }
            return true;
        }
    },
    { item: "volume des ventes",
        validator: (getFieldValue) => {
            const volumeVentesPrevues: VolumeVentesPrevuesType = getFieldValue("volumeVentesPrevues");
            if (!volumeVentesPrevues || typeof volumeVentesPrevues !== "object") return false;
            if (volumeVentesPrevues.nbJourTravailleParSemaine === undefined || volumeVentesPrevues.nbJourTravailleParSemaine === null || typeof volumeVentesPrevues.nbJourTravailleParSemaine !== "number" || volumeVentesPrevues.nbJourTravailleParSemaine <= 0) return false;
            if (volumeVentesPrevues.modePayement === undefined || volumeVentesPrevues.modePayement === null || typeof volumeVentesPrevues.modePayement !== "string" || volumeVentesPrevues.modePayement.trim().length === 0) return false;
            if (volumeVentesPrevues.activiteSaisonniere) {
                if (volumeVentesPrevues.saisonNormale === undefined || volumeVentesPrevues.saisonNormale === null || !Array.isArray(volumeVentesPrevues.saisonNormale) || volumeVentesPrevues.saisonNormale.length === 0) return false;
                for (const mois of volumeVentesPrevues.saisonNormale) {
                    if (typeof mois !== "number" || mois < 1 || mois > 12) return false;
                }
            }


            const offres: OffreType[] = getFieldValue("offres");
            if (!Array.isArray(offres) || offres.length === 0) return false;
            for (const offre of offres) {
                if (!offre || typeof offre !== "object") return false;
                if (offre.hypotheseVentePremiereAnnee === undefined || offre.hypotheseVentePremiereAnnee === null || typeof offre.hypotheseVentePremiereAnnee !== "object") return false;
                if (!offre.hypotheseVentePremiereAnnee || typeof offre.hypotheseVentePremiereAnnee !== "object") return false;
                if (offre.hypotheseVentePremiereAnnee.nbrVente === undefined || offre.hypotheseVentePremiereAnnee.nbrVente === null || typeof offre.hypotheseVentePremiereAnnee.nbrVente !== "number" || offre.hypotheseVentePremiereAnnee.nbrVente <= 0) return false;
                if (offre.hypotheseVentePremiereAnnee.frequenceVente === undefined || offre.hypotheseVentePremiereAnnee.frequenceVente === null || typeof offre.hypotheseVentePremiereAnnee.frequenceVente !== "string" || offre.hypotheseVentePremiereAnnee.frequenceVente.trim().length === 0) return false;
            }

            return true;
        }
    },
    { item: "croissance", fields: ["croissancesPrevues.tauxCroissanceAnnee1"] },
    { item: "charges",
        validator: (getFieldValue) => {
            const charges: ChargeType[] = getFieldValue("chargesPremiereAnnee");
            if (!Array.isArray(charges) || charges.length === 0) return true;
            for (const charge of charges) {
                if (!charge || typeof charge !== "object") return false;
                if (charge.typeCharge === undefined || charge.typeCharge === null || typeof charge.typeCharge !== "string" || charge.typeCharge.trim().length === 0) return false;
                if (charge.montantCharge === undefined || charge.montantCharge === null || typeof charge.montantCharge !== "number" || charge.montantCharge <= 0) return false;
                if (charge.frequence === undefined || charge.frequence === null || typeof charge.frequence !== "string" || charge.frequence.trim().length === 0) return false;
            }
            return true;
        }
    },
    { item: "investissements",
        validator: (getFieldValue) => {
            const investissements: InvestissementType[] = getFieldValue("investissements");
            if (!Array.isArray(investissements) || investissements.length === 0) return true;
            for (const investissement of investissements) {
                if (!investissement || typeof investissement !== "object") return false;
                if (investissement.typeInvestissement === undefined || investissement.typeInvestissement === null || typeof investissement.typeInvestissement !== "string" || investissement.typeInvestissement.trim().length === 0) return false;
                if (investissement.montantInvestissement === undefined || investissement.montantInvestissement === null || typeof investissement.montantInvestissement !== "number" || investissement.montantInvestissement <= 0) return false;
                // NON SPECIFIÉ POUR LE MOMENT
                // if (investissement.dateInvestissement === undefined || investissement.dateInvestissement === null || typeof investissement.dateInvestissement !== "string" || investissement.dateInvestissement.trim().length === 0) return false;
            }
            return true;
        }
    },
    { item: "financements",
        validator: (getFieldValue) => {
            const financements: FinancementType[] = getFieldValue("financements");
            if (!Array.isArray(financements) || financements.length === 0) return true;
            for (const financement of financements) {
                if (!financement || typeof financement !== "object") return false;
                if (financement.typeFinancement === "PRET_BANCAIRE") {
                    if (financement.montantFinancement === undefined || financement.montantFinancement === null || typeof financement.montantFinancement !== "number" || financement.montantFinancement <= 0) return false;
                    if (financement.dureeFinancement === undefined || financement.dureeFinancement === null || typeof financement.dureeFinancement !== "number" || financement.dureeFinancement <= 0) return false;
                    if (financement.tauxInteret === undefined || financement.tauxInteret === null || typeof financement.tauxInteret !== "number" || financement.tauxInteret < 0) return false;
                }

                if (financement.typeFinancement === "SUBVENTION") {
                    if (financement.montantFinancement === undefined || financement.montantFinancement === null || typeof financement.montantFinancement !== "number" || financement.montantFinancement <= 0) return false;
                }

                if (financement.typeFinancement === "PRET_HONNEUR") {
                    if (financement.montantFinancement === undefined || financement.montantFinancement === null || typeof financement.montantFinancement !== "number" || financement.montantFinancement <= 0) return false;
                    if (financement.dureeFinancement === undefined || financement.dureeFinancement === null || typeof financement.dureeFinancement !== "number" || financement.dureeFinancement <= 0) return false;
                }
            }
            return true;
        }
    },
];
