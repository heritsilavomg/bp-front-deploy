import { useCallback, useMemo } from "react";

export type FieldCompletionValidator = (
    field: string,
    value: any,
    getFieldValue: (field: string) => any,
) => boolean | undefined;

const isFilledValue = (value: any): boolean => {
    if (value === undefined || value === null) return false;

    if (typeof value === "number") {
        return !Number.isNaN(value) && value !== 0;
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.length === 0) return false;

        const numericValue = Number(trimmed);
        if (!Number.isNaN(numericValue)) {
            return numericValue !== 0;
        }

        return true;
    }

    if (typeof value === "boolean") return value;

    if (Array.isArray(value)) {
        return value.some((item) => {
            if (item === undefined || item === null) return false;
            if (typeof item === "number") return !Number.isNaN(item) && item !== 0;
            if (typeof item === "string") {
                const trimmed = item.trim();
                if (trimmed.length === 0) return false;
                const numericValue = Number(trimmed);
                if (!Number.isNaN(numericValue)) {
                    return numericValue !== 0;
                }
                return true;
            }
            if (typeof item === "object") return Object.keys(item).length > 0;
            return Boolean(item);
        });
    }

    if (typeof value === "object") return Object.keys(value).length > 0;

    return Boolean(value);
};

export function useBpCompletion(
    bpData: Record<string, any> | null,
    getFieldValue: (field: string) => any,
    customValidators: FieldCompletionValidator[] = [],
) {
    const isFieldFilled = useCallback(
        (field: string) => {
            const value = getFieldValue(field);
            for (const validator of customValidators) {
                const result = validator(field, value, getFieldValue);
                if (typeof result === "boolean") {
                    return result;
                }
            }
            return isFilledValue(value);
        },
        [customValidators, getFieldValue],
    );

    const getCompletionMap = useCallback(
        (fields: Record<string, string | string[]>) => {
            return Object.entries(fields).reduce((map, [key, fieldOrFields]) => {
                const keys = Array.isArray(fieldOrFields) ? fieldOrFields : [fieldOrFields];
                map.set(key, keys.some((field) => isFieldFilled(field)));
                return map;
            }, new Map<string, boolean>());
        },
        [isFieldFilled],
    );

    const getOverallCompletion = useCallback(
        (sections: { title: string; items: string[] }[]) => {
            const total = sections.reduce((acc, section) => acc + section.items.length, 0);
            const completed = sections.reduce(
                (acc, section) => acc + section.items.reduce((count, item) => count + (isFieldFilled(item) ? 1 : 0), 0),
                0,
            );
            return total === 0 ? 0 : Math.round((completed / total) * 100);
        },
        [isFieldFilled],
    );

    const bpDataMemo = useMemo(
        () => ({ bpData, getFieldValue, isFieldFilled, getCompletionMap, getOverallCompletion }),
        [bpData, getFieldValue, isFieldFilled, getCompletionMap, getOverallCompletion],
    );

    return bpDataMemo;
}
