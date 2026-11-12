import { useEffect, useMemo } from "react";
import type { OffreType } from "@/types/bp/offers";
import type { PaiementCondition } from "@/types/bp/finance";
import { on } from "events";

type PagePrixDeVenteEtCoutProps = {
    onFieldChange?: (field: string, value: any) => void;
    getFieldValue?: (field: string) => any;
};

const TVA_OPTIONS = [
    { value: 0, label: "0%" },
    { value: 2.1, label: "2.1%" },
    { value: 5.5, label: "5.5%" },
    { value: 10, label: "10%" },
    { value: 20, label: "20%" },
];

const PAYMENT_OPTIONS: Array<{ value: PaiementCondition; label: string }> = [
    { value: "DIRECT", label: "en comptant (paiement directement)" },
    { value: "DANS_LES_30J", label: "dans les 30 jours" },
    { value: "DANS_LES_45J", label: "dans les 45 jours" },
    { value: "DANS_LES_60J", label: "dans les 60 jours" },
    { value: "DANS_LES_90J", label: "dans les 90 jours" },
];

function formatCurrency(value?: number) {
    return typeof value === "number" && !Number.isNaN(value)
        ? `${value.toFixed(2).replace(/\.00$/, ".00")} Ar`
        : "—";
}

export default function PagePrixDeVenteEtCout({ onFieldChange, getFieldValue }: PagePrixDeVenteEtCoutProps) {
    const offres = (getFieldValue?.("offres") as OffreType[] | undefined) ?? [];
    const modePayementFournisseur = getFieldValue?.("modePayementFournisseur") as PaiementCondition | undefined;

    const productOffers = useMemo(
        () => offres.filter((offre) => offre.typeOffre === "PRODUIT"),
        [offres]
    );

    const hasProductOffers = productOffers.length > 0;

    const setOffres = (nextOffres: OffreType[]) => {
        onFieldChange?.("offres", nextOffres);
    };

    const updateOffreField = (index: number, field: keyof OffreType, value: any) => {
        const nextOffres = [...offres];
        nextOffres[index] = {
            ...nextOffres[index],
            [field]: value,
        };
        
        // Auto-calculate coutUnitaireTTC when coutUnitaireHT or TVA changes
        if (field === "coutUnitaireHT" || field === "TVA") {
            const coutHT = field === "coutUnitaireHT" ? value : (nextOffres[index].coutUnitaireHT ?? 0);
            const tva = field === "TVA" ? value : (nextOffres[index].TVA ?? 20);
            if (coutHT > 0) {
                nextOffres[index].coutUnitaireTTC = Number((coutHT * (1 + tva / 100)).toFixed(2));
                nextOffres[index].TVA = tva;
            }
        }
        
        setOffres(nextOffres);
    };

    const updateOffrePrice = (index: number, field: "prixDeVenteHT" | "TVA" | "prixDeVenteTTC", value: any) => {
        const current = offres[index] ?? {};
        const existingPrix = current.prixVente ?? {};
        const updatedPrix = {
            ...existingPrix,
            [field]: value,
        };
        
        // Auto-calculate prixDeVenteTTC when prixDeVenteHT or TVA changes
        if (field === "prixDeVenteHT" || field === "TVA") {
            const prixHT = field === "prixDeVenteHT" ? value : (updatedPrix.prixDeVenteHT ?? 0);
            const tva = field === "TVA" ? value : (updatedPrix.TVA ?? 20);
            if (prixHT > 0) {
                updatedPrix.prixDeVenteTTC = Number((prixHT * (1 + tva / 100)).toFixed(2));
            }
        }
        
        const nextOffres = [...offres];
        nextOffres[index] = {
            ...current,
            prixVente: {
                ...updatedPrix,
                TVA: updatedPrix.TVA ?? 20,
            },
        };
        setOffres(nextOffres);
    };

    const updatePaymentMode = (value: PaiementCondition) => {
        onFieldChange?.("modePayementFournisseur", value);
    };

    // INITIALIZE DEFAULTS
    useEffect(() => {
        if (!onFieldChange) return;

        if (modePayementFournisseur === undefined) {
            onFieldChange("modePayementFournisseur", "DIRECT");
        }
    }, []);

    return (
        <div className="rounded-3xl shadow-2xl border border-dashed border-slate-200/80 bg-white/90 p-6 sm:p-7">
            <h2 id="prix-de-vente" className="text-2xl font-bold text-slate-800">Prix de vente</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Le prix de ventes de mes offres :</p>

            <div className="mt-6">
                {offres.length > 0 ? (
                    <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-200 pb-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                            <div>Nom de l&apos;offre</div>
                            <div>Prix de vente HT</div>
                            <div>TVA sur mes ventes</div>
                            <div>Prix de vente TTC</div>
                        </div>
                        <div className="space-y-4 pt-4">
                            {offres.map((offre, index) => {
                                const prixVente = offre.prixVente ?? {};
                                const tva = prixVente.TVA ?? 20;
                                const prixDeVenteHT = prixVente.prixDeVenteHT ?? 0;
                                const prixDeVenteTTC = prixDeVenteHT > 0 ? Number((prixDeVenteHT * (1 + tva / 100)).toFixed(2)) : undefined;

                                return (
                                    <div key={`offre-${index}`} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">{offre.nomOffre || "Offre"}</div>
                                        </div>

                                        <div>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={prixVente.prixDeVenteHT ?? ""}
                                                    onChange={(event) => updateOffrePrice(index, "prixDeVenteHT", event.target.value === "" ? undefined : Number(event.target.value))}
                                                    placeholder="0.00"
                                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                                                />
                                                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">Ar</span>
                                            </div>
                                        </div>

                                        <div>
                                            <select
                                                value={tva}
                                                onChange={(event) => updateOffrePrice(index, "TVA", Number(event.target.value))}
                                                className="h-11 w-full min-w-[140px] cursor-pointer rounded-full border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                                            >
                                                {TVA_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">
                                            <span>{prixDeVenteTTC ? `${prixDeVenteTTC.toFixed(2)} Ar` : "—"}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="rounded-3xl border border-dashed border-slate-200/80 bg-slate-50 p-6 text-sm text-slate-500">
                        Aucune offre disponible pour le moment. Pour ajouter ou modifier une offre, allez dans le tableau Offres.
                    </div>
                )}
            </div>

            <div className="mt-4 text-sm text-slate-500">
                Pour ajouter ou modifier une offre, allez dans le tableau Offres.
            </div>

            <section className="mt-10 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <h3 id="cout-unitaire-par-produit" className="text-xl font-semibold text-slate-800">Coût unitaire par produit (fabriqué ou acheté)</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                    {hasProductOffers
                        ? "Je paye mes fournisseurs et j’indique le coût unitaire par produit lié à mes ventes."
                        : "Vous ne vendez que des services, indiquez vos achats de matières premières liés à vos services dans \"Achats nécessaires pour mes services\" dans le tableau Charges."
                    }
                </p>

                {hasProductOffers ? (
                    <div className="mt-6 space-y-6">
                        <div className="grid gap-4 sm:grid-cols-[1.4fr_0.8fr]">
                            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                                Je paye mes fournisseurs
                                <select
                                    value={modePayementFournisseur ?? "DIRECT"}
                                    onChange={(event) => updatePaymentMode(event.target.value as PaiementCondition)}
                                    className="h-11 rounded-2xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                                >
                                    {PAYMENT_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div>
                            <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-200 pb-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    <div>Nom du produit</div>
                                    <div>Coût unitaire HT</div>
                                    <div>TVA sur mes achats</div>
                                    <div>Coût unitaire TTC</div>
                                </div>
                                <div className="space-y-4 pt-4">
                                    {offres.map((offre, index) => {
                                        if (offre.typeOffre !== "PRODUIT") return null;

                                        const coutHT = offre.coutUnitaireHT ?? 0;
                                        const tvaAchat = offre.TVA ?? 20;
                                        const coutTTC = offre.coutUnitaireTTC ?? (coutHT > 0 ? Number((coutHT * (1 + tvaAchat / 100)).toFixed(2)) : undefined);
                                        const prixHT = offre.prixVente?.prixDeVenteHT ?? 0;
                                        const marge = prixHT > 0 ? Number((prixHT - coutHT).toFixed(2)) : undefined;

                                        return (
                                            <div key={`produit-${index}`} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                                                <div className="text-sm text-slate-900">
                                                    <div className="font-semibold">{offre.nomOffre || "Produit"}</div>
                                                    <div className="mt-1 text-sm text-slate-500">vendu(e) au prix de {formatCurrency(prixHT)} HT</div>
                                                </div>

                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={coutHT ?? 0}
                                                        onChange={(event) => updateOffreField(index, "coutUnitaireHT", event.target.value === "" ? undefined : Number(event.target.value))}
                                                        placeholder="0.00"
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                                                    />
                                                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">Ar</span>
                                                </div>

                                                <div>
                                                    <select
                                                        value={tvaAchat}
                                                        onChange={(event) => updateOffreField(index, "TVA", Number(event.target.value))}
                                                        className="h-11 w-full min-w-[140px] cursor-pointer rounded-full border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                                                    >
                                                        {TVA_OPTIONS.map((option) => (
                                                            <option key={option.value} value={option.value}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="flex flex-col gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-900">
                                                    <span>{coutTTC ? `${coutTTC.toFixed(2)} Ar` : "—"}</span>
                                                    {marge !== undefined && (
                                                        <span className={marge < 0 ? "text-sm text-rose-600" : "text-sm text-emerald-700"}>
                                                            Marge : {marge.toFixed(2)} Ar
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 rounded-3xl border border-dashed border-slate-200/80 bg-slate-50 p-6 text-sm text-slate-500">
                        Vous ne vendez que des services, indiquez vos achats de matières premières liés à vos services dans "Achats nécessaires pour mes services" dans le tableau Charges.
                    </div>
                )}
            </section>
        </div>
    );
}
