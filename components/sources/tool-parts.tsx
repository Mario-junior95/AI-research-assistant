"use client";

import type { UIMessage } from "ai";

type MessagePart = UIMessage["parts"][number];

type WebSearchOutput = {
  results?: Array<{ title: string; url: string; content: string }>;
  error?: string;
};

type RetrieveOutput = {
  chunks?: Array<{
    documentName: string;
    content: string;
    similarity: number;
  }>;
  error?: string;
};

function WebSearchResult({ output }: { output: WebSearchOutput }) {
  if (output.error) {
    return <p className="text-sm text-amber-600 dark:text-amber-400">{output.error}</p>;
  }

  return (
    <ul className="space-y-2">
      {(output.results ?? []).map((result) => (
        <li
          key={result.url}
          className="rounded-md border border-zinc-200 bg-zinc-50 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            {result.title}
          </a>
          <p className="mt-1 line-clamp-2 text-zinc-600 dark:text-zinc-400">
            {result.content}
          </p>
        </li>
      ))}
    </ul>
  );
}

function RetrieveResult({ output }: { output: RetrieveOutput }) {
  if (output.error) {
    return <p className="text-sm text-amber-600 dark:text-amber-400">{output.error}</p>;
  }

  return (
    <ul className="space-y-2">
      {(output.chunks ?? []).map((chunk, i) => (
        <li
          key={`${chunk.documentName}-${i}`}
          className="rounded-md border border-zinc-200 bg-zinc-50 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <p className="font-medium">{chunk.documentName}</p>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">{chunk.content}</p>
        </li>
      ))}
    </ul>
  );
}

export function ToolPart({ part }: { part: MessagePart }) {
  if (!part.type.startsWith("tool-")) return null;

  const toolName = part.type.replace("tool-", "");
  const label =
    toolName === "webSearch"
      ? "Web search"
      : toolName === "retrieveDocuments"
        ? "Document search"
        : toolName;

  if (!("state" in part)) return null;

  if (part.state === "input-streaming" || part.state === "input-available") {
    return (
      <div className="my-2 rounded-md border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-600">
        {label}…
      </div>
    );
  }

  if (part.state === "output-available" && "output" in part) {
    return (
      <div className="my-2 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {label}
        </p>
        {toolName === "webSearch" && (
          <WebSearchResult output={part.output as WebSearchOutput} />
        )}
        {toolName === "retrieveDocuments" && (
          <RetrieveResult output={part.output as RetrieveOutput} />
        )}
      </div>
    );
  }

  if (part.state === "output-error" && "errorText" in part) {
    return (
      <p className="my-2 text-sm text-red-600 dark:text-red-400">
        {label} failed: {part.errorText}
      </p>
    );
  }

  return null;
}
