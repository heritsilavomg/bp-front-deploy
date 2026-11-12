"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { useRouter } from "next/navigation";
import FadeIn from "@/components/animations/FadeIn";
import ScaleIn from "@/components/animations/ScaleIn";
import Link from "next/link";

export default function RegisterPage() {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        trigger,
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });

    const watchedFields = watch();

    const steps = [
        { number: 1, title: "Informations personnelles" },
        { number: 2, title: "Informations de connexion" },
        { number: 3, title: "Confirmation" },
    ];

    const validateStep = async (step: number): Promise<boolean> => {
        switch (step) {
            case 1:
                return await trigger(["nom", "prenom", "dateNaissance", "tel"]);
            case 2:
                return await trigger(["email", "password", "confirmPassword"]);
            default:
                return true;
        }
    };

    const nextStep = async () => {
        const isValid = await validateStep(currentStep);
        if (isValid) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const onSubmit = async (data: RegisterInput) => {
        setIsLoading(true);
        setError("");

        try {
            // Préparer les données pour Spring Boot
            const userData = {
                email: data.email,
                password: data.password,
                nom: data.nom,
                prenom: data.prenom,
                dateNaissance: data.dateNaissance,
                tel: data.tel,
                email_verified: false,
                role: "ROLE_USER"
            };

            const response = await fetch("/api/user", {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erreur lors de l'inscription");
            }

            setSuccess(true);
        } catch (error: any) {
            setError(error.message || "Une erreur est survenue lors de l'inscription");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
                <ScaleIn>
                    <div className="text-center max-w-md">
                        <div className="text-6xl mb-4">📧</div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Inscription réussie !
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Un email de vérification a été envoyé à <strong>{watchedFields.email}</strong>. 
                            Veuillez vérifier votre boîte mail et cliquer sur le lien pour activer votre compte.
                        </p>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                                💡 <strong>Important :</strong> Votre compte ne sera activé qu'après vérification de votre email.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push("/login")}
                            className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                        >
                            Aller à la page de connexion
                        </button>
                    </div>
                </ScaleIn>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
            <FadeIn>
                <ScaleIn delay={0.2}>
                    <div className="w-full max-w-2xl">
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                            {/* En-tête avec étapes */}
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    Créer un compte 🎉
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Rejoignez-nous en quelques étapes simples
                                </p>

                                {/* Barre de progression */}
                                <div className="flex justify-between items-center mb-8">
                                    {steps.map((step, index) => (
                                        <div key={step.number} className="flex items-center">
                                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                                currentStep >= step.number
                                                    ? "bg-primary border-primary text-white"
                                                    : "border-gray-300 dark:border-gray-600 text-gray-500"
                                            }`}>
                                                {step.number}
                                            </div>
                                            <span className={`ml-2 text-sm font-medium ${
                                                currentStep >= step.number
                                                    ? "text-primary"
                                                    : "text-gray-500"
                                            }`}>
                                                {step.title}
                                            </span>
                                            {index < steps.length - 1 && (
                                                <div className={`w-16 h-0.5 mx-4 ${
                                                    currentStep > step.number
                                                        ? "bg-primary"
                                                        : "bg-gray-300 dark:bg-gray-600"
                                                }`} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Étape 1: Informations personnelles */}
                                {currentStep === 1 && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Nom *
                                                </label>
                                                <input
                                                    {...register("nom")}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                    placeholder="Votre nom"
                                                />
                                                {errors.nom && (
                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                        {errors.nom.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Prénom *
                                                </label>
                                                <input
                                                    {...register("prenom")}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                    placeholder="Votre prénom"
                                                />
                                                {errors.prenom && (
                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                        {errors.prenom.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Date de naissance *
                                            </label>
                                            <input
                                                {...register("dateNaissance")}
                                                type="date"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                            />
                                            {errors.dateNaissance && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {errors.dateNaissance.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Numéro de téléphone *
                                            </label>
                                            <input
                                                {...register("tel")}
                                                type="tel"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                placeholder="+261 34 12 345 67"
                                            />
                                            {errors.tel && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {errors.tel.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Étape 2: Informations de connexion */}
                                {currentStep === 2 && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email *
                                            </label>
                                            <input
                                                {...register("email")}
                                                type="email"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                placeholder="votre@email.com"
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {errors.email.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Mot de passe *
                                            </label>
                                            <input
                                                {...register("password")}
                                                type="password"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                placeholder="Au moins 6 caractères"
                                            />
                                            {errors.password && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {errors.password.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Confirmer le mot de passe *
                                            </label>
                                            <input
                                                {...register("confirmPassword")}
                                                type="password"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                placeholder="Retapez votre mot de passe"
                                            />
                                            {errors.confirmPassword && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {errors.confirmPassword.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Étape 3: Récapitulatif */}
                                {currentStep === 3 && (
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                Récapitulatif de votre inscription
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400">Nom</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{watchedFields.nom}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400">Prénom</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{watchedFields.prenom}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400">Date de naissance</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{watchedFields.dateNaissance}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400">Téléphone</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{watchedFields.tel}</p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <p className="text-gray-600 dark:text-gray-400">Email</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{watchedFields.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                            <p className="text-blue-800 dark:text-blue-200 text-sm">
                                                📧 <strong>Important :</strong> Après l'inscription, vous recevrez un email de vérification. 
                                                Votre compte ne sera activé qu'après avoir cliqué sur le lien de vérification.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Boutons de navigation */}
                                <div className="flex justify-between pt-6">
                                    {currentStep > 1 ? (
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                        >
                                            Précédent
                                        </button>
                                    ) : (
                                        <div></div>
                                    )}

                                    {currentStep < 3 ? (
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all"
                                        >
                                            Suivant
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all disabled:opacity-50"
                                        >
                                            {isLoading ? "Inscription en cours..." : "Finaliser l'inscription"}
                                        </button>
                                    )}
                                </div>

                                <p className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    Déjà un compte ?{" "}
                                    <Link
                                        href="/login"
                                        className="text-primary hover:underline font-medium"
                                    >
                                        Se connecter
                                    </Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </ScaleIn>
            </FadeIn>
        </div>
    );
}