import { proxyAiRequest } from "@/app/api/ai/proxy";

type Params = { params: Promise<{ conversationId: string }> };

export async function GET(request: Request, { params }: Params) {
    const { conversationId } = await params;
    return proxyAiRequest(
        request,
        `/ai/conversations/${encodeURIComponent(conversationId)}/modification-proposals`,
    );
}

export async function POST(request: Request, { params }: Params) {
    const { conversationId } = await params;
    return proxyAiRequest(
        request,
        `/ai/conversations/${encodeURIComponent(conversationId)}/modification-proposals`,
    );
}
