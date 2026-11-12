import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";
import type { ObjectifsType } from "@/types/bp/general";

type EditObjectifsProps = {
    dateCreationPrevue?: string;
    onDateChange: (value: string) => void;
    objectifs?: ObjectifsType;
    onObjectifsChange: (next: ObjectifsType) => void;
};

function parseToDate(value?: string): Date {
    if (!value) return new Date();
    const date = new Date(value);
    return isNaN(date.getTime()) ? new Date() : date;
}

function toIsoStringFromDate(date: Date | null): string {
    if (!date) return "";
    // On force le 1er jour du mois choisi
    const normalized = new Date(date.getFullYear(), date.getMonth(), 1);
    return normalized.toISOString();
}

export default function EditObjectifs({
    dateCreationPrevue,
    onDateChange,
    objectifs,
    onObjectifsChange,
}: EditObjectifsProps) {
    const currentObjectifs = objectifs ?? {};
    const [selectedDate, setSelectedDate] = useState<Date>(parseToDate(dateCreationPrevue));

    const updateObjectif = (field: keyof ObjectifsType, value: string) => {
        onObjectifsChange({
            ...currentObjectifs,
            [field]: value,
        });
    };

    const handleDateChange = (date: Date | null) => {
        if (!date) return;
        setSelectedDate(date);
        //mois + 1 pour le backend
        //LocalDate Java: Janvier = 1
        //Date js: Jnvier = 0
        const dateToSend = new Date(date.getFullYear(), date.getMonth() + 1);
        onDateChange(toIsoStringFromDate(dateToSend));
    };

    return (
        <div className="rounded-3xl border-slate-200/80 bg-white/90 p-6 sm:p-7">
            <h2 id="objectifs" className="text-2xl font-bold text-slate-800">Objectifs</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">J&apos;envisage de créer mon entreprise en :</p>

            <div className="mt-5 grid gap-6">
                <div className="grid gap-2 sm:grid-cols-[1fr_180px] sm:items-center">
                    <label htmlFor="projectDate" className="text-sm font-semibold text-slate-700">
                        Date de création prévue
                    </label>
                    <div className="relative w-full min-w-0">
                        <DatePicker
                            id="projectDate"
                            selected={selectedDate}
                            onChange={handleDateChange}
                            showMonthYearPicker
                            dateFormat="MM/yyyy"
                            minDate={new Date()}
                            className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition cursor-pointer focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                        />
                        <Calendar className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-slate-700">Dès le lancement de l&apos;activité, les objectifs pour la première année seront :</p>
                        <textarea
                            value={currentObjectifs.objectifCourtTerme ?? ""}
                            onChange={(event) => updateObjectif("objectifCourtTerme", event.target.value)}
                            placeholder="Objectif premier année"
                            rows={4}
                            className="mt-3 w-full resize-none rounded-[30px] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                        />
                    </div>

                    <div>
                        <p className="text-sm text-slate-700">Pour la deuxième année d&apos;activité, les objectifs seront :</p>
                        <textarea
                            value={currentObjectifs.objectifMoyenTerme ?? ""}
                            onChange={(event) => updateObjectif("objectifMoyenTerme", event.target.value)}
                            placeholder="Objectif deuxième année"
                            rows={4}
                            className="mt-3 w-full resize-none rounded-[30px] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                        />
                    </div>

                    <div>
                        <p className="text-sm text-slate-700">Pour la troisième année d&apos;activité, les objectifs seront :</p>
                        <textarea
                            value={currentObjectifs.objectifLongTerme ?? ""}
                            onChange={(event) => updateObjectif("objectifLongTerme", event.target.value)}
                            placeholder="Objectif troisième année"
                            rows={4}
                            className="mt-3 w-full resize-none rounded-[30px] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}