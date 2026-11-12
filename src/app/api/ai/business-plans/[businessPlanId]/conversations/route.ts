import { proxyAiRequest } from "@/app/api/ai/proxy";

export async function GET(request: Request, { params }: {
    params: Promise<{ businessPlanId: string }>;
}) {
    const { businessPlanId } = await params;
    return proxyAiRequest(request,
        `/ai/business-plans/${encodeURIComponent(businessPlanId)}/conversations`);
}

