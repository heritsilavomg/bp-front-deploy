import { auth } from "@/auth";

export const backendUrl = process.env.SPRING_BOOT_API || "http://localhost:8080";

export async function getAuthToken(request: Request) {
    const session = await auth();
    const authorization = request.headers.get("Authorization");
    return authorization ?? `Bearer ${(session as any)?.accessToken ?? ""}`;
}

export async function getApiHeaders(request: Request, extra: HeadersInit = {}) {
    const authorization = await getAuthToken(request);
    const headers = new Headers();
    headers.set("accept", request.headers.get("accept") || "application/json");
    headers.set("Authorization", authorization);

    const contentType = request.headers.get("content-type");
    if (contentType) {
        headers.set("Content-Type", contentType.split(",", 1)[0].trim());
    }

    new Headers(extra).forEach((value, key) => headers.set(key, value));

    return headers;
}

export async function createJsonResponse(response: Response) {
    if (response.status === 204 || response.status === 205 || response.status === 304) {
        return new Response(null, { status: response.status, statusText: response.statusText });
    }
    const text = await response.text();
    try {
        const data = JSON.parse(text);
        return Response.json(data, { status: response.status, statusText: response.statusText });
    } catch {
        return new Response(text, { status: response.status, statusText: response.statusText });
    }
}

/**
 * Adapter le mois pour le type LocalDate de Java
 * en LocalDate de Java: Mois Janvier = 1
 * en Date de JS: Mois Janvier = 0
 * @param date
 */
export function adaptMounthForLocldate(date: Date | null | undefined) {
    if (!date) {
        console.error("!!!! adaptMounthForLocldate(date: Date | null | undefined): le parametre passé est inconnu")
        return new Date();
    }
    var newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + 1);
    return newDate;
}

/**
 * Adapter le mois pour le type Date de JS
 * en Date de JS: Mois Janvier = 0
 * en LocalDate de Java: Mois Janvier = 1
 * @param date
 */
export function adaptMounthForDate(date: Date | null | undefined) {
    if (!date) {
        console.error("!!!! adaptMounthForLocldate(date: Date | null | undefined): le parametre passé est inconnu")
        return new Date();
    }
    var newDate = new Date(date);
    newDate.setMonth(newDate.getMonth());
    return newDate;
}
