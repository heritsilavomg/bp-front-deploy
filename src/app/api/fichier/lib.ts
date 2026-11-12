import { auth } from "@/auth";

export const backendUrl = process.env.SPRING_BOOT_API || "http://localhost:8080";

export async function getAuthToken(request: Request) {
    const session = await auth();
    const authorization = request.headers.get("Authorization");
    return authorization ?? `Bearer ${(session as any)?.accessToken ?? ""}`;
}

export async function getApiHeaders(request: Request, extra: HeadersInit = {}) {
    const authorization = await getAuthToken(request);
    const headers: Record<string, string> = {
        accept: request.headers.get("accept") || "application/json",
        Authorization: authorization,
        ...Object.fromEntries(new Headers(extra as HeadersInit)),
    };

    const contentType = request.headers.get("Content-Type");
    if (contentType) {
        headers["Content-Type"] = contentType;
    }

    return headers;
}

export async function createJsonResponse(response: Response) {
    const text = await response.text();
    try {
        const data = JSON.parse(text);
        return Response.json(data, { status: response.status, statusText: response.statusText });
    } catch {
        return new Response(text, { status: response.status, statusText: response.statusText });
    }
}
