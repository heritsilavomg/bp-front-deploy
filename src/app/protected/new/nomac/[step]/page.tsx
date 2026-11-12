import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import NomacWizardScreen from "@/components/nomac/NomacWizardScreen";
import type { WizardStep } from "@/components/nomac/wizard/nomacWizard";

type WizardStepRoute = `step${WizardStep}`;

const STEP_ROUTE_TO_NUMBER: Record<WizardStepRoute, WizardStep> = {
  step1: 1,
  step2: 2,
  step3: 3,
  step4: 4,
  step5: 5,
};

function isWizardStepRoute(step: string): step is WizardStepRoute {
  return step in STEP_ROUTE_TO_NUMBER;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;

  return {
    title: `Step ${step} - Nomac Wizard`,
  };
}

export default async function NewWizardStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;

  if (!isWizardStepRoute(step)) {
    notFound();
  }

  const wizardStep = STEP_ROUTE_TO_NUMBER[step];

  return <NomacWizardScreen step={wizardStep} />;
}
