"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import type { ChargeType, ChargeFrequence, TypeCharge, VolumeVentesPrevuesType } from "@/types/bp/finance";
import type { OffreType, HypotheseVenteFrequence } from "@/types/bp/offers";

type Props = {
    onFieldChange: (field: string, value: any) => void;
    getFieldValue: (field: string) => any;
};

const CHARGE_OPTIONS: Array<{ value: TypeCharge; label: string }> = [
    { value: "ABONNEMENT_EAU_ELEC_GAZ_BOIS", label: "Eau, électricité, gaz, bois" },
    { value: "ABONNEMENT_TEL_INTERNET", label: "Abonnement téléphonique / internet" },
    { value: "ABONNEMENT_LOGICIEL", label: "Abonnement logiciel" },
    { value: "ABONNEMENT_AUTRES", label: "Autres abonnements" },
    { value: "LOCATION_LOYER", label: "Loyer" },
    { value: "LOCATION_VOITURE", label: "Location voiture" },
    { value: "LOCATION_MATERIEL", label: "Location matériel" },
    { value: "LOCATION_AUTRES", label: "Autres locations" },
    { value: "PERSONEL_CHARGES_SOCIALES", label: "Personel charges sociales" },
    { value: "PERSONEL_FORMATION", label: "Personel formation" },
    { value: "PERSONEL_AUTRES", label: "Personel autres" },
    { value: "FRAIS_COMMUNICATION_PUB", label: "Frais de communication / publicité" },
    { value: "FRAIS_ASSURANCE_PRO_MUTUELLE", label: "Assurance pro / mutuelle" },
    { value: "FRAIS_HONORAIRE_COMPTABLE", label: "Honoraires comptables" },
    { value: "FRAIS_ENTRETIEN", label: "Frais d'entretien" },
    { value: "FRAIS_DEPLACEMENT", label: "Frais de déplacement" },
    { value: "FRAIS_SOUS_TRAITANCE_AVEC_TVA", label: "Sous-traitance avec TVA" },
    { value: "FRAIS_SOUS_TRAITANCE_SANT_TVA", label: "Sous-traitance sans TVA" },
    { value: "FRAIS_ASSURANCE_VEHICULE", label: "Assurance véhicule" },
    { value: "FRAIS_JURIDIQUES", label: "Frais juridiques" },
    { value: "FRAIS_AUTRES", label: "Autres frais" },
    { value: "ACHATS_NECESSAIRE_POUR_MES_SERVICES", label: "Achats nécessaires pour mes services" },
    { value: "ACHATS_AUTRE", label: "Autres achats" },
    { value: "COMMISSIONS_REDEVANCE_FRANCHISE", label: "Commissions / redevances / franchise" },
    { value: "COMMISSIONS_TPE", label: "Commissions TPE" },
    { value: "COMMISSIONS_IMMOBILIERE", label: "Commissions immobilières" },
    { value: "COMMISSIONS_PLATEFORME", label: "Commissions plateforme" },
    { value: "COMMISSIONS_AUTRES", label: "Autres commissions" },
];

const FREQUENCIES: Array<{ value: ChargeFrequence; label: string }> = [
    { value: "MENSUELLE", label: "par mois" },
    { value: "ANNUELLE", label: "par an" },
];

function formatCurrency(value?: number) {
    return typeof value === "number" && !Number.isNaN(value)
        ? `${value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ar`
        : "—";
}

function computeAnnualMultiplier(
    frequency: HypotheseVenteFrequence | undefined,
    workingDays: number,
    seasonMonths: number[] | undefined,
) {
    const monthsCount = seasonMonths?.length ?? 0;
    const seasonFactor = seasonMonths ? Math.max(0, Math.min(monthsCount, 12)) / 12 : 1;

    switch (frequency) {
        case "QUOTIDIENNE":
            return 52 * Math.max(0, workingDays) * (seasonFactor || 1);
        case "HEBDOMADAIRE":
            return 52 * (seasonFactor || 1);
        case "MENSUELLE":
            return 12 * (seasonFactor || 1);
        case "TRIMESTRIELLE":
            return 4 * (seasonFactor || 1);
        case "ANNUELLE":
            return 1 * (seasonFactor || 1);
        default:
            return 0;
    }
}

function getTtcPrice(offre: OffreType) {
    const prixVente = offre.prixVente;
    if (!prixVente) return undefined;
    if (typeof prixVente.prixDeVenteTTC === "number") return prixVente.prixDeVenteTTC;
    if (typeof prixVente.prixDeVenteHT === "number") {
        const tva = typeof prixVente.TVA === "number" ? prixVente.TVA : 0;
        return Number((prixVente.prixDeVenteHT * (1 + tva / 100)).toFixed(2));
    }
    return undefined;
}

export default function PageCroissanceEtCharge({ onFieldChange, getFieldValue }: Props) {
    const [activeYear, setActiveYear] = useState<1 | 2 | 3>(1);
    const croissances = (getFieldValue("croissancesPrevues") ?? {}) as Record<string, any>;
    const volumeVentesPrevues = (getFieldValue("volumeVentesPrevues") as VolumeVentesPrevuesType | undefined) ?? {};
    const offres = Array.isArray(getFieldValue("offres")) ? (getFieldValue("offres") as OffreType[]) : [];
    const chargesA1 = Array.isArray(getFieldValue("chargesPremiereAnnee")) ? (getFieldValue("chargesPremiereAnnee") as ChargeType[]) : [];
    const chargesA2 = Array.isArray(getFieldValue("chargesDeuxiemeAnnee")) ? (getFieldValue("chargesDeuxiemeAnnee") as ChargeType[]) : [];
    const chargesA3 = Array.isArray(getFieldValue("chargesTroisiemeAnnee")) ? (getFieldValue("chargesTroisiemeAnnee") as ChargeType[]) : [];

    const workingDays = volumeVentesPrevues.nbJourTravailleParSemaine ?? 7;
    const isSeasonal = volumeVentesPrevues.activiteSaisonniere ?? false;
    const selectedMonths = volumeVentesPrevues.saisonNormale ?? [];

    const caAnnee1 = useMemo(() => {
        return offres.reduce((sum, offre) => {
            const hypothese = offre.hypotheseVentePremiereAnnee ?? {};
            const multiplier = computeAnnualMultiplier(hypothese.frequenceVente, workingDays, isSeasonal ? selectedMonths : undefined);
            const quantity = (hypothese.nbrVente ?? 0) * multiplier;
            const prixTtc = getTtcPrice(offre);
            return sum + (typeof prixTtc === "number" ? quantity * prixTtc : 0);
        }, 0);
    }, [offres, workingDays, isSeasonal, selectedMonths]);

    const caAnnee2 = caAnnee1 * (1 + ((croissances.tauxCroissanceAnnee1 ?? 0) / 100));
    const caAnnee3 = caAnnee2 * (1 + ((croissances.tauxCroissanceAnnee2 ?? 0) / 100));

    // ensure A2 and A3 have the same types as A1 but can have different montants
    const mergedA2 = useMemo(() => {
        const base = chargesA1.map((c) => c.typeCharge).filter((type): type is TypeCharge => type !== undefined);
        const byType = Object.fromEntries((chargesA2 ?? []).map((c) => [c.typeCharge, c]));
        return base.map((type) => ({ typeCharge: type as TypeCharge, montantCharge: byType[type]?.montantCharge ?? 0, frequence: byType[type]?.frequence ?? "MENSUELLE" } as ChargeType)).concat((chargesA2 ?? []).filter((c) => c.typeCharge !== undefined && !base.includes(c.typeCharge)));
    }, [chargesA1, chargesA2]);

    const mergedA3 = useMemo(() => {
        const base = chargesA1.map((c) => c.typeCharge).filter((type): type is TypeCharge => type !== undefined);
        const byType = Object.fromEntries((chargesA3 ?? []).map((c) => [c.typeCharge, c]));
        return base.map((type) => ({ typeCharge: type as TypeCharge, montantCharge: byType[type]?.montantCharge ?? 0, frequence: byType[type]?.frequence ?? "MENSUELLE" } as ChargeType)).concat((chargesA3 ?? []).filter((c) => c.typeCharge !== undefined && !base.includes(c.typeCharge)));
    }, [chargesA1, chargesA3]);

    const totalForYear = (charges: ChargeType[]) => {
        return charges.reduce((sum, c) => {
            const montant = c.montantCharge ?? 0;
            const factor = c.frequence === "MENSUELLE" ? 12 : 1;
            return sum + montant * factor;
        }, 0);
    };

    const totalA1 = totalForYear(chargesA1);
    const totalA2 = totalForYear(mergedA2 as ChargeType[]);
    const totalA3 = totalForYear(mergedA3 as ChargeType[]);

    const activeCharges = activeYear === 1 ? chargesA1 : activeYear === 2 ? mergedA2 : mergedA3;
    const activeField = activeYear === 1 ? "chargesPremiereAnnee" : activeYear === 2 ? "chargesDeuxiemeAnnee" : "chargesTroisiemeAnnee";
    const activePrefix = activeYear === 1 ? "Année 1" : activeYear === 2 ? "Année 2" : "Année 3";

    const setCharges = (next: ChargeType[]) => onFieldChange(activeField, next);

    const updateCharge = (index: number, patch: Partial<ChargeType>) => {
        const next = [...activeCharges];
        next[index] = { ...next[index], ...patch };
        setCharges(next);
    };

    const removeCharge = (index: number) => {
        const next = activeCharges.filter((_, i) => i !== index);
        setCharges(next);
    };

    const addCharge = () => {
        setCharges([...activeCharges, { typeCharge: "ACHATS_AUTRE", montantCharge: 0, frequence: "MENSUELLE" }]);
    };

    return (
        <section className="rounded-3xl bg-white/90 shadow-2xl">
            <div className="p-6 sm:p-8 space-y-8">
                <div>
                    <span id="croissance" />
                    <h2 className="text-2xl font-bold text-slate-800">Croissance</h2>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr]">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <label className="block text-sm text-slate-700">Mes ventes vont augmenter de</label>
                            <input type="number" min={0} step={1} value={croissances.tauxCroissanceAnnee1 ?? 0} onChange={(e) => onFieldChange("croissancesPrevues.tauxCroissanceAnnee1", Number(e.target.value))} className="mt-3 w-24 rounded-2xl border border-slate-200 bg-white px-3 py-2" />
                            <span className="ml-2 text-sm">% entre l'année 1 et 2.</span>
                            <p className="mt-2 text-sm text-slate-500">Ce qui représente un chiffre d'affaires de <span className="text-emerald-600 font-semibold">{formatCurrency(caAnnee2)}</span> en année 2.</p>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <label className="block text-sm text-slate-700">Et de</label>
                            <input type="number" min={0} step={1} value={croissances.tauxCroissanceAnnee2 ?? 0} onChange={(e) => onFieldChange("croissancesPrevues.tauxCroissanceAnnee2", Number(e.target.value))} className="mt-3 w-24 rounded-2xl border border-slate-200 bg-white px-3 py-2" />
                            <span className="ml-2 text-sm">% entre l'année 2 et 3.</span>
                            <p className="mt-2 text-sm text-slate-500">Ce qui représente un chiffre d'affaires de <span className="text-emerald-600 font-semibold">{formatCurrency(caAnnee3)}</span> en année 3.</p>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <span id="charges" />
                            <h2 className="text-2xl font-bold text-slate-800">Charges</h2>
                            <p className="mt-2 text-sm text-slate-500">Mes dépenses ou frais de fonctionnement liés à mon activité sont :</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3].map((year) => (
                                <button
                                    key={year}
                                    type="button"
                                    onClick={() => setActiveYear(year as 1 | 2 | 3)}
                                    className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition ${activeYear === year ? "border-cyan-600 bg-cyan-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
                                >
                                    Année {year}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                        <div className="overflow-x-hidden">
                            <table className="min-w-full table-fixed border-separate border-spacing-0">
                                <thead>
                                    <tr className="bg-slate-50 text-sm text-slate-700">
                                        <th className="w-2/5 border border-slate-200 px-3 py-3 text-left">Type de charge</th>
                                        <th className="w-1/5 border border-slate-200 px-3 py-3 text-left">Fréquence</th>
                                        <th className="w-1/5 border border-slate-200 px-3 py-3 text-left">Montant TTC</th>
                                        <th className="w-1/5 border border-slate-200 px-3 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeCharges.map((charge, index) => (
                                        <tr key={`${activeField}-${index}`} className="border-b border-slate-200 text-sm text-slate-700">
                                            <td className="px-3 py-3">
                                                <select
                                                    value={charge.typeCharge ?? ""}
                                                    onChange={(e) => updateCharge(index, { typeCharge: e.target.value as TypeCharge })}
                                                    className="cursor-pointer w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                                                >
                                                    <option value="">Sélectionner un type</option>
                                                    {CHARGE_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-3 py-3">
                                                <select
                                                    value={charge.frequence ?? "MENSUELLE"}
                                                    onChange={(e) => updateCharge(index, { frequence: e.target.value as ChargeFrequence })}
                                                    className="cursor-pointer w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                                                >
                                                    {FREQUENCIES.map((f) => (
                                                        <option key={f.value} value={f.value}>
                                                            {f.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-3 py-3">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={charge.montantCharge ?? 0}
                                                    onChange={(e) => updateCharge(index, { montantCharge: Number(e.target.value) })}
                                                    className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                                                />
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <button
                                                    type="button"
                                                    aria-label="Supprimer"
                                                    onClick={() => removeCharge(index)}
                                                    className="cursor-pointer inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {activeCharges.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-3 py-8 text-center text-sm text-slate-500">
                                                Aucune charge saisie pour {activePrefix}.
                                            </td>
                                        </tr>
                                    ) : null}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-50 text-sm font-semibold text-slate-900">
                                        <td className="px-3 py-3">Total charges {activePrefix}</td>
                                        <td className="px-3 py-3" />
                                        <td className="px-3 py-3" />
                                        <td className="px-3 py-3 text-right">{(activeYear === 1 ? totalA1 : activeYear === 2 ? totalA2 : totalA3).toFixed(0)} Ar</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <button
                            type="button"
                            onClick={addCharge}
                            className="cursor-pointer inline-flex items-center justify-center rounded-full border border-cyan-600 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
                        >
                            Ajouter une charge
                        </button>
                        <p className="text-sm text-slate-500">Types de charges et fréquence formatés pour l’année sélectionnée.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
