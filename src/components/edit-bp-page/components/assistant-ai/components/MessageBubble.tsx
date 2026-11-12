"use client";

import type { AiMessage } from "@/types/ai";
import AssistantMarkdownContent from "./AssistantMarkdownContent";

type MessageBubbleProps = {
  message: AiMessage;
};

export default function MessageBubble({ message }: MessageBubbleProps) {
  if (message.role === "system") return null;
  const isUser = message.role === "user";

  return (
    <article className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[92%] break-words rounded-2xl border px-4 py-3 text-[15px] leading-relaxed shadow-sm [overflow-wrap:anywhere] ${isUser
          ? "rounded-br-md border-violet-700 bg-violet-700 text-white"
          : "rounded-bl-md border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"}`}
      >
        <span className="sr-only">{isUser ? "Vous" : "Assistant"} : </span>
        {isUser
          ? <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{message.content}</p>
          : <AssistantMarkdownContent content={message.content} />}
      </div>
    </article>
  );
}
