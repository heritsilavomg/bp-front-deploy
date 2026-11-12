import EditTableOffre from "@/components/edit-bp-page/EditTableOffre";
import type { OffreType } from "@/types/bp/offers";

type PageProjetProps = {
    onFieldChange?: (field: string, value: any) => void;
    handleFieldChangeWithDelay?: (field: string, value: any, delay?: number) => void;
    getFieldValue?: (field: string) => any;
}

export default function PageProjet({ handleFieldChangeWithDelay, onFieldChange, getFieldValue }: PageProjetProps) {

    const offres = (getFieldValue?.("offres") as OffreType[] | undefined) ?? [];

    const setOffres = (nextOffres: OffreType[]) => {
        onFieldChange?.("offres", nextOffres);
    };

    // Helper function to safely get nested values
    const getValue = (field: string, defaultValue: string = "") => {
        if (getFieldValue) {
            return getFieldValue(field) ?? defaultValue;
        }
        return defaultValue;
    };

    return <div className="rounded-3xl border border-dashed shadow-2xl border-slate-200/80 bg-white/90 p-6 sm:p-7 ">
        <h2 className="text-2xl text-center font-bold text-slate-800 mb-4">Projet</h2>
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <label htmlFor="description" className="font-semibold text-slate-700">Description</label>

                <div className="mt-3">
                    <label htmlFor="description" className="text-sm font-light text-slate-700">Description en une phrase</label>
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        maxLength={120}
                        defaultValue={getValue("description.descriptionCourte", "")}
                        onBlur={(e)=>{handleFieldChangeWithDelay?.("description.descriptionCourte", e.target.value, 1000)}}
                        placeholder="Décrivez votre projet ici..."
                        className="mt-2 resize-none w-full rounded-lg border border-slate-200 px-3 py-2 shadow-sm focus:border-violet-500 focus:ring focus:ring-violet-500/10 sm:text-sm"
                    ></textarea>
                    <p className="text-xs text-slate-500">Max 120 caractères</p>
                </div>

                <div className="mt-3">
                    <label htmlFor="descriptionLongue" className="text-sm font-light text-slate-700">Description détaillée</label>
                    <textarea
                        id="descriptionLongue"
                        name="descriptionLongue"
                        rows={6}
                        defaultValue={getValue("description.descriptionDetaillee", "")}
                        onBlur={(e)=>{handleFieldChangeWithDelay?.("description.descriptionDetaillee", e.target.value, 1000)}}
                        placeholder="Décrivez votre projet en détail ici..."
                        className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 shadow-sm focus:border-violet-500 focus:ring focus:ring-violet-500/10 sm:text-sm"
                    ></textarea>
                </div>

            </div>

            <EditTableOffre offres={offres} setOffres={setOffres} />
        </div>
    </div>
}