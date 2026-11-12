"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Circle, Download } from "lucide-react";
import { CompletionRule, defaultCompletionRules } from "@/hooks/bpCompletionRules";
import BusinessPlanScorePanel from "./BusinessPlanScorePanel";
import type { BusinessPlanScoreState } from "@/hooks/useBusinessPlanScore";

export const sections = [
    {
        title: "Page de garde",
        items: ["Couverture", "Contact de référence", "À propos de votre projet"],
    },
    {
        title: "Projet",
        items: [
            "Description",
            "Offres",
            "Canaux de ventes",
            "Moyen de communication",
            "Objectifs",
            "Equipe",
            "Partenaires",
            "Fournisseurs",
        ],
    },
    {
        title: "Société",
        items: ["Nature du projet", "Statut juridique", "Associés"],
    },
    {
        title: "Etude de marché",
        items: ["Informations sur mon activité", "Zone d'implantation", "Concurrents", "Clients"],
    },
    {
        title: "Prévisionnel",
        items: [
            "Prix de vente",
            "Coût unitaire par produit",
            "Apports",
            "Volume des ventes",
            "Croissance",
            "Charges",
            "Investissements",
            "Financements",
        ],
    },
];

export function getPlanCompletionPercent(getFieldValue: (field: string) => any, isFieldFilled: (field: string) => boolean) {
    const rulesByItem = new Map<string, CompletionRule>();
    defaultCompletionRules.forEach((rule) => rulesByItem.set(rule.item.toLowerCase(), rule));

    let completed = 0;
    let total = 0;

    sections.forEach((section) => {
        section.items.forEach((item) => {
            total += 1;
            const rule = rulesByItem.get(item.toLowerCase());
            if (!rule) return;

            let itemComplete = false;
            if (rule.validator) {
                itemComplete = rule.validator(getFieldValue, null);
            } else if (rule.fields) {
                itemComplete = rule.fields.some((field) => isFieldFilled(field));
            }

            if (itemComplete) {
                completed += 1;
            }
        });
    });

    return total === 0 ? 0 : Math.round((completed / total) * 100);
}

function slugify(text: string) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s\/]+/g, "-")
        .replace(/[^a-z0-9-_]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

import { useBpCompletionContext } from "@/components/edit-bp-page/BpCompletionContext";

type PlanSideNavProps = {
    activeItemId: string | null;
    onActiveItemChange: (id: string | null) => void;
    score: BusinessPlanScoreState;
};

export default function PlanSideNav({ activeItemId, onActiveItemChange, score }: PlanSideNavProps) {
    const { bpData, getFieldValue, isFieldFilled } = useBpCompletionContext();
    const [openSection, setOpenSection] = useState("Projet");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    const itemCompletionMap = useMemo(() => {
        const map = new Map<string, boolean>();

        const rulesByItem = new Map<string, CompletionRule>();
        defaultCompletionRules.forEach((rule) => rulesByItem.set(rule.item.toLowerCase(), rule));

        const checkItem = (item: string) => {
            const rule = rulesByItem.get(item.toLowerCase());
            if (!rule) return false;

            if (rule.validator) {
                return rule.validator(getFieldValue, null);
            }

            if (!rule.fields) return false;
            return rule.fields.some((field) => isFieldFilled(field));
        };

        sections.forEach((section) => {
            section.items.forEach((item) => map.set(slugify(item), checkItem(item)));
        });

        return map;
    }, [getFieldValue, isFieldFilled]);

    const overallPercent = useMemo(() => {
        const totals = sections.reduce(
            (acc, section) => acc + section.items.length,
            0,
        );
        const completed = sections.reduce(
            (acc, section) => acc + section.items.reduce((s, it) => s + (itemCompletionMap.get(slugify(it)) ? 1 : 0), 0),
            0,
        );
        return totals === 0 ? 0 : Math.round((completed / totals) * 100);
    }, [itemCompletionMap]);

    const bpId = bpData?.id?.toString();
    const canDownloadPdf = overallPercent === 100 && Boolean(bpId);

    const handleDownloadPdf = async () => {
        if (!bpId || !canDownloadPdf || isDownloading) return;

        setIsDownloading(true);
        setDownloadError(null);

        try {
            const response = await fetch(`/api/bp/pdf/${encodeURIComponent(bpId)}`);
            if (!response.ok) {
                const payload = await response.text().catch(() => "");
                throw new Error(payload || "Impossible de générer le PDF du business plan.");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `business-plan-${bpId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setDownloadError(error instanceof Error ? error.message : "Erreur lors du téléchargement du PDF.");
        } finally {
            setIsDownloading(false);
        }
    };

    useEffect(() => {
        const ids = sections.flatMap((s) => s.items.map((i) => slugify(i)));

        const getSectionForId = (id: string) => {
            return sections.find((section) => section.items.some((item) => slugify(item) === id));
        };

        const onScroll = () => {
            let closestId: string | null = null;
            let closestTop = Number.POSITIVE_INFINITY;

            ids.forEach((id) => {
                const el = document.getElementById(id);
                if (!el) return;
                const rect = el.getBoundingClientRect();
                const top = Math.abs(rect.top - 120); // offset
                if (rect.top <= 200 && top < closestTop) {
                    closestTop = top;
                    closestId = id;
                }
            });

            if (closestId) {
                onActiveItemChange(closestId);
                const section = getSectionForId(closestId);
                if (section) setOpenSection(section.title);
            }
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);


    const navContent = (
        <nav className="mt-5 space-y-3 text-sm text-slate-700">
            {sections.map((section) => {
                const isOpen = openSection === section.title;
                const completedCount = section.items.reduce((acc, item) => acc + (itemCompletionMap.get(slugify(item)) ? 1 : 0), 0);
                const pct = Math.round((completedCount / section.items.length) * 100);
                const headerClasses = [
                    "flex items-center justify-between gap-3 w-full rounded-3xl p-3 text-left border border-transparent",
                    isOpen ? "ring-1 ring-violet-200 text-violet-700" : "bg-transparent text-slate-900 hover:border-slate-200/70",
                ].join(" ");

                const checkColor = pct === 100 ? "bg-emerald-100 text-emerald-700" : pct >= 50 ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-500";

                const SectionIcon = pct === 100 ? Check : Circle;
                const sectionIconClass = pct === 100 ? "h-4 w-4 text-emerald-700" : "h-4 w-4 text-slate-500";

                return (
                    <div key={section.title} className="rounded-3xl">
                        <button
                            type="button"
                            onClick={() => setOpenSection(isOpen ? "" : section.title)}
                            className={headerClasses + " cursor-pointer"}
                            aria-expanded={isOpen}
                        >
                            <div className="flex items-center gap-3">
                                <span className={"flex h-8 w-8 items-center justify-center rounded-full font-semibold " + checkColor}>
                                    <SectionIcon className={sectionIconClass} />
                                </span>
                                <span>{section.title}</span>
                            </div>
                            <span className={"text-xs font-semibold transition-transform " + (isOpen ? "rotate-180" : "rotate-0")}>▼</span>
                        </button>

                        {isOpen && (
                            <div className="mt-3 space-y-1 border-t border-slate-200/70 pt-3 pl-10 text-slate-500">
                                {section.items.map((item) => {
                                    const id = slugify(item);
                                    const active = activeItemId === id;
                                    const itemComplete = itemCompletionMap.get(id) ?? false;
                                    const ItemIcon = itemComplete ? Check : Circle;
                                    const itemIconColor = itemComplete ? "text-emerald-500" : "text-slate-400";
                                    return (
                                        <a
                                            key={item}
                                            href={`#${id}`}
                                            onClick={() => setMobileOpen(false)}
                                            className={
                                                "flex items-center gap-2 px-2 py-1 text-sm transition " +
                                                (active ? "text-slate-900 font-semibold" : "text-slate-500")
                                            }
                                        >
                                            <ItemIcon className={`h-4 w-4 ${itemIconColor}`} />
                                            <span>{item}</span>
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="rounded-2xl p-3">
                <button
                    type="button"
                    onClick={() => void handleDownloadPdf()}
                    disabled={!canDownloadPdf || isDownloading}
                    className={`cursor-pointer flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition ${canDownloadPdf && !isDownloading
                        ? "bg-violet-600 text-white shadow-sm shadow-violet-500/25 hover:bg-violet-700"
                        : "cursor-not-allowed bg-slate-200 text-slate-500"}`}
                >
                    <Download className="h-4 w-4" />
                    {isDownloading ? "Téléchargement..." : "Télécharger le PDF"}
                </button>
                {!canDownloadPdf && (
                    <p className="mt-2 text-xs text-slate-500">
                        Le PDF devient disponible lorsque le plan est complété à 100%.
                    </p>
                )}
                {downloadError && <p className="mt-2 text-xs text-red-600">{downloadError}</p>}
            </div>
        </nav>
    );

    return (
        <>
            <section className="hidden bg-transparent xl:block sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-600">Plan Progress</p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{overallPercent}% Complete</h2>
                    </div>
                    <div className="rounded-2xl bg-violet-100 px-3 py-2 text-sm font-semibold text-violet-700">{overallPercent}/100</div>
                </div>
                <BusinessPlanScorePanel {...score} />
                {navContent}
            </section>

            <div className="xl:hidden">
                <div className="bg-transparent p-3">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-600">Plan Progress</p>
                            <h2 className="mt-1 text-lg font-semibold text-slate-900">{overallPercent}% Complete</h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-500/25 transition hover:bg-violet-700"
                        >
                            Ouvrir
                        </button>
                    </div>
                    <BusinessPlanScorePanel {...score} />
                </div>

                {mobileOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4">
                        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xl">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-600">Plan Progress</p>
                                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{overallPercent}% Complete</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setMobileOpen(false)}
                                    className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                                >
                                    Fermer
                                </button>
                            </div>
                            <div className="mt-5 max-h-[70vh] overflow-y-auto">{navContent}</div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
