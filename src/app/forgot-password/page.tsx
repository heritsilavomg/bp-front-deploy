"use client";

import FadeIn from "@/components/animations/FadeIn";
import ScaleIn from "@/components/animations/ScaleIn";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true);

        try {
            const res = await fetch(
                `/api/user/forgot-password?email=${encodeURIComponent(email)}`,
                { method: "GET" }
            );

            if (res.status === 204) {
                setSuccess(true);
            } else {
                const data = await res.json();
                setError(data?.message || "Une erreur est survenue.");
            }
        } catch (err: Error | any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
            <div className="w-full max-w-md">
                <FadeIn>
                    <ScaleIn>
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    Mot de passe oublié
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Entrez votre adresse email pour réinitialiser votre mot de passe.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        placeholder="ex: example@gmail.com"
                                    />
                                </div>

                                {error && (
                                    <p className="text-red-500 text-sm font-medium">{error}</p>
                                )}

                                {success && (
                                    <p className="text-green-600 text-sm font-medium">
                                        Un email de réinitialisation a été envoyé à votre adresse email.
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="cursor-pointer w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                                >
                                    {loading ? "Envoi en cours..." : "Réinitialiser le mot de passe"}
                                </button>
                            </form>
                        </div>
                    </ScaleIn>
                </FadeIn>
            </div>
        </div>
    );
}
