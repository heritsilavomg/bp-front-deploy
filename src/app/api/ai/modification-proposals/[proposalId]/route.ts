import { proxyAiRequest } from "@/app/api/ai/proxy";

export async function GET(request: Request, { params }: {
    params: Promise<{ proposalId: string }>;
}) {
    const { proposalId } = await params;
    return proxyAiRequest(
        request,
        `/ai/modification-proposals/${encodeURIComponent(proposalId)}`,
    );
}
