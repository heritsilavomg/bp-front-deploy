"use client";

import { Sparkles, X } from "lucide-react";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import EditBpMain from "@/components/edit-bp-page/EditBpMain";

type EditBpPageClientProps = {
    bpId: string;
};

export default function EditBpPageClient({ bpId }: EditBpPageClientProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalYear, setModalYear] = useState<"annee1" | "annee2" | "annee3">("annee1");
    const [modalData, setModalData] = useState<any | null>(null);

    useEffect(() => {
        document.body.style.overflow = isModalOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isModalOpen]);

    const handleOpenResultModal = (year: "annee1" | "annee2" | "annee3", data: any) => {
        setModalYear(year);
        setModalData(data);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const yearLabel = modalYear === "annee1" ? "Année 1" : modalYear === "annee2" ? "Année 2" : "Année 3";
    const yearData = modalData?.[modalYear] ?? {};

    const formatValue = (label: string, value: unknown) => {
        if (value === undefined || value === null) {
            return "-";
        }
        if (typeof value === "number") {
            if (label.toLowerCase().includes("proportion")) {
                return `${(value * 100).toFixed(1)} %`;
            }
            if (label.toLowerCase().includes("point mort") || label.toLowerCase().includes("jours")) {
                return `${value.toLocaleString()} jours`;
            }
            if (label.toLowerCase().includes("taux")) {
                return `${value.toFixed(1)} %`;
            }
            return `${value.toLocaleString()} Ar`;
        }
        return String(value);
    };

    const groupedRows = [
        {
            title: "Revenus et marge",
            rows: [
                ["Chiffre d'affaires HT", yearData.chiffreAffairesHT],
                ["Marge brute", yearData.margeBrute],
                ["Proportion marge brute", yearData.proportionMargeBrute],
                ["Valeur ajoutée", yearData.valeurAjoutee],
            ],
        },
        {
            title: "Charges et résultat",
            rows: [
                ["Achat matières premières TTC", yearData.achatMatieresPremieresTTC],
                ["Frais de fonctionnement total", yearData.fraisFonctionnementTotal],
                ["Salaire brut et cotisations", yearData.salaireBrutEtCotisationPatronale],
                ["Excédent brut d'exploitation", yearData.excedentBrutExploitation],
                ["Dotation aux amortissements", yearData.dotationAuxAmortissement],
                ["Résultat exploitation", yearData.resultatExploitation],
                ["Charge financière", yearData.chargeFinanciere],
                ["Résultat avant impôt", yearData.resultatAvantImpot],
                ["Impôt", yearData.impot],
                ["Résultat net", yearData.resultatNet],
            ],
        },
        {
            title: "Bilan et trésorerie",
            rows: [
                ["Capacité d'autofinancement", yearData.capaciteAutofinancement],
                ["Seuil de rentabilité", yearData.seuilRentabilite],
                ["Point mort (jours)", yearData.pointMortEnNombreDeJours],
                ["BFR", yearData.bfr],
                ["Montant dettes fournisseurs", yearData.montantDetteFournisseurs],
                ["Montant crédit client", yearData.montantCreditClient],
            ],
        },
    ];

    const segmentRows = yearData?.chiffreAffairesParSegment ? Object.entries(yearData.chiffreAffairesParSegment) : [];
    const fraisRows = yearData?.detailFraisDeFonctionnement ? Object.entries(yearData.detailFraisDeFonctionnement) : [];
    const salaireRows = yearData?.detailSalaireEtCotisation ? Object.entries(yearData.detailSalaireEtCotisation) : [];
    const bfrRows = yearData?.detailBFR ? Object.entries(yearData.detailBFR) : [];
    const years = ["annee1", "annee2", "annee3"] as const;

    const formatDetailLabel = (key: string) =>
        key
            .replace(/([A-Z])/g, " $1")
            .replace(/_/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/^./, (char) => char.toUpperCase());

    const detailBlockForLabel = (labelField: string) => {
        if (labelField === "Chiffre d'affaires HT") {
            return {
                title: "Chiffre d'affaires par segment",
                rows: segmentRows,
            };
        }
        if (labelField === "Frais de fonctionnement total") {
            return {
                title: "Détail des frais de fonctionnement",
                rows: fraisRows,
            };
        }
        if (labelField === "Salaire brut et cotisations") {
            return {
                title: "Détail des salaires et cotisations",
                rows: salaireRows,
            };
        }
        if (labelField === "BFR") {
            return {
                title: "Détail du BFR",
                rows: bfrRows,
            };
        }
        return null;
    };

    const explanations = [
        {
            title: "Chiffre d'affaires HT",
            text: "Total des ventes hors taxes prévu pour l'année.",
        },
        {
            title: "Marge brute",
            text: "Montant restant après déduction du coût des matières premières des ventes.",
        },
        {
            title: "BFR",
            text: "Besoin en fonds de roulement nécessaire pour financer le cycle d'exploitation.",
        },
        {
            title: "Point mort",
            text: "Nombre de jours nécessaires pour couvrir les coûts et atteindre le seuil de rentabilité.",
        },
        {
            title: "Résultat net",
            text: "Bénéfice ou perte après déduction de toutes les charges et impôts.",
        },
    ];

    const explanationByLabel = new Map(explanations.map((item) => [item.title.toLowerCase(), item.text]));

    return (
        <div className="relative min-h-screen bg-gray-100 text-slate-900">

            <header className="sticky h-[60px] top-0 z-40 border-b border-violet-100/80 bg-white/85 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-500/25">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-violet-700">BizPlan AI</div>
                            <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Nomac Wizard</div>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        <a
                            href="/protected/profile"
                            className="hidden rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 sm:inline-flex"
                        >
                            Mon compte
                        </a>
                        <Link
                            href="/protected/new/nomac/step1"
                            className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-500/25 transition-colors hover:bg-violet-700"
                        >
                            New Plan
                        </Link>
                    </div>
                </div>
            </header>

            <EditBpMain bpId={bpId} onOpenResultModal={handleOpenResultModal} />

            {isModalOpen && (
                <div className="fixed inset-0 z-[99999] bg-slate-950/70 px-4 py-6 sm:px-6">
                    <div className="mx-auto h-[calc(100vh-4rem)] max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
                        <div className="border-b border-slate-800 p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Détails</p>
                                    <h2 className="mt-2 text-2xl font-semibold text-white">Compte de résultat complet</h2>
                                    <p className="mt-1 text-sm text-slate-400">{yearLabel}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {years.map((year) => {
                                    const label = year === "annee1" ? "Année 1" : year === "annee2" ? "Année 2" : "Année 3";
                                    const active = modalYear === year;
                                    return (
                                        <button
                                            key={year}
                                            type="button"
                                            onClick={() => setModalYear(year)}
                                            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="h-[calc(100%-120px)] overflow-y-auto p-5 pb-10 text-sm text-slate-300">
                            <div className="space-y-6 pb-10">
                                {groupedRows.map((group) => (
                                    <div key={group.title} className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/95">
                                        <div className="border-b border-slate-800 px-4 py-4 text-sm font-semibold text-slate-300">{group.title}</div>
                                        <div className="px-4 py-3">
                                            <table className="min-w-full border-collapse text-left text-slate-300">
                                                <tbody>
                                                    {group.rows.map(([labelField, value]) => {
                                                        const detailBlock = detailBlockForLabel(labelField);
                                                        return (
                                                            <Fragment key={labelField}>
                                                                <tr className="border-t border-slate-800 last:border-b last:border-slate-800">
                                                                    <th className="w-1/2 px-4 py-4 align-top font-medium text-slate-400">{labelField}</th>
                                                                    <td className="px-4 py-4">{formatValue(labelField, value)}</td>
                                                                </tr>
                                                                {detailBlock && detailBlock.rows.length > 0 && (
                                                                    <tr className="border-t border-slate-800 bg-slate-950/80">
                                                                        <td colSpan={2} className="px-4 py-4">
                                                                            <div className="rounded-3xl bg-slate-900/90 p-4">
                                                                                <div className="text-sm font-semibold text-slate-300">{detailBlock.title}</div>
                                                                                <div className="mt-3 space-y-2 text-slate-300">
                                                                                    {detailBlock.rows.map(([detailKey, detailValue]) => (
                                                                                        <div key={detailKey} className="flex justify-between gap-4 rounded-2xl bg-slate-950/80 px-3 py-2 text-slate-300">
                                                                                            <span>{formatDetailLabel(detailKey)}</span>
                                                                                            <span>{formatValue(detailKey, detailValue)}</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                                {explanationByLabel.has(labelField.toLowerCase()) && (
                                                                                    <div className="mt-3 rounded-2xl bg-slate-900/90 p-3 text-sm text-slate-300">
                                                                                        <div className="font-semibold text-slate-100">Explication</div>
                                                                                        <div className="mt-1 text-slate-400">{explanationByLabel.get(labelField.toLowerCase())}</div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </Fragment>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}

                                {explanations.length > 0 && (
                                    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/95">
                                        <div className="border-b border-slate-800 px-4 py-4 text-sm font-semibold text-slate-300">Explications des valeurs</div>
                                        <div className="space-y-3 px-4 py-4 text-slate-300">
                                            {explanations.map((item) => (
                                                <div key={item.title}>
                                                    <div className="text-sm font-semibold text-white">{item.title}</div>
                                                    <div className="text-sm text-slate-400">{item.text}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
