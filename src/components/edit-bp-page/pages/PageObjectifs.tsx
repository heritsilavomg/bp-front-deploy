"use client";
import EditObjectifs from "@/components/edit-bp-page/components/EditObjectifs";
import type { ObjectifsType } from "@/types/bp/general";
import { use, useEffect } from "react";

type PageObjectifsProps = {
    getFieldValue?: (field: string) => any;
    onFieldChange?: (field: string, value: any) => void;
};

export default function PageObjectifs({ getFieldValue, onFieldChange }: PageObjectifsProps) {
    const objectifs = (getFieldValue?.("objectifs") as ObjectifsType | undefined) ?? {};
    const dateCreationPrevue = getFieldValue?.("societe.dateCreationPrevue") as string | undefined;

    const setObjectifs = (next: ObjectifsType) => {
        onFieldChange?.("objectifs", next);
    };

    useEffect(() => {
        if (!dateCreationPrevue) {
            const today = new Date();
            const normalized = new Date(today.getFullYear(), today.getMonth(), 1);
            onFieldChange?.("societe.dateCreationPrevue", normalized.toISOString());
        }
    }, [dateCreationPrevue, onFieldChange]);

    return (
        <div className="rounded-3xl p-6 sm:p-7">
            <EditObjectifs
                dateCreationPrevue={dateCreationPrevue}
                onDateChange={(value) => onFieldChange?.("societe.dateCreationPrevue", value)}
                objectifs={objectifs}
                onObjectifsChange={setObjectifs}
            />
        </div>
    );
}
