import { Trash2 } from "lucide-react";
import type { MoyensCommunicationType } from "@/types/bp/general";

type EditMoyensCommunicationProps = {
    moyensCommunication?: MoyensCommunicationType[];
    setMoyensCommunication: (moyens: MoyensCommunicationType[]) => void;
    maxMoyens?: number;
};

const PRESET_MEANS = [
    "Site web",
    "Prospection téléphonique",
    "Participation à des salons professionnels",
];

export default function EditMoyensCommunication({
    moyensCommunication = [],
    setMoyensCommunication,
    maxMoyens = 10,
}: EditMoyensCommunicationProps) {
    const rows = moyensCommunication ?? [];

    const updateMoyen = (index: number, field: keyof MoyensCommunicationType, value: any) => {
        const next = [...rows];
        next[index] = {
            ...next[index],
            [field]: value,
        };
        setMoyensCommunication(next);
    };

    const removeMoyen = (index: number) => {
        setMoyensCommunication(rows.filter((_, currentIndex) => currentIndex !== index));
    };

    const addMoyen = (label?: string) => {
        if (rows.length >= maxMoyens) return;
        setMoyensCommunication([
            ...rows,
            {
                moyenCommunication: label ?? "",
                descriptionMoyen: "",
            },
        ]);
    };

    return (
        <div className="rounded-3xl border-slate-200/80 bg-white/90 p-6 sm:p-7">
            <span id="moyen-de-communication" />
            <h2 className="text-2xl font-bold text-slate-800">Moyens de communication</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Je communique via :</p>

            <div className="mt-6 overflow-x-auto">
                <div className="hidden grid-cols-[1.4fr_2.8fr_90px] gap-4 border-b border-slate-200/70 pb-3 text-sm font-semibold text-slate-600 sm:grid">
                    <div>Moyens de communication</div>
                    <div>Description</div>
                    <div className="text-right">&nbsp;</div>
                </div>

                <div className="mt-4 grid gap-4">
                    {rows.map((moyen, index) => (
                        <div key={`moyen-${index}`} className="grid gap-4 rounded-[30px] bg-slate-50 p-4 shadow-sm sm:grid-cols-[1.4fr_2.8fr_90px]">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 sm:hidden">Moyen</label>
                                <input
                                    type="text"
                                    value={moyen.moyenCommunication ?? ""}
                                    onChange={(event) => updateMoyen(index, "moyenCommunication", event.target.value)}
                                    placeholder="Moyen de communication"
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 sm:hidden">Description</label>
                                <textarea
                                    value={moyen.descriptionMoyen ?? ""}
                                    onChange={(event) => updateMoyen(index, "descriptionMoyen", event.target.value)}
                                    placeholder="Description du moyen de communication"
                                    rows={4}
                                    className="h-full w-full resize-none rounded-[30px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                                />
                            </div>

                            <div className="flex items-start justify-end">
                                <button
                                    type="button"
                                    onClick={() => removeMoyen(index)}
                                    className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                                    aria-label="Supprimer ce moyen"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {rows.length === 0 && (
                        <div className="rounded-[30px] border border-dashed border-slate-200/80 bg-white/90 p-6 text-sm text-slate-500">
                            Aucun moyen de communication pour le moment.
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-4">
                <div className="flex flex-wrap gap-3">
                    {PRESET_MEANS.map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => addMoyen(item)}
                            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-cyan-500 bg-white px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => addMoyen()}
                    disabled={rows.length >= maxMoyens}
                    className="inline-flex cursor-pointer w-full items-center justify-center rounded-full border border-cyan-500 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                    Ajouter un moyen de communication
                </button>
            </div>
        </div>
    );
}
