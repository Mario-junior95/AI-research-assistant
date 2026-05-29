"use client";

import { useEffect, useState } from "react";

export type Document = {
  id: string;
  name: string;
  created_at: string;
};

type DocumentListProps = {
  refreshKey: number;
};

export function DocumentList({ refreshKey }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDocuments() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/documents");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load documents");
        }
        if (!cancelled) {
          setDocuments(data.documents ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
          setDocuments([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchDocuments();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  async function handleDelete(id: string) {
    const response = await fetch(`/api/documents?id=${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Delete failed");
      return;
    }
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  }

  if (loading) {
    return <p className="text-xs text-zinc-500">Loading documents…</p>;
  }

  if (error) {
    return <p className="text-xs text-amber-600 dark:text-amber-400">{error}</p>;
  }

  if (documents.length === 0) {
    return (
      <p className="text-xs text-zinc-500">No documents uploaded yet.</p>
    );
  }

  return (
    <ul className="space-y-1">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center justify-between gap-2 rounded-md bg-zinc-50 px-2 py-1.5 text-xs dark:bg-zinc-900"
        >
          <span className="truncate" title={doc.name}>
            {doc.name}
          </span>
          <button
            type="button"
            onClick={() => void handleDelete(doc.id)}
            className="shrink-0 text-zinc-400 hover:text-red-600"
            aria-label={`Delete ${doc.name}`}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
