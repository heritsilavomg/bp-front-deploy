import { backendUrl, createJsonResponse, getApiHeaders } from "@/lib/api";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  const { id } = await params;
  const response = await fetch(`${backendUrl}/admin/users/${encodeURIComponent(id)}`, {
    headers: await getApiHeaders(request), cache: "no-store",
  });
  return createJsonResponse(response);
}

export async function PUT(request: Request, { params }: Context) {
  const { id } = await params;
  const response = await fetch(`${backendUrl}/admin/users/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: await getApiHeaders(request, { "Content-Type": "application/json" }),
    body: await request.text(),
  });
  return createJsonResponse(response);
}

export async function DELETE(request: Request, { params }: Context) {
  const { id } = await params;
  const response = await fetch(`${backendUrl}/admin/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: await getApiHeaders(request),
  });
  return createJsonResponse(response);
}
