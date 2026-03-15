"use client";

import {
  A2UIProvider,
  A2UIRenderer,
  useA2UIMessageHandler,
  type A2UIMessage,
  type A2UIAction,
} from "@a2ui-sdk/react/0.8";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { streamDemoMessageList } from "@/lib/a2ui-messages";

function handleAction(action: A2UIAction) {
  console.log("A2UI action:", action);
}

function MessageHandler({
  children,
  onComplete,
}: {
  children: React.ReactNode;
  onComplete?: () => void;
}) {
  const { processMessage } = useA2UIMessageHandler();
  const [started, setStarted] = useState(false);

  const runStream = useCallback(() => {
    if (started) return;
    setStarted(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= streamDemoMessageList.length) {
        clearInterval(interval);
        onComplete?.();
        return;
      }
      processMessage(streamDemoMessageList[i] as A2UIMessage);
      i += 1;
    }, 300);
    return () => clearInterval(interval);
  }, [started, processMessage, onComplete]);

  return (
    <>
      {!started ? (
        <button
          type="button"
          onClick={runStream}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
            开始模拟流式下发
        </button>
      ) : null}
      {children}
    </>
  );
}

export default function StreamDemoPage() {
  const [done, setDone] = useState(false);

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
            流式演示
          </h1>
          <span />
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          点击按钮后，将按 300ms 间隔逐条推送 A2UI 消息（surfaceUpdate →
          dataModelUpdate → beginRendering），模拟服务端 JSONL 流式输出。
        </p>
        <A2UIProvider>
          <MessageHandler onComplete={() => setDone(true)}>
            <div className="min-h-[200px] rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
              <A2UIRenderer onAction={handleAction} />
            </div>
          </MessageHandler>
        </A2UIProvider>
        {done && (
          <p className="mt-4 text-sm text-green-600 dark:text-green-400">
            流式消息已全部下发并完成渲染。
          </p>
        )}
      </div>
    </div>
  );
}
