import { backendUrl, createJsonResponse, getApiHeaders } from "@/lib/api";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await fetch(`${backendUrl}/bp/${encodeURIComponent(id)}`, {
    headers: await getApiHeaders(request), cache: "no-store",
  });
  if (!response.ok) return createJsonResponse(response);
  return Response.json({ data: await response.json() });
}
