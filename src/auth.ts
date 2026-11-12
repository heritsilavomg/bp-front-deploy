// src/auth.ts
import NextAuth from "next-auth";
import authConfig from "@/auth.config";

const instance = NextAuth(authConfig);

export const auth = instance.auth;
export const signIn = instance.signIn;
export const signOut = instance.signOut;
export const handlers = instance.handlers;
