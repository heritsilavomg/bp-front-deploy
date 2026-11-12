import { Bot, Lamp } from "lucide-react";
import { planItemDescriptions } from "./planItemDescriptions";
import { useEffect, useState } from "react";
import { useBusinessPlanCalculation } from "@/hooks/useBusinessPlanCalculation";
import CalculationSummary from "./CalculationSummary";
import { useChatter } from "./components/assistant-ai/ChatterContext";

type AsideSummaryProps = {
    activeItemId: string | null;
    bpId?: string | null;
    savedRevision: number;
    waitingForPlan: boolean;
    overallPercent: number;
    canUseAssistant?: boolean;
    onOpenResultModal?: (year: "annee1" | "annee2" | "annee3", data: any) => void;
};

export default function AsideSummary({
    activeItemId,
    bpId,
    savedRevision,
    waitingForPlan,
    overallPercent,
    canUseAssistant = true,
    onOpenResultModal,
}: AsideSummaryProps) {
    const currentItem = activeItemId ? planItemDescriptions[activeItemId] : null;
    const { data: calculData, loading: loadingCalc, error: calcError, retry } = useBusinessPlanCalculation(bpId, savedRevision);
    const [selectedYear, setSelectedYear] = useState<"annee1" | "annee2" | "annee3">("annee1");
    const [warningMessage, setWarningMessage] = useState<string | null>(null);
    const { setState } = useChatter();

    const isPlanComplete = overallPercent === 100;

    useEffect(() => {
        if (isPlanComplete) {
            setWarningMessage(null);
        }
    }, [isPlanComplete]);

    return (
        <aside className="hidden self-start xl:block order-last xl:order-none xl:sticky xl:top-20 rounded-3xl border border-slate-200/80 bg-slate-950/95 p-4 text-white shadow-[0_24px_90px_-60px_rgba(15,23,42,0.52)] sm:p-5">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Performance</p>
                    <h2 className="mt-1 text-xl font-semibold">Résumé Rapide</h2>
                </div>
            </div>

            <div className="mt-4 rounded-lg bg-slate-900/90 p-3">
                <div className="flex items-start gap-3 text-slate-300">
                    <span className="rounded-2xl bg-slate-800/80 p-3 text-slate-300">
                        <Lamp className="h-4 w-4" />
                    </span>
                    <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Information</p>
                        <p className="mt-2 text-base font-semibold text-white">{currentItem?.title ?? "Section active"}</p>
                    </div>
                </div>
                <p className="mt-3 text-sm leading-5 text-slate-300">
                    {currentItem?.description ?? "Faites défiler le plan pour afficher l’explication du champ actuellement visible à l’écran."}
                </p>
            </div>

            <CalculationSummary data={calculData} loading={waitingForPlan || loadingCalc} error={calcError} retry={retry}
                selectedYear={selectedYear} onSelectYear={setSelectedYear} />

            <div className="min-h-24">
            {calculData && (calculData.annee1 || calculData.annee2 || calculData.annee3) && (
                <div className="mt-4">
                    <button
                        type="button"
                        onClick={() => {
                            if (!isPlanComplete) {
                                setWarningMessage("Complétez le business plan à 100 % pour voir le compte de résultat.");
                                return;
                            }
                            onOpenResultModal?.(selectedYear, calculData);
                        }}
                        disabled={!isPlanComplete}
                        className={`inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${isPlanComplete ? "cursor-pointer bg-slate-800 text-white hover:bg-slate-700" : "cursor-not-allowed bg-slate-700/80 text-slate-300"}`}
                    >
                        Compte de résultat complet
                    </button>
                    {!isPlanComplete && (
                        <p className="mt-2 text-xs text-amber-300">
                            Le business plan doit être complété à 100 % pour ouvrir le compte de résultat.
                        </p>
                    )}
                    {warningMessage && <p className="mt-2 text-xs text-red-400">{warningMessage}</p>}
                </div>
            )}

            </div>
            {canUseAssistant && <div className="mt-3">
                <button
                    type="button"
                    onClick={() => setState((prev) => ({ ...prev, open: true, minimized: false, expanded: false }))}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
                >
                    <Bot className="h-4 w-4" />
                    Conversation avec un agent IA
                </button>
            </div>}

        </aside>
    );
}
