import { backendUrl, createJsonResponse, getApiHeaders } from "@/lib/api";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  const { id } = await params;
  const response = await fetch(`${backendUrl}/bp/${encodeURIComponent(id)}/score`, {
    headers: await getApiHeaders(request),
    cache: "no-store",
  });
  return createJsonResponse(response);
}
