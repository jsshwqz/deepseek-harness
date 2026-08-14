# Rust/Tauri Desktop Client — 踩坑记录

> 从 Electron 迁移到 Rust/Tauri 桌面客户端（branch `feat/dsh-desktop-tauri`）。
> 目标：把 `lib.rs` 做到 `cargo check --lib` 编译通过。

## 一、为什么抛弃 Electron

原版 `dsh-desktop` 主进程是 TypeScript（`dist/main/runtime.js`），用 `tsc` 编译、asar 打包，
运行时 `node_modules` 不进包 → `Cannot find package '@deepseek-ai/dsh-sdk-client'`。
Rust/Tauri 直接把主进程编译成二进制，**不 import 任何 JS 包**，根源问题消失。

## 二、构建链路

```
apps/dsh-desktop-tauri/
├── src-tauri/
│   ├── Cargo.toml       ← 依赖 tauri v2 + tauri-plugin-shell + tokio + serde
│   ├── build.rs         ← `fn main(){ tauri_build::build() }`
│   ├── tauri.conf.json  ← 窗口 1100×720、深色、custom-protocol
│   ├── icons/icon.ico   ← ⚠️ 见第三节
│   └── src/lib.rs       ← JSON-RPC over stdio，控制 dsh-jsonrpc-agent 子进程
└── dist/                ← 静态前端（index.html + app.js，Tauri 直接托管）
```

## 三、图标坑（最大耗时）

cargo check 一路卡在 `resource.rc` 编译：

| 版本 | 图标来源 | 报错 | 结论 |
|------|----------|------|------|
| 1 | 空文件 | `not found` | 必须有图标 |
| 2 | Buffer 手写 1bpp/32bpp | `RC2175 not in 3.00 format` | 手工 DIB 不被认 |
| 3 | .NET `Bitmap.Save(Icon)` 16/48/256px | `RC2176 old DIB` | 本机 .NET 存的是**假 ICO**（PNG 魔数 89 50 4E 47） |
| 4 | Buffer 32bpp 多尺寸 | 同上 | — |
| 5 | `Icon.ExtractAssociatedIcon('explorer.exe')` | `Invalid reserved field value (255)` | **接近了**：rc.exe 认，但 tauri 宏校验更严 |
| **6 ✅** | explorer 图标 + **改字节 9 为 0** | `RC:0` | 通过 |

**关键诊断**：字节级验证图标文件（看 DIB header 是 12 还是 40 字节、reserved 字段是否为 0）。

## 四、Rust lib.rs 错误清单

| 错误 | 修复 |
|------|------|
| `E0758 unterminated block comment` | 补 `*/` |
| `no method emit_all` | tauri v2 改 `emit`，需 `use tauri::Emitter` |
| `get_status 用 State 必须返回 Result` | `-> Result<RuntimeStatus, String>` |
| `tokio MutexGuard 不 Send` | `std::sync::Mutex` → `tokio::sync::Mutex`，`lock()` → `lock().await` |
| `proc macro panicked: OUT_DIR not set` | 必须保留 `build.rs`（之前删了它来绕图标，绕不动又加回） |
| `variable does not need to be mutable` | 去掉 `stdin` 的 `mut` |

## 五、环境备忘

- `cargo check --lib` 依赖已缓存后 ~3s 完成
- tauri 配置**必须无 BOM**（.NET `WriteAllText` 会带 BOM，导致 `expected value at line 1`），用 `Convert.FromBase64String + WriteAllBytes`
- `rc.exe` 路径转义正常（escape_string 把 `\` 转 `\\\\`），路径本身不是问题
- 网络：github.com:443 间歇 21s 超时 → 需要重试循环
