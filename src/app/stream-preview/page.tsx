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
import { streamDemoMessageList } from "@/lib/a2ui-messages";

function handleAction(action: A2UIAction) {
  console.log("A2UI action:", action);
}

function StreamPreviewContent({ onLinesChange }: { onLinesChange: (lines: string[]) => void }) {
  const { processMessage } = useA2UIMessageHandler();
  const [started, setStarted] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  const runStream = useCallback(() => {
    if (started) return;
    setStarted(true);
    setLines([]);
    onLinesChange([]);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= streamDemoMessageList.length) {
        clearInterval(interval);
        return;
      }
      const msg = streamDemoMessageList[i] as A2UIMessage;
      const line = JSON.stringify(msg);
      setLines((prev) => {
        const next = [...prev, line];
        onLinesChange(next);
        return next;
      });
      processMessage(msg);
      i += 1;
    }, 400);
    return () => clearInterval(interval);
  }, [started, processMessage, onLinesChange]);

  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={runStream}
          disabled={started}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {started ? "流式推送中…" : "开始流式推送"}
        </button>
        {started && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            左侧每行对应一条 A2UI 消息，右侧实时渲染
          </span>
        )}
      </div>
      <A2UIRenderer onAction={handleAction} />
    </>
  );
}

export default function StreamPreviewPage() {
  const [dataLines, setDataLines] = useState<string[]>([]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-900">
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-700 dark:bg-zinc-800">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← 返回首页
        </Link>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          流式数据与页面对应关系
        </h1>
        <span />
      </header>

      <div className="flex flex-1 min-h-0">
        {/* 左侧：流式数据 */}
        <section className="flex w-[50%] flex-col border-r border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          <div className="shrink-0 border-b border-zinc-200 px-4 py-2 dark:border-zinc-700">
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              流式数据（JSONL）
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              每行一条 A2UI 消息，从上到下按到达顺序
            </p>
          </div>
          <pre className="flex-1 overflow-auto p-4 text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 font-mono whitespace-pre-wrap break-all">
            {dataLines.length === 0 ? (
              <span className="text-zinc-400 dark:text-zinc-500">
                点击「开始流式推送」后，此处将逐行显示 surfaceUpdate、dataModelUpdate、beginRendering 等消息
              </span>
            ) : (
              dataLines.map((line, i) => (
                <div key={i} className="border-l-2 border-emerald-500/60 bg-emerald-50/50 dark:bg-emerald-950/30 pl-2 py-1 mb-1 last:mb-0">
                  <span className="text-zinc-500 dark:text-zinc-400 select-none">{i + 1}. </span>
                  {line}
                </div>
              ))
            )}
          </pre>
        </section>

        {/* 右侧：预览 */}
        <section className="flex w-[50%] flex-col bg-zinc-50 dark:bg-zinc-900">
          <div className="shrink-0 border-b border-zinc-200 px-4 py-2 dark:border-zinc-700">
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              预览（A2UI 渲染）
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              根据左侧消息流实时更新
            </p>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <A2UIProvider>
              <StreamPreviewContent onLinesChange={setDataLines} />
            </A2UIProvider>
          </div>
        </section>
      </div>
    </div>
  );
}
