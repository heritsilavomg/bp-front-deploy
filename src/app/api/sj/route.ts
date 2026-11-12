import { NextRequest } from "next/server";
import { backendUrl, createJsonResponse, getApiHeaders } from "@/lib/api";

export async function GET(request: NextRequest) {
    const response = await fetch(`${backendUrl}/statutjuridique/statutjuridique`, {
        method: "GET",
        headers: await getApiHeaders(request),
    });

    return createJsonResponse(response);
}

export async function POST(request: NextRequest) {
    const response = await fetch(`${backendUrl}/statutjuridique/statutjuridique`, {
        method: "POST",
        headers: await getApiHeaders(request),
        body: await request.text(),
    });

    return createJsonResponse(response);
}
