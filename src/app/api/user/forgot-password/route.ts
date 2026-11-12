import { backendUrl, createJsonResponse } from "@/lib/api";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  if (!email) {
    return Response.json({ error: "Le paramètre email est requis." }, { status: 400 });
  }

  // Public endpoint: no session token, as with the former direct browser call.
  const response = await fetch(`${backendUrl}/user/forgot-password?email=${encodeURIComponent(email)}`, {
    method: "GET",
  });

  return createJsonResponse(response);
}
