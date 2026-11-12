"use client";

import { useEffect, useRef } from "react";

type DeleteConversationDialogProps = {
    title: string;
    isDeleting: boolean;
    errorMessage: string | null;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function DeleteConversationDialog({
    title, isDeleting, errorMessage, onCancel, onConfirm,
}: DeleteConversationDialogProps) {
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        cancelButtonRef.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isDeleting) onCancel();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isDeleting, onCancel]);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4"
            onMouseDown={(event) => {
                if (event.currentTarget === event.target && !isDeleting) onCancel();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-conversation-title"
                className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900"
            >
                <h2 id="delete-conversation-title" className="text-lg font-semibold text-slate-900 dark:text-white">
                    Supprimer cette conversation ?
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    <span className="font-medium text-slate-800 dark:text-slate-100">{title}</span> et tout son historique seront supprimés définitivement, y compris sa mémoire conversationnelle.
                </p>
                {errorMessage && (
                    <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
                        {errorMessage}
                    </p>
                )}
                <div className="mt-5 flex justify-end gap-3">
                    <button
                        ref={cancelButtonRef}
                        type="button"
                        disabled={isDeleting}
                        onClick={onCancel}
                        className="min-h-10 rounded-lg px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        disabled={isDeleting}
                        onClick={onConfirm}
                        className="min-h-10 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isDeleting ? "Suppression…" : "Supprimer"}
                    </button>
                </div>
            </section>
        </div>
    );
}
