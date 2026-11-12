import { Trash2 } from "lucide-react";
import type { EditorOffer as OffreType } from "@/lib/offerIdentity";

type EditTableOffreProps = {
    offres?: OffreType[];
    setOffres: (offres: OffreType[]) => void;
    maxOffres?: number;
};

const OFFER_TYPES: Array<{ value: OffreType["typeOffre"]; label: string }> = [
    { value: "PRODUIT", label: "Produit" },
    { value: "SERVICE", label: "Service" },
];

export default function EditTableOffre({
    offres = [],
    setOffres,
    maxOffres = 10,
}: EditTableOffreProps) {
    const rows = offres ?? [];

    const updateOffre = (index: number, field: keyof OffreType, value: any) => {
        const next = [...rows];
        next[index] = {
            ...next[index],
            [field]: value,
        };
        setOffres(next);
    };

    const removeOffre = (index: number) => {
        setOffres(rows.filter((_, currentIndex) => currentIndex !== index));
    };

    const addOffre = (typeOffre: OffreType["typeOffre"]) => {
        if (rows.length >= maxOffres) return;
        setOffres([
            ...rows,
            {
                clientOfferKey: crypto.randomUUID(),
                nomOffre: "",
                typeOffre,
                descriptionOffre: "",
            },
        ]);
    };

    return (
        <div className="rounded-3xl border border-dashed border-slate-200/80 bg-white/90 p-6 sm:p-7">
            <h2 id="offres" className="text-2xl font-bold text-slate-800">Offres</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Les produits et services que je vais proposer :</p>

            <div className="mt-6">
                <div className="hidden grid-cols-[1.8fr_0.9fr_2.8fr_90px] gap-4 border-b border-slate-200/70 pb-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500 sm:grid">
                    <div>Nom de l&apos;offre</div>
                    <div>Type</div>
                    <div>Description de l&apos;offre</div>
                    <div className="text-right">&nbsp;</div>
                </div>

                <div className="mt-4 space-y-3">
                    {rows.map((offre, index) => (
                        <div
                            key={offre.offerId ?? offre.clientOfferKey ?? `offre-${index}`}
                            className="grid items-start gap-4 rounded-[30px] border border-slate-200/70 bg-white p-4 shadow-sm sm:grid-cols-[1.8fr_0.9fr_2.8fr_90px]"
                        >
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 sm:hidden">Nom de l&apos;offre</label>
                                <input
                                    type="text"
                                    value={offre.nomOffre ?? ""}
                                    onChange={(event) => updateOffre(index, "nomOffre", event.target.value)}
                                    placeholder="Nom de l'offre"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 sm:hidden">Type</label>
                                <select
                                    value={offre.typeOffre ?? "SERVICE"}
                                    onChange={(event) => updateOffre(index, "typeOffre", event.target.value as OffreType["typeOffre"])}
                                    className="h-11 w-full min-w-[140px] cursor-pointer rounded-full border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                                >
                                    {OFFER_TYPES.map((option) => (
                                        <option className="border-none p-3 outline-none" key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 sm:hidden">Description de l&apos;offre</label>
                                <textarea
                                    value={offre.descriptionOffre ?? ""}
                                    onChange={(event) => updateOffre(index, "descriptionOffre", event.target.value)}
                                    placeholder="Description de l'offre"
                                    rows={3}
                                    className="min-h-[96px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                                />
                            </div>

                            <div className="flex items-start justify-end">
                                <button
                                    type="button"
                                    onClick={() => removeOffre(index)}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                                    aria-label="Supprimer cette offre"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {rows.length === 0 && (
                        <div className="rounded-[30px] border border-dashed border-slate-200/80 bg-white/90 p-6 text-sm text-slate-500">
                            Aucune offre pour le moment. Ajoutez un produit ou un service.
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">Nombre d'offres : {rows.length}/{maxOffres}</p>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => addOffre("PRODUIT")}
                        disabled={rows.length >= maxOffres}
                        className="inline-flex items-center justify-center rounded-full border border-teal-500 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Ajouter un produit
                    </button>
                    <button
                        type="button"
                        onClick={() => addOffre("SERVICE")}
                        disabled={rows.length >= maxOffres}
                        className="inline-flex items-center justify-center rounded-full border border-sky-500 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Ajouter un service
                    </button>
                </div>
            </div>
        </div>
    );
}
