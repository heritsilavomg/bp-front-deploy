"use client";

import AsideSummary from "@/components/edit-bp-page/AsideSummary";
import PlanSideNav from "./PlanSideNav";
import { BpCompletionProvider } from "@/components/edit-bp-page/BpCompletionContext";
import { useBpCompletion } from "@/hooks/useBpCompletion";
import useBpEditor from "@/hooks/useBpEditor";
import PageCanalDeVente from "@/components/edit-bp-page/pages/PageCanalDeVente";
import PageDeGarde from "@/components/edit-bp-page/pages/PageDeGarde";
import PageEquipe from "@/components/edit-bp-page/pages/PageEquipe";
import PageFournisseurs from "@/components/edit-bp-page/pages/PageFournisseurs";
import PageMoyensCommunication from "@/components/edit-bp-page/pages/PageMoyensCommunication";
import PageObjectifs from "@/components/edit-bp-page/pages/PageObjectifs";
import PagePartenaires from "@/components/edit-bp-page/pages/PagePartenaires";
import PageProjet from "@/components/edit-bp-page/pages/PageProjet";
import PagePrixDeVenteEtCout from "@/components/edit-bp-page/pages/PagePrixDeVenteEtCout";
import PageApport from "@/components/edit-bp-page/pages/PageApport";
import NatureProjet from "./pages/PageSociete/NatureProjet";
import PageEtudeDuMarchee from "./pages/PageEtudeDuMarchee";
import VolumeVente from "./pages/VolumeVente";
import PageCroissanceEtCharge from "./pages/PageCroissanceEtCharge";
import PageFinancement from "./pages/PageFinancement";
import PageInvestissement from "./pages/PageInvestissement";
import { getPlanCompletionPercent, sections } from "./PlanSideNav";
import { Bot } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import Chatter from "./components/assistant-ai/Chatter";
import { ChatterProvider, useChatter } from "./components/assistant-ai/ChatterContext";
import type { AiStoredModificationProposal } from "@/types/ai";
import { useBusinessPlanScore } from "@/hooks/useBusinessPlanScore";
import AdminOwnerContext from "./AdminOwnerContext";
import { useSession } from "next-auth/react";

type EditBpMainProps = {
    bpId?: string;
    onOpenResultModal?: (year: "annee1" | "annee2" | "annee3", data: any) => void;
};

export default function EditBpMain({ bpId, onOpenResultModal }: EditBpMainProps) {
    const { data: session } = useSession();
    const [activeItemId, setActiveItemId] = useState<string | null>(null);
    const [isAiApplying, setIsAiApplying] = useState(false);
    const {
        bpData,
        coverImagePreview,
        logoImagePreview,
        isLoading,
        toast,
        saveError,
        savedRevision,
        getFieldValue,
        handleFieldChange,
        handleFieldChangeWithDelay,
        flushPendingChanges,
        reloadBusinessPlan,
        handleUpload,
        handleRemove,
    } = useBpEditor(bpId);

    const score = useBusinessPlanScore(bpData?.id === bpId && !isLoading ? bpId : undefined, savedRevision);

    const { isFieldFilled, getCompletionMap, getOverallCompletion } = useBpCompletion(
        bpData,
        getFieldValue,
    );

    const overallPercent = getPlanCompletionPercent(getFieldValue, isFieldFilled);
    const shouldShowLoader = Boolean(bpId && isLoading);
    const projectName: string | null = bpData?.id === bpId && typeof bpData?.nomProjet === "string"
        ? bpData.nomProjet
        : null;
    const canUseAssistant = Boolean(bpId && bpData?.id === bpId && bpData?.utilisateurCreateur === session?.user.id);
    const prepareProposalApply = useCallback(async () => {
        setIsAiApplying(true);
        try {
            await flushPendingChanges();
        } catch (error) {
            setIsAiApplying(false);
            throw error;
        }
    }, [flushPendingChanges]);
    const handleProposalApplied = useCallback(async (proposal: AiStoredModificationProposal) => {
        await reloadBusinessPlan();
    }, [reloadBusinessPlan]);
    const finishProposalApply = useCallback(() => setIsAiApplying(false), []);

    return (
        <main className="relative mx-auto flex min-h-[calc(100vh-60px)] max-w-[1600px] flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 lg:px-8 xl:px-12 lg:pb-6">
            <AdminOwnerContext bpId={bpData?.id === bpId ? bpId : undefined} ownerId={typeof bpData?.utilisateurCreateur === "string" ? bpData.utilisateurCreateur : undefined} />
            {toast && (
                <div className="pointer-events-none fixed bottom-6 left-6 z-50 flex">
                    <div
                        className={`pointer-events-auto rounded-lg px-4 py-3 text-sm font-medium shadow-md ${toast.type === "success"
                            ? "bg-emerald-500 text-white"
                            : toast.type === "error"
                                ? "bg-red-500 text-white"
                                : "bg-slate-800 text-white"
                            }`}
                    >
                        {toast.message}
                    </div>
                </div>
            )}

            <BpCompletionProvider
                value={{
                    bpData,
                    getFieldValue,
                    isFieldFilled,
                    customValidators: [],
                }}
            >
                <ChatterProvider>

                    <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[400px_minmax(0,_1fr)_380px]">
                        <div className="min-w-0 self-start xl:sticky xl:top-20">
                            <PlanSideNav activeItemId={activeItemId} onActiveItemChange={setActiveItemId} score={score} />
                        </div>

                        <div className="relative min-w-0 overflow-x-auto">
                        {isAiApplying && (
                            <div role="status" aria-live="polite" className="absolute inset-x-4 top-4 z-20 rounded-xl bg-slate-900/90 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg">
                                Application de la proposition et rechargement du Business Plan…
                            </div>
                        )}
                        <section
                            inert={isAiApplying}
                            aria-busy={isAiApplying}
                            className={`flex w-auto flex-col gap-6 rounded-3xl border-slate-200/80 p-0 ${isAiApplying ? "pointer-events-none opacity-70" : ""}`}
                        >
                            {shouldShowLoader ? (
                                <div className="grid gap-4 p-10 text-center text-slate-500">
                                    <div className="mx-auto h-20 w-20 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600" />
                                    <div>Chargement du business plan...</div>
                                </div>
                            ) : bpId && bpData?.id !== bpId ? (
                                <p role="alert" className="p-4 text-sm text-red-600">{saveError || "Impossible de charger le Business Plan."}</p>
                            ) : (
                                <>
                                    <PageDeGarde
                                        coverImagePreview={coverImagePreview}
                                        logoImagePreview={logoImagePreview}
                                        onUpload={handleUpload}
                                        onRemove={handleRemove}
                                        onFieldChange={handleFieldChange}
                                        handleFieldChangeWithDelay={handleFieldChangeWithDelay}
                                        bpData={bpData}
                                        getFieldValue={getFieldValue}
                                    />

                                    <PageProjet
                                        handleFieldChangeWithDelay={handleFieldChangeWithDelay}
                                        onFieldChange={handleFieldChange}
                                        getFieldValue={getFieldValue}
                                    />

                                    <section className="rounded-3xl bg-white/90 shadow-2xl">
                                        <PageCanalDeVente onFieldChange={handleFieldChange} getFieldValue={getFieldValue} />
                                        <PageMoyensCommunication onFieldChange={handleFieldChange} getFieldValue={getFieldValue} />
                                        <PageObjectifs onFieldChange={handleFieldChange} getFieldValue={getFieldValue} />
                                    </section>

                                    <section className="rounded-3xl bg-white/90 shadow-2xl">
                                        <PageEquipe onFieldChange={handleFieldChange} getFieldValue={getFieldValue} dateDebutProjet={getFieldValue("societe.dateCreationPrevue")} />
                                        <PagePartenaires onFieldChange={handleFieldChange} getFieldValue={getFieldValue} />
                                        <PageFournisseurs onFieldChange={handleFieldChange} getFieldValue={getFieldValue} />
                                    </section>

                                    <section className="rounded-3xl bg-white/90 shadow-2xl">
                                        <NatureProjet onFieldChange={handleFieldChange} getFieldValue={getFieldValue} />
                                    </section>

                                    <PageEtudeDuMarchee onFieldChange={handleFieldChange} getFieldValue={getFieldValue} />

                                    <PagePrixDeVenteEtCout onFieldChange={handleFieldChange} getFieldValue={getFieldValue} />

                                    <PageApport onFieldChange={handleFieldChange} getFieldValue={getFieldValue} />

                                    <VolumeVente onFieldChange={handleFieldChange} getFieldValue={getFieldValue} />

                                    <PageCroissanceEtCharge onFieldChange={handleFieldChange} getFieldValue={getFieldValue} />

                                    <PageInvestissement onFieldChange={handleFieldChange} getFieldValue={getFieldValue} />

                                    <PageFinancement onFieldChange={handleFieldChange} getFieldValue={getFieldValue} />
                                </>
                            )}
                        </section>
                        </div>

                        <AsideSummary
                            canUseAssistant={canUseAssistant}
                            activeItemId={activeItemId}
                            bpId={bpData?.id === bpId && !isLoading ? bpId : undefined}
                            savedRevision={savedRevision}
                            waitingForPlan={isLoading}
                            overallPercent={overallPercent}
                            onOpenResultModal={onOpenResultModal}
                        />
                    </div>

                    {bpId && canUseAssistant && (
                        <ChatOverlay
                            bpId={bpId}
                            projectName={projectName}
                            beforeAiSend={flushPendingChanges}
                            beforeProposalApply={prepareProposalApply}
                            onProposalApplied={handleProposalApplied}
                            onProposalApplySettled={finishProposalApply}
                        />
                    )}
                </ChatterProvider>
            </BpCompletionProvider>
        </main>
    );
}

function ChatOverlay({
    bpId, projectName, beforeAiSend, beforeProposalApply, onProposalApplied, onProposalApplySettled,
}: {
    bpId: string;
    projectName: string | null;
    beforeAiSend: () => Promise<void>;
    beforeProposalApply: () => Promise<void>;
    onProposalApplied: (proposal: AiStoredModificationProposal) => Promise<void>;
    onProposalApplySettled: () => void;
}) {
    const { state, setState } = useChatter();
    const mobileTriggerRef = useRef<HTMLButtonElement>(null);

    const restoreFocusAfterClose = () => {
        window.requestAnimationFrame(() => {
            if (window.matchMedia("(max-width: 1023px)").matches) {
                mobileTriggerRef.current?.focus();
            } else {
                (document.activeElement as HTMLElement | null)?.blur();
            }
        });
    };

    return (
        <>
            <button
                ref={mobileTriggerRef}
                type="button"
                hidden={state.open && !state.minimized}
                onClick={() => setState((prev) => ({ ...prev, open: true, minimized: false, expanded: false }))}
                aria-label="Ouvrir l'assistant IA"
                className="fixed bottom-4 right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-violet-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:bg-violet-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:bg-violet-600 dark:hover:bg-violet-500 xl:hidden"
            >
                <Bot aria-hidden="true" className="h-5 w-5" />
                Assistant IA
            </button>
            <Chatter
                open={state.open}
                expanded={state.expanded}
                minimized={state.minimized}
                onClose={() => {
                    setState((prev) => ({ ...prev, open: false, minimized: false }));
                    restoreFocusAfterClose();
                }}
                onToggleExpanded={() => setState((prev) => ({ ...prev, expanded: !prev.expanded, minimized: false }))}
                onToggleMinimize={() => {
                    if (!state.minimized) restoreFocusAfterClose();
                    setState((prev) => ({ ...prev, minimized: !prev.minimized, open: !prev.minimized }));
                }}
                bpId={bpId}
                projectName={projectName}
                beforeAiSend={beforeAiSend}
                beforeProposalApply={beforeProposalApply}
                onProposalApplied={onProposalApplied}
                onProposalApplySettled={onProposalApplySettled}
            />
        </>
    );
}
