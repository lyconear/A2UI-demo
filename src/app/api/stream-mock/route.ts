import { welcomeCardMessages } from "@/lib/a2ui-messages";
import { NextResponse } from "next/server";

/**
 * Mock A2UI JSONL 流式接口，无需任何 API Key。
 * 客户端可 fetch('/api/stream-mock') 并逐行解析 JSONL。
 */
export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const msg of welcomeCardMessages) {
        controller.enqueue(encoder.encode(JSON.stringify(msg) + "\n"));
      }
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-store",
    },
  });
}
