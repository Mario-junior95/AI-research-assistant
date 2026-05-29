import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { getChatModel } from "@/lib/ai/provider";
import { RESEARCH_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { createResearchTools } from "@/lib/ai/tools";
import { getLatestUserQuery } from "@/lib/chat/extract-user-query";
import { getServerEnv } from "@/lib/env";
import { buildDocumentContextForQuery } from "@/lib/rag/build-document-context";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    getServerEnv();
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Server configuration error",
      },
      { status: 500 },
    );
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  let system = RESEARCH_SYSTEM_PROMPT;
  const latestQuery = getLatestUserQuery(messages);

  if (latestQuery) {
    try {
      const documentContext = await buildDocumentContextForQuery(latestQuery);
      if (documentContext) {
        system = `${RESEARCH_SYSTEM_PROMPT}\n\n${documentContext}`;
      }
    } catch (error) {
      console.error("Document context retrieval failed:", error);
      system = `${RESEARCH_SYSTEM_PROMPT}\n\n## Uploaded documents\n\nAutomatic document search failed. Use retrieveDocuments if the user asks about their files.`;
    }
  }

  const result = streamText({
    model: getChatModel(),
    system,
    messages: await convertToModelMessages(messages),
    tools: createResearchTools(),
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
