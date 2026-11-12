import { backendUrl, createJsonResponse, getApiHeaders } from "@/lib/api";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const response = await fetch(`${backendUrl}/admin/business-plans?${params}`, {
    headers: await getApiHeaders(request), cache: "no-store",
  });
  return createJsonResponse(response);
}
