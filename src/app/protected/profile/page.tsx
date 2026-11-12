"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import FadeIn from "@/components/animations/FadeIn";
import ScaleIn from "@/components/animations/ScaleIn";

const profileSchema = z.object({
  email: z.string().email("Email invalide"),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  tel: z.string().min(10, "Le numéro de téléphone est invalide"),
  dateNaissance: z.string().min(1, "La date de naissance est requise"),
});

type ProfileData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: "",
      nom: "",
      prenom: "",
      tel: "",
      dateNaissance: "",
    },
  });

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      setError("");
      try {
        const session = await getSession();
        const profileUserId = session?.user?.id;
        if (!profileUserId) {
          throw new Error("Session utilisateur introuvable.");
        }

        const response = await fetch(`/api/user/${encodeURIComponent(profileUserId)}`, {
          method: "GET",
          headers: { accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error("Impossible de récupérer les informations du profil.");
        }

        const data = await response.json();
        const user = Array.isArray(data) ? data[0] : data;

        if (!user) {
          throw new Error("Utilisateur introuvable.");
        }

        setUserId(user.id ?? null);
        reset({
          email: user.email ?? "",
          nom: user.nom ?? "",
          prenom: user.prenom ?? "",
          tel: user.tel ?? "",
          dateNaissance: user.dateNaissance ?? "",
        });
      } catch (error: any) {
        setError(error.message || "Une erreur est survenue lors du chargement du profil.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileData) => {
    if (!userId) {
      setError("Impossible de mettre à jour le profil sans identifiant utilisateur.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/user/${encodeURIComponent(userId)}`, {
        method: "PUT",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || "Impossible de mettre à jour le profil.");
      }

      setSuccess("Profil mis à jour avec succès.");
      router.refresh();
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue lors de la mise à jour.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-10">
      <FadeIn>
        <div className="mx-auto w-full max-w-3xl">
          <ScaleIn>
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/10">
              <div className="mb-8">
                <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Mon profil</h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Modifiez vos informations personnelles et de contact.
                </p>
              </div>

              {error ? (
                <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-red-700 dark:bg-red-900/20 dark:text-red-200">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="mb-6 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-200">
                  {success}
                </div>
              ) : null}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                    <input
                      type="email"
                      {...register("email")}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-violet-400 dark:focus:ring-violet-900/40"
                      placeholder="example@gmail.com"
                    />
                    {errors.email ? (
                      <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Téléphone</label>
                    <input
                      type="tel"
                      {...register("tel")}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-violet-400 dark:focus:ring-violet-900/40"
                      placeholder="+261341234567"
                    />
                    {errors.tel ? (
                      <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.tel.message}</p>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Nom</label>
                    <input
                      type="text"
                      {...register("nom")}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-violet-400 dark:focus:ring-violet-900/40"
                      placeholder="Votre nom"
                    />
                    {errors.nom ? (
                      <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.nom.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Prénom</label>
                    <input
                      type="text"
                      {...register("prenom")}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-violet-400 dark:focus:ring-violet-900/40"
                      placeholder="Votre prénom"
                    />
                    {errors.prenom ? (
                      <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.prenom.message}</p>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Date de naissance</label>
                    <input
                      type="date"
                      {...register("dateNaissance")}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-violet-400 dark:focus:ring-violet-900/40"
                    />
                    {errors.dateNaissance ? (
                      <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.dateNaissance.message}</p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center justify-center rounded-2xl bg-violet-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:bg-violet-400"
                  >
                    {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                  >
                    Retour au tableau de bord
                  </button>
                </div>
              </form>
            </div>
          </ScaleIn>
        </div>
      </FadeIn>
    </div>
  );
}
