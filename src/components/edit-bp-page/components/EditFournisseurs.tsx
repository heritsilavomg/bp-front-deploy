import { Trash2 } from "lucide-react";
import type { FournisseurType } from "@/types/bp/people";

type EditFournisseursProps = {
  fournisseurs?: FournisseurType[];
  setFournisseurs: (fournisseurs: FournisseurType[]) => void;
  maxFournisseurs?: number;
};

export default function EditFournisseurs({ fournisseurs = [], setFournisseurs, maxFournisseurs = 12 }: EditFournisseursProps) {
  const rows = fournisseurs ?? [];

  const updateFournisseur = (index: number, field: keyof FournisseurType, value: any) => {
    const next = [...rows];
    next[index] = { ...next[index], [field]: value };
    setFournisseurs(next);
  };

  const removeFournisseur = (index: number) => {
    setFournisseurs(rows.filter((_, currentIndex) => currentIndex !== index));
  };

  const addFournisseur = () => {
    if (rows.length >= maxFournisseurs) return;
    setFournisseurs([
      ...rows,
      {
        nomFournisseur: "",
        description: "",
      },
    ]);
  };

  return (
    <div className="rounded-3xl border-slate-200/80 bg-white/90 p-6 sm:p-7">
      <span id="fournisseurs" />
      <h2 className="text-2xl font-bold text-slate-800">Fournisseurs</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">Les personnes ou entreprises à qui je vais acheter mes marchandises (services, produits finis, matières premières, ...) nécessaires pour ma production.</p>

      <div className="mt-6 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <div className="hidden sm:grid min-w-0 grid-cols-[1.6fr_2.8fr_70px] gap-0 border-b border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
          <div>Nom du fournisseur</div>
          <div>Description</div>
          <div className="text-right">&nbsp;</div>
        </div>

        <div className="divide-y divide-slate-200">
          {rows.length > 0 ? (
            rows.map((fournisseur, index) => (
              <div key={`fournisseur-${index}`} className="grid gap-3 border-b border-slate-200 px-3 py-4 sm:grid-cols-[1.6fr_2.8fr_70px] sm:items-center">
                <div>
                  <input
                    type="text"
                    value={fournisseur.nomFournisseur ?? ""}
                    onChange={(event) => updateFournisseur(index, "nomFournisseur", event.target.value)}
                    placeholder="Nom du fournisseur"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={fournisseur.description ?? ""}
                    onChange={(event) => updateFournisseur(index, "description", event.target.value)}
                    placeholder="Description"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                  />
                </div>

                <div className="flex items-start justify-end">
                  <button
                    type="button"
                    onClick={() => removeFournisseur(index)}
                    className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                    aria-label="Supprimer ce fournisseur"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-12 text-center text-sm text-slate-500">Aucun fournisseur défini pour le moment.</div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Ajouter un fournisseur :</p>
        <button
          type="button"
          onClick={addFournisseur}
          disabled={rows.length >= maxFournisseurs}
          className="inline-flex cursor-pointer items-center justify-center rounded-full border border-cyan-500 bg-white px-5 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Autre fournisseur
        </button>
      </div>
    </div>
  );
}
