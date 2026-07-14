# 食材管家

一款个人使用、移动优先的食材库存 PWA。记录买入与做饭消耗，查看食材已存放天数和处理优先级，再把库存组合成关键词，直接去小红书或 B 站搜索菜谱。

> 在线地址：[https://hd2yao.github.io/pantry-recipe-pwa/](https://hd2yao.github.io/pantry-recipe-pwa/)

![食材管家菜谱搜索页](docs/screenshots/mobile-recipes.png)

## 第一版功能

- 记录食材名称、数量、单位、分类、买入日期和建议处理天数。
- 同名同单位食材自动合并，按「超过建议期、尽快吃、还新鲜、未设置」排序和筛选。
- 一次消耗多种食材，并保留菜名、时间和用量记录。
- 勾选现有库存，生成「食材 + 菜谱」关键词，打开小红书或 B 站官方搜索页。
- JSON 导出、覆盖导入和清空数据。
- 可安装到手机主屏幕；应用外壳离线可打开。

## 手机上使用

不需要上架 App Store，也不需要注册账号。

- iPhone / iPad：用 Safari 打开在线地址，点「分享」→「添加到主屏幕」。
- Android：用 Chrome 打开在线地址，点浏览器菜单→「安装应用」或「添加到主屏幕」。
- 首次打开后先新增食材；以后从主屏幕图标进入即可。

## 数据和安全边界

- 所有食材数据只保存在当前浏览器的 `localStorage`，没有账号、服务器或云同步。
- 清理网站数据、重装浏览器或更换手机可能丢失数据；建议定期在右上角「⋯」中导出备份。
- 离线只保证已缓存的应用界面可打开；小红书和 B 站搜索仍需要网络。
- 「建议处理天数」只是个人管理提示，不代表食品安全结论。食用前仍需结合气味、外观、保存温度和包装说明判断。
- 本项目不抓取、保存或重排第三方平台内容，只生成并打开官方搜索 URL。

## 本地开发

建议使用 Node.js 24。

```bash
npm ci
npm run dev
```

常用验证命令：

```bash
npm run test:run
npm run lint
npm run build
npm run build -- --mode github-pages
```

## 部署

推送到 `main` 后，[GitHub Actions](.github/workflows/deploy-pages.yml) 会先执行测试、lint 和 Pages 子路径构建，再发布 `dist` 到 GitHub Pages。

## 文档

- [产品与架构方案](docs/plans/2026-07-14-pantry-recipe-design.md)
- [实施计划](docs/plans/2026-07-14-pantry-recipe-pwa.md)
- [浏览器验收](docs/browser-acceptance.md)
- [视觉验收](docs/visual-acceptance.md)

## 当前不做

账号体系、云同步、自动识图、营养计算、后台推送、平台爬虫和 App Store 上架不在第一版范围内。
