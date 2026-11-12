import { backendUrl, createJsonResponse, getApiHeaders } from "@/lib/api";

export async function GET(request: Request) {
  const response = await fetch(`${backendUrl}/admin/scoring`, {
    headers: await getApiHeaders(request),
    cache: "no-store",
  });
  return createJsonResponse(response);
}

export async function PUT(request: Request) {
  const response = await fetch(`${backendUrl}/admin/scoring`, {
    method: "PUT",
    headers: await getApiHeaders(request, { "Content-Type": "application/json" }),
    body: await request.text(),
  });
  return createJsonResponse(response);
}
