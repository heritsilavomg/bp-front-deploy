"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Lightbulb, FileText, Rocket, BarChart2, Loader } from "lucide-react";
import { useNomacWizard } from "@/components/nomac/NomacWizardProvider";
import { BpType } from "@/types/bp/bp";

const OPTIONS = [
    {
        id: "CREATION",
        title: "Création",
        subtitle: "Votre projet est à l'état idéatoire.",
        Icon: Lightbulb,
    },
    {
        id: "FRANCHISE",
        title: "Franchise ou réseau de franchise",
        subtitle: "Je souhaite créer une franchise ou un réseau de franchise.",
        Icon: FileText,
    },
    {
        id: "REPRISE",
        title: "Reprise d'entreprise",
        subtitle: "Je souhaite reprendre une entreprise existante.",
        Icon: Rocket,
    },
    {
        id: "ENTREPRISE_EXISTANTE",
        title: "Entreprise existante",
        subtitle: "Je souhaite optimiser ou pivoter mon business plan.",
        Icon: BarChart2,
    },
];

export default function Page() {
    const router = useRouter();
    const [selected, setSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { selection } = useNomacWizard();

    const handlePrev = () => {
        router.replace("/protected/new/nomac/step5");
    };

    const handleContinue = async () => {
        if (!selected
                || !selection.categorie
                || !selection.categorie.code
                || !selection.categorie.nom
                || !selection.categorie.libelle
            ) return;

        const newBp: Omit<BpType, "id"> = {
            aProposProjet: {
                autreTypeActivite: selection.categorie.libelle,
                codeActivite: selection.categorie.code,
                typeActivite: selection.categorie.nom,
                typeProjet: selected as "CREATION" | "FRANCHISE" | "REPRISE" | "ENTREPRISE_EXISTANTE",
            },
            utilisateurCreateur: "",
            statutValidation: "BROUILLON",
        };

        setLoading(true);
        await fetch("/api/bp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newBp),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to create new BP");
            }
            return response.json();
        })
        .then((data) => {
            console.log("New BP created:", data);
            router.replace(`/protected/edit-bp/${data.data.id}`);
        })
        .catch((error) => {
            console.error("Error creating new BP:", error);
            setLoading(false);
        });
    };



    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="mt-4 text-3xl font-bold text-slate-900">Où en est votre projet ?</h1>
                    <p className="mt-2 text-sm text-slate-600">Cette information nous permet d'adapter les outils d'IA et les modèles de business plan à votre maturité actuelle.</p>
                </div>

                <div className="space-y-4">
                    {OPTIONS.map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => !loading && setSelected(opt.id)}
                            className={`cursor-pointer w-full rounded-2xl border p-5 text-left transition-shadow flex items-start gap-4 ${selected === opt.id ? "border-violet-300 bg-white shadow-[0_8px_30px_rgba(91,33,182,0.08)]" : "border-slate-200 bg-white/90 hover:shadow-sm"}`}
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                <opt.Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-slate-900">{opt.title}</h3>
                                    <div className={`h-5 w-5 rounded-full border ${selected === opt.id ? "border-violet-600 bg-violet-600/75" : "border-slate-200 bg-white"}`} />
                                </div>
                                <p className="mt-2 text-sm text-slate-500">{opt.subtitle}</p>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-8 border-t pt-6">
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handlePrev}
                            className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-violet-600"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Précédent
                        </button>

                        <button
                            type="button"
                            onClick={handleContinue}
                            disabled={!selected || loading}
                            className={`cursor-pointer inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition ${selected ? "bg-violet-600 hover:bg-violet-700" : "bg-slate-300 cursor-not-allowed"}`}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                                    <span className="ml-2">Chargement...</span>
                                </span>
                            ) : (
                                "Continuer"
                            )}
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
