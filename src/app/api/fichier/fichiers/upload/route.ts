import { backendUrl, getApiHeaders, createJsonResponse } from "@/app/api/fichier/lib";

export async function POST(request: Request) {
    const headers = await getApiHeaders(request);
    const response = await fetch(`${backendUrl}/fichiers/upload`, {
        method: "POST",
        headers,
        body: request.body,
        duplex: "half",
    } as RequestInit & { duplex: "half" });

    if (!response.ok) {
        return Response.json({ error: "Erreur lors de l'upload du fichier." }, { status: response.status });
    }

    return createJsonResponse(response);
}
