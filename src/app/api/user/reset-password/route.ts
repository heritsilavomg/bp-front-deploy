import { backendUrl, createJsonResponse } from "@/lib/api";

// Public endpoint: no session token, as with the former direct browser call.
export async function POST(request: Request) {
  const body = await request.text();

  const response = await fetch(`${backendUrl}/user/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  return createJsonResponse(response);
}
