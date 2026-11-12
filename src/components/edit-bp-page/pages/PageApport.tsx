"use client";

import { useEffect, useMemo } from "react";
import { Trash2 } from "lucide-react";
import type { ApportType, TypeApport } from "@/types/bp/finance";
import type { AssocieType } from "@/types/bp/people";

type Props = {
    onFieldChange: (field: string, value: any) => void;
    getFieldValue: (field: string) => any;
};

const NATURE_APPORTS: Array<{ value: TypeApport; label: string }> = [
    { value: "NATURE_FOND_DE_COMMERCE", label: "Fonds de commerce" },
    { value: "NATURE_DROIT_AU_BAIL_OU_PAS_DE_PORTE", label: "Droit au bail / pas de porte" },
    { value: "NATURE_BREVET_MARQUE", label: "Brevet / marque" },
    { value: "NATURE_ACHAT_IMMOBILIERE", label: "Achat immobilier" },
    { value: "NATURE_FRAIS_ACQUISITION_IMMOBILIERE", label: "Frais d'acquisition immobilière" },
    { value: "NATURE_TERRAIN", label: "Terrain" },
    { value: "NATURE_VEHICULE_UTILITAIRE", label: "Véhicule utilitaire" },
    { value: "NATURE_VEHICULE_TOURISME", label: "Véhicule tourisme" },
    { value: "NATURE_MACHINE", label: "Machine" },
    { value: "NATURE_OUTIL_ET_MATERIEL_NECESSAIRE_ACTIVITE", label: "Outil et matériel nécessaire à l'activité" },
    { value: "NATURE_MAT_INFORMATIQUE", label: "Matériel informatique" },
    { value: "NATURE_MEUBLE_DESTINEE_A_AMENAGEMENTS", label: "Meuble destiné à aménagements" },
    { value: "NATURE_TRAVAUX_AGENCEMENT", label: "Travaux d'agencement" },
    { value: "NATURE_CREATION_SITE_WEB_APPLICATION", label: "Création site web / application" },
    { value: "NATURE_LOGICIEL_DEVELOPPE", label: "Logiciel développé" },
    { value: "NATURE_FRAIS_CREATION_SOCIETE", label: "Frais de création de société" },
];

function formatCurrency(value?: number) {
    return typeof value === "number" && !Number.isNaN(value)
        ? `${value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ar`
        : "0 Ar";
}

function getNatureLabel(value?: TypeApport) {
    return NATURE_APPORTS.find((option) => option.value === value)?.label ?? "Sélectionner une nature";
}

export default function PageApport({ onFieldChange, getFieldValue }: Props) {
    const associes = Array.isArray(getFieldValue("associe")) ? (getFieldValue("associe") as AssocieType[]) : [];
    const apports = Array.isArray(getFieldValue("apports")) ? (getFieldValue("apports") as ApportType[]) : [];

    const associeMap = useMemo(
        () => new Map(associes.map((associe) => [associe.numeroAssocie, associe])),
        [associes],
    );

    const personalApports = useMemo(() => {
        return associes.map((associe) => {
            const existing = apports.find(
                (apport) => apport.typeApport === "PERSONEL" && apport.numeroAssocieApporteur === associe.numeroAssocie,
            );

            return {
                numeroAssocieApporteur: associe.numeroAssocie,
                typeApport: "PERSONEL" as const,
                montantApport: existing?.montantApport ?? 0,
            } as ApportType;
        });
    }, [associes, apports]);

    const natureApports = useMemo(() => {
        return apports.filter((apport) => {
            if (apport.typeApport === "PERSONEL") return false;
            if (apport.numeroAssocieApporteur === undefined || apport.numeroAssocieApporteur === null) return true;
            return associeMap.has(apport.numeroAssocieApporteur);
        });
    }, [apports, associeMap]);

    useEffect(() => {
        const desiredApports = [...personalApports, ...natureApports];
        const needSync =
            desiredApports.length !== apports.length ||
            desiredApports.some((desired, index) => {
                const current = apports[index];
                if (!current) return true;
                return (
                    current.typeApport !== desired.typeApport ||
                    current.numeroAssocieApporteur !== desired.numeroAssocieApporteur ||
                    current.montantApport !== desired.montantApport ||
                    current.typeApport !== desired.typeApport
                );
            });

        if (needSync) {
            onFieldChange("apports", desiredApports);
        }
    }, [apports, natureApports, onFieldChange, personalApports]);

    const updatePersonalApport = (numeroAssocie: number, montantApport: number) => {
        const nextPersonalApports = personalApports.map((item) =>
            item.numeroAssocieApporteur === numeroAssocie ? { ...item, montantApport } : item,
        );
        onFieldChange("apports", [...nextPersonalApports, ...natureApports]);
    };

    const updateNatureApport = (index: number, patch: Partial<ApportType>) => {
        const next = [...natureApports];
        next[index] = { ...next[index], ...patch };
        onFieldChange("apports", [...personalApports, ...next]);
    };

    const addNatureApport = () => {
        const next = [...natureApports, { typeApport: "NATURE_FRAIS_CREATION_SOCIETE", numeroAssocieApporteur: undefined, montantApport: 0 } as ApportType];
        onFieldChange("apports", [...personalApports, ...next]);
    };

    const removeNatureApport = (index: number) => {
        const next = natureApports.filter((_, i) => i !== index);
        onFieldChange("apports", [...personalApports, ...next]);
    };

    const totalMontant = [...personalApports, ...natureApports].reduce((sum, apport) => sum + (apport.montantApport ?? 0), 0);

    return (
        <section className="rounded-3xl bg-white/90 shadow-2xl">
            <div className="p-6 sm:p-8 space-y-6">
                <div>
                    <span id="apports" />
                    <h2 className="text-2xl font-bold text-slate-800">Apports</h2>
                    <p className="mt-2 text-sm text-slate-500">Ce que vous apportez pour financer la création de votre projet.</p>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-separate border-spacing-0 text-sm text-slate-700">
                            <thead>
                                <tr className="bg-slate-50 text-left text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">
                                    <th className="border-b border-slate-200 px-4 py-4">Nature du financement</th>
                                    <th className="border-b border-slate-200 px-4 py-4">Montant</th>
                                    <th className="w-16 border-b border-slate-200 px-4 py-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {personalApports.map((apport) => {
                                    const associe = associeMap.get(apport.numeroAssocieApporteur ?? -1);
                                    const title = associe?.nomPrenom
                                        ? `Apport personnel de ${associe.nomPrenom}`
                                        : `Apport personnel de l'associé n°${apport.numeroAssocieApporteur}`;
                                    return (
                                        <tr key={`personnel-${apport.numeroAssocieApporteur}`} className="border-b border-slate-200">
                                            <td className="px-4 py-4">
                                                <div className="font-semibold text-slate-900">{title}</div>
                                                <div className="mt-1 text-xs text-slate-500">Apport personnel (non supprimable)</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="max-w-[160px]">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={apport.montantApport ?? 0}
                                                        onChange={(event) => updatePersonalApport(apport.numeroAssocieApporteur ?? -1, Number(event.target.value))}
                                                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-4" />
                                        </tr>
                                    );
                                })}

                                {natureApports.map((apport, index) => (
                                    <tr key={`nature-${index}`} className="border-b border-slate-200">
                                        <td className="px-4 py-4 align-top">
                                            <div className="grid gap-3">
                                                <label className="block text-sm font-semibold text-slate-900">Apport en nature</label>
                                                <select
                                                    value={apport.typeApport ?? "NATURE_FRAIS_CREATION_SOCIETE"}
                                                    onChange={(event) => updateNatureApport(index, { typeApport: event.target.value as TypeApport })}
                                                    className="cursor-pointer w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                                >
                                                    {NATURE_APPORTS.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                                    <span className="text-sm text-slate-500">de la part de</span>
                                                    <select
                                                        value={apport.numeroAssocieApporteur ?? ""}
                                                        onChange={(event) =>
                                                            updateNatureApport(index, {
                                                                numeroAssocieApporteur:
                                                                    event.target.value === "" ? undefined : Number(event.target.value),
                                                            })
                                                        }
                                                        className="cursor-pointer min-w-[180px] rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                                    >
                                                        <option value="">Sélectionner un associé</option>
                                                        {associes.map((associe) => (
                                                            <option key={associe.numeroAssocie} value={associe.numeroAssocie}>
                                                                {associe.nomPrenom ?? `Associé n°${associe.numeroAssocie}`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <div className="max-w-[160px]">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={apport.montantApport ?? 0}
                                                    onChange={(event) => updateNatureApport(index, { montantApport: Number(event.target.value) })}
                                                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right align-top">
                                            <button
                                                type="button"
                                                onClick={() => removeNatureApport(index)}
                                                className="cursor-pointer inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                                                aria-label="Supprimer cet apport"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-50 text-sm font-semibold text-slate-900">
                                    <td className="border-t border-slate-200 px-4 py-4">Total des apports</td>
                                    <td className="border-t border-slate-200 px-4 py-4">{formatCurrency(totalMontant)}</td>
                                    <td className="border-t border-slate-200 px-4 py-4" />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        type="button"
                        onClick={addNatureApport}
                        className="cursor-pointer inline-flex items-center justify-center rounded-full border border-cyan-600 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
                    >
                        Ajouter un apport : Apport en nature
                    </button>
                    <p className="text-sm text-slate-500">Les apports personnels des associés sont ajoutés automatiquement et ne peuvent pas être supprimés.</p>
                </div>
            </div>
        </section>
    );
}
