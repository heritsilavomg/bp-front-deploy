"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import FadeIn from "@/components/animations/FadeIn";
import ScaleIn from "@/components/animations/ScaleIn";
import Link from "next/link";
import {
    Rocket,
    ArrowRight,
    Sparkles,
    BarChart3,
    Bot,
} from "lucide-react";

const NOMAC_REFERENCE_URL = "https://www.instat.mg/documents/upload/main/INSTAT_Nomac_27_11_2013.pdf";

export default function LoginPage() {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/protected";

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginInput) => {
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (!result?.ok || result.error) {
                setError("Email ou mot de passe incorrect");
                setIsLoading(false);
                return;
            }

            const session = await getSession();
            if (!session?.user) {
                setError("Impossible de récupérer la session. Veuillez réessayer.");
                setIsLoading(false);
                return;
            }

            router.push(session.user.roles?.includes("ROLE_ADMIN") ? "/admin" : callbackUrl);
            router.refresh();
        } catch {
            setError("Une erreur est survenue lors de la connexion");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-white">
            {/* Colonne gauche — formulaire */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-10 sm:py-14">
                <FadeIn>
                    <div className="w-full max-w-md mx-auto">
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                <Rocket className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">
                                BizPlan AI
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            Bienvenue
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 mb-8">
                            Connectez-vous pour retrouver vos business plans et
                            poursuivre leur rédaction.
                        </p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                                    E-mail professionnel
                                </label>
                                <input
                                    {...register("email")}
                                    type="email"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="nom@entreprise.mg"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Mot de passe
                                    </label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-xs sm:text-sm text-indigo-600 hover:underline"
                                    >
                                        Oublié ?
                                    </Link>
                                </div>
                                <input
                                    {...register("password")}
                                    type="password"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Votre mot de passe"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
                            >
                                {isLoading ? "Connexion..." : "Se connecter"}
                                {!isLoading && <ArrowRight className="w-4 h-4" />}
                            </button>

                            <div className="flex items-center gap-3 py-1">
                                <div className="h-px flex-1 bg-gray-200" />
                                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-400 text-center">
                                    Nouveau sur BizPlan AI ?
                                </span>
                                <div className="h-px flex-1 bg-gray-200" />
                            </div>

                            <p className="text-center text-sm text-gray-600 pt-2">
                                Pas encore de compte ?{" "}
                                <Link
                                    href="/register"
                                    className="text-indigo-600 hover:underline font-medium"
                                >
                                    Créer un compte
                                </Link>
                            </p>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
                            <span>© 2026 BizPlan AI Madagascar.</span>
                            <div className="flex items-center gap-4">
                                <Link href="/" className="hover:text-gray-600">
                                    Accueil
                                </Link>
                                <a href={NOMAC_REFERENCE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">
                                    Référentiel NOMAC 2012
                                </a>
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </div>

            {/* Colonne droite — panneau marketing */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0b1120] via-[#0f172a] to-[#1e2a4a] items-center justify-center px-12 py-16">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(99,102,241,0.25),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(56,189,248,0.15),transparent_50%)]" />

                <ScaleIn delay={0.15}>
                    <div className="relative w-full max-w-lg">
                        <div className="flex justify-center mb-6">
                            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-slate-300 text-[10px] uppercase tracking-widest rounded-full px-4 py-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                                Assistant IA intégré
                            </div>
                        </div>

                        <h2 className="text-3xl xl:text-4xl font-bold text-white text-center mb-4 leading-tight">
                            Construisez votre
                            <br />
                            business plan pas à pas.
                        </h2>

                        <p className="text-slate-400 text-center text-sm mb-8 max-w-md mx-auto">
                            Conçue pour les entrepreneurs malgaches : décrivez votre projet,
                            renseignez vos prévisions et obtenez automatiquement vos résultats
                            financiers sur trois ans.
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <div className="w-9 h-9 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center mb-3">
                                    <BarChart3 className="w-4.5 h-4.5" />
                                </div>
                                <h3 className="text-sm font-semibold text-white mb-1">
                                    Score de viabilité
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Une note sur 100 répartie sur cinq dimensions.
                                </p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <div className="w-9 h-9 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-3">
                                    <Bot className="w-4.5 h-4.5" />
                                </div>
                                <h3 className="text-sm font-semibold text-white mb-1">
                                    Assistant IA
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Des propositions de modification que vous validez.
                                </p>
                            </div>
                        </div>

                        {/* Mockup dashboard */}
                        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0d1424]">
                            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white/5 border-b border-white/10">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                                <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                                <span className="ml-3 text-[10px] text-slate-500">
                                    BizPlan AI — Résumé financier
                                </span>
                            </div>

                            <div className="p-4">
                                <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                                    Indicateurs calculés automatiquement
                                </p>
                                <div className="flex items-end gap-1.5 h-20 mb-4">
                                    {[35, 55, 40, 70, 60, 85, 65, 95].map((h, i) => (
                                        <div
                                            key={i}
                                            style={{ height: `${h}%` }}
                                            className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan-500 to-blue-400"
                                        />
                                    ))}
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-white/5 rounded-lg p-2.5">
                                        <p className="text-[9px] text-slate-500 mb-1">
                                            Chiffre d&apos;affaires
                                        </p>
                                        <p className="text-xs font-semibold text-white">
                                            Sur 3 ans
                                        </p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-2.5">
                                        <p className="text-[9px] text-slate-500 mb-1">
                                            Résultat net
                                        </p>
                                        <p className="text-xs font-semibold text-white">Par année</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-2.5">
                                        <p className="text-[9px] text-slate-500 mb-1">
                                            Score
                                        </p>
                                        <p className="text-xs font-semibold text-white">Sur 100</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScaleIn>
            </div>
        </div>
    );
}
