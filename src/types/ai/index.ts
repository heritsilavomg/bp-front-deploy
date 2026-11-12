/** Matches the wire values in the backend openapi-ai.yaml. */
export type AiMessageRole = "user" | "assistant" | "system";

export interface AiConversation {
    id: string;
    businessPlanId: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

export interface AiMessage {
    id: string;
    role: AiMessageRole;
    content: string;
    createdAt: string;
}

export interface AiMessagePage {
    /** Oldest to newest within this page; page 0 contains the latest messages. */
    messages: AiMessage[];
    page: number;
    size: number;
    hasMore: boolean;
}

export interface CreateAiConversationRequest {
    businessPlanId: string;
}

export interface UpdateAiConversationRequest {
    title: string;
}

export interface SendAiMessageRequest {
    content: string;
}

export type AiModificationDecision =
    | "CHAT"
    | "PROPOSAL_READY"
    | "CLARIFICATION_REQUIRED"
    | "UNSUPPORTED";

export type AiModificationProposalStatus = "PENDING" | "APPLIED" | "REJECTED" | "EXPIRED";
export type AiModificationOperation = "SET";
export type AiModificationTargetType = "BUSINESS_PLAN" | "OFFER";
export type AiModificationValueType = "STRING" | "DOUBLE" | "INTEGER" | "OFFER" | "NONE";
export type AiModificationUnit = "TEXT" | "MGA" | "COUNT" | "PERCENTAGE";
export type AiModificationType =
    | "PROJECT_NAME"
    | "PROJECT_HEADQUARTERS_ADDRESS"
    | "PROJECT_DESCRIPTION_SHORT"
    | "PROJECT_DESCRIPTION_DETAILED"
    | "PROJECT_ACTIVITY_INFORMATION"
    | "OBJECTIVE_SHORT_TERM"
    | "OBJECTIVE_MEDIUM_TERM"
    | "OBJECTIVE_LONG_TERM"
    | "CUSTOMER_DESCRIPTION"
    | "CUSTOMER_CATCHMENT_AREA"
    | "EMERGENCY_RISK_SCENARIOS"
    | "EMERGENCY_ACTIVATION_PROTOCOL"
    | "GROWTH_YEAR_2_RATE"
    | "GROWTH_YEAR_3_RATE"
    | "OFFER_CREATE"
    | "OFFER_DELETE"
    | "OFFER_NAME"
    | "OFFER_DESCRIPTION"
    | "OFFER_SALE_PRICE_HT"
    | "OFFER_UNIT_COST_HT"
    | "OFFER_FIRST_YEAR_SALES_COUNT";

export interface AiModificationTarget {
    targetType: AiModificationTargetType;
    offerName?: string | null;
    offerId?: string | null;
}

export interface AiOfferCreatePayload {
    name: string;
    description: string;
    offerType: "PRODUIT" | "SERVICE";
    salePriceHt: number;
    unitCostHt: number;
    saleVat: number;
    costVat: number;
    salesCount: number;
    salesFrequency: "QUOTIDIENNE" | "HEBDOMADAIRE" | "MENSUELLE" | "TRIMESTRIELLE" | "ANNUELLE";
}

export interface AiProposedChange {
    createOffer?: AiOfferCreatePayload | null;
    createdOfferId?: string | null;
    oldOfferFingerprint?: string | null;
    type: AiModificationType;
    operation: AiModificationOperation;
    target: AiModificationTarget;
    valueType: AiModificationValueType;
    oldStringValue?: string | null;
    newStringValue?: string | null;
    oldDoubleValue?: number | null;
    newDoubleValue?: number | null;
    oldIntegerValue?: number | null;
    newIntegerValue?: number | null;
    unit: AiModificationUnit;
    requiresFinancialRecalculation: boolean;
}

export interface AiStoredModificationProposal {
    id: string;
    conversationId: string;
    businessPlanId: string;
    assistantMessageId?: string | null;
    status: AiModificationProposalStatus;
    summary: string;
    changes: AiProposedChange[];
    createdAt: string;
    updatedAt: string;
    expiresAt: string;
    appliedAt?: string | null;
}

export interface AiModificationRequestResult {
    decision: AiModificationDecision;
    message: string;
    proposal?: AiStoredModificationProposal | null;
}

export interface CreateAiModificationProposalRequest {
    content: string;
}
