"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import { DocumentList } from "@/components/documents/document-list";
import { DocumentUpload } from "@/components/documents/document-upload";

export function Chat() {
  const [input, setInput] = useState("");
  const [docRefreshKey, setDocRefreshKey] = useState(0);

  const { messages, sendMessage, status, stop, error } = useChat();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || status !== "ready") return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] max-h-[900px] w-full max-w-6xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-200 p-4 dark:border-zinc-800 md:flex">
        <h2 className="mb-1 text-sm font-semibold">Documents</h2>
        <p className="mb-3 text-xs text-zinc-500">
          Uploaded PDFs are searched automatically on each message.
        </p>
        <DocumentUpload
          onUploaded={() => setDocRefreshKey((k) => k + 1)}
          disabled={status !== "ready"}
        />
        <div className="mt-4 flex-1 overflow-y-auto">
          <DocumentList refreshKey={docRefreshKey} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {error && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error.message}
          </div>
        )}
        <MessageList messages={messages} status={status} />
        <ChatInput
          input={input}
          status={status}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          onStop={stop}
        />
      </div>
    </div>
  );
}
