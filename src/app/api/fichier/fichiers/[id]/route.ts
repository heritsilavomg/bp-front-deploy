import { backendUrl, getApiHeaders, createJsonResponse } from "@/app/api/fichier/lib";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const headers = await getApiHeaders(request);
    const response = await fetch(`${backendUrl}/fichiers/${encodeURIComponent(id)}`, {
        method: "GET",
        headers,
    });

    if (!response.ok) {
        return Response.json({ error: "Fichier non trouvé." }, { status: response.status });
    }

    return createJsonResponse(response);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const headers = await getApiHeaders(request);
    const response = await fetch(`${backendUrl}/fichiers/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers,
    });

    if (!response.ok) {
        return Response.json({ error: "Impossible de supprimer le fichier." }, { status: response.status });
    }

    return new Response(null, { status: 204 });
}
