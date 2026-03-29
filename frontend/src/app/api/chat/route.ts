import { NextRequest, NextResponse } from "next/server";

import { generateAssistantReply } from "@/lib/server/chat-rag";

type ChatPayload = {
  message?: string;
  threadId?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  portfolioContext?: boolean;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatPayload;
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const result = await generateAssistantReply({
      message,
      threadId: body.threadId ?? "default-thread",
      history: Array.isArray(body.history) ? body.history : [],
      portfolioContext: body.portfolioContext ?? false,
    });

    return NextResponse.json({
      id: crypto.randomUUID(),
      role: "assistant",
      content: result.content,
      model: result.model,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
