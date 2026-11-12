"use client";

import { useRouter } from "next/navigation";
import { BadgeInfo } from "lucide-react";
import StaggerChildren from "@/components/animations/StaggerChildren";
import { useNomacWizard } from "@/components/nomac/NomacWizardProvider";
import { NomacWizardShell } from "@/components/nomac/wizard/NomacWizardShell";
import { SelectionCard, SkeletonGrid, SummaryLine } from "@/components/nomac/wizard/NomacWizardCards";
import {
  buildBreadcrumb,
  getCategorieLabel,
  getClasseLabel,
  getDivisionLabel,
  getGroupeLabel,
  getSectionLabel,
  getStepTone,
  getWizardStepGridColumns,
  getWizardStepSkeletonCount,
  pickDescription,
  STEP_ROUTE_PATHS,
} from "@/components/nomac/wizard/nomacWizard";
import { useNomacWizardStepGuard, useNomacWizardStepItems } from "@/components/nomac/wizard/useNomacWizardStep";
import type { CategorieEntity } from "@/types/nomac";

export default function Step5Wizard() {
  const router = useRouter();
  const { hydrated, selection, setCategorie } = useNomacWizard();
  useNomacWizardStepGuard(5, hydrated, selection);
  const { items: categories, loading, error } = useNomacWizardStepItems<CategorieEntity>(5, selection, hydrated);

  const breadcrumb = buildBreadcrumb(selection, 5);
  const columnsClassName = getWizardStepGridColumns(5);
  const canAdvance = Boolean(selection.categorie);

  const handleBack = () => {
    router.replace(STEP_ROUTE_PATHS[4]);
  };

  const handleNext = () => {
    if (selection.categorie) {
      router.replace("/protected/new/etat-projet");
    }
  };

  const handleCategoriePick = (categorie: CategorieEntity) => {
    setCategorie(categorie);
  };

  const opportunityValues = [
    getSectionLabel(selection.section),
    getDivisionLabel(selection.division),
    getGroupeLabel(selection.groupe),
    getClasseLabel(selection.classe),
    selection.categorie?.code,
  ]
    .filter(Boolean)
    .slice(0, 5);

  return (
    <NomacWizardShell
      step={5}
      breadcrumb={breadcrumb}
      hydrated={hydrated}
      canAdvance={canAdvance}
      onBack={handleBack}
      onNext={handleNext}
    >
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_80px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950 sm:text-xl">Choisir la catégorie finale</h2>
              <p className="text-sm text-slate-500">
                Basé sur votre sélection de classe, voici les catégories NOMAC correspondantes.
              </p>
            </div>
            <div className="rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              100% Complete
            </div>
          </div>

          <div className="mb-5 rounded-2xl border border-violet-100 bg-violet-50/80 p-4 text-sm leading-6 text-slate-700">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <BadgeInfo className="h-4 w-4 text-violet-600" />
              Configuration de la catégorie
            </div>
            <p className="mt-2">
              La catégorie finale sera utilisée pour finaliser la structure de votre plan et affiner la génération.
            </p>
          </div>

          {loading ? (
            <SkeletonGrid count={getWizardStepSkeletonCount(5)} columnsClassName={columnsClassName} />
          ) : error ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : (
            <StaggerChildren stagger={0.03} duration={0.35}>
              <div className={"grid gap-4 " + columnsClassName}>
                {categories.map((categorie, index) => {
                  const title = getCategorieLabel(categorie);
                  const Icon = getStepTone(5, index);

                  return (
                    <SelectionCard
                      key={categorie.code}
                      icon={Icon}
                      title={title || categorie.code}
                      description={pickDescription(title, [categorie.libelle, categorie.searchText])}
                      code={categorie.code}
                      badge="Catégorie"
                      footer={getClasseLabel(selection.classe)}
                      selected={selection.categorie?.code === categorie.code}
                      onClick={() => handleCategoriePick(categorie)}
                    />
                  );
                })}
              </div>
            </StaggerChildren>
          )}
        </div>

        <aside className="rounded-[28px] border border-violet-100 bg-[linear-gradient(180deg,rgba(244,238,255,0.95)_0%,rgba(255,255,255,0.98)_100%)] p-5 shadow-[0_20px_80px_rgba(91,33,182,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-600">Résumé du Secteur</p>
              <h3 className="mt-2 text-lg font-bold text-slate-950">Configuration active</h3>
            </div>
            <div className="rounded-full bg-violet-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white">
              Config NOMAC active
            </div>
          </div>

          <div className="mt-5 space-y-3 rounded-2xl border border-white/80 bg-white/90 p-4">
            <SummaryLine label="Section" value={getSectionLabel(selection.section)} />
            <SummaryLine label="Division" value={getDivisionLabel(selection.division)} />
            <SummaryLine label="Groupe" value={getGroupeLabel(selection.groupe)} />
            <SummaryLine label="Classe" value={getClasseLabel(selection.classe)} />
            <SummaryLine label="Catégorie" value={getCategorieLabel(selection.categorie)} />
          </div>

          <div className="mt-5 rounded-2xl border border-violet-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Opportunités clés</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {opportunityValues.map((value, index) => (
                <span
                  key={(value || "Unknown") + index}
                  className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Sélectionnez une catégorie finale pour verrouiller le contexte NOMAC de votre nouveau plan.
          </div>
        </aside>
      </section>
    </NomacWizardShell>
  );
}
