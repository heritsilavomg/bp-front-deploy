import { aiErrorResponse, proxyAiRequest } from "@/app/api/ai/proxy";

type Params = { params: Promise<{ conversationId: string }> };

export async function GET(request: Request, { params }: Params) {
    const { conversationId } = await params;
    const searchParams = new URL(request.url).searchParams;
    const pageValue = searchParams.get("page") ?? "0";
    const sizeValue = searchParams.get("size") ?? "50";
    const page = Number(pageValue);
    const size = Number(sizeValue);

    if (!/^\d+$/.test(pageValue) || !Number.isSafeInteger(page) || page < 0
        || !/^\d+$/.test(sizeValue) || !Number.isSafeInteger(size) || size < 1 || size > 100) {
        return aiErrorResponse(400, "INVALID_PAGINATION",
            "page doit etre un entier positif ou nul et size un entier entre 1 et 100.");
    }

    const query = new URLSearchParams({ page: String(page), size: String(size) });
    return proxyAiRequest(request,
        `/ai/conversations/${encodeURIComponent(conversationId)}/messages?${query}`);
}

export async function POST(request: Request, { params }: Params) {
    const { conversationId } = await params;
    return proxyAiRequest(request, `/ai/conversations/${encodeURIComponent(conversationId)}/messages`);
}

