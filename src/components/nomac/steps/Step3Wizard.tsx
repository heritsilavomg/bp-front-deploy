"use client";

import { useRouter } from "next/navigation";
import { ListTree } from "lucide-react";
import StaggerChildren from "@/components/animations/StaggerChildren";
import { useNomacWizard } from "@/components/nomac/NomacWizardProvider";
import { NomacWizardShell } from "@/components/nomac/wizard/NomacWizardShell";
import { SelectionCard, SkeletonGrid } from "@/components/nomac/wizard/NomacWizardCards";
import {
  buildBreadcrumb,
  getDivisionLabel,
  getGroupeLabel,
  getStepTone,
  getWizardStepGridColumns,
  getWizardStepReferenceLabel,
  getWizardStepSkeletonCount,
  pickDescription,
  STEP_ROUTE_PATHS,
} from "@/components/nomac/wizard/nomacWizard";
import { useNomacWizardStepGuard, useNomacWizardStepItems } from "@/components/nomac/wizard/useNomacWizardStep";
import type { GroupeEntity } from "@/types/nomac";

export default function Step3Wizard() {
  const router = useRouter();
  const { hydrated, selection, setGroupe } = useNomacWizard();
  useNomacWizardStepGuard(3, hydrated, selection);
  const { items: groupes, loading, error } = useNomacWizardStepItems<GroupeEntity>(3, selection, hydrated);

  const breadcrumb = buildBreadcrumb(selection, 3);
  const columnsClassName = getWizardStepGridColumns(3);
  const referenceLabel = getWizardStepReferenceLabel(3, selection);
  const canAdvance = Boolean(selection.groupe);

  const handleBack = () => {
    router.replace(STEP_ROUTE_PATHS[2]);
  };

  const handleNext = () => {
    if (selection.groupe) {
      router.replace(STEP_ROUTE_PATHS[4]);
    }
  };

  const handleGroupePick = (groupe: GroupeEntity) => {
    setGroupe(groupe);
  };

  return (
    <NomacWizardShell
      step={3}
      breadcrumb={breadcrumb}
      hydrated={hydrated}
      canAdvance={canAdvance}
      onBack={handleBack}
      onNext={handleNext}
    >
      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_80px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 sm:text-xl">Sélectionnez votre groupe d&apos;activité</h2>
            <p className="text-sm text-slate-500">Affinez votre sélection vers le groupe d&apos;activité exact.</p>
          </div>
          <div className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            {referenceLabel}
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-violet-100 bg-violet-50/80 p-4 text-sm leading-6 text-slate-700">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <ListTree className="h-4 w-4 text-violet-600" />
            Groupe d&apos;activité
          </div>
          <p className="mt-2">
            La division {getDivisionLabel(selection.division)} permet d&apos;affiner votre activité au niveau groupe.
          </p>
        </div>

        {loading ? (
          <SkeletonGrid count={getWizardStepSkeletonCount(3)} columnsClassName={columnsClassName} />
        ) : error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : (
          <StaggerChildren stagger={0.03} duration={0.35}>
            <div className={"grid gap-4 " + columnsClassName}>
              {groupes.map((groupe, index) => {
                const title = getGroupeLabel(groupe);
                const Icon = getStepTone(3, index);

                return (
                  <SelectionCard
                    key={groupe.code}
                    icon={Icon}
                    title={title || groupe.code}
                    description={pickDescription(title, [groupe.libelle, groupe.searchText])}
                    code={groupe.code}
                    badge="Groupe"
                    footer={getDivisionLabel(selection.division)}
                    selected={selection.groupe?.code === groupe.code}
                    onClick={() => handleGroupePick(groupe)}
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
