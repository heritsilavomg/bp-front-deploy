import { backendUrl, getAuthToken } from "@/lib/api";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const token = await getAuthToken(request);

    const response = await fetch(`${backendUrl}/calcul/activite/${encodeURIComponent(id)}`, {
        method: "GET",
        headers: {
            accept: request.headers.get("accept") || "application/json",
            Authorization: token,
        },
    });

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        return new Response(text || "Erreur lors du calcul.", { status: response.status });
    }

    const data = await response.json().catch(() => null);
    return Response.json({ data });
}
