import { proxyAiRequest } from "@/app/api/ai/proxy";

export async function GET(request: Request, { params }: {
    params: Promise<{ conversationId: string }>;
}) {
    const { conversationId } = await params;
    return proxyAiRequest(request, `/ai/conversations/${encodeURIComponent(conversationId)}`);
}

export async function PATCH(request: Request, { params }: {
    params: Promise<{ conversationId: string }>;
}) {
    const { conversationId } = await params;
    return proxyAiRequest(request, `/ai/conversations/${encodeURIComponent(conversationId)}`);
}

export async function DELETE(request: Request, { params }: {
    params: Promise<{ conversationId: string }>;
}) {
    const { conversationId } = await params;
    return proxyAiRequest(request, `/ai/conversations/${encodeURIComponent(conversationId)}`);
}
