"use client";

import { CheckCircle2, Clock3, LoaderCircle, TriangleAlert } from "lucide-react";
import type { AiProposedChange, AiStoredModificationProposal } from "@/types/ai";
import { AI_MODIFICATION_LABELS } from "../modificationCapabilities";
import type { ProposalApplyError } from "../hooks/useAiModificationProposals";

type ModificationProposalCardProps = {
    proposal: AiStoredModificationProposal;
    isApplying: boolean;
    applyDisabled: boolean;
    applyError?: ProposalApplyError;
    onApply: (proposalId: string) => Promise<void>;
};

const numberFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

function changeLabel(change: AiProposedChange): string {
    const offerName = change.target.offerName?.trim();
    return offerName
        ? `${AI_MODIFICATION_LABELS[change.type]} — ${offerName}`
        : AI_MODIFICATION_LABELS[change.type];
}

function changeValue(change: AiProposedChange, side: "old" | "new"): string {
    if (change.valueType === "STRING") {
        const value = side === "old" ? change.oldStringValue : change.newStringValue;
        return value?.trim() || "Non renseigné";
    }
    if (change.valueType === "DOUBLE") {
        const value = side === "old" ? change.oldDoubleValue : change.newDoubleValue;
        const suffix = change.unit === "MGA" ? " Ar" : change.unit === "PERCENTAGE" ? " %" : "";
        return typeof value === "number"
            ? `${numberFormatter.format(value)}${suffix}`
            : "Non renseigné";
    }
    if (change.type === "OFFER_CREATE" && change.createOffer) {
        if (side === "old") return "Nouvelle offre";
        const o = change.createOffer;
        return `${o.name} — ${o.offerType === "PRODUIT" ? "Produit" : "Service"}\n${o.description}\nPrix de vente HT : ${numberFormatter.format(o.salePriceHt)} Ar (TVA ${o.saleVat} %)\nCoût unitaire HT : ${numberFormatter.format(o.unitCostHt)} Ar (TVA ${o.costVat} %)\nVentes : ${o.salesCount} — ${o.salesFrequency}`;
    }
    if (change.type === "OFFER_DELETE") return side === "old" ? change.target.offerName || "Offre" : "Offre supprimée après confirmation";
    const value = side === "old" ? change.oldIntegerValue : change.newIntegerValue;
    return typeof value === "number" ? numberFormatter.format(value) : "Non renseigné";
}

function ValueText({ label, value, expanded = false }: { label: string; value: string; expanded?: boolean }) {
    if (value.length <= 150 || expanded) {
        return (
            <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800 [overflow-wrap:anywhere] dark:text-slate-100">{value}</p>
            </div>
        );
    }
    return (
        <details className="min-w-0">
            <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:text-slate-400">
                {label} — afficher le texte complet
            </summary>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-800 [overflow-wrap:anywhere] dark:text-slate-100">{value}</p>
        </details>
    );
}

function Status({ proposal }: { proposal: AiStoredModificationProposal }) {
    if (proposal.status === "APPLIED") {
        return (
            <p role="status" className="flex flex-wrap items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                Modification appliquée
                {proposal.appliedAt && (
                    <span className="font-normal text-slate-500 dark:text-slate-400">
                        le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(proposal.appliedAt))}
                    </span>
                )}
            </p>
        );
    }
    if (proposal.status === "EXPIRED") {
        return <p role="status" className="text-sm font-semibold text-amber-700 dark:text-amber-300">Cette proposition a expiré.</p>;
    }
    if (proposal.status === "REJECTED") {
        return <p role="status" className="text-sm font-semibold text-slate-600 dark:text-slate-300">Proposition rejetée</p>;
    }
    return (
        <p role="status" className="flex items-center gap-2 text-sm font-semibold text-violet-700 dark:text-violet-300">
            <Clock3 aria-hidden="true" className="h-4 w-4" />
            En attente de votre validation
        </p>
    );
}

export default function ModificationProposalCard({
    proposal,
    isApplying,
    applyDisabled,
    applyError,
    onApply,
}: ModificationProposalCardProps) {
    const needsFinancialRefresh = proposal.changes.some((change) => change.requiresFinancialRecalculation);
    const canApply = proposal.status === "PENDING" && !applyError?.terminal;

    return (
        <article
            aria-label="Proposition de modification du Business Plan"
            className="ml-0 max-w-[96%] rounded-2xl border border-violet-200 bg-violet-50/80 p-4 shadow-sm dark:border-violet-800 dark:bg-violet-950/30 sm:ml-8"
        >
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700 dark:text-violet-300">
                        Proposition de modification
                    </p>
                    <p className="mt-2 break-words text-sm text-slate-700 dark:text-slate-200">{proposal.summary}</p>
                </div>
                <Status proposal={proposal} />
            </div>

            <div className="mt-4 space-y-3">
                {proposal.changes.map((change, index) => {
                    const oldValue = changeValue(change, "old");
                    const newValue = changeValue(change, "new");
                    return (
                        <section key={`${change.type}:${change.target.offerId ?? change.createdOfferId ?? change.target.offerName ?? "bp"}:${index}`} className="rounded-xl border border-violet-100 bg-white/80 p-3 dark:border-violet-900 dark:bg-slate-900/70">
                            <h3 className="break-words text-sm font-semibold text-slate-900 dark:text-white">{changeLabel(change)}</h3>
                            {change.type === "OFFER_DELETE" && <p className="mt-2 text-sm font-semibold text-red-700 dark:text-red-300">Cette suppression retirera l’offre des prévisions financières.</p>}
                            <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-start">
                                <ValueText label="Ancienne valeur" value={oldValue} />
                                <span aria-hidden="true" className="hidden pt-5 text-violet-500 sm:block">→</span>
                                <ValueText label="Nouvelle valeur" value={newValue} expanded={change.type === "OFFER_CREATE"} />
                            </div>
                        </section>
                    );
                })}
            </div>

            {needsFinancialRefresh && (
                <p className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <TriangleAlert aria-hidden="true" className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                    Les indicateurs financiers seront mis à jour.
                </p>
            )}

            {applyError && (
                <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
                    {applyError.message}
                </p>
            )}

            {canApply && (
                <div className="mt-4 flex justify-end">
                    <button
                        type="button"
                        disabled={applyDisabled}
                        aria-label="Appliquer toute la proposition"
                        aria-busy={isApplying}
                        onClick={() => { void onApply(proposal.id); }}
                        className="inline-flex min-h-11 min-w-32 items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-violet-600 dark:hover:bg-violet-500"
                    >
                        {isApplying && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
                        {isApplying ? "Application..." : "Appliquer"}
                    </button>
                </div>
            )}
        </article>
    );
}
