"use client";

import { createContext, ReactNode, useContext } from "react";
import type { FieldCompletionValidator } from "@/hooks/useBpCompletion";

export type BpCompletionContextValue = {
    bpData: Record<string, any> | null;
    getFieldValue: (field: string) => any;
    isFieldFilled: (field: string) => boolean;
    customValidators: FieldCompletionValidator[];
};

const BpCompletionContext = createContext<BpCompletionContextValue | null>(null);

export function BpCompletionProvider({
    children,
    value,
}: {
    children: ReactNode;
    value: BpCompletionContextValue;
}) {
    return <BpCompletionContext.Provider value={value}>{children}</BpCompletionContext.Provider>;
}

export function useBpCompletionContext() {
    const context = useContext(BpCompletionContext);
    if (!context) {
        throw new Error("useBpCompletionContext must be used within a BpCompletionProvider");
    }
    return context;
}
