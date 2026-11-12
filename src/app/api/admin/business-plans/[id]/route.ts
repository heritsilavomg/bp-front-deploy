import { backendUrl, createJsonResponse, getApiHeaders } from "@/lib/api";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return createJsonResponse(await fetch(`${backendUrl}/admin/business-plans/${encodeURIComponent(id)}`, {
    headers: await getApiHeaders(request), cache: "no-store",
  }));
}
