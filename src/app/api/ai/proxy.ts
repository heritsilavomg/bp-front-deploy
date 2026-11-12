import { auth } from "@/auth";
import { backendUrl } from "@/lib/api";

export function aiErrorResponse(status: number, code: string, message: string) {
    return Response.json({ code, message }, {
        status,
        headers: { "Cache-Control": "no-store" },
    });
}

/** Server-side only: credentials always come from Auth.js, never inbound headers. */
export async function proxyAiRequest(request: Request, path: string) {
    let session;
    try {
        session = await auth();
    } catch {
        return aiErrorResponse(500, "AUTH_SESSION_ERROR", "Impossible de lire la session.");
    }

    if (!session?.accessToken?.trim() || !(Date.parse(session.expires) > Date.now())) {
        return aiErrorResponse(401, "UNAUTHENTICATED", "Veuillez vous connecter.");
    }

    const headers = new Headers({
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
    });
    let body: string | undefined;
    if (request.method === "POST" || request.method === "PATCH") {
        try {
            const requestBody = await request.text();
            if (requestBody.length > 0) {
                headers.set("Content-Type", request.headers.get("content-type") || "application/json");
                body = requestBody;
            }
        } catch {
            return aiErrorResponse(400, "INVALID_BODY", "Impossible de lire la requete.");
        }
    }

    try {
        const response = await fetch(`${backendUrl.replace(/\/+$/, "")}${path}`, {
            method: request.method,
            headers,
            body,
            cache: "no-store",
            redirect: "manual",
        });
        const responseHeaders = new Headers({ "Cache-Control": "no-store" });
        for (const name of ["content-type", "retry-after", "www-authenticate"]) {
            const value = response.headers.get(name);
            if (value !== null) responseHeaders.set(name, value);
        }

        // Preserve the original payload, including JSON/text error bodies and empty responses.
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch {
        return aiErrorResponse(502, "BACKEND_UNAVAILABLE", "Le service IA est momentanement indisponible.");
    }
}
