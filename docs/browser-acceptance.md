# 食材管家浏览器验收

## 验收基线

- 日期：2026-07-14 19:08 CST
- 功能 revision：`f02900d`
- 分支：`feature/first-release`
- 环境：Node.js 24、Vite production preview、Playwright CLI / Chromium
- 本地 URL：`http://127.0.0.1:4173/`
- 线上目标 URL：`https://hd2yao.github.io/pantry-recipe-pwa/`

文档和截图在功能 revision 之后加入，不改变被验收的运行行为。

## 主流程结果

| 场景 | 操作与关键结果 | 结果 |
|---|---|---|
| 首次使用 | 清空存储后打开，显示首次空状态和新增入口 | 通过 |
| 买入与持久化 | 新增番茄 3 个、鸡蛋 6 个；刷新后数量保持 | 通过 |
| 做饭消耗 | 记录「番茄炒蛋」，各消耗 1 个；剩余番茄 2 个、鸡蛋 5 个，并产生 1 条历史记录 | 通过 |
| 菜谱搜索 | 勾选鸡蛋、番茄，生成「鸡蛋 番茄 菜谱」；两个链接均为编码后的平台官方搜索 URL | 通过 |
| 导出与恢复 | 导出 1,172 字节 JSON；确认清空后导入同一文件，库存与记录完整恢复 | 通过 |
| 非法操作保护 | 清空和覆盖导入均有确认步骤，取消不会改写数据 | 通过 |
| 离线外壳 | 在已加载一次后切换离线并刷新，应用和本地库存仍可打开 | 通过 |
| 控制台 | 完整流程中 0 error、0 warning | 通过 |

## 关键断言

- 小红书：`https://www.xiaohongshu.com/search_result?keyword=鸡蛋%20番茄%20菜谱`（中文部分实际为 URL 编码）。
- B 站：`https://search.bilibili.com/all?keyword=鸡蛋%20番茄%20菜谱`（中文部分实际为 URL 编码）。
- 平台链接使用新窗口和安全的 `rel` 属性；应用没有抓取第三方页面。
- 375px、768px 和 1440px 视口的 `scrollWidth` 均等于 `clientWidth`，无横向溢出。
- 桌面视口中的应用主体限制为 720px，保持手机端信息密度。
- 普通按钮和筛选项最小高度为 44px；原生复选框为 20px，但其标签点击区为 145×69px。
- GitHub Pages 构建中，资源路径、manifest `start_url` 和 `scope` 均为 `/pantry-recipe-pwa/`；本地构建均为 `/`。

## PWA 产物检查

`npm run build` 生成：

- `dist/manifest.webmanifest`
- `dist/sw.js`
- `dist/registerSW.js`
- `dist/workbox-*.js`

Service worker 预缓存 9 个同源应用壳文件；配置没有为小红书或 B 站增加运行时缓存。

## 自动化门禁

- `npm run test:run`：11 个测试文件、39 个测试全部通过。
- `npm run lint`：通过。
- `npm run build`：通过。
- `npm run build -- --mode github-pages`：通过。
- `git diff --check`：通过。

## 线上复核

- `main` revision：`7838df2`
- GitHub Actions run：[`29328009572`](https://github.com/hd2yao/pantry-recipe-pwa/actions/runs/29328009572)，build 和 deploy 均通过。
- 页面、`manifest.webmanifest` 和 `sw.js` 均返回 HTTP 200。
- 线上 375×812 视口中页面标题、空状态和底部导航正常，`scrollWidth` 等于 `clientWidth`。
- manifest 地址正确指向仓库子路径，service worker 已进入 ready 状态。
- 线上浏览器控制台 0 error、0 warning。
