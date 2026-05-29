"use client";

type ChatInputProps = {
  input: string;
  status: "ready" | "submitted" | "streaming" | "error";
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onStop: () => void;
};

export function ChatInput({
  input,
  status,
  onInputChange,
  onSubmit,
  onStop,
}: ChatInputProps) {
  const isBusy = status === "submitted" || status === "streaming";

  return (
    <form onSubmit={onSubmit} className="border-t border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Ask a research question..."
          rows={2}
          className="flex-1 resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
          disabled={isBusy}
        />
        {isBusy ? (
          <button
            type="button"
            onClick={onStop}
            className="rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Send
          </button>
        )}
      </div>
    </form>
  );
}
