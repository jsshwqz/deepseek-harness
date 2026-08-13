# 浮动选中引用工具条（插件化）

## 目标

让 Web 界面里选中聊天内容后，能一键**复制**原始文本或**引用**为 markdown blockquote。
按"把定制做成插件、与官方解耦"的方向落地：核心只加一个极小的通用扩展点，
功能代码整体抽成独立插件包，自己长期维护。

## 决策

- 不硬改 `ChatView` 塞实现：那样每次官方更新都要 rebase 功能 commit，
  且违反"新行为走扩展点、不动 agent-loop/视图主体"的仓库约束。
- 核心改一个点：在 `conversation.view` 的 children 表里声明一个空 owner 的
  `conversation.view.overlay` 列表槽位（kind list / scope session），
  并在 `ChatView` 的 `.scroll` 顶部渲染 `renderSlot('conversation.view.overlay', {})`。
  这个扩点零 owner 数据、通用、永不与官方后续改动冲突。
- 功能整体做成独立插件包 `packages/client/ui-selection-quote`：
  监听 `document.mouseup`，检测选中是否落在 `[data-chat-flow]` 聊天列内，
  通过 `ctx.slots.inject('conversation.view.overlay', ...)` 把自己挂进扩点，
  渲染 `position: fixed` 浮动工具条（固定定位不被滚动容器 overflow 裁切）。
- SlotMap 类型由插件通过 `declare module` 注入，符合依赖方向
  （ui-conversation 声明运行时 children、插件声明类型；
  与现有 `conversation.input.overlay` 由 ui-input-trigger 声明类型的模式一致）。

## 改动文件

- `packages/client/ui-conversation/src/client/contract/slots.ts`：
  加宽 `ChatViewSlotProps` 的 `PropsRenderSlots` 到包含 `conversation.view.overlay`。
- `packages/client/ui-conversation/src/client/apply.ts`：
  `conversation.view` register 的 children 加 `conversation.view.overlay`。
- `packages/client/ui-conversation/src/client/chat/ChatView.tsx`：
  在 `.scroll` 内、`.column` 前渲染 overlay 槽位；移除旧的硬编码工具条。
- 删除旧硬编码文件：`SelectionToolbar.tsx` / `.module.css` / `use-selection-toolbar.ts`。
- 新建 `packages/client/ui-selection-quote/`：package.json、tsconfig、tsdown、
  README、invariant、client/index.ts（declare modules + apply + inject）、
  client/SelectionOverlay.tsx（选中检测 + 复制/引用 + 1s 反馈）、
  client/SelectionOverlay.module.css、client/locales.ts（selection 词表）。
- `packages/bundle/web-app/cordis.patch.yml`：插入 `ui-selection-quote` 行。
- `packages/bundle/web-app/package.json`：加工作区依赖。

## 词表

`selection` 命名空间：`quote` / `quoted`。
复制类词汇 `copy` / `copied` 走 common 命名空间自动回退，无需重复定义。

## 行为

- 复制：原样写入选中文本到剪贴板，成功显示 1 秒对勾反馈后自动收起。
- 引用：把选中文本每行前加 `> ` 写成 markdown blockquote，再写剪贴板，同样反馈后收起。
- 工具条在下次页面滚动、工具条外点击、或成功动作反馈结束时自动消失。
- 仅当选中锚点位于聊天列（`[data-chat-flow]`）内时出现；输入框等区域不受影响。

## 解耦收益

官方更新时只需 rebase 核心那一个扩点 commit（声明一个槽位 + 一处 renderSlot），
插件包完全不动、一直可用；功能迭代（加动作、调样式、换词表）只在插件内，
不进主仓库源码。

## 未覆盖 / 后续

- 选中起点在聊天列外、终点在内的跨区选中不会被拾取（以锚点节点判定）。
- 工具条宽度用固定常量（两个按钮），后续加动作需同步该值。
- 本环境无 pnpm/tsc，未跑 test:gui / test:web；需维护者在上游环境执行。
