import { NextRequest } from "next/server";
import { backendUrl, createJsonResponse, getApiHeaders } from "@/lib/api";

export async function GET(request: NextRequest) {
  const response = await fetch(`${backendUrl}/config/config/keys`, {
    method: "GET",
    headers: await getApiHeaders(request),
  });

  return createJsonResponse(response);
}
