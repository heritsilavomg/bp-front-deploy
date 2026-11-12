import type { ComponentType } from "react";
import Step1Wizard from "@/components/nomac/steps/Step1Wizard";
import Step2Wizard from "@/components/nomac/steps/Step2Wizard";
import Step3Wizard from "@/components/nomac/steps/Step3Wizard";
import Step4Wizard from "@/components/nomac/steps/Step4Wizard";
import Step5Wizard from "@/components/nomac/steps/Step5Wizard";
import type { WizardStep } from "@/components/nomac/wizard/nomacWizard";

const STEP_COMPONENTS: Record<WizardStep, ComponentType> = {
  1: Step1Wizard,
  2: Step2Wizard,
  3: Step3Wizard,
  4: Step4Wizard,
  5: Step5Wizard,
};

export default function NomacWizardScreen({ step }: { step: WizardStep }) {
  const StepComponent = STEP_COMPONENTS[step];
  return <StepComponent />;
}
