import { backendUrl, getAuthToken, createJsonResponse } from "@/app/api/fichier/lib";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const url = new URL(request.url);
    const statut = url.searchParams.get("statut");

    if (!statut) {
        return Response.json({ error: "Le paramètre statut est requis." }, { status: 400 });
    }

    const token = await getAuthToken(request);
    const response = await fetch(`${backendUrl}/fichiers/${encodeURIComponent(id)}/statut?statut=${encodeURIComponent(statut)}`, {
        method: "PUT",
        headers: {
            accept: "application/json",
            Authorization: token,
        },
    });

    if (!response.ok) {
        return Response.json({ error: "Impossible de mettre à jour le statut du fichier." }, { status: response.status });
    }

    return createJsonResponse(response);
}
