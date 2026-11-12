import { mergeSavedOfferIds, offersForSave } from "@/lib/offerIdentity";
import { useCallback, useEffect, useRef, useState } from "react";
import { adaptMounthForLocldate, adaptMounthForDate } from "@/lib/api";

type Toast = {
    type: "saving" | "success" | "error";
    message: string;
};

type UseBpEditorResult = {
    bpData: Record<string, any> | null;
    coverImagePreview: string | null;
    logoImagePreview: string | null;
    isSaving: boolean;
    isLoading: boolean;
    saveMessage: string | null;
    saveError: string | null;
    savedRevision: number;
    toast: Toast | null;
    getFieldValue: (field: string) => any;
    handleFieldChange: (field: string, value: any) => void;
    handleFieldChangeWithDelay: (field: string, value: any, delay?: number) => void;
    flushPendingChanges: () => Promise<void>;
    reloadBusinessPlan: () => Promise<void>;
    handleUpload: (file: File, categorie?: "COUVERTURE" | "LOGO") => Promise<void>;
    handleRemove: (categorie?: "COUVERTURE" | "LOGO") => void;
};

function normalizeAssociates(value: unknown) {
    if (!Array.isArray(value)) return value;

    return value.map((associate) => {
        if (!associate || typeof associate !== "object") return associate;

        const item = associate as Record<string, any>;
        return {
            numeroAssocie: item.numeroAssocie,
            nomPrenom: item.nomPrenom ?? "",
            dateNaiss: item.dateNaiss ?? "",
            situationActuelle: item.situationActuelle ?? undefined,
            autreSituation: item.autreSituation ?? "",
            typeProjetEtudiant: item.typeProjetEtudiant ?? undefined,
            parcoursEtMotivation: item.parcoursEtMotivation ?? "",
            fichierCV: item.fichierCV ?? "",
            recevoirSalaire: item.recevoirSalaire ?? false,
            montantSalaire: item.montantSalaire ?? 0,
            frequenceSalaire: item.frequenceSalaire ?? undefined,
            anneeDebutReceptionSalaire: item.anneeDebutReceptionSalaire ?? 0,
            moisDebutReceptionSalaire: item.moisDebutReceptionSalaire ?? 0,
        };
    });
}

function normalizeEquipeDatesForDisplay(value: unknown) {
    if (!Array.isArray(value)) return value;

    return value.map((member) => {
        if (!member || typeof member !== "object") return member;

        const row = member as Record<string, any>;
        if (typeof row.dateEmbauche !== "string" || !row.dateEmbauche) {
            return row;
        }

        const parsedDate = new Date(row.dateEmbauche);
        if (Number.isNaN(parsedDate.getTime())) {
            return row;
        }

        return {
            ...row,
            dateEmbauche: adaptMounthForDate(parsedDate).toISOString(),
        };
    });
}

function normalizeBpData(value: Record<string, any> | null): Record<string, any> {
    const data = value ?? {};

    return {
        ...data,
        associe: normalizeAssociates(data.associe),
        equipe: normalizeEquipeDatesForDisplay(data.equipe),
    };
}

export function updateArrayFieldItemUsingIndex<T extends Record<string, any>>(
    items: T[],
    index: number,
    field: keyof T,
    value: T[keyof T],
): T[] {
    if (index < 0 || index >= items.length) return items;

    return items.map((item, currentIndex) =>
        currentIndex === index ? { ...item, [field]: value } : item,
    );
}

export function updateArrayFieldItemUsingMatchingKeyValue<
    T extends Record<string, any>,
    K extends keyof T,
>(
    items: T[],
    matchingKey: K,
    matchingValue: T[K],
    field: keyof T,
    value: T[keyof T],
): T[] {
    return items.map((item) =>
        item[matchingKey] === matchingValue ? { ...item, [field]: value } : item,
    );
}

export default function useBpEditor(bpId?: string): UseBpEditorResult {
    const [bpData, setBpData] = useState<Record<string, any> | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [logoImagePreview, setLogoImagePreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(Boolean(bpId));
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [savedRevision, setSavedRevision] = useState(0);
    const [toast, setToast] = useState<Toast | null>(null);
    const pendingChangesRef = useRef<Record<string, any>>({});
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const savePromiseRef = useRef<Promise<void> | null>(null);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMountedRef = useRef(true);
    const autosaveGenerationRef = useRef(0);
    const loadGenerationRef = useRef(0);

    const setNestedValue = useCallback((obj: Record<string, any>, path: string, value: any) => {
        const keys = path.split(".");
        const newObj = { ...obj };
        let current = newObj;

        for (let index = 0; index < keys.length - 1; index += 1) {
            const key = keys[index];
            current[key] = current[key] && typeof current[key] === "object"
                ? { ...current[key] }
                : {};
            current = current[key];
        }

        current[keys[keys.length - 1]] = value;
        return newObj;
    }, []);

    const getNestedValue = useCallback((obj: Record<string, any> | null, path: string) => {
        if (!obj) return undefined;

        return path.split(".").reduce<any>((current, key) => {
            if (current === null || current === undefined || typeof current !== "object") {
                return undefined;
            }
            return current[key];
        }, obj);
    }, []);

    const saveChanges = useCallback(async (): Promise<void> => {
        if (savePromiseRef.current) {
            return savePromiseRef.current.then(() => {
                // An edit may have arrived while the current request was in flight.
                // Reuse the same save path once it has completed.
                if (Object.keys(pendingChangesRef.current).length > 0) return saveChanges();
            });
        }
        if (!bpId) {
            const error = new Error("Aucun identifiant de BP n'est défini.");
            setSaveError(error.message);
            throw error;
        }

        const changes = { ...pendingChangesRef.current };
        if (Object.keys(changes).length === 0) return;

        const request = (async () => {
            setIsSaving(true);
            setSaveError(null);
            setSaveMessage(null);
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            setToast({ type: "saving", message: "Enregistrement..." });

            try {
            const nestedPayload = Object.entries(changes).reduce(
                (payload, [key, value]) => setNestedValue(payload, key, value),
                {} as Record<string, any>,
            );
            if ("associe" in nestedPayload) {
                nestedPayload.associe = normalizeAssociates(nestedPayload.associe);
            }
            if (Array.isArray(nestedPayload.equipe)) {
                nestedPayload.equipe = nestedPayload.equipe.map((member) => {
                    if (!member || typeof member !== "object") return member;

                    const row = { ...member } as Record<string, any>;
                    if (typeof row.dateEmbauche === "string" && row.dateEmbauche) {
                        const parsedDate = new Date(row.dateEmbauche);
                        if (!Number.isNaN(parsedDate.getTime())) {
                            row.dateEmbauche = adaptMounthForLocldate(parsedDate).toISOString();
                        }
                    }

                    return row;
                });
            }
            const submittedOffers = nestedPayload.offres;
            if (Array.isArray(submittedOffers)) nestedPayload.offres = offersForSave(submittedOffers);
            const response = await fetch("/api/bp", {
                method: "POST",
                headers: { "Content-Type": "application/json", accept: "application/json" },
                body: JSON.stringify({ id: bpId, ...nestedPayload }),
            });

            if (!response.ok) {
                const responsePayload = await response.json().catch(() => null);
                throw new Error(responsePayload?.message || "Erreur lors de l'enregistrement du BP.");
            }

            if (Array.isArray(submittedOffers)) {
                const savedPayload = await response.json();
                const savedOffers = savedPayload?.data?.offres;
                if (Array.isArray(savedOffers)) {
                    setBpData(current => current && Array.isArray(current.offres)
                        ? { ...current, offres: mergeSavedOfferIds(current.offres, submittedOffers, savedOffers) } : current);
                    // Pending edits retain their content and receive only server-assigned identities.
                    if (Array.isArray(pendingChangesRef.current.offres) && pendingChangesRef.current.offres !== changes.offres) {
                        pendingChangesRef.current.offres = mergeSavedOfferIds(pendingChangesRef.current.offres, submittedOffers, savedOffers);
                    }
                }
            }

                // Keep edits made while the POST was in flight for the next save.
                for (const [field, value] of Object.entries(changes)) {
                    if (pendingChangesRef.current[field] === value) {
                        delete pendingChangesRef.current[field];
                    }
                }
                setSaveMessage("Modifications enregistrées.");
                setSavedRevision(revision => revision + 1);
                setToast({ type: "success", message: "Modifications enregistrées." });
                toastTimerRef.current = setTimeout(() => setToast(null), 2200);
            } catch (error) {
                const message = error instanceof Error ? error.message : "Erreur lors de l'enregistrement.";
                setSaveError(message);
                setToast({ type: "error", message });
                if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                toastTimerRef.current = setTimeout(() => setToast(null), 4000);
                throw error;
            } finally {
                savePromiseRef.current = null;
                setIsSaving(false);
            }
        })();
        savePromiseRef.current = request;
        return request;
    }, [bpId, setNestedValue]);

    const scheduleSave = useCallback((delay = 800) => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        const autosaveGeneration = autosaveGenerationRef.current;
        saveTimerRef.current = setTimeout(() => {
            saveTimerRef.current = null;
            if (autosaveGenerationRef.current !== autosaveGeneration) return;
            void saveChanges().catch(() => undefined);
        }, delay);
    }, [saveChanges]);

    const flushPendingChanges = useCallback(async (): Promise<void> => {
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
            saveTimerRef.current = null;
        }

        // A save may have started from autosave. Await it, then persist edits that
        // arrived while it was in flight, so the AI always sees the latest BP.
        while (savePromiseRef.current || Object.keys(pendingChangesRef.current).length > 0) {
            if (savePromiseRef.current) await savePromiseRef.current;
            else await saveChanges();
        }
    }, [saveChanges]);

    const updateField = useCallback((field: string, value: any, delay = 800) => {
        setBpData((currentData) => setNestedValue(currentData ?? {}, field, value));
        pendingChangesRef.current = { ...pendingChangesRef.current, [field]: value };
        scheduleSave(delay);
    }, [scheduleSave, setNestedValue]);

    const loadBusinessPlan = useCallback(async (): Promise<void> => {
        if (!bpId) return;
        const loadGeneration = ++loadGenerationRef.current;
        try {
            setIsLoading(true);
            const response = await fetch(`/api/bp/getById/${encodeURIComponent(bpId)}`, {
                cache: "no-store",
            });
            if (!response.ok) throw new Error("Impossible de charger le business plan.");

            const payload = await response.json();
            if (!isMountedRef.current || loadGenerationRef.current !== loadGeneration) return;

            const data = normalizeBpData(payload?.data ?? null);
            setBpData(data);
            setSavedRevision(revision => revision + 1);
            setCoverImagePreview(data.idImageCouverture
                ? `/api/fichier/fichiers/${encodeURIComponent(data.idImageCouverture)}/view`
                : null);
            setLogoImagePreview(data.idImageLogo
                ? `/api/fichier/fichiers/${encodeURIComponent(data.idImageLogo)}/view`
                : null);
            setSaveError(null);
        } catch (error) {
            if (isMountedRef.current && loadGenerationRef.current === loadGeneration) {
                setSaveError(error instanceof Error
                    ? error.message
                    : "Erreur lors du chargement du business plan.");
                throw error;
            }
        } finally {
            if (isMountedRef.current && loadGenerationRef.current === loadGeneration) {
                setIsLoading(false);
            }
        }
    }, [bpId]);

    const reloadBusinessPlan = useCallback(async (): Promise<void> => {
        // Invalidate every timer created against the pre-APPLY local snapshot.
        autosaveGenerationRef.current += 1;
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
            saveTimerRef.current = null;
        }
        if (savePromiseRef.current) await savePromiseRef.current;
        pendingChangesRef.current = {};
        setSaveMessage(null);
        await loadBusinessPlan();
    }, [loadBusinessPlan]);

    useEffect(() => {
        if (!bpId) return;
        isMountedRef.current = true;
        void loadBusinessPlan().catch(() => undefined);
        return () => {
            isMountedRef.current = false;
            loadGenerationRef.current += 1;
            autosaveGenerationRef.current += 1;
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
                saveTimerRef.current = null;
            }
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            void saveChanges().catch(() => undefined);
        };
    }, [bpId, loadBusinessPlan, saveChanges]);

    const handleUpload = useCallback(async (file: File, categorie: "COUVERTURE" | "LOGO" = "COUVERTURE") => {
        setSaveError(null);
        setSaveMessage(null);
        const formData = new FormData();
        formData.append("fichier", file);
        formData.append("categorie", categorie);
        if (bpId) formData.append("businessPlanId", bpId);

        try {
            const response = await fetch("/api/fichier/fichiers/upload", { method: "POST", body: formData });
            if (!response.ok) throw new Error("Impossible d'uploader l'image.");

            const data = await response.json();
            const id = data?.id?.toString() ?? null;
            if (categorie === "COUVERTURE") setCoverImagePreview(URL.createObjectURL(file));
            else setLogoImagePreview(URL.createObjectURL(file));
            updateField(categorie === "COUVERTURE" ? "idImageCouverture" : "idImageLogo", id);
            setSaveMessage("Image uploadée (enregistrement automatique déclenché).");
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : "Erreur pendant l'upload du fichier.");
            setSaveMessage(null);
        }
    }, [bpId, updateField]);

    const handleRemove = useCallback((categorie: "COUVERTURE" | "LOGO" = "COUVERTURE") => {
        updateField(categorie === "COUVERTURE" ? "idImageCouverture" : "idImageLogo", null);
        if (categorie === "COUVERTURE") setCoverImagePreview(null);
        else setLogoImagePreview(null);
        setSaveMessage(null);
        setSaveError(null);
    }, [updateField]);

    const getFieldValue = useCallback((field: string) => getNestedValue(bpData, field), [bpData, getNestedValue]);
    const handleFieldChange = useCallback((field: string, value: any) => updateField(field, value), [updateField]);
    const handleFieldChangeWithDelay = useCallback((field: string, value: any, delay = 800) => updateField(field, value, delay), [updateField]);

    return {
        bpData,
        coverImagePreview,
        logoImagePreview,
        isSaving,
        isLoading,
        saveMessage,
        saveError,
        savedRevision,
        toast,
        getFieldValue,
        handleFieldChange,
        handleFieldChangeWithDelay,
        flushPendingChanges,
        reloadBusinessPlan,
        handleUpload,
        handleRemove,
    };
}
