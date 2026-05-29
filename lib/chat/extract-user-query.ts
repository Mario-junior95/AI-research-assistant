import type { UIMessage } from "ai";

export function getLatestUserQuery(messages: UIMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "user") continue;

    const text = message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim();

    if (text) return text;
  }

  return null;
}
