import { backendUrl, getApiHeaders, createJsonResponse } from "@/lib/api";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headers = await getApiHeaders(request);
  const response = await fetch(`${backendUrl}/user/${encodeURIComponent(id)}`, {
    method: "GET",
    headers,
  });

  return createJsonResponse(response);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headers = await getApiHeaders(request);
  const body = await request.text();

  const response = await fetch(`${backendUrl}/user/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers,
    body,
  });

  return createJsonResponse(response);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headers = await getApiHeaders(request);
  const response = await fetch(`${backendUrl}/user/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers,
  });

  return createJsonResponse(response);
}
