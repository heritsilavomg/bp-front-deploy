"use client";

import { useEffect, useMemo } from "react";
import type { FinancementType, TypeFinancement } from "@/types/bp/finance";

type Props = {
    onFieldChange: (field: string, value: any) => void;
    getFieldValue: (field: string) => any;
};

const DEFAULT_LOAN: FinancementType = {
    typeFinancement: "PRET_BANCAIRE",
    montantFinancement: 0,
    dureeFinancement: 24,
    tauxInteret: 5,
};

function formatCurrency(value?: number) {
    return typeof value === "number" && !Number.isNaN(value)
        ? `${value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ar`
        : "0 Ar";
}

function isSameFinancement(a: FinancementType | undefined, b: FinancementType | undefined) {
    if (!a || !b) return false;
    return a.typeFinancement === b.typeFinancement && a.montantFinancement === b.montantFinancement && a.dureeFinancement === b.dureeFinancement && a.tauxInteret === b.tauxInteret;
}

export default function PageFinancement({ onFieldChange, getFieldValue }: Props) {
    const financements = Array.isArray(getFieldValue("financements"))
        ? (getFieldValue("financements") as FinancementType[])
        : [];

    const loan = financements.find((item) => item.typeFinancement === "PRET_BANCAIRE") ?? DEFAULT_LOAN;
    const subvention = financements.find((item) => item.typeFinancement === "SUBVENTION");
    const pretHonneur = financements.find((item) => item.typeFinancement === "PRET_HONNEUR");

    const sortedFinancements = useMemo(() => {
        const ordered: FinancementType[] = [loan];
        if (subvention) ordered.push(subvention);
        if (pretHonneur) ordered.push(pretHonneur);
        return ordered;
    }, [loan, subvention, pretHonneur]);

    useEffect(() => {
        const uniqueByType = new Map<TypeFinancement, FinancementType>();
        financements.forEach((item) => {
            if (!item.typeFinancement) return;
            if (!uniqueByType.has(item.typeFinancement)) {
                uniqueByType.set(item.typeFinancement, item);
            }
        });

        if (!uniqueByType.has("PRET_BANCAIRE")) {
            uniqueByType.set("PRET_BANCAIRE", DEFAULT_LOAN);
        }

        const nextFinancements: FinancementType[] = [
            uniqueByType.get("PRET_BANCAIRE")!,
            uniqueByType.get("SUBVENTION"),
            uniqueByType.get("PRET_HONNEUR"),
        ].filter(Boolean) as FinancementType[];

        const hasChanged =
            nextFinancements.length !== financements.length ||
            nextFinancements.some((item, index) => !isSameFinancement(item, financements[index]));

        if (hasChanged) {
            onFieldChange("financements", nextFinancements);
        }
    }, [financements, onFieldChange]);

    const updateFinancement = (type: TypeFinancement, patch: Partial<FinancementType>) => {
        const next = financements.map((item) =>
            item.typeFinancement === type ? { ...item, ...patch } : item,
        );
        onFieldChange("financements", next);
    };

    const addFinancement = (type: Extract<TypeFinancement, "SUBVENTION" | "PRET_HONNEUR">) => {
        if (financements.some((item) => item.typeFinancement === type)) return;
        onFieldChange("financements", [loan, ...financements.filter((item) => item.typeFinancement !== "PRET_BANCAIRE"), { typeFinancement: type, montantFinancement: 0, dureeFinancement: type === "PRET_HONNEUR" ? 6 : undefined }]);
    };

    const totalFinancements = sortedFinancements.reduce((sum, item) => sum + (item.montantFinancement ?? 0), 0);

    return (
        <section className="rounded-3xl bg-white/90 shadow-2xl">
            <div className="space-y-6 p-6 sm:p-8">
                <div>
                    <h2 id="financements" className="text-2xl font-bold text-slate-800">Financements</h2>
                    <p className="mt-2 text-sm text-slate-500">Ce qu’il me manque pour lancer mon’activité :</p>
                </div>

                <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 p-4 sm:p-6">
                    <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
                        <table className="min-w-full border-separate border-spacing-0 text-sm text-slate-700">
                            <thead>
                                <tr className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                                    <th className="border-b border-slate-200 px-5 py-4">Nature du financement</th>
                                    <th className="border-b border-slate-200 px-5 py-4">Montant</th>
                                    <th className="border-b border-slate-200 px-5 py-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedFinancements.map((item, index) => {
                                    const isLoan = item.typeFinancement === "PRET_BANCAIRE";
                                    return (
                                        <tr key={item.typeFinancement} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                            <td className="px-5 py-6 align-top">
                                                <div className="space-y-3">
                                                    <div className="text-sm font-semibold text-slate-900">
                                                        {isLoan ? "Prêt bancaire" : item.typeFinancement === "SUBVENTION" ? "Subvention" : "Prêt d'honneur"}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        {isLoan ? (
                                                            <>
                                                                <span className="text-sm text-slate-600">sur</span>
                                                                <input
                                                                    type="number"
                                                                    min={1}
                                                                    value={item.dureeFinancement ?? 24}
                                                                    onChange={(event) => updateFinancement("PRET_BANCAIRE", { dureeFinancement: Number(event.target.value) })}
                                                                    className="w-24 rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                                                />
                                                                <span className="text-sm text-slate-600">mois à</span>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    step={0.1}
                                                                    value={item.tauxInteret ?? 5}
                                                                    onChange={(event) => updateFinancement("PRET_BANCAIRE", { tauxInteret: Number(event.target.value) })}
                                                                    className="w-20 rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                                                />
                                                                <span className="text-sm text-slate-600">%</span>
                                                            </>
                                                        ) : item.typeFinancement === "PRET_HONNEUR" ? (
                                                            <>
                                                                <span className="text-sm text-slate-600">sur</span>
                                                                <input
                                                                    type="number"
                                                                    min={1}
                                                                    value={item.dureeFinancement ?? 6}
                                                                    onChange={(event) => updateFinancement("PRET_HONNEUR", { dureeFinancement: Number(event.target.value) })}
                                                                    className="w-24 rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                                                />
                                                                <span className="text-sm text-slate-600">mois</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-sm text-slate-600">Montant unique</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-6 align-top">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={item.montantFinancement ?? 0}
                                                    onChange={(event) => updateFinancement(item.typeFinancement as TypeFinancement, { montantFinancement: Number(event.target.value) })}
                                                    className="w-full max-w-[220px] rounded-full border border-slate-200 bg-slate-100 px-5 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                                />
                                            </td>
                                            <td className="px-5 py-6 align-top text-right text-sm text-slate-500">
                                                {isLoan ? "*le taux par défaut est à titre indicatif" : ""}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-100 text-sm font-semibold text-slate-900">
                                    <td className="border-t border-slate-200 px-5 py-4">Total des financements</td>
                                    <td className="border-t border-slate-200 px-5 py-4">{formatCurrency(totalFinancements)}</td>
                                    <td className="border-t border-slate-200 px-5 py-4" />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        disabled={Boolean(subvention)}
                        onClick={() => addFinancement("SUBVENTION")}
                        className="inline-flex items-center justify-center rounded-full border border-cyan-600 bg-white px-5 py-3 text-sm font-semibold text-cyan-700 shadow-sm transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:bg-slate-100"
                    >
                        Subvention
                    </button>
                    <button
                        type="button"
                        disabled={Boolean(pretHonneur)}
                        onClick={() => addFinancement("PRET_HONNEUR")}
                        className="inline-flex items-center justify-center rounded-full border border-cyan-600 bg-white px-5 py-3 text-sm font-semibold text-cyan-700 shadow-sm transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:bg-slate-100"
                    >
                        Prêt d'honneur
                    </button>
                </div>
            </div>
        </section>
    );
}
