# 参与贡献

感谢你帮助这个项目变得更可信。

## 开发环境

需要 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

提交前运行：

```bash
npm run verify
npm run build
```

## 数据贡献要求

营养值改动必须同时提供：

- 可公开访问的原始来源 URL；
- 菜品名称和品牌；
- 每份、每100克或其他明确口径；
- 页面显示的原始数值；
- 访问日期；
- 官方、第三方或估算来源类型；
- 缺失字段和可能的地区、批次差异。

不要：

- 把缺失值填写为 0；
- 从受限接口或登录后页面批量抓取；
- 提交 API Key、Cookie、Token 或个人数据；
- 将第三方数据标记为官方；
- 添加没有可追溯依据的健康结论。

## 分支和提交

建议分支名称：

```text
feature/add-food-filter
fix/missing-sodium-total
data/verify-official-label
docs/update-methodology
```

提交信息应简短描述实际变更。Pull Request 需要说明验证命令和数据来源。
