import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Email invalide" }),
  password: z
    .string()
    .min(2, "Le mot de passe doit contenir au moins 6 caractères")
    .max(100, "Maximum 100 caractères"),
});

export const registerSchema = z.object({
  // Étape 1: Informations personnelles
  nom: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  prenom: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),
  dateNaissance: z.string().min(1, { message: "La date de naissance est requise" }),
  tel: z.string().min(10, { message: "Le numéro de téléphone est invalide" }),

  // Étape 2: Informations de connexion
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;