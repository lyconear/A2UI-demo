"use client";

import {
  A2UIProvider,
  A2UIRenderer,
  type A2UIMessage,
  type A2UIAction,
} from "@a2ui-sdk/react/0.8";
import Link from "next/link";
import {
  welcomeCardMessages,
  layoutDemoMessages,
  formDemoMessages,
} from "@/lib/a2ui-messages";

function handleAction(action: A2UIAction) {
  console.log("A2UI action:", action);
  if (typeof window !== "undefined") {
    window.alert(`收到动作: ${action.name}`);
  }
}

function DemoBlock({
  title,
  messages,
}: {
  title: string;
  messages: A2UIMessage[];
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
      <div className="min-h-[120px] rounded-lg border border-dashed border-zinc-300 bg-zinc-50/50 p-4 dark:border-zinc-600 dark:bg-zinc-800/50">
        <A2UIProvider messages={messages}>
          <A2UIRenderer onAction={handleAction} />
        </A2UIProvider>
      </div>
    </section>
  );
}

export default function GalleryPage() {
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
            组件画廊
          </h1>
          <span />
        </div>
      </header>
      <div className="mx-auto max-w-3xl space-y-10 px-6 py-10">
        <DemoBlock title="欢迎卡片（Column + Card + Text + Button）" messages={welcomeCardMessages} />
        <DemoBlock title="布局（Row + Column）" messages={layoutDemoMessages} />
        <DemoBlock title="表单（TextField、CheckBox、Slider、Button）" messages={formDemoMessages} />
      </div>
    </div>
  );
}
