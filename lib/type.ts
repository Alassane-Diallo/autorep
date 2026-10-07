import { z } from "zod";

// Schema de base pour l'inscription
export const UserSchema = z.object({
  nom: z.string().min(1, "Nom requis."),
  prenom: z.string().min(1, "Prénom requis."),
  email: z.string().email("Email invalide."),
  telephone: z.string().optional(),
  role: z.enum(["CLIENT", "TECHNICIEN"]),
})

// Schema pour la réponse du serveur (contient id)
export const UserResponseSchema = z.object({
  id: z.string(),
  nom: z.string(),
  prenom: z.string(),
  email: z.string(),
  role: z.enum(["CLIENT", "TECHNICIEN", "ADMIN"]),
  telephone: z.string().optional(),
  client: z.object({
    adresse: z.string().optional()
  }).optional(),
  technicien: z.object({
    specialite: z.string().optional()
  }).optional(),
})
export type UserResponse = z.infer<typeof UserResponseSchema>;

// Schema login
export const LoginSchema = z.object({
  email: z.string().email("Email invalide."),
  password: z.string().min(6, "Mot de passe minimum 6 caractères.")
})
export type LoginType = z.infer<typeof LoginSchema>

// Schema register
export const RegisterSchema = UserSchema.extend({
  password: z.string().min(6, "Mot de passe minimum 6 caractères."),
  adresse: z.string().optional(),
  specialite: z.string().optional(),
  confirmPassword: z.string().optional(),
})
export type RegisterType = z.infer<typeof RegisterSchema>