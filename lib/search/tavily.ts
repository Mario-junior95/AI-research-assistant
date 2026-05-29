import { hasTavily } from "@/lib/env";

export type WebSearchResult = {
  title: string;
  url: string;
  content: string;
};

function getTavilyApiKey(): string {
  const key = process.env.TAVILY_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "Web search is not configured. Add TAVILY_API_KEY to your environment.",
    );
  }
  return key;
}

export async function searchWeb(
  query: string,
  maxResults = 5,
): Promise<WebSearchResult[]> {
  if (!hasTavily()) {
    throw new Error(
      "Web search is not configured. Add TAVILY_API_KEY to your environment.",
    );
  }

  const apiKey = getTavilyApiKey();

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      max_results: maxResults,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    const snippet = text.startsWith("<") ? response.statusText : text;
    throw new Error(`Tavily search failed: ${response.status} ${snippet}`);
  }

  const data = (await response.json()) as {
    results?: Array<{ title?: string; url?: string; content?: string }>;
  };

  return (data.results ?? []).map((item) => ({
    title: item.title ?? "Untitled",
    url: item.url ?? "",
    content: item.content ?? "",
  }));
}
