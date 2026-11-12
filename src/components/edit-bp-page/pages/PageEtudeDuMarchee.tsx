"use client";

import dynamic from "next/dynamic";
import { Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ClientsType, ConcurrentType, ZoneImplantationType } from "@/types/bp/general";

const LocationPickerMap = dynamic(
    () => import("@/components/edit-bp-page/components/LocationPickerMap"),
    { ssr: false },
);

type PageEtudeDuMarcheeProps = {
    onFieldChange: (field: string, value: any) => void;
    getFieldValue: (field: string) => any;
};

type FileReference = {
    id: string;
    name: string;
};

const EMPTY_FILE_VALUES: any[] = [];

function createEmptyCompetitor(): ConcurrentType {
    return {
        nomConcurrent: "",
        pointsForts: "",
        pointsFaibles: "",
    };
}

function getFileId(value: any): string | null {
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (!value || typeof value !== "object") return null;
    const id = value.id ?? value.fichierId ?? value.fileId ?? value._id;
    return id === undefined || id === null ? null : String(id);
}

function getFileName(value: any, id: string): string {
    if (!value || typeof value !== "object") return id;
    return value.nom ?? value.nomFichier ?? value.name ?? value.fileName ?? id;
}

export default function PageEtudeDuMarchee({ onFieldChange, getFieldValue }: PageEtudeDuMarcheeProps) {
    const zoneImplantation = (getFieldValue("zoneImplantation") as ZoneImplantationType | undefined) ?? {};
    const clients = (getFieldValue("clients") as ClientsType | undefined) ?? {};
    const concurrents = (getFieldValue("concurrents") as ConcurrentType[] | undefined) ?? [];
    const fichierValues = (getFieldValue("fichiersJoints") as any[] | undefined) ?? EMPTY_FILE_VALUES;
    const [fileReferences, setFileReferences] = useState<FileReference[]>([]);
    const [uploading, setUploading] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function loadFileNames() {
            const ids = fichierValues.map(getFileId).filter((id): id is string => Boolean(id));
            const references = await Promise.all(ids.map(async (id, index) => {
                const originalValue = fichierValues[index];
                try {
                    const response = await fetch(`/api/fichier/fichiers/${encodeURIComponent(id)}`);
                    if (!response.ok) throw new Error("File metadata unavailable");
                    const payload = await response.json();
                    const metadata = payload?.data ?? payload;
                    return { id, name: getFileName(metadata, id) };
                } catch {
                    return { id, name: getFileName(originalValue, id) };
                }
            }));

            if (mounted) setFileReferences(references);
        }

        void loadFileNames();
        return () => {
            mounted = false;
        };
    }, [fichierValues]);

    const updateCompetitor = (index: number, field: keyof ConcurrentType, value: string) => {
        const next = concurrents.map((competitor, currentIndex) =>
            currentIndex === index ? { ...competitor, [field]: value } : competitor,
        );
        onFieldChange("concurrents", next);
    };

    const addCompetitor = () => {
        onFieldChange("concurrents", [...concurrents, createEmptyCompetitor()]);
    };

    const removeCompetitor = (index: number) => {
        onFieldChange("concurrents", concurrents.filter((_, currentIndex) => currentIndex !== index));
    };

    const uploadDocument = async (file?: File) => {
        if (!file) return;
        setUploading(true);
        setFileError(null);

        try {
            let response: Response | null = null;
            let responsePayload: any = null;
            let lastError = "Impossible d'ajouter ce document.";

            for (const categorie of ["DOCUMENT", "AUTRE", "ETUDE_MARCHE"]) {
                const formData = new FormData();
                formData.append("fichier", file);
                formData.append("categorie", categorie);
                response = await fetch("/api/fichier/fichiers/upload", { method: "POST", body: formData });

                const responseText = await response.text();
                try {
                    responsePayload = responseText ? JSON.parse(responseText) : null;
                } catch {
                    responsePayload = null;
                }

                if (response.ok) break;
                lastError = responsePayload?.message || responsePayload?.error || responseText || lastError;
            }

            if (!response?.ok) throw new Error(lastError);

            const payload = responsePayload;
            const uploadedFile = payload?.data ?? payload;
            const id = getFileId(uploadedFile);
            if (!id) throw new Error("L'API n'a pas retourné l'identifiant du document.");

            onFieldChange("fichiersJoints", [...fichierValues, id]);
            setFileReferences((current) => [...current, { id, name: getFileName(uploadedFile, file.name) }]);
        } catch (error) {
            setFileError(error instanceof Error ? error.message : "Impossible d'ajouter ce document.");
        } finally {
            setUploading(false);
        }
    };

    const removeDocument = async (id: string) => {
        setFileError(null);
        try {
            const response = await fetch(`/api/fichier/fichiers/${encodeURIComponent(id)}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Impossible de supprimer ce document.");
            onFieldChange("fichiersJoints", fichierValues.filter((value) => getFileId(value) !== id));
            setFileReferences((current) => current.filter((file) => file.id !== id));
        } catch (error) {
            setFileError(error instanceof Error ? error.message : "Impossible de supprimer ce document.");
        }
    };

    return (
        <section className="rounded-3xl bg-white/90 shadow-2xl">
            <div className="space-y-14 p-6 sm:p-8">
                <section>
                    <span id="informations-sur-mon-activite" />
                    <h2 className="text-xl font-bold text-slate-900">Etude du marché</h2>
                    <label className="mt-6 block text-sm text-slate-700">
                        Informations sur le marché
                        <textarea
                            rows={4}
                            placeholder="Informations sur le marché..."
                            value={getFieldValue("informationsActivite") ?? ""}
                            onChange={(event) => onFieldChange("informationsActivite", event.target.value)}
                            className="mt-3 block w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20"
                        />
                    </label>
                </section>

                <section>
                    <span id="zone-dimplantation" />
                    <h2 className="text-lg font-semibold text-slate-900">Zone d&apos;implantation</h2>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <label className="text-sm text-slate-700 sm:col-span-2">
                            Adresse complète
                            <input type="text" defaultValue={zoneImplantation.adresseComplete ?? ""} onBlur={(event) => onFieldChange("zoneImplantation.adresseComplete", event.target.value)} placeholder="Ex : Lot IV Antananarivo" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20" />
                        </label>
                        <label className="text-sm text-slate-700">
                            Code postal
                            <input type="text" defaultValue={zoneImplantation.codePostal ?? ""} onBlur={(event) => onFieldChange("zoneImplantation.codePostal", event.target.value)} placeholder="Ex : 101" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20" />
                        </label>
                        <label className="text-sm text-slate-700">
                            Ville
                            <input type="text" defaultValue={zoneImplantation.ville ?? ""} onBlur={(event) => onFieldChange("zoneImplantation.ville", event.target.value)} placeholder="Ex : Antananarivo" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20" />
                        </label>
                    </div>
                    <div className="mt-5">
                        <p className="mb-2 text-sm font-medium text-slate-700">Localisation GPS</p>
                        <LocationPickerMap
                            latitude={zoneImplantation.coordonneesGps?.latitude}
                            longitude={zoneImplantation.coordonneesGps?.longitude}
                            onChange={(latitude, longitude) => {
                                onFieldChange("zoneImplantation.coordonneesGps.latitude", latitude);
                                onFieldChange("zoneImplantation.coordonneesGps.longitude", longitude);
                            }}
                        />
                    </div>
                </section>

                <section>
                    <span id="concurrents" />
                    <h2 className="text-lg font-semibold text-slate-900">Concurrents</h2>
                    <p className="mt-5 text-sm text-slate-700">Mes concurrents principaux sont :</p>
                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-400">
                        <div>
                            <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_52px] border-b border-slate-400 bg-slate-50 text-center text-sm text-slate-700 sm:grid">
                                <div className="border-r border-slate-400 px-3 py-3">Nom du concurrent</div>
                                <div className="border-r border-slate-400 px-3 py-3">Points forts</div>
                                <div className="border-r border-slate-400 px-3 py-3">Points faibles</div>
                                <div />
                            </div>
                            {concurrents.map((competitor, index) => (
                                <div key={`competitor-${index}`} className="grid border-b border-slate-400 last:border-b-0 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_52px]">
                                    <div className="border-b border-slate-200 p-2 sm:border-b-0 sm:border-r sm:border-slate-400">
                                        <label className="mb-1 block text-xs text-slate-500 sm:hidden">Nom du concurrent</label>
                                        <input value={competitor.nomConcurrent ?? ""} onChange={(event) => updateCompetitor(index, "nomConcurrent", event.target.value)} placeholder="Nom du concurrent" className="min-w-0 w-full rounded-xl border-0 bg-slate-50 px-3 py-3 text-sm break-words outline-none focus:ring-2 focus:ring-cyan-500/20" />
                                    </div>
                                    <div className="border-b border-slate-200 p-2 sm:border-b-0 sm:border-r sm:border-slate-400">
                                        <label className="mb-1 block text-xs text-slate-500 sm:hidden">Points forts</label>
                                        <textarea value={competitor.pointsForts ?? ""} onChange={(event) => updateCompetitor(index, "pointsForts", event.target.value)} placeholder="Points forts" rows={3} className="min-h-[96px] min-w-0 w-full resize-y whitespace-pre-wrap break-words rounded-xl border-0 bg-slate-50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20" />
                                    </div>
                                    <div className="border-b border-slate-200 p-2 sm:border-b-0 sm:border-r sm:border-slate-400">
                                        <label className="mb-1 block text-xs text-slate-500 sm:hidden">Points faibles</label>
                                        <textarea value={competitor.pointsFaibles ?? ""} onChange={(event) => updateCompetitor(index, "pointsFaibles", event.target.value)} placeholder="Points faibles" rows={3} className="min-h-[96px] min-w-0 w-full resize-y whitespace-pre-wrap break-words rounded-xl border-0 bg-slate-50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20" />
                                    </div>
                                    <div className="flex items-center justify-end p-2 sm:justify-center"><button type="button" onClick={() => removeCompetitor(index)} className="cursor-pointer p-2 text-red-600 transition hover:text-red-800" aria-label="Supprimer ce concurrent" title="Supprimer ce concurrent"><Trash2 size={17} /></button></div>
                                </div>
                            ))}
                            {concurrents.length === 0 && <div className="px-4 py-8 text-center text-sm text-slate-500">Aucun concurrent ajouté.</div>}
                        </div>
                    </div>
                    <button type="button" onClick={addCompetitor} className="mt-4 cursor-pointer rounded-full border border-cyan-600 px-4 py-2 text-sm font-medium text-cyan-700 transition hover:bg-cyan-50">Ajouter un concurrent</button>
                </section>

                <section>
                    <span id="clients" />
                    <h2 className="text-lg font-semibold text-slate-900">Clients</h2>
                    <label className="mt-5 block text-sm text-slate-700">
                        Description de ma clientèle :
                        <textarea rows={4} value={clients.descriptionClients ?? ""} onChange={(event) => onFieldChange("clients.descriptionClients", event.target.value)} placeholder="Décrivez votre clientèle..." className="mt-3 block w-full resize-none rounded-xl border-0 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500/20" />
                    </label>
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-slate-900">Documents annexes liés à votre étude de marché</h2>
                    <p className="mt-4 text-sm leading-6 text-slate-600">Vous pouvez ajouter tout document permettant d&apos;approfondir votre étude de marché (.doc, .docx, .jpeg, .jpg, .pdf, .png)</p>
                    <label className="mt-4 inline-flex cursor-pointer rounded-full border border-cyan-600 px-4 py-2 text-sm font-medium text-cyan-700 transition hover:bg-cyan-50">
                        {uploading ? "Ajout en cours..." : "Ajouter un document"}
                        <input type="file" accept=".doc,.docx,.jpeg,.jpg,.pdf,.png" disabled={uploading} className="hidden" onChange={(event) => { void uploadDocument(event.target.files?.[0]); event.currentTarget.value = ""; }} />
                    </label>
                    {fileError && <p className="mt-3 text-sm text-red-600">{fileError}</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {fileReferences.map((file) => (
                            <div key={file.id} className="inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-600 bg-white px-3 py-1.5 text-sm text-cyan-800">
                                <a href={`/api/fichier/fichiers/${encodeURIComponent(file.id)}/download`} target="_blank" rel="noreferrer" className="max-w-[320px] truncate hover:underline">{file.name}</a>
                                <button type="button" onClick={() => void removeDocument(file.id)} className="cursor-pointer text-cyan-700 hover:text-red-600" aria-label={`Supprimer ${file.name}`} title="Supprimer le document"><X size={16} /></button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </section>
    );
}
