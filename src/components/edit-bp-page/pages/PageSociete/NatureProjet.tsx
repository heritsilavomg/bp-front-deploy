"use client";

import { useEffect, useMemo, useState } from "react";
import type { AssocieType, SocieteStatutJuridique } from "@/types/bp/people";
import {
    updateArrayFieldItemUsingIndex,
    updateArrayFieldItemUsingMatchingKeyValue,
} from "@/hooks/useBpEditor";

type NatureProjetProps = {
    onFieldChange?: (field: string, value: any) => void;
    getFieldValue?: (field: string) => any;
};

type LegalStatusRule = {
    code: SocieteStatutJuridique;
    nom: string;
    nombreMinimumParticipants: number;
    nombreMaximumParticipants: number | null;
    typeParticipants: string;
    description?: string;
    regles?: {
        minimumParticipants?: number;
        maximumParticipants?: number;
    };
};

const FALLBACK_STATUS: LegalStatusRule[] = [
    { code: "SARL", nom: "Société à Responsabilité Limitée", nombreMinimumParticipants: 2, nombreMaximumParticipants: null, typeParticipants: "associés" },
    { code: "SA", nom: "Société Anonyme", nombreMinimumParticipants: 1, nombreMaximumParticipants: null, typeParticipants: "actionnaires" },
    { code: "EI", nom: "Entreprise Individuelle", nombreMinimumParticipants: 1, nombreMaximumParticipants: 1, typeParticipants: "dirigeant" },
    { code: "SCS", nom: "Société en Commandite Simple", nombreMinimumParticipants: 2, nombreMaximumParticipants: null, typeParticipants: "associés" },
    { code: "SNC", nom: "Société en Nom Collectif", nombreMinimumParticipants: 2, nombreMaximumParticipants: null, typeParticipants: "associés" },
    { code: "SC", nom: "Société Civile", nombreMinimumParticipants: 2, nombreMaximumParticipants: null, typeParticipants: "associés" },
    { code: "GIE", nom: "Groupement d'Intérêt Économique", nombreMinimumParticipants: 2, nombreMaximumParticipants: null, typeParticipants: "membres" },
    { code: "SDET", nom: "Société de Droit Étranger", nombreMinimumParticipants: 1, nombreMaximumParticipants: null, typeParticipants: "société étrangère" },
];

const statusLabel = (status: LegalStatusRule) => `${status.nom} (min. ${status.nombreMinimumParticipants} ${status.nombreMinimumParticipants > 1 ? "associés" : "associé"})`;

function createEmptyAssociate(numeroAssocie: number): AssocieType {
    return {
        numeroAssocie,
        nomPrenom: "",
        dateNaiss: "",
        situationActuelle: "ETUDIANT",
        typeProjetEtudiant: "SCOLAIRE",
        parcoursEtMotivation: "",
        recevoirSalaire: false,
        montantSalaire: 0,
        frequenceSalaire: undefined,
        anneeDebutReceptionSalaire: 0,
        moisDebutReceptionSalaire: 0,
    };
}

function getMinimumParticipants(status?: LegalStatusRule) {
    return status?.regles?.minimumParticipants ?? status?.nombreMinimumParticipants ?? 1;
}

export default function NatureProjet({ getFieldValue, onFieldChange }: NatureProjetProps) {
    const [legalStatuses, setLegalStatuses] = useState<LegalStatusRule[]>(FALLBACK_STATUS);
    const [isLoadingStatuses, setIsLoadingStatuses] = useState(true);
    const [yearErrors, setYearErrors] = useState<Record<number, string>>({});
    const selectedStatusCode = getFieldValue?.("societe.statutJuridique") as SocieteStatutJuridique | undefined;
    const selectedStatus = legalStatuses.find((status) => status.code === selectedStatusCode) ?? legalStatuses[0];
    const associates = (getFieldValue?.("associe") as AssocieType[] | undefined) ?? [];
    const minimumParticipants = getMinimumParticipants(selectedStatus);
    const maximumParticipants = selectedStatus?.regles?.maximumParticipants ?? selectedStatus?.nombreMaximumParticipants ?? null;

    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 20;
    const maxYear = currentYear + 20;
    const salaryStartYearOptions = useMemo(
        () => Array.from({ length: maxYear - minYear + 1 }, (_, index) => minYear + index),
        [minYear, maxYear],
    );

    const validateStartYear = (year?: number | null) => {
        if (year === undefined || year === null) {
            return "Veuillez sélectionner l'année de début du salaire.";
        }

        if (!Number.isInteger(year)) {
            return "L'année doit être un nombre entier valide.";
        }

        if (year < minYear) {
            return `L'année de début doit être au minimum ${minYear}.`;
        }

        if (year > maxYear) {
            return `L'année de début doit être au plus ${maxYear}.`;
        }

        return null;
    };

    useEffect(() => {
        const nextErrors: Record<number, string> = {};

        associates.forEach((associate) => {
            if (associate.recevoirSalaire) {
                const error = validateStartYear(associate.anneeDebutReceptionSalaire);
                if (error) {
                    nextErrors[associate.numeroAssocie] = error;
                }
            }
        });

        setYearErrors(nextErrors);
    }, [associates, currentYear]);

    useEffect(() => {
        let mounted = true;

        async function loadLegalStatuses() {
            try {
                const response = await fetch("/api/sj");
                if (!response.ok) throw new Error("Impossible de charger les statuts juridiques.");
                const data = await response.json();
                if (mounted && Array.isArray(data) && data.length > 0) setLegalStatuses(data);
            } catch {
                // Keep the local list available if the API is temporarily unavailable.
            } finally {
                if (mounted) setIsLoadingStatuses(false);
            }
        }

        void loadLegalStatuses();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!selectedStatusCode || !selectedStatus || associates.length >= minimumParticipants) return;

        const nextAssociates = [...associates];
        for (let index = nextAssociates.length; index < minimumParticipants; index += 1) {
            nextAssociates.push(createEmptyAssociate(index + 1));
        }
        onFieldChange?.("associe", nextAssociates);
    }, [associates, minimumParticipants, onFieldChange, selectedStatus]);

    const orderedAssociates = useMemo(
        () => [...associates].sort((first, second) => first.numeroAssocie - second.numeroAssocie),
        [associates],
    );

    const updateAssociate = (numeroAssocie: number, field: keyof AssocieType, value: any) => {
        const nextAssociates = updateArrayFieldItemUsingMatchingKeyValue(
            associates,
            "numeroAssocie",
            numeroAssocie,
            field,
            value,
        );
        onFieldChange?.("associe", nextAssociates);
    };

    const updateAssociateByIndex = (index: number, field: keyof AssocieType, value: any) => {
        onFieldChange?.("associe", updateArrayFieldItemUsingIndex(associates, index, field, value));
    };

    const addAssociate = () => {
        if (maximumParticipants !== null && associates.length >= maximumParticipants) return;
        const nextNumero = associates.reduce((max, associate) => Math.max(max, associate.numeroAssocie), 0) + 1;
        onFieldChange?.("associe", [...associates, createEmptyAssociate(nextNumero)]);
    };

    const removeAssociate = (numeroAssocie: number) => {
        if (numeroAssocie <= minimumParticipants) return;
        onFieldChange?.("associe", associates.filter((associate) => associate.numeroAssocie !== numeroAssocie));
    };

    const uploadCv = async (numeroAssocie: number, file?: File) => {
        if (!file) return;
        const formData = new FormData();
        formData.append("fichier", file);
        formData.append("categorie", "CV");

        try {
            const response = await fetch("/api/fichier/fichiers/upload", { method: "POST", body: formData });
            if (!response.ok) throw new Error("Impossible d'uploader le CV.");
            const data = await response.json();
            updateAssociate(numeroAssocie, "fichierCV", data?.id?.toString() ?? "");
        } catch {
            // The form remains usable when the optional CV upload fails.
        }
    };

    return (
        <div className="space-y-10 p-6 sm:p-8">
            <section>
                <span id="nature-du-projet" />
                <h2 className="text-lg font-semibold text-slate-900">Nature du projet</h2>
                <p className="mt-4 text-sm text-slate-700">
                    Mon projet est :
                    <select
                        value={getFieldValue?.("aProposProjet.typeProjet") ?? "CREATION"}
                        onChange={(event) => onFieldChange?.("aProposProjet.typeProjet", event.target.value)}
                        className="ml-3 cursor-pointer rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-cyan-500/20"
                    >
                        <option value="CREATION">une création</option>
                        <option value="FRANCHISE">une franchise</option>
                        <option value="REPRISE">une reprise</option>
                        <option value="ENTREPRISE_EXISTANTE">une entreprise existante</option>
                    </select>
                </p>
                <p className="mt-4 text-sm text-slate-700">Activité principale : {getFieldValue?.("aProposProjet.typeActivite") || "-"}</p>
                <p className="mt-3 text-sm text-slate-700">
                    Catégorie : <a href="https://www.instat.mg/documents/upload/main/INSTAT_Nomac_27_11_2013.pdf" target="_blank" rel="noreferrer" className="text-cyan-700 hover:text-cyan-900">code activité</a> {getFieldValue?.("aProposProjet.codeActivite") || "-"}
                </p>
            </section>

            <section>
                <span id="statut-juridique" />
                <h2 className="text-lg font-semibold text-slate-900">Statut juridique</h2>
                <p className="mt-4 text-sm text-slate-700">
                    J&apos;envisage de créer une
                    <select
                        value={selectedStatusCode ?? ""}
                        onChange={(event) => onFieldChange?.("societe.statutJuridique", event.target.value)}
                        className="ml-3 cursor-pointer max-w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-cyan-500/20"
                    >
                        {legalStatuses.map((status) => <option key={status.code} value={status.code}>{statusLabel(status)}</option>)}
                    </select>
                </p>
                {isLoadingStatuses && <p className="mt-2 text-xs text-slate-500">Chargement des règles juridiques...</p>}
                {selectedStatus?.description && <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">{selectedStatus.description}</p>}
            </section>

            <section>
                <span id="associes" />
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-slate-900">Associés</h2>
                    <p className="text-sm text-slate-500">Minimum requis : {minimumParticipants} {minimumParticipants > 1 ? "associés" : "associé"}</p>
                </div>

                <div className="mt-5 space-y-6">
                    {orderedAssociates.map((associate, index) => {
                        const isRequired = index < minimumParticipants;
                        return (
                            <article key={associate.numeroAssocie} className="overflow-hidden border border-slate-400 bg-white">
                                <div className="border-b border-slate-400 bg-slate-50 px-4 py-3 text-center text-sm text-slate-700">
                                    Associé n°{associate.numeroAssocie} {isRequired && <span className="text-xs text-slate-400">(obligatoire)</span>}
                                </div>
                                <div className="space-y-5 p-5 sm:p-7">
                                    <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,180px)] sm:items-center">
                                        <label className="text-sm text-slate-700">Prénom Nom</label>
                                        <input value={associate.nomPrenom ?? ""} onChange={(event) => updateAssociate(associate.numeroAssocie, "nomPrenom", event.target.value)} placeholder="Ex : Thomas Dupont" className="rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20" />
                                        <label className="text-sm text-slate-700">né le</label>
                                        <input type="date" value={(associate.dateNaiss ?? "").slice(0, 10)} onChange={(event) => updateAssociate(associate.numeroAssocie, "dateNaiss", event.target.value)} className="rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500/20" />
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,220px)] sm:items-center">
                                        <label className="text-sm text-slate-700">Ma situation actuelle est</label>
                                        <select value={associate.situationActuelle ?? ""} onChange={(event) => updateAssociate(associate.numeroAssocie, "situationActuelle", event.target.value || undefined)} className="cursor-pointer rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500/20">
                                            <option value="">Sélectionnez une situation</option>
                                            <option value="EN_ACTIVITE">En activité</option>
                                            <option value="ETUDIANT">Étudiant</option>
                                            <option value="RETRAITE">Retraité</option>
                                            <option value="AUTRE">Autre</option>
                                        </select>
                                    </div>

                                    {associate.situationActuelle === "ETUDIANT" && (
                                        <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,220px)] sm:items-center">
                                            <label className="text-sm text-slate-700">Mon projet étudiant est</label>
                                            <select value={associate.typeProjetEtudiant ?? ""} onChange={(event) => updateAssociate(associate.numeroAssocie, "typeProjetEtudiant", event.target.value || undefined)} className="cursor-pointer rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500/20">
                                                <option value="">Sélectionnez un projet</option>
                                                <option value="SCOLAIRE">Un projet scolaire</option>
                                                <option value="SORTIE_ETUDE">Une sortie d&apos;études</option>
                                                <option value="PARALLELE_ETUDE">En parallèle des études</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
                                        <label className="text-sm text-slate-700">Mon parcours et mes motivations</label>
                                        <textarea value={associate.parcoursEtMotivation ?? ""} onChange={(event) => updateAssociate(associate.numeroAssocie, "parcoursEtMotivation", event.target.value)} placeholder="Présentez votre parcours et vos motivations" rows={3} className="resize-none rounded-xl border-0 bg-slate-50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20" />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,220px)] sm:items-center">
                                        <label className="text-sm text-slate-700">L&apos;entreprise</label>
                                        <select value={associate.recevoirSalaire ? "SALAIRE" : "PAS_DE_SALAIRE"} onChange={(event) => updateAssociate(associate.numeroAssocie, "recevoirSalaire", event.target.value === "SALAIRE")} className="cursor-pointer rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500/20">
                                            <option value="SALAIRE">me versera un salaire</option>
                                            <option value="PAS_DE_SALAIRE">ne me versera pas de salaire</option>
                                        </select>
                                    </div>

                                    {associate.recevoirSalaire && (
                                        <>
                                            <div className="grid gap-3 sm:grid-cols-[auto_90px_auto_140px] sm:items-center">
                                                <span className="text-sm text-slate-700">de</span>
                                                <div className="flex items-center rounded-xl bg-slate-50 pr-3 focus-within:ring-2 focus-within:ring-cyan-500/20">
                                                    <input type="number" min={0} value={associate.montantSalaire ?? 0} onChange={(event) => updateAssociate(associate.numeroAssocie, "montantSalaire", Number(event.target.value))} className="min-w-0 flex-1 rounded-xl border-0 bg-transparent px-3 py-2 text-right text-sm outline-none" />
                                                    <span className="text-sm text-slate-500">Ar</span>
                                                </div>
                                                <span className="text-sm text-slate-700">brut par</span>
                                                <select value={associate.frequenceSalaire ?? ""} onChange={(event) => updateAssociate(associate.numeroAssocie, "frequenceSalaire", event.target.value || undefined)} className="cursor-pointer rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20">
                                                    <option value="">Sélectionnez une fréquence</option>
                                                    <option value="MENSUELLE">par mois</option>
                                                    <option value="ANNUELLE">par an</option>
                                                </select>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-[1fr_1fr] sm:items-center">
                                                <label className="text-sm text-slate-700">Mois de début</label>
                                                <select value={associate.moisDebutReceptionSalaire ?? ""} onChange={(event) => updateAssociate(associate.numeroAssocie, "moisDebutReceptionSalaire", event.target.value === "" ? undefined : Number(event.target.value))} className="cursor-pointer rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500/20">
                                                    <option value="">Sélectionnez un mois</option>
                                                    <option value="1">Janvier</option>
                                                    <option value="2">Février</option>
                                                    <option value="3">Mars</option>
                                                    <option value="4">Avril</option>
                                                    <option value="5">Mai</option>
                                                    <option value="6">Juin</option>
                                                    <option value="7">Juillet</option>
                                                    <option value="8">Août</option>
                                                    <option value="9">Septembre</option>
                                                    <option value="10">Octobre</option>
                                                    <option value="11">Novembre</option>
                                                    <option value="12">Décembre</option>
                                                </select>

                                                <label className="text-sm text-slate-700">Année de début</label>
                                                <select value={associate.anneeDebutReceptionSalaire ?? ""} onChange={(event) => updateAssociate(associate.numeroAssocie, "anneeDebutReceptionSalaire", event.target.value === "" ? undefined : Number(event.target.value))} className="cursor-pointer rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500/20">
                                                    <option value="">Sélectionnez une année</option>
                                                    {salaryStartYearOptions.map((yearOption) => (
                                                        <option key={yearOption} value={yearOption}>
                                                            {yearOption}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {yearErrors[associate.numeroAssocie] && (
                                                <p className="mt-2 text-sm text-rose-600">{yearErrors[associate.numeroAssocie]}</p>
                                            )}
                                        </>
                                    )}

                                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                                        <span>CV (pdf, word)</span>
                                        <label className="cursor-pointer rounded-full border border-cyan-600 px-3 py-1.5 text-cyan-700 transition hover:bg-cyan-50">
                                            {associate.fichierCV ? "CV joint" : "Joindre un CV"}
                                            <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(event) => void uploadCv(associate.numeroAssocie, event.target.files?.[0])} />
                                        </label>
                                    </div>

                                    {!isRequired && (
                                        <div className="flex justify-end border-t border-slate-100 pt-4">
                                            <button type="button" onClick={() => removeAssociate(associate.numeroAssocie)} className="rounded-full border border-red-600 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50">Supprimer cet associé</button>
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>

                {(maximumParticipants === null || associates.length < maximumParticipants) && (
                    <button type="button" onClick={addAssociate} className="mt-6 rounded-full border border-cyan-600 px-4 py-2 text-sm font-medium text-cyan-700 transition hover:bg-cyan-50">Ajouter un associé</button>
                )}
            </section>
        </div>
    );
}
