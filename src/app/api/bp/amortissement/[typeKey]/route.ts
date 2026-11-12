import { NextRequest } from "next/server";
import { backendUrl, createJsonResponse, getApiHeaders } from "@/lib/api";

interface Params {
  params: Promise<{ typeKey: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { typeKey } = await params;
  const response = await fetch(`${backendUrl}/amortissement/amortissement/${encodeURIComponent(typeKey)}`, {
    method: "GET",
    headers: await getApiHeaders(request),
  });

  return createJsonResponse(response);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { typeKey } = await params;
  const response = await fetch(`${backendUrl}/amortissement/amortissement/${encodeURIComponent(typeKey)}`, {
    method: "PUT",
    headers: await getApiHeaders(request),
    body: await request.text(),
  });

  return createJsonResponse(response);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { typeKey } = await params;
  const response = await fetch(`${backendUrl}/amortissement/amortissement/${encodeURIComponent(typeKey)}`, {
    method: "DELETE",
    headers: await getApiHeaders(request),
  });

  return createJsonResponse(response);
}
