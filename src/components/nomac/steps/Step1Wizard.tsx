"use client";

import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import StaggerChildren from "@/components/animations/StaggerChildren";
import { useNomacWizard } from "@/components/nomac/NomacWizardProvider";
import { NomacWizardShell } from "@/components/nomac/wizard/NomacWizardShell";
import { ResultCard, SelectionCard, SkeletonGrid } from "@/components/nomac/wizard/NomacWizardCards";
import {
  buildBreadcrumb,
  buildSelectionFromResult,
  getSectionLabel,
  getSectionTone,
  getWizardRequiredStep,
  getWizardStepGridColumns,
  pickDescription,
  STEP_ROUTE_PATHS,
} from "@/components/nomac/wizard/nomacWizard";
import { useNomacDirectSearch } from "@/components/nomac/wizard/useNomacDirectSearch";
import { useNomacWizardStepItems } from "@/components/nomac/wizard/useNomacWizardStep";
import type { GlobalNomacResult, SectionEntity } from "@/types/nomac";

export default function Step1Wizard() {
  const router = useRouter();
  const { hydrated, selection, replaceSelection, setSection } = useNomacWizard();
  const { items: sections, loading, error } = useNomacWizardStepItems<SectionEntity>(1, selection, hydrated);
  const {
    searchQuery,
    setSearchQuery,
    searchLoading,
    directResults,
    searchError,
    handleDirectSearch,
  } = useNomacDirectSearch();

  const breadcrumb = buildBreadcrumb(selection, 1);
  const columnsClassName = getWizardStepGridColumns(1);
  const canAdvance = Boolean(selection.section);

  const handleNext = () => {
    if (selection.section) {
      router.replace(STEP_ROUTE_PATHS[2]);
    }
  };

  const handleSectionPick = (section: SectionEntity) => {
    setSection(section);
  };

  const handleDirectResultPick = (result: GlobalNomacResult) => {
    const nextSelection = buildSelectionFromResult(result);
    replaceSelection(nextSelection);
    const nextStep = getWizardRequiredStep(nextSelection);
    router.replace(STEP_ROUTE_PATHS[nextStep]);
  };

  return (
    <NomacWizardShell
      step={1}
      breadcrumb={breadcrumb}
      hydrated={hydrated}
      canAdvance={canAdvance}
      onNext={handleNext}
    >
      <section className="grid gap-6">
        <FadeIn delay={0.05}>
          <form
            onSubmit={handleDirectSearch}
            className="rounded-[28px] border border-violet-100 bg-white p-4 shadow-[0_20px_80px_rgba(91,33,182,0.07)] sm:p-6"
          >
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-violet-600">
              <Search className="h-4 w-4" />
              Recherche directe
            </div>
            <div className="mt-4 flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Entrez votre code catégorie (Ex: 7022Z)"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm shadow-violet-500/25 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Recherche Directe
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Recherchez par code, libellé ou mot-clé pour retrouver immédiatement la bonne hiérarchie NOMAC.
            </p>
            {searchError ? (
              <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {searchError}
              </div>
            ) : null}
          </form>
        </FadeIn>

        {directResults.length > 0 ? (
          <FadeIn delay={0.08}>
            <div className="rounded-[28px] border border-violet-100 bg-white p-4 shadow-[0_20px_80px_rgba(91,33,182,0.06)] sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Résultats directs</h2>
                  <p className="text-sm text-slate-500">
                    Cliquez sur un résultat pour accéder directement au bon niveau de sélection.
                  </p>
                </div>
                <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                  {directResults.length} résultat(s)
                </span>
              </div>

              <StaggerChildren stagger={0.05} duration={0.4}>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {directResults.map((result) => (
                    <ResultCard
                      key={`${result.type}-${result.code}`}
                      result={result}
                      onClick={() => handleDirectResultPick(result)}
                    />
                  ))}
                </div>
              </StaggerChildren>
            </div>
          </FadeIn>
        ) : null}

        <FadeIn delay={0.1}>
          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_80px_rgba(15,23,42,0.05)] sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950 sm:text-xl">Choisissez votre secteur</h2>
                <p className="text-sm text-slate-500">
                  Sélectionnez votre activité pour poursuivre la hiérarchie NOMAC.
                </p>
              </div>
              <div className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                Sélection rapide
              </div>
            </div>

            {loading ? (
              <SkeletonGrid count={12} columnsClassName={columnsClassName} />
            ) : error ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : (
              <StaggerChildren stagger={0.03} duration={0.35}>
                <div className={"grid gap-4 " + columnsClassName}>
                  {sections.map((section, index) => {
                    const title = getSectionLabel(section);
                    const Icon = getSectionTone(index, `${title} ${section.libelle ?? ""}`);

                    return (
                      <SelectionCard
                        key={section.code}
                        icon={Icon}
                        title={title || section.code}
                        description={pickDescription(title, [section.libelle, section.searchText])}
                        code={section.code}
                        badge="Section"
                        footer="Secteur"
                        selected={selection.section?.code === section.code}
                        onClick={() => handleSectionPick(section)}
                      />
                    );
                  })}
                </div>
              </StaggerChildren>
            )}
          </div>
        </FadeIn>
      </section>
    </NomacWizardShell>
  );
}
