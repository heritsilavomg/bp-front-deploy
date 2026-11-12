"use client";

import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import type { ApportType, InvestissementType, TypeApport } from "@/types/bp/finance";
import type { AssocieType } from "@/types/bp/people";

type Props = {
    onFieldChange: (field: string, value: any) => void;
    getFieldValue: (field: string) => any;
};

const NATURE_APPORTS: Array<{ value: TypeApport; label: string }> = [
    { value: "NATURE_FOND_DE_COMMERCE", label: "Fonds de commerce" },
    { value: "NATURE_DROIT_AU_BAIL_OU_PAS_DE_PORTE", label: "Droit au bail / pas de porte" },
    { value: "NATURE_BREVET_MARQUE", label: "Brevet / marque" },
    { value: "NATURE_ACHAT_IMMOBILIERE", label: "Achat immobilier" },
    { value: "NATURE_FRAIS_ACQUISITION_IMMOBILIERE", label: "Frais d'acquisition immobilière" },
    { value: "NATURE_TERRAIN", label: "Terrain" },
    { value: "NATURE_VEHICULE_UTILITAIRE", label: "Véhicule utilitaire" },
    { value: "NATURE_VEHICULE_TOURISME", label: "Véhicule tourisme" },
    { value: "NATURE_MACHINE", label: "Machine" },
    { value: "NATURE_OUTIL_ET_MATERIEL_NECESSAIRE_ACTIVITE", label: "Outil et matériel nécessaire à l'activité" },
    { value: "NATURE_MAT_INFORMATIQUE", label: "Matériel informatique" },
    { value: "NATURE_MEUBLE_DESTINEE_A_AMENAGEMENTS", label: "Meuble destiné à aménagements" },
    { value: "NATURE_TRAVAUX_AGENCEMENT", label: "Travaux d'agencement" },
    { value: "NATURE_CREATION_SITE_WEB_APPLICATION", label: "Création site web / application" },
    { value: "NATURE_LOGICIEL_DEVELOPPE", label: "Logiciel développé" },
    { value: "NATURE_FRAIS_CREATION_SOCIETE", label: "Frais de création de société" },
];

function formatCurrency(value?: number) {
    return typeof value === "number" && !Number.isNaN(value)
        ? `${value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ar`
        : "0 Ar";
}

function getNatureLabel(value?: TypeApport) {
    return NATURE_APPORTS.find((option) => option.value === value)?.label ?? "Nature inconnue";
}

export default function PageInvestissement({ onFieldChange, getFieldValue }: Props) {
    const associes = Array.isArray(getFieldValue("associe")) ? (getFieldValue("associe") as AssocieType[]) : [];
    const apports = Array.isArray(getFieldValue("apports")) ? (getFieldValue("apports") as ApportType[]) : [];
    const investissements = Array.isArray(getFieldValue("investissements")) ? (getFieldValue("investissements") as InvestissementType[]) : [];
    const garantieLoyer = getFieldValue("garantieLoyer") as number | undefined;
    const stockDeDepart = getFieldValue("stockDeDepart") as number | undefined;
    const nbrMoisCouvertParTresorerieDepart = getFieldValue("nbrMoisCouvertParTresorerieDepart") as number | undefined;

    const associeMap = useMemo(
        () => new Map(associes.map((associe) => [associe.numeroAssocie, associe])),
        [associes],
    );

    const natureApports = useMemo(
        () =>
            apports.filter(
                (apport) => apport.typeApport && apport.typeApport !== "PERSONEL",
            ),
        [apports],
    );

    const addInvestissement = (investment: InvestissementType) => {
        onFieldChange("investissements", [...investissements, investment]);
    };

    const addGarantieLoyer = () => {
        onFieldChange("garantieLoyer", 0);
    };

    const addStockDepart = () => {
        onFieldChange("stockDeDepart", 0);
    };

    const addTresorerieDepart = () => {
        onFieldChange("nbrMoisCouvertParTresorerieDepart", 1);
    };

    const updateInvestissement = (index: number, field: keyof InvestissementType, value: any) => {
        const next = investissements.map((item, currentIndex) =>
            currentIndex === index ? { ...item, [field]: value } : item,
        );
        onFieldChange("investissements", next);
    };

    const removeInvestissement = (index: number) => {
        onFieldChange("investissements", investissements.filter((_, currentIndex) => currentIndex !== index));
    };

    const totalInvestissement = investissements.reduce((sum, item) => sum + (item.montantInvestissement ?? 0), 0);
    const totalApportsNature = natureApports.reduce((sum, item) => sum + (item.montantApport ?? 0), 0);

    return (
        <section className="rounded-3xl bg-white/90 shadow-2xl">
            <div className="space-y-6 p-6 sm:p-8">
                <div>
                    <h2 id="investissements" className="text-2xl font-bold text-slate-800">Investissements</h2>
                    <p className="mt-2 text-sm text-slate-500">Regroupez vos besoins pour démarrer le projet.</p>
                </div>

                {natureApports.length > 0 && (
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Apports en nature</h3>
                                <p className="mt-1 text-sm text-slate-600">Présentation des apports en nature existants, affichage seulement.</p>
                            </div>
                            <div className="rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
                                Total : {formatCurrency(totalApportsNature)}
                            </div>
                        </div>

                        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                            <table className="min-w-full border-separate border-spacing-0 text-sm text-slate-700">
                                <thead>
                                    <tr className="bg-slate-50 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                                        <th className="border-b border-slate-200 px-4 py-3">Nature</th>
                                        <th className="border-b border-slate-200 px-4 py-3">Associé</th>
                                        <th className="border-b border-slate-200 px-4 py-3 text-right">Montant</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {natureApports.map((apport, index) => {
                                        const associe = associeMap.get(apport.numeroAssocieApporteur ?? -1);
                                        return (
                                            <tr key={`nature-apport-${index}`} className="border-b border-slate-200">
                                                <td className="px-4 py-3">{getNatureLabel(apport.typeApport)}</td>
                                                <td className="px-4 py-3">{associe?.nomPrenom ?? `Associé n°${apport.numeroAssocieApporteur}`}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(apport.montantApport)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap gap-3">
                    {!garantieLoyer && (
                        <button
                            type="button"
                            onClick={addGarantieLoyer}
                            className="cursor-pointer inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            Garantie loyer
                        </button>
                    )}

                    {!stockDeDepart && (
                        <button
                            type="button"
                            onClick={addStockDepart}
                            className="cursor-pointer inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            Stock départ
                        </button>
                    )}

                    {!nbrMoisCouvertParTresorerieDepart && (
                        <button
                            type="button"
                            onClick={addTresorerieDepart}
                            className="cursor-pointer inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            Trésorerie de départ
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => addInvestissement({ typeInvestissement: undefined, montantInvestissement: 0 })}
                        className="cursor-pointer inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        Autre investissement
                    </button>
                </div>

                {(garantieLoyer !== undefined || stockDeDepart !== undefined || nbrMoisCouvertParTresorerieDepart !== undefined) && (
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                        <table className="min-w-full border-separate border-spacing-0 text-sm text-slate-700">
                            <thead>
                                <tr className="bg-slate-50 text-left text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">
                                    <th className="border-b border-slate-200 px-4 py-4">Élément</th>
                                    <th className="border-b border-slate-200 px-4 py-4">Montant TTC</th>
                                    <th className="border-b border-slate-200 px-4 py-4">Mois</th>
                                    <th className="w-16 border-b border-slate-200 px-4 py-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {garantieLoyer !== undefined && (
                                    <tr className="border-b border-slate-200">
                                        <td className="px-4 py-4">Garantie de loyer</td>
                                        <td className="px-4 py-4">
                                            <input type="number" min={0} value={garantieLoyer ?? 0} onChange={(e) => onFieldChange("garantieLoyer", Number(e.target.value))} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20" />
                                        </td>
                                        <td className="px-4 py-4">—</td>
                                        <td className="px-4 py-4 text-right">
                                            <button type="button" onClick={() => onFieldChange("garantieLoyer", undefined)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-100">×</button>
                                        </td>
                                    </tr>
                                )}

                                {stockDeDepart !== undefined && (
                                    <tr className="border-b border-slate-200">
                                        <td className="px-4 py-4">Stock de départ</td>
                                        <td className="px-4 py-4">
                                            <input type="number" min={0} value={stockDeDepart ?? 0} onChange={(e) => onFieldChange("stockDeDepart", Number(e.target.value))} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20" />
                                        </td>
                                        <td className="px-4 py-4">—</td>
                                        <td className="px-4 py-4 text-right">
                                            <button type="button" onClick={() => onFieldChange("stockDeDepart", undefined)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-100">×</button>
                                        </td>
                                    </tr>
                                )}

                                {nbrMoisCouvertParTresorerieDepart !== undefined && (
                                    <tr className="border-b border-slate-200">
                                        <td className="px-4 py-4">Trésorerie de départ (en mois de charges)</td>
                                        <td className="px-4 py-4">—</td>
                                        <td className="px-4 py-4">
                                            <input type="number" min={1} value={nbrMoisCouvertParTresorerieDepart ?? 1} onChange={(e) => onFieldChange("nbrMoisCouvertParTresorerieDepart", Number(e.target.value))} className="w-20 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20" />
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button type="button" onClick={() => onFieldChange("nbrMoisCouvertParTresorerieDepart", undefined)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-100">×</button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                    <table className="min-w-full border-separate border-spacing-0 text-sm text-slate-700">
                        <thead>
                            <tr className="bg-slate-50 text-left text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">
                                <th className="border-b border-slate-200 px-4 py-4">Investissement</th>
                                <th className="border-b border-slate-200 px-4 py-4">Montant TTC</th>
                                <th className="w-16 border-b border-slate-200 px-4 py-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {investissements.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">
                                        Aucun investissement ajouté pour le moment.
                                    </td>
                                </tr>
                            ) : (
                                investissements.map((item, index) => (
                                    <tr key={`investissement-${index}`} className="border-b border-slate-200">
                                        <td className="px-4 py-4">
                                            <select
                                                value={item.typeInvestissement ?? ""}
                                                onChange={(event) => updateInvestissement(index, "typeInvestissement", event.target.value)}
                                                className="cursor-pointer w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                            >
                                                <option value="">Sélectionner une nature d'investissement</option>
                                                {NATURE_APPORTS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-4">
                                            <input
                                                type="number"
                                                min={0}
                                                value={item.montantInvestissement ?? 0}
                                                onChange={(event) => updateInvestissement(index, "montantInvestissement", Number(event.target.value))}
                                                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => removeInvestissement(index)}
                                                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-red-200 bg-white text-red-700 transition hover:border-red-300 hover:bg-red-50"
                                                aria-label="Supprimer cet investissement"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-50 text-sm font-semibold text-slate-900">
                                <td className="border-t border-slate-200 px-4 py-4">Total des investissements</td>
                                <td className="border-t border-slate-200 px-4 py-4">{formatCurrency(totalInvestissement)}</td>
                                <td className="border-t border-slate-200 px-4 py-4" />
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </section>
    );
}
