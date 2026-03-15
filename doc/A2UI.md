# A2UI 协议与概念说明

本文档从多个维度介绍 A2UI（Agent to UI）：它是什么、核心概念、消息与字段含义、组件与数据绑定、以及与本工程的对应关系。以 **v0.8 稳定版** 为主，必要时会提及 v0.9 的差异。

---

## 一、A2UI 是什么

**A2UI** 是一套**声明式、平台无关的 UI 协议**：由服务端（例如 LLM/Agent）以 **JSONL（每行一个 JSON）** 的形式流式下发“要画什么界面”，客户端根据协议解析后，用**本地组件**（Web / Flutter / 未来 SwiftUI 等）渲染，而不是执行任意代码。

- **LLM 友好**：扁平组件列表 + ID 引用，便于模型逐条生成，无需一次输出整棵嵌套树。
- **流式**：消息一条条发，客户端可以渐进渲染，体验更顺畅。
- **安全**：只传“描述 UI 的数据”，不传可执行代码；组件类型由客户端 Catalog 限定。
- **平台无关**：同一份协议可对应 Web（React/Lit/Angular）、Flutter、后续移动端等不同实现。

---

## 二、核心概念一览

| 概念 | 含义 | 谁提供 |
|------|------|--------|
| **Surface（表面）** | 一块可独立渲染的 UI 区域，有唯一 `surfaceId`。一个应用可有多个 Surface（如主内容区、弹窗）。 | 协议通过 `surfaceId` 指定 |
| **组件树** | 用**扁平列表 + ID 引用**表示的 UI 结构：每条消息里是 `{ id, component }`，子节点通过 `children` 里的 ID 引用。 | 服务端通过 `surfaceUpdate` 下发 |
| **数据模型（Data Model）** | 每个 Surface 一份键值数据，组件用 `path` 绑定到某条数据（如 `/user/name`）。 | 服务端通过 `dataModelUpdate` 下发 |
| **Catalog（目录）** | 客户端维护的“组件类型 → 实际控件”的映射（如 `Text` → 某 React 组件）。协议只写类型名，具体长什么样由客户端决定。 | 客户端实现 |

关系可以简化为：

- **服务端**：发 `surfaceUpdate`（画哪些组件、怎么排）+ `dataModelUpdate`（填什么数据）+ `beginRendering`（从哪个根节点开始画）。
- **客户端**：按消息更新内部的“组件 Map”和“数据模型”，收到 `beginRendering` 后从 `root` 开始解析引用、查 Catalog、渲染。

---

## 三、消息类型与字段说明

协议规定：**一行一条 JSON 消息**（JSONL）。每条消息有且仅有一个“顶层 key”，对应一种操作。

### 3.1 四种消息类型概览

| 消息类型（顶层 key） | 作用 |
|----------------------|------|
| `surfaceUpdate` | 向某个 Surface 添加/更新组件定义（结构） |
| `dataModelUpdate` | 更新该 Surface 的数据模型（数据） |
| `beginRendering` | 通知客户端“可以开始渲染了”，并指定根组件 ID |
| `deleteSurface` | 删除整个 Surface（如关闭弹窗） |

### 3.2 surfaceUpdate —— 定义/更新组件

**含义**：为指定 Surface 增加或更新一批组件。组件用 **id** 唯一标识，子节点通过 **id 引用** 组成树。

**顶层结构**：

```json
{
  "surfaceUpdate": {
    "surfaceId": "main",
    "components": [ { "id": "...", "component": { "组件类型": { ...属性 } } }, ... ]
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `surfaceId` | string | ✅ | 目标 Surface 的 ID |
| `components` | array | ✅ | 组件定义列表 |

**components 中每个元素**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 该组件在当前 Surface 内唯一 ID，供其他组件通过 `children`、`child` 等引用 |
| `component` | object | ✅ | **有且仅有一个 key**，即组件类型名（如 `Text`、`Column`、`Button`），值为该类型的属性对象 |

**示例**：

```json
{
  "surfaceUpdate": {
    "surfaceId": "main",
    "components": [
      { "id": "root", "component": { "Column": { "children": { "explicitList": ["title", "btn"] } } } },
      { "id": "title", "component": { "Text": { "text": { "literalString": "标题" }, "usageHint": "h1" } } },
      { "id": "btn", "component": { "Button": { "child": "btn_label", "primary": true, "action": { "name": "submit" } } } },
      { "id": "btn_label", "component": { "Text": { "text": { "literalString": "提交" } } } }
    ]
  }
}
```

同一 `id` 再次出现即表示**更新**该组件，而不是新增一份。

---

### 3.3 dataModelUpdate —— 更新数据模型

**含义**：更新指定 Surface 的“数据模型”。组件里用 `{ "path": "/xxx" }` 绑定的值，就来自这里。

**顶层结构**：

```json
{
  "dataModelUpdate": {
    "surfaceId": "main",
    "path": "可选，默认为根",
    "contents": [ { "key": "...", "valueString" | "valueNumber" | "valueBoolean" | "valueMap": ... }, ... ]
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `surfaceId` | string | ✅ | 目标 Surface |
| `path` | string | ❌ | 更新在数据模型中的位置；省略则从根开始 |
| `contents` | array | ✅ | “邻接表”形式的键值列表：每项一个 `key` + 一个类型化值 |

**contents 中每个元素**：必须包含 `key`，以及**恰好一个**类型化值字段：

| 值字段 | 类型 | 含义 |
|--------|------|------|
| `valueString` | string | 字符串 |
| `valueNumber` | number | 数字 |
| `valueBoolean` | boolean | 布尔 |
| `valueMap` | array | 嵌套结构，同上格式的 `{ key, value* }` 数组 |

**示例**：根下挂 `user` 对象，内含 `name`、`email`：

```json
{
  "dataModelUpdate": {
    "surfaceId": "main",
    "contents": [
      {
        "key": "user",
        "valueMap": [
          { "key": "name", "valueString": "张三" },
          { "key": "email", "valueString": "zhang@example.com" }
        ]
      }
    ]
  }
}
```

组件里用 `{ "path": "/user/name" }` 即可绑定到 `"张三"`。

---

### 3.4 beginRendering —— 触发渲染

**含义**：告诉客户端“组件与数据已经足够，请从某个根组件开始渲染”。客户端会缓冲之前的 `surfaceUpdate` / `dataModelUpdate`，直到收到本条才真正画出来，避免半成品闪烁。

**结构**：

```json
{
  "beginRendering": {
    "surfaceId": "main",
    "root": "root",
    "catalogId": "可选，默认标准目录",
    "styles": "可选"
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `surfaceId` | string | ✅ | 要渲染的 Surface |
| `root` | string | ✅ | 作为树根的组件 **id**（必须在之前的 `surfaceUpdate` 里出现过） |
| `catalogId` | string | ❌ | 组件目录标识，省略则用默认标准目录 |
| `styles` | object | ❌ | 样式配置 |

**顺序要求**：`beginRendering` 必须在对应 Surface 的至少一次 `surfaceUpdate`（以及通常的 `dataModelUpdate`）**之后**发送。

---

### 3.5 deleteSurface —— 删除 Surface

**含义**：移除整个 Surface（包括其组件和数据）。常用于关弹窗、离开某块 UI。

**结构**：

```json
{
  "deleteSurface": { "surfaceId": "modal" }
}
```

---

## 四、消息顺序与流式行为

- **同一条流里**：可多次发 `surfaceUpdate`、多次发 `dataModelUpdate`，顺序上二者可以交错；但**第一次真正渲染**必须在收到该 Surface 的 `beginRendering` 之后。
- **推荐顺序**（v0.8）：
  1. 若干条 `surfaceUpdate`（可拆成多条逐步发）
  2. 一条或若干条 `dataModelUpdate` 填充数据
  3. 一条 `beginRendering` 指定 `surfaceId` 和 `root`
- 之后还可继续发 `surfaceUpdate` / `dataModelUpdate` 做增量更新，无需再次 `beginRendering`。

本工程的「流式数据与页面对应」演示页就是按上述顺序逐条推送消息，左侧展示 JSONL，右侧实时渲染，便于对照理解。

---

## 五、组件与数据绑定

### 5.1 组件如何引用“值”

组件属性里表示“一段文本/一个值”的写法有两种：

| 写法 | 含义 | 示例 |
|------|------|------|
| `{ "literalString": "固定文案" }` | 写死的字符串 | 标题、按钮文案 |
| `{ "literalNumber": 42 }` / `{ "literalBoolean": true }` | 写死的数字/布尔 | 滑块默认值等 |
| `{ "path": "/user/name" }` | 绑定数据模型中该路径的值 | 表单字段、动态列表项 |

数据模型由 `dataModelUpdate` 的 `contents` 建立和更新；`path` 使用类似 JSON Pointer 的路径（如 `/form/email`、`/items/0/title`）。

### 5.2 常见组件类型与属性（v0.8 简要）

- **布局**  
  - **Column**：垂直排列。`children`: `{ "explicitList": ["id1","id2"] }`，`distribution` / `alignment`。  
  - **Row**：水平排列。同上。  
  - **List**：列表；`children` 可用 `template` + `dataBinding` 绑定到数据路径，按数组项渲染子组件。

- **展示**  
  - **Text**：`text`: ValueSource，`usageHint`: `"h1"`|`"h2"`|`"body"`|`"caption"` 等。  
  - **Image**：`url`: ValueSource，`fit` 等。  
  - **Icon**：`name`: ValueSource。  
  - **Divider**：`axis`: `"horizontal"` | `"vertical"`。

- **交互**  
  - **Button**：`child`: 子组件 id（如文字），`primary`: boolean，`action`: `{ "name": "actionName" }`。  
  - **TextField**：`label`、`text`（绑定 path）、`textFieldType`: `"shortText"`|`"longText"`|`"number"`|`"obscured"`|`"date"` 等。  
  - **CheckBox**：`label`、`value`（绑定 path，boolean）。  
  - **Slider**：`value`（path），`minValue`、`maxValue`。  
  - **DateTimeInput**：`value`（path），`enableDate` / `enableTime`。  
  - **MultipleChoice**：`options`、`selections`（path）、`maxAllowedSelections`。

- **容器**  
  - **Card**：`child`: 一个子组件 id。  
  - **Modal**：`entryPointChild`、`contentChild`。  
  - **Tabs**：`tabItems`: `[ { "title": ..., "child": "id" }, ... ]`。

更完整的属性与 schema 见 [A2UI 组件参考](https://a2ui.org/reference/components/)。

---

## 六、字段映射速查

便于快速从“协议里某个字段”找到“含义和用法”。

### 6.1 消息顶层 → 下一层

| 消息顶层 key | 下一层主要字段 |
|--------------|----------------|
| `surfaceUpdate` | `surfaceId`, `components` |
| `dataModelUpdate` | `surfaceId`, `path?`, `contents` |
| `beginRendering` | `surfaceId`, `root`, `catalogId?`, `styles?` |
| `deleteSurface` | `surfaceId` |

### 6.2 surfaceUpdate.components 元素

| 字段 | 含义 |
|------|------|
| `id` | 组件在当前 Surface 内的唯一 ID |
| `component` | 单 key 对象：key = 组件类型名，value = 该类型的属性（其中又可包含 `literalString`/`path`、`child`/`children`、`action` 等） |

### 6.3 dataModelUpdate.contents 元素

| 字段 | 含义 |
|------|------|
| `key` | 当前层级的键名 |
| `valueString` | 字符串值 |
| `valueNumber` | 数字值 |
| `valueBoolean` | 布尔值 |
| `valueMap` | 子对象，同结构数组，形成树形数据 |

路径规则：根为 `/`，下一级为 `/key`，嵌套为 `/key/subkey`，与 `path` 绑定一致。

### 6.4 组件内部常见属性含义

| 属性/形态 | 含义 |
|-----------|------|
| `literalString` / `literalNumber` / `literalBoolean` | 字面量，不绑定数据 |
| `path` | 绑定数据模型路径，如 `"/user/name"` |
| `explicitList` | 子组件 id 数组，如 `["header","body"]` |
| `template` + `dataBinding` | 列表项模板，绑定到数组路径 |
| `child` | 单个子组件 id（Button、Card 等） |
| `action` | 用户点击时上报的 `name`，由客户端发回服务端 |
| `usageHint` | 展示 hint（如 `h1`、`body`），用于样式/无障碍 |

---

## 七、本工程中的对应关系

- **协议版本**：本 demo 使用 **A2UI v0.8**。
- **消息定义位置**：`src/lib/a2ui-messages.ts`。其中定义了多组 `A2UIMessage[]`（如 `welcomeCardMessages`、`layoutDemoMessages`、`formDemoMessages`、`streamDemoMessageList`），可直接对应到上述几种消息类型和字段。
- **渲染**：使用 `@a2ui-sdk/react` 的 v0.8 导出：`A2UIProvider`、`A2UIRenderer`、`useA2UIMessageHandler`。Provider 可一次性传入 `messages`，或通过 `useA2UIMessageHandler` 的 `processMessage` 逐条推送（流式）。
- **演示页**：
  - **组件画廊**：静态 `messages` 展示不同组件与数据绑定。
  - **流式演示**：前端定时逐条 `processMessage`，观察渐进渲染。
  - **流式数据与页面对应**：左侧展示 JSONL 行，右侧同一批消息驱动 A2UI 渲染，便于对照“每条消息 ↔ 界面变化”。
  - **API 流式接口**：`/api/stream-mock` 返回 JSONL 流，前端用 `processMessage` 消费并渲染。

---

## 八、A2UI 的局限性

理解协议的边界，有助于判断是否适合你的场景；以下为常见局限与取舍。

### 8.1 表达能力与组件边界

- **仅限 Catalog 内组件**：服务端只能使用客户端事先在 Catalog 里声明的组件类型和属性。无法“临时发明”新控件或任意 HTML/原生组件，扩展新能力需要先更新客户端 Catalog 并发布。
- **纯声明式，无代码执行**：协议只描述“画什么、绑什么数据、点完报什么 action”，不传递也不执行任意脚本。复杂逻辑（如本地计算、复杂校验、动画编排）要么由服务端通过新消息驱动，要么依赖客户端在组件实现里写死或通过有限配置表达。
- **交互形态受协议约束**：当前标准组件以表单、列表、按钮、卡片等为主。高度定制的手势、拖拽、画布、富文本编辑等若未在 Catalog 中定义，就无法通过协议直接表达，需扩展 Catalog 或改用其他方案。

### 8.2 生态与多端实现

- **生态尚在早期**：相比成熟 UI 框架或“代码生成 + 执行”方案，A2UI 的组件库、工具链、最佳实践仍在发展中，可选组件和样例相对有限。
- **每平台需独立渲染器**：同一份协议要在 Web、Flutter、未来 SwiftUI/Jetpack Compose 上渲染，需要各端分别实现一套符合协议的渲染器与 Catalog。协议统一了“描述”，但实现与适配成本由各端自行承担。
- **移动端与 WebView**：部分能力（如复杂布局、输入法、滚动）在移动 WebView 或小屏上的表现可能不如原生或成熟 SPA 框架成熟，需针对目标环境做验证。

### 8.3 与 LLM 协作的代价

- **Token 与冗余**：v0.8 的邻接表、类型化 value（valueString / valueNumber / valueMap 等）便于校验和解析，但 JSON 体积相对大，LLM 输出 token 会增多；协议设计在“可验证性”与“token 效率”之间做了取舍。
- **生成结果需校验与纠错**：LLM 可能产出不合法 JSON、错误 path、未知组件类型或错误属性。生产环境通常需要服务端校验（如 JSON Schema）、重试或修正逻辑，才能稳定驱动客户端。
- **v0.9 的“提示优先”**：更简洁、对人友好的 schema 有利于 LLM 理解，但放宽格式约束后，后处理与错误恢复会更复杂，需要在开发体验与鲁棒性之间权衡。

### 8.4 和“代码/工具”方案的对比

- **不能替代任意代码生成**：若需求是“Agent 生成并执行任意前端/后端代码”（如 MCP、E2B、代码解释执行），A2UI 不面向该场景；它只描述 UI 与数据，不传可执行代码。
- **灵活性换安全与一致性**：Catalog 预定义组件限制了“想画什么就画什么”的自由度，但换来了安全（无注入与执行）、多端一致性和可预测的渲染行为。适合受控、产品化强的 Agent UI，不适合需要极高自由度的实验或一次性脚本 UI。

### 8.5 小结

| 维度 | 局限性 |
|------|--------|
| 组件 | 只能用 Catalog 内组件，无法临时发明新控件或任意标记 |
| 逻辑 | 纯声明式，无客户端脚本执行；复杂逻辑靠服务端消息或客户端写死 |
| 生态 | 早期阶段，组件与工具相对少；每平台需独立实现渲染器 |
| LLM | 输出需校验/纠错；协议为可验证性牺牲部分 token 效率 |
| 定位 | 不替代“生成并执行代码”的方案，用灵活性换安全与一致性 |

这些局限来自协议设计目标（安全、流式、LLM 友好、多端一致）；在适合的场景下（如受控对话 UI、表单与列表、多端统一体验），A2UI 能发挥价值，而在需要任意代码或极高定制时，需考虑其他技术组合。

---

若要深入协议或服务端生成规则，可参考：

- [A2UI 协议 v0.8](https://a2ui.org/specification/v0.8-a2ui/)
- [消息参考](https://a2ui.org/reference/messages/)
- [组件参考](https://a2ui.org/reference/components/)
- [Agent 开发指南](https://a2ui.org/guides/agent-development/)
