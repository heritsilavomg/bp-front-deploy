"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import type { AiConversation } from "@/types/ai";
import { ApiError } from "../api";
import ConversationActionsMenu from "./ConversationActionsMenu";
import DeleteConversationDialog from "./DeleteConversationDialog";

type AiConversationListProps = {
    conversations: AiConversation[];
    activeConversationId: string | null;
    isLoading: boolean;
    disabled?: boolean;
    renamingConversationId: string | null;
    deletingConversationId: string | null;
    errorMessage: string | null;
    onSelect: (id: string) => void;
    onNewConversation: () => void;
    onRetry: () => void;
    onRename: (id: string, title: string) => Promise<AiConversation>;
    onDelete: (id: string) => Promise<void>;
};

function formatUpdatedAt(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const elapsedMinutes = Math.floor((Date.now() - date.getTime()) / 60_000);
    if (elapsedMinutes < 1) return "À l'instant";
    if (elapsedMinutes < 60) return `Il y a ${elapsedMinutes} min`;
    if (elapsedMinutes < 24 * 60) return `Il y a ${Math.floor(elapsedMinutes / 60)} h`;
    return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(date);
}

function normalizeTitle(value: string): string {
    return value.replace(/\s+/g, " ").trim();
}

function actionErrorMessage(error: unknown, action: "rename" | "delete"): string {
    if (error instanceof ApiError) {
        if (error.status === 401) return "Votre session a expiré.";
        if (error.status === 403) return `Vous ne pouvez pas ${action === "rename" ? "modifier" : "supprimer"} cette conversation.`;
        if (error.status === 404) return "Cette conversation n'existe plus.";
        if (error.status === 0 && error.code === "INVALID_ARGUMENT") return error.message;
    }
    return action === "rename" ? "Impossible de renommer la conversation." : "Impossible de supprimer la conversation.";
}

export default function AiConversationList({
    conversations, activeConversationId, isLoading, disabled = false,
    renamingConversationId, deletingConversationId, errorMessage,
    onSelect, onNewConversation, onRetry, onRename, onDelete,
}: AiConversationListProps) {
    const rootRef = useRef<HTMLElement>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [renameError, setRenameError] = useState<string | null>(null);
    const [conversationToDelete, setConversationToDelete] = useState<AiConversation | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        const closeOutsideMenu = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpenMenuId(null);
        };
        const closeOnEscape = (event: globalThis.KeyboardEvent) => {
            if (event.key === "Escape" && !conversationToDelete && !editingConversationId) setOpenMenuId(null);
        };
        document.addEventListener("pointerdown", closeOutsideMenu);
        window.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeOutsideMenu);
            window.removeEventListener("keydown", closeOnEscape);
        };
    }, [conversationToDelete, editingConversationId]);

    const startRename = (conversation: AiConversation) => {
        setOpenMenuId(null);
        setEditingConversationId(conversation.id);
        setEditingTitle(conversation.title);
        setRenameError(null);
    };

    const cancelRename = () => {
        if (renamingConversationId) return;
        setEditingConversationId(null);
        setEditingTitle("");
        setRenameError(null);
    };

    const submitRename = async (event: FormEvent<HTMLFormElement>, conversation: AiConversation) => {
        event.preventDefault();
        const normalizedTitle = normalizeTitle(editingTitle);
        if (!normalizedTitle) {
            setRenameError("Le titre ne peut pas être vide.");
            return;
        }
        if (normalizedTitle.length > 60) {
            setRenameError("Le titre ne peut pas dépasser 60 caractères.");
            return;
        }
        if (normalizedTitle === normalizeTitle(conversation.title)) {
            cancelRename();
            return;
        }
        setRenameError(null);
        try {
            await onRename(conversation.id, normalizedTitle);
            setEditingConversationId(null);
            setEditingTitle("");
        } catch (error) {
            setRenameError(actionErrorMessage(error, "rename"));
        }
    };

    const confirmDelete = async () => {
        if (!conversationToDelete) return;
        setDeleteError(null);
        try {
            await onDelete(conversationToDelete.id);
            setConversationToDelete(null);
            setOpenMenuId(null);
        } catch (error) {
            setDeleteError(actionErrorMessage(error, "delete"));
        }
    };

    return (
        <nav ref={rootRef} aria-label="Conversations" className="flex min-h-0 flex-1 flex-col space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Conversations</h2>
                <button type="button" data-chat-initial-focus aria-label="Créer une nouvelle conversation" onClick={onNewConversation} disabled={disabled || isLoading} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-violet-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-50">
                    <Plus aria-hidden="true" className="h-4 w-4" />
                    Nouvelle conversation
                </button>
            </div>

            {errorMessage && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
                    <p>{errorMessage}</p>
                    <button type="button" onClick={onRetry} disabled={disabled || isLoading} className="mt-2 font-semibold underline disabled:opacity-50">Réessayer</button>
                </div>
            )}

            {isLoading ? (
                <div role="status" className="flex items-center gap-2 py-4 text-sm text-slate-600 dark:text-slate-300">
                    <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin text-violet-600" />
                    Chargement des conversations...
                </div>
            ) : conversations.length > 0 ? (
                <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                    {conversations.map((conversation) => {
                        const active = conversation.id === activeConversationId;
                        const isEditing = conversation.id === editingConversationId;
                        const isRenaming = conversation.id === renamingConversationId;
                        const isDeleting = conversation.id === deletingConversationId;
                        const rowDisabled = disabled || isRenaming || isDeleting;
                        const title = conversation.title.trim() || "Nouvelle conversation";
                        return (
                            <li key={conversation.id} className={`rounded-xl border transition ${active ? "border-violet-300 bg-violet-50 dark:border-violet-600 dark:bg-violet-950/60" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"}`}>
                                {isEditing ? (
                                    <form onSubmit={(event) => { void submitRename(event, conversation); }} className="space-y-2 p-3">
                                        <label className="sr-only" htmlFor={`conversation-title-${conversation.id}`}>Titre de la conversation</label>
                                        <input id={`conversation-title-${conversation.id}`} autoFocus value={editingTitle} maxLength={60} disabled={isRenaming} onChange={(event) => setEditingTitle(event.target.value)} onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                                            if (event.key === "Escape") {
                                                event.preventDefault();
                                                cancelRename();
                                            }
                                        }} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-violet-900" />
                                        {renameError && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{renameError}</p>}
                                        <div className="flex justify-end gap-2">
                                            <button type="button" disabled={isRenaming} onClick={cancelRename} className="min-h-10 rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-200 dark:hover:bg-slate-700">Annuler</button>
                                            <button type="submit" disabled={isRenaming} className="inline-flex min-h-10 items-center rounded-lg bg-violet-700 px-3 text-sm font-semibold text-white hover:bg-violet-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-50">
                                                {isRenaming && <LoaderCircle aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />}
                                                Enregistrer
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex items-start gap-1 p-1.5">
                                        <button type="button" aria-current={active ? "true" : undefined} onClick={() => onSelect(conversation.id)} disabled={rowDisabled} className="min-w-0 flex-1 rounded-lg px-2 py-1.5 text-left text-sm text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-200 dark:hover:bg-slate-700">
                                            <span className={`block truncate ${active ? "font-semibold text-violet-800 dark:text-violet-100" : "font-medium"}`}>{title}</span>
                                            <span className="mt-1 block text-xs font-normal text-slate-500 dark:text-slate-400">{formatUpdatedAt(conversation.updatedAt)}</span>
                                        </button>
                                        <ConversationActionsMenu title={title} isOpen={openMenuId === conversation.id} disabled={disabled || isRenaming || isDeleting} onToggle={() => setOpenMenuId((current) => current === conversation.id ? null : conversation.id)} onRename={() => startRename(conversation)} onDelete={() => {
                                            setOpenMenuId(null);
                                            setConversationToDelete(conversation);
                                            setDeleteError(null);
                                        }} />
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            ) : !errorMessage && (
                <div className="space-y-3 py-4 text-sm text-slate-600 dark:text-slate-300">
                    <p>Aucune conversation pour ce Business Plan.</p>
                    <button type="button" onClick={onNewConversation} disabled={disabled} className="inline-flex min-h-11 items-center rounded-xl border border-violet-300 px-3 py-2 font-semibold text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-violet-700 dark:text-violet-200 dark:hover:bg-violet-950/50">Commencer une conversation</button>
                </div>
            )}

            {conversationToDelete && (
                <DeleteConversationDialog title={conversationToDelete.title.trim() || "Nouvelle conversation"} isDeleting={deletingConversationId === conversationToDelete.id} errorMessage={deleteError} onCancel={() => {
                    if (!deletingConversationId) {
                        setConversationToDelete(null);
                        setDeleteError(null);
                    }
                }} onConfirm={() => { void confirmDelete(); }} />
            )}
        </nav>
    );
}
