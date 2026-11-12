"use client";

import { useEffect, useRef, useState } from "react";

type ImageUploadCardProps = {
    value?: string;
    onUpload?: (file: File) => void;
    onRemove?: () => void;
    height?: number | string;
    width?: number | string;
    label?: string;
    accept?: string;
};

export default function ImageUploadCard({
    value,
    onUpload,
    onRemove,
    height = 280,
    width = "100%",
    label = "Choisir une image de couverture",
    accept = "image/*",
}: ImageUploadCardProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(value ?? null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [hovered, setHovered] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (value) {
            setPreviewUrl(value);
        }
    }, [value]);

    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const containerStyle = {
        height: typeof height === "number" ? `${height}px` : height,
        width: typeof width === "number" ? `${width}px` : width,
    };

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setFileName(file.name);

        if (onUpload) {
            onUpload(file);
        }
    }

    function handleRemove() {
        if (previewUrl && previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setFileName(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
        onRemove?.();
    }

    function triggerFileDialog() {
        inputRef.current?.click();
    }

    return (
        <div
            className="group relative mx-auto overflow-hidden border border-slate-200/80 bg-slate-100 text-center shadow-sm transition-shadow duration-300 hover:shadow-lg cursor-pointer"
            style={containerStyle}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={triggerFileDialog}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleFileChange}
            />

            <div className="absolute inset-0 bg-slate-950/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex flex-col items-center gap-3 rounded-3xl bg-slate-950/80 px-6 py-4 text-center text-white shadow-xl backdrop-blur-sm">
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            triggerFileDialog();
                        }}
                        className="cursor-pointer inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-500/30 transition hover:bg-emerald-400"
                    >
                        Uploader
                    </button>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            handleRemove();
                        }}
                        className="cursor-pointer inline-flex items-center justify-center rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-red-500/30 transition hover:bg-red-400"
                    >
                        Supprimer
                    </button>
                </div>
            </div>

            {previewUrl ? (
                <div className="h-full w-full">
                    <img
                        src={previewUrl}
                        alt={fileName ? `Aperçu de ${fileName}` : "Aperçu de l'image"}
                        className="h-full w-full object-cover"
                    />
                </div>
            ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-8 text-slate-500">
                    <div className="rounded-full bg-slate-200 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-600 shadow-sm">
                        {label}
                    </div>
                    <span className="text-sm text-slate-600">Cliquez pour sélectionner</span>
                    <button
                        type="button"
                        onClick={triggerFileDialog}
                        className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                        Choisir un fichier
                    </button>
                </div>
            )}
        </div>
    );
}
