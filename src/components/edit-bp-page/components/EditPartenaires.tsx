import { Trash2 } from "lucide-react";
import type { PartenaireType, PartenaireAvancement } from "@/types/bp/people";

type EditPartenairesProps = {
  partenaires?: PartenaireType[];
  setPartenaires: (partenaires: PartenaireType[]) => void;
  maxPartenaires?: number;
};

const PRESET_PARTENAIRE_TYPES = [
  "Expert-comptable / Comptable",
  "Réseau d'accompagnement",
  "Services publics",
  "Avocat / Juriste",
  "Franchisseur",
  "CCI / CMA",
  "Coach, Incubateur",
  "Autre partenaire",
];

const AVANCEMENT_OPTIONS: { value: PartenaireAvancement; label: string }[] = [
  { value: "A_CONTACTER", label: "À contacter" },
  { value: "EN_RECHERCHE", label: "En recherche" },
  { value: "DEJA_CONTACTE", label: "Déjà contacté" },
];

export default function EditPartenaires({ partenaires = [], setPartenaires, maxPartenaires = 12 }: EditPartenairesProps) {
  const rows = partenaires ?? [];

  const updatePartenaire = (index: number, field: keyof PartenaireType, value: any) => {
    const next = [...rows];
    next[index] = { ...next[index], [field]: value };
    setPartenaires(next);
  };

  const removePartenaire = (index: number) => {
    setPartenaires(rows.filter((_, currentIndex) => currentIndex !== index));
  };

  const addPartenaire = (typePartenaire?: string) => {
    if (rows.length >= maxPartenaires) return;
    setPartenaires([
      ...rows,
      {
        typePartenaire: typePartenaire ?? "",
        nomPartenaire: "",
        contact: "",
        avancement: "A_CONTACTER",
      },
    ]);
  };

    return (
    <div className="rounded-3xl border-slate-200/80 bg-white/90 p-6 sm:p-7">
      <span id="partenaires" />
      <h2 className="text-2xl font-bold text-slate-800">Partenaires</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">Les personnes, organismes ou entreprises qui vont m’aider à développer mon entreprise.</p>

      <div className="mt-6 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <div className="hidden sm:grid min-w-0 grid-cols-[1.2fr_1.2fr_1.8fr_70px] gap-0 border-b border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
          <div>Type de partenaire</div>
          <div>Avancement</div>
          <div>Nom du partenaire</div>
          <div className="text-right">&nbsp;</div>
        </div>

        <div className="divide-y divide-slate-200">
          {rows.length > 0 ? (
            rows.map((partenaire, index) => (
              <div key={`partenaire-${index}`} className="grid gap-3 border-b border-slate-200 px-3 py-4 sm:grid-cols-[1.2fr_1.2fr_1.8fr_70px] sm:items-center">
                <div>
                  <input
                    type="text"
                    value={partenaire.typePartenaire ?? ""}
                    onChange={(event) => updatePartenaire(index, "typePartenaire", event.target.value)}
                    placeholder="Type de partenaire"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                  />
                </div>

                <div>
                  <select
                    value={partenaire.avancement ?? "A_CONTACTER"}
                    onChange={(event) => updatePartenaire(index, "avancement", event.target.value as PartenaireAvancement)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                  >
                    {AVANCEMENT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <input
                    type="text"
                    value={partenaire.nomPartenaire ?? ""}
                    onChange={(event) => updatePartenaire(index, "nomPartenaire", event.target.value)}
                    placeholder="Nom du partenaire"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                  />
                </div>

                <div className="flex items-start justify-end">
                  <button
                    type="button"
                    onClick={() => removePartenaire(index)}
                    className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                    aria-label="Supprimer ce partenaire"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-12 text-center text-sm text-slate-500">Aucun partenaire défini pour le moment.</div>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          {PRESET_PARTENAIRE_TYPES.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => addPartenaire(label)}
              className="inline-flex cursor-pointer items-center justify-center rounded-full border border-cyan-500 bg-white px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => addPartenaire()}
          disabled={rows.length >= maxPartenaires}
          className="inline-flex cursor-pointer items-center justify-center rounded-full border border-cyan-500 bg-white px-5 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Autre partenaire
        </button>
      </div>
    </div>
  );
}
