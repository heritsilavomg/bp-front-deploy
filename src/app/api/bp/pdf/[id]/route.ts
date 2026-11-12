import { backendUrl, getAuthToken } from "@/lib/api";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const token = await getAuthToken(request);

    const response = await fetch(`${backendUrl}/pdf/business-plan/${encodeURIComponent(id)}`, {
        method: "GET",
        headers: {
            accept: request.headers.get("accept") || "application/pdf",
            Authorization: token,
        },
    });

    if (!response.ok) {
        const text = await response.text();
        return new Response(text || "Impossible de générer le PDF du business plan.", {
            status: response.status,
            headers: {
                "content-type": "application/json",
            },
        });
    }

    const headers = new Headers(response.headers);
    if (!headers.has("content-type")) {
        headers.set("content-type", "application/pdf");
    }

    return new Response(response.body, {
        status: response.status,
        headers,
    });
}
