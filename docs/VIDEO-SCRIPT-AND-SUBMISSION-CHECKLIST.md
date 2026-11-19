# COMP10013 CW01 — Part B（视频演示脚本）+ 提交清单

目标时长 **5 分钟（±30 秒）**，mp4、必须本人英语配音、录屏。
总字数约 700 词（按 140 词/分钟）。英文段落就是可以直接照读的口播稿。

> 录之前先做一次：`npm run build && npm run preview`，用 Edge 打开 `http://localhost:4173/?demo=1`，
> 浏览器缩放 100%，窗口调到 1440×900，显示器分辨率 1080p。录屏软件推荐 OBS（窗口捕获 + 麦克风）。

---

## 0:00 – 0:25 · 开场（应用是什么、给谁用）

**画面**：浏览器停在 MyFridge 首页（`?demo=1`，列表里已有 5 件样品）。

**English**
> Hi, this is MyFridge — a Progressive Web App I built for COMP10013 with React and Vite.
> It tracks what is in your fridge, how much is left, and when it expires. Everything runs on the device:
> no account, no server, and it works offline.
> I'll show the deployed app, demonstrate the four CRUD operations and the two device APIs, and then walk
> through the source code that implements them.

---

## 0:25 – 1:10 · 部署与安装（Deployment & Demonstration，10 分）

**画面**：地址栏里的 `jiej-eng.github.io/myfridge` → 点安装图标 → 应用以独立窗口打开（没有地址栏）→ 展示首页。

**English**
> This build is deployed on GitHub Pages over HTTPS, which the device APIs require.
> Because it ships a web manifest and a Workbox service worker, it installs like a native app.
> I'll install it now — one click in the address bar.
> Notice it opens in standalone mode: no browser chrome, an app icon on the home screen.
> The manifest sets the name, theme colour, and the 192 and 512 icons, plus a maskable one so Android can
> crop it without clipping the fridge.

**操作提示**：装好后从桌面图标启动，再演示一次“飞行模式刷新仍能打开”（离线 shell）。

---

## 1:10 – 2:10 · CRUD 演示（On-Device Storage & CRUD，15 分）

**画面**：Add item → 填 Cheddar cheese / Dairy / 2 / expiry 10 days → Add → 卡片出现 → 修改数量 −/+ →
铅笔改日期 → 停在确认删除对话框，先不删 → 刷新页面，数据仍在 → 再删除。

**English**
> Create: the floating button opens a validated sheet — name, category, quantity, unit, expiry date and place.
> Read: the list sorts by expiry, and each card derives its own status badge — fresh, use soon, or expired.
> Update has two paths: the stepper changes quantity in place and clamps at one, the pencil reopens the same
> form pre-filled.
> Delete asks for confirmation first.
> The important part is persistence. I'll reload the page now — the items are still here, because every
> mutation is written to localStorage by a single hook.

---

## 2:10 – 2:55 · 源码：存储与状态（Technical understanding）

**画面**：VS Code 打开 `src/hooks/usePersistedState.js`，然后 `src/hooks/useItems.js`，鼠标跟随关键行。

**English**
> Storage is wrapped once in `usePersistedState`.
> The initial value is read lazily, so the disk is hit on mount, not on every render.
> An effect mirrors the value into localStorage and catches `QuotaExceededError`, so a full disk produces a
> banner instead of silent data loss.
> `useItems` is the only owner of the collection — add, update, adjustQuantity and delete all go through it,
> which means the UI and the stored JSON can never disagree.

---

## 2:55 – 3:35 · 设备 API 1：相机（Device APIs，15 分）

**画面**：表单里点 “Take a photo” → 授权 → 预览 → Capture → 缩略图出现在卡片上；再切回
`src/hooks/useCamera.js` 讲三行代码。

**English**
> The first API is the camera. `getUserMedia` requests an environment-facing video stream, and shows it in a
> live preview.
> The shutter draws that frame into a canvas, downscales it to 720 pixels and exports JPEG at 0.72 quality —
> about sixty kilobytes, which keeps localStorage happy.
> Every error is mapped to a readable message: permission denied, no camera, or camera already in use.
> And the stream is stopped on close and on unmount — otherwise the camera light stays on and the next attempt
> fails.

---

## 3:35 – 4:10 · 设备 API 2：通知（Device APIs，15 分）

**画面**：点 “Enable reminders” → 浏览器授权 → 点 “Check expiring items now” → 系统通知弹出（标题 + 两条到期项）。

**English**
> The second API is the Notifications API. Permission is only requested from that button — never on page load —
> because browsers require a user gesture.
> `checkExpiring` filters items due within three days, builds one digest notification with a human countdown,
> and uses a fixed tag so repeated presses replace rather than stack.
> It is honest about its limit: a page can only notify while it is open. Real background delivery needs Web
> Push and a server, which I list as future work.

---

## 4:10 – 4:40 · UI/UX 与响应式（App Design，10 分）

**画面**：拖窄窗口到手机宽度（或 DevTools 切换到 390×844）→ 卡片变单列、按钮移到底部、表单变成底部抽屉；
再拖宽到 1280 px → 三列网格、按钮到右下角。

**English**
> The layout is mobile-first. Below 640 pixels the grid is one column, the primary action moves into the
> thumb zone, and the form becomes a bottom sheet.
> Above that it widens to two and three columns and the dialog centres.
> Status is never colour alone — every card carries a text badge as well — and icon buttons have aria-labels,
> focus outlines, and reduced-motion support.

---

## 4:40 – 5:00 · 代码质量与收尾（Code Quality & Extras，10 分）

**画面**：VS Code 文件树（components / hooks / utils / .github）+ GitHub Actions 绿色勾。

**English**
> The code is split into presentational components, four focused hooks and pure utilities, so each file has one
> job and the date logic can be tested in isolation.
> A GitHub Actions workflow installs and builds the project on every push, which is the DevOps part of the
> module.
> If I had more time I would move photos to IndexedDB, add Web Push for background reminders, and cover the
> CRUD flow with Playwright tests.
> Thanks for watching — the repository and README are linked in the submission.

---

## 录完自检（30 秒）

- [ ] 时长在 4:30 – 5:30 之间（不要为了塞内容而加速）
- [ ] 所有四段 CRUD 都有画面证据（Create / Read / Update / Delete），并展示了刷新后数据仍在
- [ ] 两个 API 都有「操作演示 + 代码讲解」两部分，不是只有一句话
- [ ] 每个小段都回到了源码，且鼠标/光标指向正在讲的代码行
- [ ] 声音清楚、无风扇噪音；画面无个人信息（浏览器书签栏、聊天弹窗、Banner ID 以外的东西）
- [ ] 导出 mp4（H.264 + AAC），文件名 `DWT-CW01-First-Attempt-B01857661-Yijie-Shen.mp4`

---

## 提交清单（Part A + Part B）

### 1. 仓库与部署（已完成 ✅）

1. 仓库已公开：<https://github.com/Jiej-eng/myfridge>（默认分支 `main`，含 `README.md`）。
2. 部署已上线：<https://jiej-eng.github.io/myfridge/>（HTTPS，可安装，Service Worker scope `/myfridge/`）。
3. 更新部署的方式：`$env:PAGES_BASE="/myfridge/"; npm run build` → 把 `dist/` 推到 `gh-pages` 分支。
4. 报告第 11 页已经写成真实链接（`github.com/Jiej-eng/myfridge` + `jiej-eng.github.io/myfridge`），无需再手改。

### 2. Part A（40%）

- [ ] 文件名 `DWT-CW01-First-Attempt-B01857661-Yijie-Shen.pptx`
- [ ] 第一页插入 Aula 上的 **Student Declaration**（作业要求放在文档第一页）
- [ ] 页数 15 页，处于 10–15 页要求内
- [ ] 全片无姓名以外的身份信息；Banner ID 按作业要求填写（匿名评分，别加姓名以外的个人信息）
- [ ] 通过 Aula 的 `Part A: Written Component`（Turnitin）入口提交

### 3. Part B（60%）

- [ ] 文件名 `DWT-CW01-First-Attempt-B01857661-Yijie-Shen.mp4`
- [ ] 本人英语配音、约 5 分钟、mp4 格式
- [ ] 提交前自己完整看一遍：能否听清、代码行是否对得上讲解

### 4. 风险提示（务必自己确认）

- 这份作业对生成式 AI 的使用等级为 **Type 1（Restricted）**（以 Aula 上的模块说明为准）。
  交付前请你自己按模块政策核对，并确保你能**独立讲清**报告里每一段代码与每个设计决定——
  视频是本人出镜讲解，讲不清会直接影响 Part B 的 60 分。
- 提交前把 PPT 里和你实际情况不符的表述改掉（例如你并没有做的测试项），不要保留无法证明的结论。
- 截止时间 2026-12-06，具体时刻以 Aula 显示为准，建议提前 3 天提交，给 Turnitin 留时间。

### 5. 交之前最后跑一遍

```bash
cd myfridge
npm ci
npm run build
npm run preview   # 打开 http://localhost:4173/?demo=1 走一遍 10 项自检
```
