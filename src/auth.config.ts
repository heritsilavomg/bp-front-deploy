// src/auth.config.ts
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validations/auth";

const SPRING_BOOT_API = process.env.SPRING_BOOT_API || "http://localhost:8080";

export default {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);
        if (!validatedFields.success) return null;

        const { email, password } = validatedFields.data;

        try {
          const response = await fetch(`${SPRING_BOOT_API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) return null;
          const data = await response.json();

          if (data && data.accessToken) {
            // Décodage natif standard Web API
            const base64Url = data.accessToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const tokenPayload = JSON.parse(atob(base64));

            return {
              id: tokenPayload.sub,
              name: tokenPayload.n,
              email: tokenPayload.n,
              accessToken: data.accessToken,
              roles: tokenPayload.a || [],
            };
          }
          return null;
        } catch (error) {
          console.error("Erreur d'authentification Spring Boot:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.accessToken = user.accessToken;
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.accessToken = token.accessToken;
        session.user.roles = token.roles;
      }
      return session;
    },
  },
  session: { 
    strategy: "jwt",
    maxAge: 60 * 24 * 60 * 60, // 60 jours
  },
  trustHost: true,
} satisfies NextAuthConfig;
