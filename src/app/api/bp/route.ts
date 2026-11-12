import { auth } from "@/auth";
import { backendUrl, createJsonResponse, getApiHeaders } from "@/lib/api";

export async function GET(request: Request) {
  const response = await fetch(`${backendUrl}/bp`, { headers: await getApiHeaders(request), cache: "no-store" });
  if (!response.ok) return createJsonResponse(response);
  return Response.json({ data: await response.json() });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || new Date(session.expires) <= new Date()) {
    return Response.json({ isLoggedIn: false }, { status: 401 });
  }
  const response = await fetch(`${backendUrl}/bp`, {
    method: "POST", headers: await getApiHeaders(request, { "Content-Type": "application/json" }), body: await request.text(),
  });
  if (!response.ok) return createJsonResponse(response);
  return Response.json({ data: await response.json() }, { status: response.status });
}
