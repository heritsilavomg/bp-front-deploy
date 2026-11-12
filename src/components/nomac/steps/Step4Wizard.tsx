"use client";

import { useRouter } from "next/navigation";
import { Layers3 } from "lucide-react";
import StaggerChildren from "@/components/animations/StaggerChildren";
import { useNomacWizard } from "@/components/nomac/NomacWizardProvider";
import { NomacWizardShell } from "@/components/nomac/wizard/NomacWizardShell";
import { SelectionCard, SkeletonGrid } from "@/components/nomac/wizard/NomacWizardCards";
import {
  buildBreadcrumb,
  getGroupeLabel,
  getClasseLabel,
  getStepTone,
  getWizardStepGridColumns,
  getWizardStepReferenceLabel,
  getWizardStepSkeletonCount,
  pickDescription,
  STEP_ROUTE_PATHS,
} from "@/components/nomac/wizard/nomacWizard";
import { useNomacWizardStepGuard, useNomacWizardStepItems } from "@/components/nomac/wizard/useNomacWizardStep";
import type { ClasseEntity } from "@/types/nomac";

export default function Step4Wizard() {
  const router = useRouter();
  const { hydrated, selection, setClasse } = useNomacWizard();
  useNomacWizardStepGuard(4, hydrated, selection);
  const { items: classes, loading, error } = useNomacWizardStepItems<ClasseEntity>(4, selection, hydrated);

  const breadcrumb = buildBreadcrumb(selection, 4);
  const columnsClassName = getWizardStepGridColumns(4);
  const referenceLabel = getWizardStepReferenceLabel(4, selection);
  const canAdvance = Boolean(selection.classe);

  const handleBack = () => {
    router.replace(STEP_ROUTE_PATHS[3]);
  };

  const handleNext = () => {
    if (selection.classe) {
      router.replace(STEP_ROUTE_PATHS[5]);
    }
  };

  const handleClassePick = (classe: ClasseEntity) => {
    setClasse(classe);
  };

  return (
    <NomacWizardShell
      step={4}
      breadcrumb={breadcrumb}
      hydrated={hydrated}
      canAdvance={canAdvance}
      onBack={handleBack}
      onNext={handleNext}
    >
      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_80px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 sm:text-xl">Sélectionnez votre classe d&apos;activité</h2>
            <p className="text-sm text-slate-500">Choisissez la classe la plus pertinente pour votre modèle.</p>
          </div>
          <div className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            {referenceLabel}
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-violet-100 bg-violet-50/80 p-4 text-sm leading-6 text-slate-700">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <Layers3 className="h-4 w-4 text-violet-600" />
            Classe d&apos;activité
          </div>
          <p className="mt-2">
            La classe {getGroupeLabel(selection.groupe)} vous rapproche du cadrage final de votre projet.
          </p>
        </div>

        {loading ? (
          <SkeletonGrid count={getWizardStepSkeletonCount(4)} columnsClassName={columnsClassName} />
        ) : error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : (
          <StaggerChildren stagger={0.03} duration={0.35}>
            <div className={"grid gap-4 " + columnsClassName}>
              {classes.map((classe, index) => {
                const title = getClasseLabel(classe);
                const Icon = getStepTone(4, index);

                return (
                  <SelectionCard
                    key={classe.code}
                    icon={Icon}
                    title={title || classe.code}
                    description={pickDescription(title, [classe.libelle, classe.searchText])}
                    code={classe.code}
                    badge="Classe"
                    footer={getGroupeLabel(selection.groupe)}
                    selected={selection.classe?.code === classe.code}
                    onClick={() => handleClassePick(classe)}
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
