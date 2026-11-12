// src/proxy.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { pathname } = req.nextUrl;

    // 1. REVERSE PROXY VERS SPRING BOOT
    if (pathname.startsWith("/api/v1")) {
        const targetUrl = new URL(pathname, process.env.SPRING_BOOT_API || "http://localhost:8080"); // URL Spring Boot (http://backend:8080 sous Docker)
        targetUrl.search = req.nextUrl.search;

        // Récupération sécurisée du token Spring Boot stocké dans la session Auth.js
        const springToken = (req.auth as any)?.accessToken;

        // On clone les headers initiaux pour y injecter le token
        const requestHeaders = new Headers(req.headers);
        if (springToken) {
            requestHeaders.set("Authorization", `Bearer ${springToken}`);
        }

        return NextResponse.rewrite(targetUrl, {
            request: {
                headers: requestHeaders,
            },
        });
    }

    // 2. LOGIQUE DE REDIRECTION DE VOS PAGES
    const expires = req.auth?.expires ? new Date(req.auth.expires) : new Date(0);
    const isLoggedIn = !!req.auth && expires > new Date();

    const isProtectedRoute = pathname.startsWith("/protected") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/settings");
    const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

    if (isLoggedIn && (pathname === "/protected/new" || pathname === "/protected/new/")) {
        return NextResponse.redirect(new URL("/protected/new/nomac/step1", req.url));
    }

    if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
        return NextResponse.redirect(new URL("/protected", req.url));
    }

    if (!isLoggedIn && isProtectedRoute) {
        const callbackUrl = encodeURIComponent(pathname);
        return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url));
    }

    if (!isLoggedIn && isAdminRoute) {
        const callbackUrl = encodeURIComponent(pathname);
        return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url));
    }

    if (isLoggedIn && isAdminRoute && !(req.auth?.user?.roles || []).includes("ROLE_ADMIN")) {
        return NextResponse.redirect(new URL("/protected", req.url));
    }

    return NextResponse.next();
});

export const config = {
    // Exclure les routes internes d'Auth.js pour éviter les boucles infinies
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
