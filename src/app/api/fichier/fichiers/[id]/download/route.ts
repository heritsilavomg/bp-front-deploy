import { backendUrl, getAuthToken } from "@/app/api/fichier/lib";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const token = await getAuthToken(request);
    const response = await fetch(`${backendUrl}/fichiers/${encodeURIComponent(id)}/download`, {
        method: "GET",
        headers: {
            accept: request.headers.get("accept") || "application/octet-stream",
            Authorization: token,
        },
    });

    if (!response.ok) {
        const text = await response.text();
        return new Response(text, { status: response.status });
    }

    const headers = new Headers(response.headers);
    if (!headers.has("content-type")) {
        headers.set("content-type", "application/octet-stream");
    }

    return new Response(response.body, {
        status: response.status,
        headers,
    });
}
