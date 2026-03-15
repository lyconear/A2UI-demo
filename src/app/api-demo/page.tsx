"use client";

import {
  A2UIProvider,
  A2UIRenderer,
  useA2UIMessageHandler,
  type A2UIMessage,
  type A2UIAction,
} from "@a2ui-sdk/react/0.8";
import Link from "next/link";
import { useCallback, useState } from "react";

function handleAction(action: A2UIAction) {
  console.log("A2UI action:", action);
}

function ApiConsumer({ onDone }: { onDone?: () => void }) {
  const { processMessage } = useA2UIMessageHandler();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStream = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stream-mock");
      if (!res.ok) throw new Error(res.statusText);
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No body");
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const msg = JSON.parse(line) as A2UIMessage;
            processMessage(msg);
          } catch {
            // skip invalid line
          }
        }
      }
      for (const line of buffer.split("\n")) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line) as A2UIMessage;
          processMessage(msg);
        } catch {
          // skip
        }
      }
      onDone?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "请求失败");
    } finally {
      setLoading(false);
    }
  }, [processMessage, onDone]);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={fetchStream}
        disabled={loading}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {loading ? "请求中…" : "请求 /api/stream-mock"}
      </button>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="min-h-[180px] rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <A2UIRenderer onAction={handleAction} />
      </div>
    </div>
  );
}

export default function ApiDemoPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← 返回首页
          </Link>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            API 流式接口
          </h1>
          <span />
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          调用本地 <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-700">/api/stream-mock</code>{" "}
          ，以 NDJSON 流式返回 A2UI 消息，下方使用 useA2UIMessageHandler 逐条消费并渲染。
        </p>
        <A2UIProvider>
          <ApiConsumer />
        </A2UIProvider>
      </div>
    </div>
  );
}
