import { backendUrl, getApiHeaders, createJsonResponse } from "@/lib/api";

export async function GET(request: Request) {
  const headers = await getApiHeaders(request);
  const response = await fetch(`${backendUrl}/user`, {
    method: "GET",
    headers,
  });

  return createJsonResponse(response);
}

// Public sign-up: forwarded like the former direct browser call, without the session token.
export async function POST(request: Request) {
  const body = await request.text();

  const response = await fetch(`${backendUrl}/user`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body,
  });

  return createJsonResponse(response);
}
