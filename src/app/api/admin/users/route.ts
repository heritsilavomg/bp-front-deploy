import { backendUrl, createJsonResponse, getApiHeaders } from "@/lib/api";

export async function GET(request: Request) {
  const url = new URL(`${backendUrl}/admin/users`);
  new URL(request.url).searchParams.forEach((value, key) => url.searchParams.set(key, value));
  const response = await fetch(url, { headers: await getApiHeaders(request), cache: "no-store" });
  return createJsonResponse(response);
}

export async function POST(request: Request) {
  const response = await fetch(`${backendUrl}/admin/users`, {
    method: "POST",
    headers: await getApiHeaders(request, { "Content-Type": "application/json" }),
    body: await request.text(),
  });
  return createJsonResponse(response);
}
