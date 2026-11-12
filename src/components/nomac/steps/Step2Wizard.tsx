"use client";

import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import StaggerChildren from "@/components/animations/StaggerChildren";
import { useNomacWizard } from "@/components/nomac/NomacWizardProvider";
import { NomacWizardShell } from "@/components/nomac/wizard/NomacWizardShell";
import { SelectionCard, SkeletonGrid } from "@/components/nomac/wizard/NomacWizardCards";
import {
  buildBreadcrumb,
  getSectionLabel,
  getStepTone,
  getWizardStepGridColumns,
  getWizardStepReferenceLabel,
  getWizardStepSkeletonCount,
  getDivisionLabel,
  pickDescription,
  STEP_ROUTE_PATHS,
} from "@/components/nomac/wizard/nomacWizard";
import { useNomacWizardStepGuard, useNomacWizardStepItems } from "@/components/nomac/wizard/useNomacWizardStep";
import type { DivisionEntity } from "@/types/nomac";

export default function Step2Wizard() {
  const router = useRouter();
  const { hydrated, selection, setDivision } = useNomacWizard();
  useNomacWizardStepGuard(2, hydrated, selection);
  const { items: divisions, loading, error } = useNomacWizardStepItems<DivisionEntity>(2, selection, hydrated);

  const breadcrumb = buildBreadcrumb(selection, 2);
  const columnsClassName = getWizardStepGridColumns(2);
  const referenceLabel = getWizardStepReferenceLabel(2, selection);
  const canAdvance = Boolean(selection.division);

  const handleBack = () => {
    router.replace(STEP_ROUTE_PATHS[1]);
  };

  const handleNext = () => {
    if (selection.division) {
      router.replace(STEP_ROUTE_PATHS[3]);
    }
  };

  const handleDivisionPick = (division: DivisionEntity) => {
    setDivision(division);
  };

  return (
    <NomacWizardShell
      step={2}
      breadcrumb={breadcrumb}
      hydrated={hydrated}
      canAdvance={canAdvance}
      onBack={handleBack}
      onNext={handleNext}
    >
      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_80px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 sm:text-xl">Choisissez une Division</h2>
            <p className="text-sm text-slate-500">Identifiez la division qui correspond à votre secteur.</p>
          </div>
          <div className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            {referenceLabel}
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-violet-100 bg-violet-50/80 p-4 text-sm leading-6 text-slate-700">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <Building2 className="h-4 w-4 text-violet-600" />
            Division sélectionnée
          </div>
          <p className="mt-2">
            La section {getSectionLabel(selection.section)} regroupe les divisions proches de votre activité.
          </p>
        </div>

        {loading ? (
          <SkeletonGrid count={getWizardStepSkeletonCount(2)} columnsClassName={columnsClassName} />
        ) : error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : (
          <StaggerChildren stagger={0.03} duration={0.35}>
            <div className={"grid gap-4 " + columnsClassName}>
              {divisions.map((division, index) => {
                const title = getDivisionLabel(division);
                const Icon = getStepTone(2, index);

                return (
                  <SelectionCard
                    key={division.code}
                    icon={Icon}
                    title={title || division.code}
                    description={pickDescription(title, [division.libelle, division.searchText])}
                    code={division.code}
                    badge="Division"
                    footer={getSectionLabel(selection.section)}
                    selected={selection.division?.code === division.code}
                    onClick={() => handleDivisionPick(division)}
                  />
                );
              })}
            </div>
          </StaggerChildren>
        )}
      </section>
    </NomacWizardShell>
  );
}
