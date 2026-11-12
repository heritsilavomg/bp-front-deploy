"use client";

import { MoreVertical } from "lucide-react";
import type { MouseEvent } from "react";

type ConversationActionsMenuProps = {
    title: string;
    isOpen: boolean;
    disabled: boolean;
    onToggle: () => void;
    onRename: () => void;
    onDelete: () => void;
};

export default function ConversationActionsMenu({
    title, isOpen, disabled, onToggle, onRename, onDelete,
}: ConversationActionsMenuProps) {
    const stop = (event: MouseEvent) => event.stopPropagation();

    return (
        <div className="relative shrink-0" onClick={stop}>
            <button
                type="button"
                aria-label={`Actions pour ${title}`}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                disabled={disabled}
                onClick={(event) => {
                    event.stopPropagation();
                    onToggle();
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            >
                <MoreVertical aria-hidden="true" className="h-5 w-5" />
            </button>
            {isOpen && (
                <div
                    role="menu"
                    aria-label={`Actions de ${title}`}
                    className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
                >
                    <button
                        type="button"
                        role="menuitem"
                        onClick={onRename}
                        className="flex min-h-10 w-full items-center px-3 text-left text-sm text-slate-700 transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none dark:text-slate-100 dark:hover:bg-slate-700 dark:focus-visible:bg-slate-700"
                    >
                        Renommer
                    </button>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={onDelete}
                        className="flex min-h-10 w-full items-center px-3 text-left text-sm text-red-700 transition hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-none dark:text-red-300 dark:hover:bg-red-950/50 dark:focus-visible:bg-red-950/50"
                    >
                        Supprimer
                    </button>
                </div>
            )}
        </div>
    );
}
