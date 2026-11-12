import { NomacWizardProvider } from "@/components/nomac/NomacWizardProvider";

export default function NewLayout({ children }: { children: React.ReactNode }) {
    return <NomacWizardProvider>{children}</NomacWizardProvider>;
}
