"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Page de réinitialisation du mot de passe.
 * Entrer le nouveau mot de passe => confirm => POST backend.
 */
export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") as string;

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<{ message: string } | null>(null);

    useEffect(() => {
        if (!token) {
            setError({ message: "Token de réinitialisation manquant." });
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirm) {
            setError({ message: "Les mots de passe ne correspondent pas." });
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/user/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: encodeURIComponent(token),
                    newPassword: password,
                }),
            });

            if (res.ok) {
                setSuccess(true);
            } else {
                const data = await res.json();
                setError({ message: data?.message || "Une erreur est survenue." });
            }
        } catch (err: any) {
            setError({ message: err.message });
        } finally {
            setLoading(false);
        }
    };

    if (error && !success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Erreur de réinitialisation
                            </h1>
                            <p className="text-red-600 dark:text-red-400">
                                {error.message}
                            </p>

                            <Link
                                href="/login"
                                className="mt-4 inline-block text-primary font-medium hover:underline"
                            >
                                Retourner à la page de connexion
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 text-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Mot de passe mis à jour 🎉
                        </h1>
                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                            Votre mot de passe a été réinitialisé avec succès.
                        </p>
                        <Link
                            href="/login"
                            className="text-primary font-semibold hover:underline"
                        >
                            Revenir à la connexion
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Réinitialiser le mot de passe
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Entrez votre nouveau mot de passe.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nouveau mot de passe
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Confirmer le mot de passe
                            </label>
                            <input
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm font-medium">{error.message}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                        >
                            {loading ? "Mise à jour..." : "Réinitialiser"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
