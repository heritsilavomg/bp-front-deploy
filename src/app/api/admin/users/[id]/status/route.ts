import { backendUrl, createJsonResponse, getApiHeaders } from "@/lib/api";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  const response = await fetch(`${backendUrl}/admin/users/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: await getApiHeaders(request, { "Content-Type": "application/json" }),
    body: await request.text(),
  });
  return createJsonResponse(response);
}
