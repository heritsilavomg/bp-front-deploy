import { proxyAiRequest } from "@/app/api/ai/proxy";

export async function POST(request: Request) {
    return proxyAiRequest(request, "/ai/conversations");
}

