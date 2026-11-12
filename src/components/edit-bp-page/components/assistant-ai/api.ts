import type {
    AiConversation,
    AiModificationRequestResult,
    AiStoredModificationProposal,
    AiMessage,
    AiMessagePage,
    CreateAiModificationProposalRequest,
    CreateAiConversationRequest,
    SendAiMessageRequest,
    UpdateAiConversationRequest,
} from "@/types/ai";

type AiRequestBody = CreateAiConversationRequest
    | SendAiMessageRequest
    | UpdateAiConversationRequest
    | CreateAiModificationProposalRequest;
type AiRequestMethod = "GET" | "POST" | "PATCH" | "DELETE";

function stringField(body: unknown, field: string): string | undefined {
    if (typeof body !== "object" || body === null) return undefined;
    const value = (body as Record<string, unknown>)[field];
    return typeof value === "string" ? value : undefined;
}

export class ApiError extends Error {
    /** 0 means no HTTP response: local validation or a network failure. */
    readonly status: number;
    readonly code?: string;
    readonly description?: string;
    readonly body: unknown;

    constructor(status: number, body: unknown, fallback: string, code?: string) {
        super(stringField(body, "message") || stringField(body, "description")
            || (typeof body === "string" && body.trim() ? body : fallback));
        this.name = "ApiError";
        this.status = status;
        this.code = stringField(body, "code") ?? code;
        this.description = stringField(body, "description");
        this.body = body;
    }
}

function requireNonBlank(value: string, field: string) {
    if (typeof value !== "string" || !value.trim()) {
        throw new ApiError(0, null, `${field} ne doit pas etre vide.`, "INVALID_ARGUMENT");
    }
}

async function requestAi<T>(
    path: string,
    method: AiRequestMethod = "GET",
    body?: AiRequestBody,
    expectJson = true,
): Promise<T> {
    let response: Response;
    let text: string;
    try {
        response = await fetch(`/api/ai${path}`, {
            method,
            credentials: "same-origin",
            cache: "no-store",
            headers: body === undefined
                ? { Accept: "application/json" }
                : { Accept: "application/json", "Content-Type": "application/json" },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        text = await response.text();
    } catch {
        throw new ApiError(0, null, "Impossible de joindre le service IA.", "NETWORK_ERROR");
    }

    let payload: unknown = text;
    let isJson = false;
    try {
        payload = JSON.parse(text);
        isJson = true;
    } catch {
        // Keep a non-JSON error body available to the caller.
    }

    if (!response.ok) {
        throw new ApiError(response.status, payload, `Erreur du service IA (HTTP ${response.status}).`);
    }
    if (!expectJson) return undefined as T;
    if (!isJson) {
        throw new ApiError(response.status, payload, "Reponse IA invalide.", "INVALID_RESPONSE");
    }
    return payload as T;
}

export async function createAiConversation(businessPlanId: string): Promise<AiConversation> {
    requireNonBlank(businessPlanId, "businessPlanId");
    return requestAi<AiConversation>("/conversations", "POST", { businessPlanId });
}

export async function getAiConversations(businessPlanId: string): Promise<AiConversation[]> {
    requireNonBlank(businessPlanId, "businessPlanId");
    return requestAi<AiConversation[]>(`/business-plans/${encodeURIComponent(businessPlanId)}/conversations`);
}

export async function getAiConversation(conversationId: string): Promise<AiConversation> {
    requireNonBlank(conversationId, "conversationId");
    return requestAi<AiConversation>(`/conversations/${encodeURIComponent(conversationId)}`);
}

export async function getAiMessages(conversationId: string, page = 0, size = 50): Promise<AiMessagePage> {
    requireNonBlank(conversationId, "conversationId");
    if (!Number.isSafeInteger(page) || page < 0
        || !Number.isSafeInteger(size) || size < 1 || size > 100) {
        throw new ApiError(0, null,
            "page doit etre un entier positif ou nul et size un entier entre 1 et 100.", "INVALID_ARGUMENT");
    }
    const query = new URLSearchParams({ page: String(page), size: String(size) });
    return requestAi<AiMessagePage>(`/conversations/${encodeURIComponent(conversationId)}/messages?${query}`);
}

export async function sendAiMessage(conversationId: string, content: string): Promise<AiMessage> {
    requireNonBlank(conversationId, "conversationId");
    requireNonBlank(content, "content");
    return requestAi<AiMessage>(`/conversations/${encodeURIComponent(conversationId)}/messages`, "POST", { content });
}

export async function updateAiConversationTitle(conversationId: string, title: string): Promise<AiConversation> {
    requireNonBlank(conversationId, "conversationId");
    const normalizedTitle = title.replace(/\s+/g, " ").trim();
    if (!normalizedTitle) {
        throw new ApiError(0, null, "Le titre ne peut pas etre vide.", "INVALID_ARGUMENT");
    }
    if (normalizedTitle.length > 60) {
        throw new ApiError(0, null, "Le titre ne peut pas depasser 60 caracteres.", "INVALID_ARGUMENT");
    }
    return requestAi<AiConversation>(`/conversations/${encodeURIComponent(conversationId)}`,
        "PATCH", { title: normalizedTitle });
}

export async function deleteAiConversation(conversationId: string): Promise<void> {
    requireNonBlank(conversationId, "conversationId");
    await requestAi<void>(`/conversations/${encodeURIComponent(conversationId)}`, "DELETE", undefined, false);
}

export async function createAiModificationProposal(
    conversationId: string,
    content: string,
): Promise<AiModificationRequestResult> {
    requireNonBlank(conversationId, "conversationId");
    requireNonBlank(content, "content");
    return requestAi<AiModificationRequestResult>(
        `/conversations/${encodeURIComponent(conversationId)}/modification-proposals`,
        "POST",
        { content },
    );
}

export async function listAiModificationProposals(
    conversationId: string,
): Promise<AiStoredModificationProposal[]> {
    requireNonBlank(conversationId, "conversationId");
    return requestAi<AiStoredModificationProposal[]>(
        `/conversations/${encodeURIComponent(conversationId)}/modification-proposals`,
    );
}

export async function getAiModificationProposal(
    proposalId: string,
): Promise<AiStoredModificationProposal> {
    requireNonBlank(proposalId, "proposalId");
    return requestAi<AiStoredModificationProposal>(
        `/modification-proposals/${encodeURIComponent(proposalId)}`,
    );
}

export async function applyAiModificationProposal(
    proposalId: string,
): Promise<AiStoredModificationProposal> {
    requireNonBlank(proposalId, "proposalId");
    return requestAi<AiStoredModificationProposal>(
        `/modification-proposals/${encodeURIComponent(proposalId)}/apply`,
        "POST",
    );
}
