import { Chat } from "@/components/chat/chat";

export default function Home() {
  return (
    <main className="flex min-h-full flex-col items-center p-4 md:p-8">
      <header className="mb-6 w-full max-w-6xl">
        <h1 className="text-2xl font-semibold tracking-tight">
          AI Research Assistant
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Chat with web search and your uploaded PDFs.
        </p>
      </header>
      <Chat />
    </main>
  );
}
