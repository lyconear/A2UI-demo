import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          A2UI 示例工程
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          本工程帮助理解 A2UI 协议与各种组件能力，无需 Gemini API
          Key，使用静态或 Mock 流即可运行。若你有 OpenAI 或 Anthropic Key，可配置后使用
          Vercel AI SDK 体验“对话生成 UI”。
        </p>

        <nav className="mt-10 flex flex-col gap-4">
          <Link
            href="/gallery"
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
          >
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              组件画廊
            </span>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              静态 A2UI 消息展示：欢迎卡片、Row/Column 布局、表单（TextField、CheckBox、Slider、Button）
            </p>
          </Link>
          <Link
            href="/stream-demo"
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
          >
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              流式演示
            </span>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              模拟 JSONL 流式下发 A2UI 消息，无需任何 API Key
            </p>
          </Link>
          <Link
            href="/stream-preview"
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
          >
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              流式数据与页面对应
            </span>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              左侧展示 JSONL 流式数据，右侧实时预览 A2UI 渲染，一一对应
            </p>
          </Link>
          <Link
            href="/api-demo"
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
          >
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              API 流式接口
            </span>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              调用 /api/stream-mock 获取 Mock A2UI JSONL 流
            </p>
          </Link>
        </nav>

        <div className="mt-12 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>关于 Key：</strong>本示例不依赖 Gemini。若需“AI 生成
            A2UI”，可在环境变量中配置 <code>OPENAI_API_KEY</code> 或{" "}
            <code>ANTHROPIC_API_KEY</code>，并部署到 Vercel 使用。
          </p>
        </div>
      </main>
    </div>
  );
}
