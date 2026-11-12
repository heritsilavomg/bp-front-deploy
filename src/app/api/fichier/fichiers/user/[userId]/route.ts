import { backendUrl, getApiHeaders, createJsonResponse } from "@/app/api/fichier/lib";

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const headers = await getApiHeaders(request);
    const response = await fetch(`${backendUrl}/fichiers/user/${encodeURIComponent(userId)}`, {
        method: "GET",
        headers,
    });

    if (!response.ok) {
        return Response.json({ error: "Impossible de récupérer les fichiers de l'utilisateur." }, { status: response.status });
    }

    return createJsonResponse(response);
}
