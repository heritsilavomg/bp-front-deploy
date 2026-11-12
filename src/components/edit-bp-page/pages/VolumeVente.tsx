"use client";

import { useEffect, useMemo } from "react";
import type { OffreType } from "@/types/bp/offers";
import type { VolumeVentesPrevuesType } from "@/types/bp/finance";

type HypotheseVenteFrequence = "QUOTIDIENNE" | "HEBDOMADAIRE" | "MENSUELLE" | "TRIMESTRIELLE" | "ANNUELLE";

const FREQUENCY_LABELS: Record<HypotheseVenteFrequence, string> = {
    QUOTIDIENNE: "par jour",
    HEBDOMADAIRE: "par semaine",
    MENSUELLE: "par mois",
    TRIMESTRIELLE: "par trimestre",
    ANNUELLE: "par an",
};

const MONTHS = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
];

function computeAnnualMultiplier(
    frequency: HypotheseVenteFrequence | undefined,
    workingDaysPerWeek: number,
    seasonMonths: number[] | undefined,
) {
    const monthsCount = seasonMonths?.length ?? 0;
    const seasonFactor = seasonMonths ? Math.max(0, Math.min(monthsCount, 12)) / 12 : 1;

    switch (frequency) {
        case "QUOTIDIENNE":
            return 52 * Math.max(0, workingDaysPerWeek) * (seasonFactor || 1);
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

function formatCurrency(value?: number) {
    return typeof value === "number" && !Number.isNaN(value)
        ? `${value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ar`
        : "—";
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

function getTtcCost(offre: OffreType) {
    if (typeof offre.coutUnitaireTTC === "number") return offre.coutUnitaireTTC;
    if (typeof offre.coutUnitaireHT === "number") {
        const tva = typeof offre.TVA === "number" ? offre.TVA : 0;
        return Number((offre.coutUnitaireHT * (1 + tva / 100)).toFixed(2));
    }
    return undefined;
}

const DEFAULT_FREQUENCY: HypotheseVenteFrequence = "MENSUELLE";

type VolumeVenteProps = {
    onFieldChange: (field: string, value: any) => void;
    getFieldValue: (field: string) => any;
};

export default function VolumeVente({ onFieldChange, getFieldValue }: VolumeVenteProps) {
    const volumeVentesPrevues = (getFieldValue("volumeVentesPrevues") as VolumeVentesPrevuesType | undefined) ?? {};
    const offres = Array.isArray(getFieldValue("offres")) ? (getFieldValue("offres") as OffreType[]) : [];

    const workingDays = volumeVentesPrevues.nbJourTravailleParSemaine ?? 7;
    const isSeasonal = volumeVentesPrevues.activiteSaisonniere ?? false;
    const selectedMonths = volumeVentesPrevues.saisonNormale ?? [];

    const toggleMonth = (monthIndex: number) => {
        const nextMonths = selectedMonths.includes(monthIndex)
            ? selectedMonths.filter((month) => month !== monthIndex)
            : [...selectedMonths, monthIndex].sort((a, b) => a - b);
        onFieldChange("volumeVentesPrevues.saisonNormale", nextMonths);
    };

    const totalRow = useMemo(() => {
        let totalCa = 0;
        let totalCost = 0;

        offres.forEach((offre) => {
            const hypothese = offre.hypotheseVentePremiereAnnee ?? {};
            const multiplier = computeAnnualMultiplier(hypothese.frequenceVente, workingDays, isSeasonal ? selectedMonths : undefined);
            const quantity = (hypothese.nbrVente ?? 0) * multiplier;
            const prixTtc = getTtcPrice(offre);
            const costTtc = getTtcCost(offre);

            if (typeof prixTtc === "number") totalCa += quantity * prixTtc;
            if (typeof costTtc === "number") totalCost += quantity * costTtc;
        });

        return {
            ca: totalCa,
            cost: totalCost,
        };
    }, [offres, selectedMonths, workingDays, isSeasonal]);

    //INITIALIZE DEFAULTS
    useEffect(() => {
        if (volumeVentesPrevues.modePayement === undefined) {
            onFieldChange("volumeVentesPrevues.modePayement", "DIRECT");
        }
        if (volumeVentesPrevues.nbJourTravailleParSemaine === undefined) {
            onFieldChange("volumeVentesPrevues.nbJourTravailleParSemaine", 7);
        }
        if (volumeVentesPrevues.activiteSaisonniere === undefined) {
            onFieldChange("volumeVentesPrevues.activiteSaisonniere", false);
        }
        if (volumeVentesPrevues.saisonNormale === undefined) {
            onFieldChange("volumeVentesPrevues.saisonNormale", []);
        }
    }, []);

    return (
        <section className="rounded-3xl bg-white/90 shadow-2xl">
            <div className="space-y-10 p-6 sm:p-8">
                <div>
                    <h2 id="volume-des-ventes" className="text-2xl font-bold text-slate-800">Volume des ventes</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Définissez vos hypothèses de ventes et vos conditions de saisonnalité.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                    <label className="block rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <span className="block text-sm font-semibold text-slate-700">Je travaille</span>
                        <input
                            type="number"
                            min={0}
                            value={workingDays}
                            onChange={(event) => onFieldChange("volumeVentesPrevues.nbJourTravailleParSemaine", Number(event.target.value))}
                            className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        />
                        <span className="mt-2 block text-sm text-slate-500">jours par semaine</span>
                    </label>

                    <label className="block rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <span className="block text-sm font-semibold text-slate-700">Mes clients me paient</span>
                        <select
                            value={volumeVentesPrevues.modePayement ?? "DIRECT"}
                            onChange={(event) => onFieldChange("volumeVentesPrevues.modePayement", event.target.value)}
                            className="mt-3 w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        >
                            <option value="DIRECT">en comptant (paiement directement)</option>
                            <option value="DANS_LES_30J">dans les 30 jours</option>
                            <option value="DANS_LES_45J">dans les 45 jours</option>
                            <option value="DANS_LES_60J">dans les 60 jours</option>
                            <option value="DANS_LES_90J">dans les 90 jours</option>
                        </select>
                    </label>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <span className="block text-sm font-semibold text-slate-700">Saisonnalité</span>
                            <p className="mt-2 text-sm text-slate-500">
                                Choisissez si votre activité est saisonnière ou non.
                            </p>
                        </div>
                        <select
                            value={isSeasonal ? "AVEC" : "SANS"}
                            onChange={(event) => {
                                const nextValue = event.target.value === "AVEC";
                                onFieldChange("volumeVentesPrevues.activiteSaisonniere", nextValue);
                                if (!nextValue) {
                                    onFieldChange("volumeVentesPrevues.saisonNormale", []);
                                }
                            }}
                            className="max-w-[260px] cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        >
                            <option value="SANS">Je n&apos;ai pas d&apos;activité saisonnière</option>
                            <option value="AVEC">J&apos;ai une activité saisonnière</option>
                        </select>
                    </div>

                    {isSeasonal && (
                        <div className="mt-6">
                            <p className="text-sm font-semibold text-slate-700">Saison normale</p>
                            <p className="mt-2 text-sm text-slate-500">Je serais en saison normale les mois suivants :</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {MONTHS.map((month, index) => {
                                    const monthNumber = index + 1;
                                    const selected = selectedMonths.includes(monthNumber);
                                    return (
                                        <button
                                            key={month}
                                            type="button"
                                            onClick={() => toggleMonth(monthNumber)}
                                            className={`rounded-full border px-4 py-2 text-sm transition ${selected ? "border-cyan-700 bg-cyan-700 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
                                        >
                                            {month}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-fixed border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-slate-50 text-left text-sm text-slate-700">
                                    <th className="w-[240px] border-b border-slate-200 px-3 py-3">Nom de l&apos;offre</th>
                                    <th className="w-[120px] border-b border-slate-200 px-3 py-3">Nombre de ventes</th>
                                    <th className="w-[160px] border-b border-slate-200 px-3 py-3">Fréquence</th>
                                    <th className="border-b border-slate-200 px-3 py-3">Chiffre d&apos;affaires annuel TTC</th>
                                    <th className="border-b border-slate-200 px-3 py-3">Coût annuel TTC</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-slate-700">
                                {offres.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                                            Aucune offre définie. Ajoutez une offre dans la section Projet.
                                        </td>
                                    </tr>
                                ) : (
                                    offres.map((offre, index) => {
                                        const hypothese = offre.hypotheseVentePremiereAnnee ?? {};
                                        const multiplier = computeAnnualMultiplier(
                                            hypothese.frequenceVente,
                                            workingDays,
                                            isSeasonal ? selectedMonths : undefined,
                                        );
                                        const quantity = (hypothese.nbrVente ?? 0) * multiplier;
                                        const prixTtc = getTtcPrice(offre);
                                        const costTtc = getTtcCost(offre);
                                        const chiffreAffaires = typeof prixTtc === "number" ? quantity * prixTtc : undefined;
                                        const coutAnnuel = typeof costTtc === "number" ? quantity * costTtc : undefined;

                                        return (
                                            <tr key={`volume-offre-${index}`} className="border-b border-slate-200 last:border-b-0">
                                                <td className="px-3 py-4 align-top break-words">
                                                    <div className="font-semibold text-slate-900">{offre.nomOffre || "Offre"}</div>
                                                </td>
                                                <td className="px-3 py-4 align-top">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={hypothese.nbrVente ?? ""}
                                                        onChange={(event) => {
                                                            const nextValue = event.target.value === "" ? undefined : Number(event.target.value);
                                                            const nextOffres = [...offres];
                                                            nextOffres[index] = {
                                                                ...nextOffres[index],
                                                                hypotheseVentePremiereAnnee: {
                                                                    ...hypothese,
                                                                    frequenceVente: hypothese.frequenceVente ?? DEFAULT_FREQUENCY,
                                                                    nbrVente: nextValue,
                                                                },
                                                            };
                                                            onFieldChange("offres", nextOffres);
                                                        }}
                                                        placeholder="0"
                                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                                    />
                                                </td>
                                                <td className="px-3 py-4 align-top">
                                                    <select
                                                        value={hypothese.frequenceVente ?? DEFAULT_FREQUENCY}
                                                        onChange={(event) => {
                                                            const nextValue = event.target.value as HypotheseVenteFrequence;
                                                            const nextOffres = [...offres];
                                                            nextOffres[index] = {
                                                                ...nextOffres[index],
                                                                hypotheseVentePremiereAnnee: {
                                                                    ...hypothese,
                                                                    frequenceVente: nextValue,
                                                                },
                                                            };
                                                            onFieldChange("offres", nextOffres);
                                                        }}
                                                        className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                                    >
                                                        {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                                                            <option key={value} value={value}>{label}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-3 py-4 align-top text-slate-900 font-semibold">
                                                    {formatCurrency(chiffreAffaires)}
                                                </td>
                                                <td className="px-3 py-4 align-top text-slate-900 font-semibold">
                                                    {formatCurrency(coutAnnuel)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                            {offres.length > 0 && (
                                <tfoot>
                                    <tr className="bg-slate-50 text-sm font-semibold text-slate-900">
                                        <td className="px-3 py-4">Total</td>
                                        <td className="px-3 py-4" />
                                        <td className="px-3 py-4" />
                                        <td className="px-3 py-4">{formatCurrency(totalRow.ca)}</td>
                                        <td className="px-3 py-4">{formatCurrency(totalRow.cost)}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}
