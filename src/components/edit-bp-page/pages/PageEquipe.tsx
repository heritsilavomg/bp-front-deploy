import EditEquipe from "@/components/edit-bp-page/components/EditEquipe";
import type { EquipeType } from "@/types/bp/people";

type PageEquipeProps = {
    onFieldChange?: (field: string, value: any) => void;
    getFieldValue?: (field: string) => any;
    dateDebutProjet?: string;
};

export default function PageEquipe({ onFieldChange, getFieldValue, dateDebutProjet }: PageEquipeProps) {
    const getFullYear = (dateStr: string | undefined) => {
        if (!dateStr) return new Date().getFullYear();
        try {
            return new Date(dateStr).getFullYear();
        } catch (error) {
            console.error("CANNOT PARSE THIS TO A DATE", dateStr);
            return new Date().getFullYear();
        }
    };

    const equipe = (getFieldValue?.("equipe") as EquipeType[] | undefined) ?? [];

    const setEquipe = (next: EquipeType[]) => {
        onFieldChange?.("equipe", next);
    };

    return (
        <div className="p-6 sm:p-7">
            <EditEquipe equipe={equipe} onEquipeChange={setEquipe} dateDebutProjet={getFullYear(dateDebutProjet)} />
        </div>
    );
}
