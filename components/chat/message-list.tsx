"use client";

import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ToolPart } from "@/components/sources/tool-parts";

type MessageListProps = {
  messages: UIMessage[];
  status: "ready" | "submitted" | "streaming" | "error";
};

export function MessageList({ messages, status }: MessageListProps) {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center text-center text-zinc-500">
          <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
            What would you like to research?
          </p>
          <p className="mt-2 max-w-sm text-sm">
            Ask questions, search the web for current information, or upload PDFs
            to query your own documents.
          </p>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
              message.role === "user"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 dark:bg-zinc-900"
            }`}
          >
            {message.parts.map((part, i) => {
              if (part.type === "text") {
                return message.role === "user" ? (
                  <p key={`${message.id}-${i}`} className="whitespace-pre-wrap">
                    {part.text}
                  </p>
                ) : (
                  <div
                    key={`${message.id}-${i}`}
                    className="prose prose-sm prose-zinc dark:prose-invert max-w-none"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {part.text}
                    </ReactMarkdown>
                  </div>
                );
              }

              return <ToolPart key={`${message.id}-${i}`} part={part} />;
            })}
          </div>
        </div>
      ))}

      {status === "submitted" && (
        <div className="flex justify-start">
          <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm text-zinc-500 dark:bg-zinc-900">
            Thinking…
          </div>
        </div>
      )}
    </div>
  );
}
