import { NextRequest } from "next/server";
import { backendUrl, createJsonResponse, getApiHeaders } from "@/lib/api";

interface Params {
  params: Promise<{ code: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { code } = await params;
  const response = await fetch(`${backendUrl}/statutjuridique/statutjuridique/${encodeURIComponent(code)}`, {
    method: "GET",
    headers: await getApiHeaders(request),
  });

  return createJsonResponse(response);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { code } = await params;
  const response = await fetch(`${backendUrl}/statutjuridique/statutjuridique/${encodeURIComponent(code)}`, {
    method: "PUT",
    headers: await getApiHeaders(request),
    body: await request.text(),
  });

  return createJsonResponse(response);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { code } = await params;
  const response = await fetch(`${backendUrl}/statutjuridique/statutjuridique/${encodeURIComponent(code)}`, {
    method: "DELETE",
    headers: await getApiHeaders(request),
  });

  return createJsonResponse(response);
}
