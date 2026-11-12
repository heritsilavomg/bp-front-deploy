"use client";

import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Trash2 } from "lucide-react";
import type { EquipeType, FrequencePaiement, TypeContrat } from "@/types/bp/people";

type RecruitmentMode = "RECRUTER" | "PAS_RECRUTER";

const CONTRACT_TYPES: TypeContrat[] = ["CDI", "CDD", "ALTERNANCE"];
const FREQUENCE_OPTIONS: { value: FrequencePaiement; label: string }[] = [
    { value: "MENSUELLE", label: "par mois" },
    { value: "ANNUELLE", label: "par an" },
];
const RECRUIT_OPTIONS = [
    { value: "RECRUTER" as RecruitmentMode, label: "Je compte recruter" },
    { value: "PAS_RECRUTER" as RecruitmentMode, label: "Je ne compte pas recruter" },
];
const YEAR_TABS = [1, 2, 3];

function parseDate(value?: string): Date | null {
    if (!value) {
        return null;
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
}

function getYearFromDate(value?: string): number | null {
    const date = parseDate(value);
    if (!date) {
        return null;
    }
    return date.getFullYear();
}

function addMonths(date: Date, months: number): Date {
    const copy = new Date(date.valueOf());
    copy.setMonth(copy.getMonth() + months);
    return copy;
}

function getDefaultDateForYear(year: number): Date {
    return new Date(year, 5, 1);
}

function toIsoMonthDate(date: Date | null): string {
    if (!date) {
        return "";
    }
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
}

function isContractActiveInYear(row: EquipeType, year: number): boolean {
    const startDate = parseDate(row.dateEmbauche);
    if (!startDate) {
        return false;
    }

    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

    if (row.typeContrat === "CDI") {
        return startDate <= yearEnd;
    }

    if (!row.dureeContrat || row.dureeContrat <= 0) {
        return getYearFromDate(row.dateEmbauche) === year;
    }

    const endDate = addMonths(startDate, row.dureeContrat);
    return startDate <= yearEnd && endDate >= yearStart;
}

function formatDateLabel(value?: string): string {
    const date = parseDate(value);
    if (!date) {
        return "";
    }
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

type EditEquipeProps = {
    equipe?: EquipeType[];
    onEquipeChange: (next: EquipeType[]) => void;
    dateDebutProjet?: number;
};

export default function EditEquipe({ equipe = [], onEquipeChange, dateDebutProjet}: EditEquipeProps) {
    const rows = equipe ?? [];
    const [recruitmentMode, setRecruitmentMode] = useState<RecruitmentMode>(rows.length > 0 ? "RECRUTER" : "PAS_RECRUTER");
    const [activeYear, setActiveYear] = useState(1);
    const baseYear = dateDebutProjet ?? new Date().getFullYear();
    const selectedYear = dateDebutProjet ?? baseYear + activeYear - 1;

    useEffect(() => {
        if (rows.length > 0) {
            setRecruitmentMode("RECRUTER");
        }
    }, [rows.length]);

    const displayRows = useMemo(() => {
        return rows
            .map((row, index) => {
                const startYear = getYearFromDate(row.dateEmbauche);
                const editable = startYear === selectedYear;
                return { row, index, startYear, editable };
            })
            .filter(({ row }) => isContractActiveInYear(row, selectedYear))
            .sort((a, b) => {
                const aYear = a.startYear ?? 0;
                const bYear = b.startYear ?? 0;
                return aYear - bYear;
            });
    }, [rows, selectedYear]);

    const updateRow = (index: number, field: keyof EquipeType, value: any) => {
        const nextRows = [...rows];
        const nextRow = {
            ...nextRows[index],
            [field]: value,
        } as EquipeType;

        if (field === "typeContrat") {
            if (value === "CDI" || value === "ALTERNANCE") {
                nextRow.dureeContrat = 0;
            } else if (value === "CDD" && (!nextRow.dureeContrat || nextRow.dureeContrat === 0)) {
                nextRow.dureeContrat = 6;
            }
        }

        nextRows[index] = nextRow;
        onEquipeChange(nextRows);
    };

    const removeRow = (index: number) => {
        onEquipeChange(rows.filter((_, currentIndex) => currentIndex !== index));
    };

    const addRow = () => {
        const newRow: EquipeType = {
            position: "",
            typeContrat: "CDI",
            frequencePaiement: "MENSUELLE",
            salaire: undefined,
            dureeContrat: 0,
            dateEmbauche: toIsoMonthDate(getDefaultDateForYear(selectedYear)),
        };
        onEquipeChange([...rows, newRow]);
        setRecruitmentMode("RECRUTER");
    };

    const handleRecruitmentChange = (value: RecruitmentMode) => {
        setRecruitmentMode(value);
        if (value === "PAS_RECRUTER") {
            onEquipeChange([]);
        }
    };

    return (
        <div className="rounded-3xl border-slate-200/80 bg-white/90 p-6 sm:p-7">
            <span id="equipe" />
            <h2 className="text-2xl font-bold text-slate-800">Équipe</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Au cours de mes 3 premières années d'activité,</p>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2">
                    <label htmlFor="recruitmentMode" className="text-sm font-semibold text-slate-700">
                        Statut de recrutement
                    </label>
                    <select
                        id="recruitmentMode"
                        value={recruitmentMode}
                        onChange={(event) => handleRecruitmentChange(event.target.value as RecruitmentMode)}
                        className="mt-2 w-full max-w-xs rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                    >
                        {RECRUIT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-wrap gap-3">
                    {YEAR_TABS.map((year) => (
                        <button
                            key={year}
                            type="button"
                            onClick={() => setActiveYear(year)}
                            className={
                                "inline-flex cursor-pointer h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition " +
                                (activeYear === year
                                    ? "bg-slate-800 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200")
                            }
                        >
                            Année {year}
                        </button>
                    ))}
                </div>
            </div>

            {recruitmentMode === "RECRUTER" ? (
                <>
                    <div className="mt-6">
                        <div className="w-full rounded-[30px] border border-slate-200 bg-white shadow-sm">
                            <div className="hidden sm:grid min-w-0 grid-cols-[minmax(0,2.2fr)_minmax(0,2.8fr)_minmax(0,1.4fr)_70px] gap-0 border-b border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
                                <div>Nom du poste</div>
                                <div>Contrat</div>
                                <div>Salaire brut</div>
                                <div className="text-right">&nbsp;</div>
                            </div>

                            <div className="divide-y divide-slate-200">
                                {displayRows.length > 0 ? (
                                    displayRows.map((item) => {
                                        const { row, index: globalIndex, editable } = item;
                                        return (
                                            <div
                                                key={`employee-${globalIndex}`}
                                                className={
                                                    "grid gap-4 border-b border-slate-200 px-3 py-4 sm:grid-cols-[minmax(0,2.2fr)_minmax(0,2.8fr)_minmax(0,1.4fr)_70px] " +
                                                    (editable ? "" : " opacity-80")
                                                }
                                            >
                                                <div>
                                                    {!editable && (
                                                        <div className="mb-3 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                            Contrat encore en cours
                                                        </div>
                                                    )}
                                                    {editable ? (
                                                        <input
                                                            type="text"
                                                            value={row.position ?? ""}
                                                            onChange={(event) => updateRow(globalIndex, "position", event.target.value)}
                                                            placeholder="Nom du poste"
                                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                                                        />
                                                    ) : (
                                                        <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                                            {row.position ?? "-"}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    {editable ? (
                                                        <>
                                                            <div className="space-y-2">
                                                                <label className="sr-only">Type de contrat</label>
                                                                <select
                                                                    value={row.typeContrat ?? "CDI"}
                                                                    onChange={(event) => updateRow(globalIndex, "typeContrat", event.target.value as TypeContrat)}
                                                                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                                                                >
                                                                    {CONTRACT_TYPES.map((contract) => (
                                                                        <option key={contract} value={contract}>
                                                                            {contract}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            {row.typeContrat === "CDD" && (
                                                                <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2 py-2 text-sm text-slate-700">
                                                                    <span>de</span>
                                                                    <input
                                                                        type="number"
                                                                        min={1}
                                                                        value={row.dureeContrat ?? 6}
                                                                        onChange={(event) => updateRow(globalIndex, "dureeContrat", Number(event.target.value))}
                                                                        className="w-20 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                                                                    />
                                                                    <span>mois</span>
                                                                </div>
                                                            )}

                                                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">À partir de</p>
                                                                <div className="relative mt-2">
                                                                    <DatePicker
                                                                        selected={parseDate(row.dateEmbauche)}
                                                                        onChange={(date: Date | null) => updateRow(globalIndex, "dateEmbauche", toIsoMonthDate(date))}
                                                                        showMonthYearPicker
                                                                        dateFormat="MM/yyyy"
                                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                                                                    />
                                                                    <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                                                            <div className="mb-2">{row.typeContrat ?? "-"}</div>
                                                            {row.typeContrat === "CDD" && (
                                                                <div className="mb-2">de {row.dureeContrat ?? "-"} mois</div>
                                                            )}
                                                            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                                                                {formatDateLabel(row.dateEmbauche) || "Date inconnue"}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    {editable ? (
                                                        <>
                                                            <div>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    value={row.salaire ?? ""}
                                                                    onChange={(event) => updateRow(globalIndex, "salaire", Number(event.target.value))}
                                                                    placeholder="40"
                                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                                                                />
                                                            </div>
                                                            <div>
                                                                <select
                                                                    value={row.frequencePaiement ?? "MENSUELLE"}
                                                                    onChange={(event) => updateRow(globalIndex, "frequencePaiement", event.target.value as FrequencePaiement)}
                                                                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                                                                >
                                                                    {FREQUENCE_OPTIONS.map((option) => (
                                                                        <option key={option.value} value={option.value}>
                                                                            {option.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                                            {row.salaire != null
                                                                ? `${row.salaire} Ar ${row.frequencePaiement === "ANNUELLE" ? "par an" : "par mois"}`
                                                                : "-"}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-start justify-end">
                                                    {editable ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRow(globalIndex)}
                                                            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                                                            aria-label="Supprimer cet employé"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    ) : (
                                                        <div className="h-11" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="px-4 py-16 text-center text-sm text-slate-500">
                                        Aucun employé défini pour cette année.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-500">Ajouter un employé :</p>
                        <button
                            type="button"
                            onClick={addRow}
                            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-cyan-500 bg-white px-5 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
                        >
                            Autre employé
                        </button>
                    </div>
                </>
            ) : (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-200/80 bg-slate-50 p-6 text-sm text-slate-500">
                    Je ne prévois pas de recrutement pour l'instant.
                </div>
            )}
        </div>
    );
}
