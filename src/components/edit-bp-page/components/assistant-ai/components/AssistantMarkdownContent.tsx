"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

type AssistantMarkdownContentProps = {
    content: string;
};

function safeUrl(url: string): string {
    const value = url.trim();
    if (!value) return "";
    if (value.startsWith("/") || value.startsWith("#") || value.startsWith("?")) return value;

    try {
        const protocol = new URL(value).protocol;
        return protocol === "http:" || protocol === "https:" || protocol === "mailto:" ? value : "";
    } catch {
        return "";
    }
}

const markdownComponents: Components = {
    p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
    strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-slate-100">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    h1: ({ children }) => <h3 className="mb-2 mt-4 text-lg font-bold text-slate-900 first:mt-0 dark:text-slate-100">{children}</h3>,
    h2: ({ children }) => <h4 className="mb-2 mt-4 text-base font-bold text-slate-900 first:mt-0 dark:text-slate-100">{children}</h4>,
    h3: ({ children }) => <h5 className="mb-2 mt-4 text-sm font-bold text-slate-900 first:mt-0 dark:text-slate-100">{children}</h5>,
    ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5 marker:text-violet-600 dark:marker:text-violet-300">{children}</ul>,
    ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5 marker:font-semibold marker:text-violet-600 dark:marker:text-violet-300">{children}</ol>,
    li: ({ children }) => <li className="pl-1">{children}</li>,
    blockquote: ({ children }) => <blockquote className="my-3 border-l-4 border-violet-300 bg-violet-50/70 py-2 pl-3 italic text-slate-700 dark:border-violet-500 dark:bg-violet-950/40 dark:text-slate-200">{children}</blockquote>,
    code: ({ className, children, ...props }) => {
        const block = String(children).includes("\n");
        return (
            <code
                {...props}
                className={block
                    ? `block min-w-max font-mono text-xs leading-6 ${className ?? ""}`
                    : "rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-800 dark:bg-slate-700 dark:text-slate-100"}
            >
                {children}
            </code>
        );
    },
    pre: ({ children }) => <pre className="my-3 max-w-full overflow-x-auto rounded-xl bg-slate-900 p-3 text-slate-100 shadow-inner">{children}</pre>,
    table: ({ children }) => (
        <div className="my-3 max-w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="min-w-full border-collapse text-left text-xs">{children}</table>
        </div>
    ),
    thead: ({ children }) => <thead className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100">{children}</thead>,
    tbody: ({ children }) => <tbody className="divide-y divide-slate-200 dark:divide-slate-700">{children}</tbody>,
    tr: ({ children }) => <tr className="align-top">{children}</tr>,
    th: ({ children }) => <th className="whitespace-nowrap px-3 py-2 font-semibold">{children}</th>,
    td: ({ children }) => <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{children}</td>,
    a: ({ href, children }) => {
        const safeHref = href ? safeUrl(href) : "";
        return safeHref
            ? <a href={safeHref} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-violet-700 underline decoration-violet-300 underline-offset-2 hover:text-violet-900 dark:text-violet-300 dark:decoration-violet-500 dark:hover:text-violet-100">{children}</a>
            : <span>{children}</span>;
    },
};

export default function AssistantMarkdownContent({ content }: AssistantMarkdownContentProps) {
    return (
        <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={safeUrl} components={markdownComponents}>
            {content}
        </ReactMarkdown>
    );
}
