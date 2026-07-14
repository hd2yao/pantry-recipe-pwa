# 食材管家 PWA 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标：** 构建一款可安装到手机主屏幕的个人食材库存 PWA，支持买入、消耗、保鲜提示、菜谱搜索和本地备份。

**架构：** React 页面只负责交互和展示，库存规则集中在无副作用的 TypeScript 领域模块，本地存储通过独立适配层读写带版本号的数据快照。应用不接后端；PWA service worker 缓存应用壳，第三方菜谱只通过官方搜索 URL 打开。

**技术栈：** React、TypeScript、Vite、Vitest、Testing Library、Playwright CLI、vite-plugin-pwa、原生 CSS、localStorage。

---

## 执行约束

- Intent Lock：只解决个人食材库存、消耗、保鲜提示、菜谱搜索和备份。
- Scope Fence：不增加账号、云同步、爬虫、营养计算或后台推送。
- 数据约束：持久化快照必须带 `version: 1`，导入内容必须先完整校验。
- 安全约束：不把保存天数表述成确定的食品安全结论。
- UI 约束：移动优先，底部三栏导航，主要触控目标不小于 44px。
- 回退策略：每个批次独立提交；静态部署失败不影响本地数据和本地构建。

## 验收映射

| 验收标准 | 实现任务 | 验证 |
|---|---|---|
| AC-001 新增并持久化食材 | Task 2、3、5 | 领域测试、存储测试、Playwright CLI |
| AC-002 消耗并生成记录 | Task 2、6 | 领域测试、组件测试、Playwright CLI |
| AC-003 保鲜优先级 | Task 2、5 | 固定日期单元测试、页面断言 |
| AC-004 平台菜谱搜索 | Task 2、6 | URL 单元测试、浏览器新窗口断言 |
| AC-005 数据导入导出 | Task 3、7 | 存储测试、Playwright CLI |
| AC-006 PWA 与离线应用壳 | Task 4、8 | production preview、manifest/service worker 检查 |
| AC-007 响应式和触控尺寸 | Task 5、6、8 | 375/768/1440 截图和几何检查 |
| AC-008 自动化覆盖 | Task 2、3、5、6、8 | `npm run test:run`、Playwright CLI 验收记录 |

### Task 1：初始化 React、测试和代码质量工具

**文件：**

- 创建：`package.json`
- 创建：`vite.config.ts`
- 创建：`vitest.config.ts`
- 创建：`tsconfig.json`
- 创建：`tsconfig.app.json`
- 创建：`tsconfig.node.json`
- 创建：`eslint.config.js`
- 创建：`index.html`
- 创建：`src/main.tsx`
- 创建：`src/App.tsx`
- 创建：`src/test/setup.ts`
- 创建：`.gitignore`

**步骤：**

1. 使用 Vite React TypeScript 模板生成基础文件，不覆盖已有 Git 历史和文档。
2. 安装 `vitest`、Testing Library、`jsdom` 和 `vite-plugin-pwa`；浏览器验收使用本机 Playwright CLI wrapper。
3. 在 `package.json` 增加 `test`、`test:run`、`lint`、`build` 和 `preview` 命令。
4. 写最小 App 冒烟测试，断言页面标题可见。
5. 运行 `npm run test:run`，预期先因页面未实现而失败。
6. 实现最小页面后再次运行，预期通过。
7. 运行 `npm run lint && npm run build`。
8. 提交：`chore: bootstrap React PWA project`。

### Task 2：用 TDD 实现库存领域规则

**文件：**

- 创建：`src/domain/types.ts`
- 创建：`src/domain/pantry.ts`
- 创建：`src/domain/pantry.test.ts`
- 创建：`src/domain/recipeSearch.ts`
- 创建：`src/domain/recipeSearch.test.ts`
- 创建：`src/domain/shelfLife.ts`

**先写失败测试：**

```ts
it('扣减库存并保留消耗快照', () => {
  const result = consumeItems(snapshot, {
    dishName: '番茄炒蛋',
    consumedAt: '2026-07-14',
    lines: [{ itemId: 'tomato', quantity: 2 }],
  });

  expect(result.items[0].quantity).toBe(1);
  expect(result.consumptionRecords[0].lines[0].itemName).toBe('番茄');
});
```

```ts
it('生成编码后的平台搜索链接', () => {
  expect(buildRecipeSearchUrl('bilibili', ['番茄', '鸡蛋']))
    .toBe('https://search.bilibili.com/all?keyword=%E7%95%AA%E8%8C%84%20%E9%B8%A1%E8%9B%8B%20%E8%8F%9C%E8%B0%B1');
});
```

**步骤：**

1. 写新增、同名合并、超量消耗、归零移除、历史快照和保鲜状态测试。
2. 运行 `npm run test:run -- src/domain`，预期因实现不存在而失败。
3. 实现 `addPantryItem`、`consumeItems`、`getFreshnessStatus`、`getDaysStored` 和搜索 URL 生成器。
4. 使用本地日期的日期字符串进行天数计算，避免时区导致差一天。
5. 再次运行领域测试，预期全部通过。
6. 提交：`feat: add pantry domain rules`。

### Task 3：实现版本化存储与备份

**文件：**

- 创建：`src/storage/pantryStorage.ts`
- 创建：`src/storage/pantryStorage.test.ts`
- 创建：`src/storage/validation.ts`
- 创建：`src/storage/validation.test.ts`

**先写失败测试：**

```ts
it('拒绝未知版本且不覆盖当前数据', () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(validSnapshot));
  expect(() => importSnapshot('{"version": 99}')).toThrow('不支持的数据版本');
  expect(loadSnapshot()).toEqual(validSnapshot);
});
```

**步骤：**

1. 为默认空快照、保存/加载、损坏 JSON、导出和导入写测试。
2. 运行对应测试，确认失败原因是适配器尚未实现。
3. 实现结构校验和 `version: 1` 迁移入口。
4. 导入时先解析到内存，校验通过后才写入 localStorage。
5. 运行存储测试和全部单元测试。
6. 提交：`feat: persist and back up pantry data`。

### Task 4：实现可安装 PWA 外壳

**文件：**

- 修改：`vite.config.ts`
- 修改：`index.html`
- 创建：`public/icon.svg`
- 创建：`public/apple-touch-icon.svg`
- 创建：`src/styles/tokens.css`
- 创建：`src/styles/global.css`

**步骤：**

1. 配置 manifest 名称、主题色、standalone 模式和应用图标。
2. 配置 service worker 只缓存同源应用壳，不缓存小红书/B 站内容。
3. 添加安全的 viewport、theme-color 和 PWA 元数据。
4. 建立颜色、字体、间距、圆角和状态语义 token。
5. 运行 `npm run build`，确认生成 manifest 和 service worker。
6. 启动 production preview，检查 manifest 请求为 200。
7. 提交：`feat: add installable PWA shell`。

### Task 5：实现今天总览和库存页面

**文件：**

- 创建：`src/hooks/usePantry.ts`
- 创建：`src/components/AppShell.tsx`
- 创建：`src/components/BottomNav.tsx`
- 创建：`src/features/dashboard/Dashboard.tsx`
- 创建：`src/features/dashboard/Dashboard.test.tsx`
- 创建：`src/features/inventory/InventoryView.tsx`
- 创建：`src/features/inventory/InventoryView.test.tsx`
- 创建：`src/features/inventory/AddItemSheet.tsx`
- 创建：`src/features/inventory/ItemCard.tsx`
- 创建：`src/styles/components.css`
- 修改：`src/App.tsx`

**先写失败测试：**

```tsx
it('把超过建议期的食材排在最前面', () => {
  render(<Dashboard snapshot={snapshot} today="2026-07-14" />);
  const names = screen.getAllByTestId('priority-item').map((node) => node.textContent);
  expect(names[0]).toContain('菠菜');
});
```

**步骤：**

1. 先测试空状态、优先列表、筛选和新增表单校验。
2. 实现 `usePantry`，集中处理加载、保存和领域操作。
3. 实现移动端应用壳、顶部栏和底部导航。
4. 实现总览指标、优先食材、库存卡片和新增弹层。
5. 增加状态文案：新鲜、尽快吃、超过建议期、未设置。
6. 运行组件测试、lint 和 build。
7. 提交：`feat: add dashboard and inventory flows`。

### Task 6：实现消耗记录和菜谱搜索

**文件：**

- 创建：`src/features/consumption/ConsumeSheet.tsx`
- 创建：`src/features/consumption/ConsumeSheet.test.tsx`
- 创建：`src/features/recipes/RecipeSearch.tsx`
- 创建：`src/features/recipes/RecipeSearch.test.tsx`
- 修改：`src/features/dashboard/Dashboard.tsx`
- 修改：`src/features/inventory/InventoryView.tsx`
- 修改：`src/App.tsx`

**先写失败测试：**

```tsx
it('禁用超过库存的消耗提交', async () => {
  render(<ConsumeSheet items={[tomato]} onSubmit={onSubmit} />);
  await userEvent.type(screen.getByLabelText('番茄用量'), '99');
  expect(screen.getByRole('button', { name: '确认消耗' })).toBeDisabled();
});
```

**步骤：**

1. 测试多食材选择、超量校验、可选菜名和提交结果。
2. 实现消耗弹层并把领域错误转换成用户可理解的中文。
3. 测试菜谱食材选择、关键词预览和两个平台链接。
4. 实现菜谱页面；平台链接用新窗口打开并带安全属性。
5. 在无法打开新窗口时允许复制关键词。
6. 运行全部单元与组件测试、lint 和 build。
7. 提交：`feat: add consumption and recipe search`。

### Task 7：实现数据管理、反馈与无障碍细节

**文件：**

- 创建：`src/features/settings/DataMenu.tsx`
- 创建：`src/features/settings/DataMenu.test.tsx`
- 创建：`src/components/Toast.tsx`
- 创建：`src/components/ConfirmDialog.tsx`
- 修改：`src/components/AppShell.tsx`
- 修改：`src/styles/components.css`

**步骤：**

1. 为导出文件名、合法导入、非法导入和覆盖确认写测试。
2. 实现数据菜单和 JSON 文件下载/读取。
3. 为弹层实现焦点移动、Escape 关闭和语义标签。
4. 为成功、失败和本地存储异常增加非阻塞反馈。
5. 检查键盘导航、颜色对比、44px 触控区和 reduced motion。
6. 运行全部测试、lint 和 build。
7. 提交：`feat: add data backup and accessibility`。

### Task 8：真实浏览器验证、截图和项目文档

**文件：**

- 创建：`docs/browser-acceptance.md`
- 创建：`docs/visual-acceptance.md`
- 修改：`README.md`

**Playwright CLI 验收场景：**

```text
打开首次空状态 -> 新增番茄 -> 刷新确认持久化
-> 新增鸡蛋 -> 消耗番茄和鸡蛋 -> 确认剩余数量
-> 进入菜谱页 -> 选择库存 -> 核对两个平台链接关键词
-> 导出备份 -> 清空/导入 -> 核对恢复结果
```

**步骤：**

1. 启动 production preview，记录启动时间、源码 revision 和 URL。
2. 使用 Playwright CLI 的 `open -> snapshot -> interact -> snapshot` 流程验收首次空状态、买入、消耗、刷新持久化、菜谱链接和备份。
3. 把操作、关键 DOM 结果和失败修复记录到 `docs/browser-acceptance.md`。
4. 分别以 375×812、768×1024、1440×1000 截图首页、库存和菜谱页。
5. 检查无横向滚动、固定底栏不遮挡内容、最长文本不裁切。
6. 在 `docs/visual-acceptance.md` 记录 revision、URL、视口、截图和评分。
7. 完善中文 README：功能、安装、手机添加主屏幕、数据边界、开发和部署。
8. 运行最终门禁：

   ```bash
   npm run test:run
   npm run lint
   npm run build
   git diff --check
   ```

9. 提交：`docs: add usage and verification guide`。
10. 推送 `main`，验证 GitHub 仓库可见性和远端状态。

## 收敛检查

- 每条 AC 都必须有通过证据；缺少证据时标记为部分满足，不宣称完成。
- 实际改动不得包含账号、云服务、爬虫或第三方分析 SDK。
- `npm audit` 的生产依赖风险需要检查；无法立即修复时记录原因。
- 本地存储边界、食品安全提示和第三方平台依赖必须在 README 明示。
- 视觉评分低于 90 或出现溢出、重叠、遮挡时进入最多五轮的最小修复循环。
