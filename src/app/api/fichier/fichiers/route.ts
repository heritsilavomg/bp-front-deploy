import { backendUrl, getApiHeaders, createJsonResponse } from "@/app/api/fichier/lib";

export async function GET(request: Request) {
    const headers = await getApiHeaders(request);
    const response = await fetch(`${backendUrl}/fichiers`, {
        method: "GET",
        headers,
    });

    if (!response.ok) {
        return Response.json({ error: "Erreur lors de la récupération des fichiers." }, { status: response.status });
    }

    return createJsonResponse(response);
}
