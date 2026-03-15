/**
 * A2UI v0.8 协议消息示例
 * 用于组件画廊与流式演示，无需任何 API Key
 * @see https://a2ui.org/specification/v0.8-a2ui/
 */

import type { A2UIMessage } from "@a2ui-sdk/react/0.8";

const SURFACE_ID = "main";

/** 简单欢迎卡片：Column + Card + Text + Button */
export const welcomeCardMessages: A2UIMessage[] = [
  {
    surfaceUpdate: {
      surfaceId: SURFACE_ID,
      components: [
        {
          id: "root",
          component: {
            Column: {
              children: { explicitList: ["card"] },
              distribution: "start",
              alignment: "stretch",
            },
          },
        },
        {
          id: "card",
          component: { Card: { child: "card_inner" } },
        },
        {
          id: "card_inner",
          component: {
            Column: {
              children: { explicitList: ["title", "desc", "btn_text", "btn"] },
              distribution: "start",
              alignment: "stretch",
            },
          },
        },
        {
          id: "title",
          component: {
            Text: {
              text: { literalString: "欢迎使用 A2UI" },
              usageHint: "h2",
            },
          },
        },
        {
          id: "desc",
          component: {
            Text: {
              text: {
                literalString:
                  "A2UI 是声明式、平台无关的 UI 协议，由服务端以 JSONL 流式下发，客户端用本地组件渲染。无需 Gemini，本示例使用静态/ Mock 数据即可运行。",
              },
              usageHint: "body",
            },
          },
        },
        {
          id: "btn_text",
          component: {
            Text: {
              text: { literalString: "点击试试" },
            },
          },
        },
        {
          id: "btn",
          component: {
            Button: {
              child: "btn_text",
              primary: true,
              action: { name: "welcome_click" },
            },
          },
        },
      ],
    },
  },
  { dataModelUpdate: { surfaceId: SURFACE_ID, contents: [] } },
  { beginRendering: { surfaceId: SURFACE_ID, root: "root" } },
];

/** 布局组件展示：Row + Column */
export const layoutDemoMessages: A2UIMessage[] = [
  {
    surfaceUpdate: {
      surfaceId: SURFACE_ID,
      components: [
        {
          id: "root",
          component: {
            Column: {
              children: { explicitList: ["row_title", "row", "col_title", "col"] },
              distribution: "start",
              alignment: "stretch",
            },
          },
        },
        {
          id: "row_title",
          component: {
            Text: {
              text: { literalString: "Row 横向布局" },
              usageHint: "h3",
            },
          },
        },
        {
          id: "row",
          component: {
            Row: {
              children: { explicitList: ["r1", "r2", "r3"] },
              distribution: "spaceBetween",
              alignment: "center",
            },
          },
        },
        { id: "r1", component: { Text: { text: { literalString: "左" } } } },
        { id: "r2", component: { Text: { text: { literalString: "中" } } } },
        { id: "r3", component: { Text: { text: { literalString: "右" } } } },
        {
          id: "col_title",
          component: {
            Text: {
              text: { literalString: "Column 纵向布局" },
              usageHint: "h3",
            },
          },
        },
        {
          id: "col",
          component: {
            Column: {
              children: { explicitList: ["c1", "c2", "c3"] },
              distribution: "start",
              alignment: "stretch",
            },
          },
        },
        { id: "c1", component: { Text: { text: { literalString: "第一行" } } } },
        { id: "c2", component: { Text: { text: { literalString: "第二行" } } } },
        { id: "c3", component: { Text: { text: { literalString: "第三行" } } } },
      ],
    },
  },
  { dataModelUpdate: { surfaceId: SURFACE_ID, contents: [] } },
  { beginRendering: { surfaceId: SURFACE_ID, root: "root" } },
];

/** 表单组件：TextField、CheckBox、Slider、Button */
export const formDemoMessages: A2UIMessage[] = [
  {
    surfaceUpdate: {
      surfaceId: SURFACE_ID,
      components: [
        {
          id: "root",
          component: {
            Column: {
              children: {
                explicitList: [
                  "form_title",
                  "email_label",
                  "email_input",
                  "bio_label",
                  "bio_input",
                  "agree_cb",
                  "slider_label",
                  "slider",
                  "submit_text",
                  "submit_btn",
                ],
              },
              distribution: "start",
              alignment: "stretch",
            },
          },
        },
        {
          id: "form_title",
          component: {
            Text: {
              text: { literalString: "表单示例" },
              usageHint: "h2",
            },
          },
        },
        {
          id: "email_label",
          component: {
            Text: {
              text: { literalString: "邮箱" },
              usageHint: "body",
            },
          },
        },
        {
          id: "email_input",
          component: {
            TextField: {
              label: { literalString: "Email" },
              text: { path: "/form/email" },
              textFieldType: "shortText",
            },
          },
        },
        {
          id: "bio_label",
          component: {
            Text: {
              text: { literalString: "简介" },
              usageHint: "body",
            },
          },
        },
        {
          id: "bio_input",
          component: {
            TextField: {
              label: { literalString: "多行输入" },
              text: { path: "/form/bio" },
              textFieldType: "longText",
            },
          },
        },
        {
          id: "agree_cb",
          component: {
            CheckBox: {
              label: { literalString: "同意条款" },
              value: { path: "/form/agree" },
            },
          },
        },
        {
          id: "slider_label",
          component: {
            Text: {
              text: { literalString: "音量" },
              usageHint: "body",
            },
          },
        },
        {
          id: "slider",
          component: {
            Slider: {
              value: { path: "/form/volume" },
              minValue: 0,
              maxValue: 100,
            },
          },
        },
        {
          id: "submit_text",
          component: {
            Text: {
              text: { literalString: "提交" },
            },
          },
        },
        {
          id: "submit_btn",
          component: {
            Button: {
              child: "submit_text",
              primary: true,
              action: { name: "submit_form" },
            },
          },
        },
      ],
    },
  },
  {
    dataModelUpdate: {
      surfaceId: SURFACE_ID,
      contents: [
        {
          key: "form",
          valueMap: [
            { key: "email", valueString: "" },
            { key: "bio", valueString: "" },
            { key: "agree", valueBoolean: false },
            { key: "volume", valueNumber: 50 },
          ],
        },
      ],
    },
  },
  { beginRendering: { surfaceId: SURFACE_ID, root: "root" } },
];

/** 流式演示用：逐条发送的 Mock 消息（模拟 JSONL 流） */
export const streamDemoMessageList = welcomeCardMessages;
