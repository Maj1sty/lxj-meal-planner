# 餐盘有数 · LXJ Meal Planner

[![CI](https://github.com/Maj1sty/lxj-meal-planner/actions/workflows/ci.yml/badge.svg)](https://github.com/Maj1sty/lxj-meal-planner/actions/workflows/ci.yml)
[![Deploy Pages](https://github.com/Maj1sty/lxj-meal-planner/actions/workflows/pages.yml/badge.svg)](https://github.com/Maj1sty/lxj-meal-planner/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/Code%20License-MIT-173f34.svg)](LICENSE)
[![Data: attributed](https://img.shields.io/badge/Data-attributed-e96842.svg)](DATA_LICENSE.md)

一个基于公开营养信息的餐品营养计算与透明配餐工具。它可以计算一餐的热量、蛋白质、脂肪和碳水，并按均衡、轻负担、高蛋白或控钠目标比较组合。

项目最重要的原则是：**缺失值不按零计算，推荐理由可以检查，每个数字都能回到来源。**

> 非官方项目，与老乡鸡及 FatSecret 无隶属、授权或合作关系。结果仅作一般信息与软件演示，不替代包装标签、医生或注册营养师建议。

## 在线体验

发布后访问：<https://maj1sty.github.io/lxj-meal-planner/>

## V1 功能

- 按全部、主食、主菜和蔬菜筛选或搜索菜品。
- 以 0.5 倍增量自由组合餐品。
- 计算热量、蛋白质、脂肪和碳水合计。
- 钠缺失时保持“待补充”，食盐当量不会错误显示为零。
- 枚举“主食 + 主菜 + 蔬菜”的全部候选组合。
- 提供均衡、轻负担和高蛋白三种可运行的透明排序。
- 控钠模式在数据不足时拒绝输出虚假排名。
- 显示数据来源、访问日期、口径、完整度与已知限制。
- 支持复制本餐摘要。

## 当前数据状态

V1 收录 6 条可追溯的演示数据。

| 项目 | 覆盖 | 说明 |
|---|---:|---|
| 热量、蛋白质、脂肪、碳水 | 6/6 | 第三方公开页面 |
| 钠 | 0/6 | 公开页面未展示 |
| 食盐当量 | 0/6 | 依赖钠，暂不计算 |
| 官方营养值交叉核验 | 0/6 | 待从官方营养标识逐条核对 |
| 每份克重 | 1/2 份制菜品 | 三黑元气饭只有“每份”口径 |
| 实时菜单与地区供应 | 未覆盖 | 本项目不是实时菜单 |

更完整的说明见 [数据缺口](docs/data-gaps.md) 和 [数据方法](docs/data-methodology.md)。

## 快速开始

需要 Node.js 20 或更高版本。

```bash
git clone https://github.com/Maj1sty/lxj-meal-planner.git
cd lxj-meal-planner
npm install
npm run dev
```

浏览器打开 <http://127.0.0.1:4173>。

项目没有运行时第三方依赖，`npm install` 主要用于生成一致的锁文件环境。

## 验证

```bash
npm run check
npm test
npm run build
```

测试覆盖：

- 数量与营养合计；
- 缺失钠值传播；
- 食盐当量不被错误生成；
- 配餐候选完整枚举；
- 推荐结果可复现；
- 控钠模式的数据门槛；
- 数据 ID、来源和字段质量。

## 推荐规则

V1 不使用黑箱模型。所有候选固定包含一项主食、一项主菜和一项独立蔬菜。

- **均衡组合**：比较与演示目标热量、蛋白质和脂肪区间的距离。
- **轻负担组合**：优先较低热量，同时对蛋白质过低进行惩罚。
- **高蛋白优先**：比较蛋白质总量和每 100 kcal 蛋白质密度。
- **控钠优先**：只有候选菜品钠数据全部完整时才开放。

页面上的“适配度”仅用于当前候选之间排序，不是医学健康评分。详细公式见 [`src/core/recommendation.js`](src/core/recommendation.js)。

## 数据来源

1. [老乡鸡官方微博：菜品溯源报告 2.0 线上可视化说明](https://www.sina.cn/news/detail/5296041042647572.html)
2. [FatSecret：老乡鸡产品营养信息](https://www.fatsecret.cn/热量营养/老乡鸡)
3. [国家卫健委：餐饮食品营养标识指南](https://www.nhc.gov.cn/sps/c100088/202012/9f71d532e5684a54a63090a75eb737fb/files/1732844456897_92407.pdf)

食盐当量在钠数据可用时采用指南口径：

```text
食盐当量（g） = 钠（mg） × 2.5 ÷ 1000
```

FatSecret 数据仅用于小规模、带来源链接的演示记录。若后续批量接入，应使用其正式 API 并遵守署名与使用条款。

## 项目结构

```text
.
├── src/
│   ├── core/              # 营养计算与推荐规则
│   ├── data/              # 菜品数据与来源元信息
│   ├── app.js             # 页面状态与交互
│   └── styles.css         # 响应式界面
├── tests/                 # Node 原生测试
├── scripts/               # 本地服务、构建与检查
├── data/                  # 可审阅的 CSV 数据快照
├── docs/                  # 架构、数据方法和缺口
├── .github/               # CI、Pages、Issue 与 PR 模板
└── index.html
```

架构说明见 [docs/architecture.md](docs/architecture.md)。

## Roadmap

- [x] 自由选餐和营养合计
- [x] 数据来源与缺失值展示
- [x] 三种可运行目标配餐
- [x] 控钠模式安全降级
- [x] 自动化测试和 GitHub Actions
- [x] GitHub Pages 部署
- [ ] 逐条核验官方营养标识
- [ ] 补全钠和真实出餐份量
- [ ] 扩展至 30～50 个菜品
- [ ] 添加地区、在售状态与数据版本
- [ ] 支持用户导入自定义数据
- [ ] 在合法授权前提下接入正式数据 API

## 参与贡献

欢迎提交数据勘误、来源补充和规则改进。涉及营养值的改动必须附原始来源、份量口径和访问日期，详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

- 源代码使用 [MIT License](LICENSE)。
- 第三方营养事实、名称与商标不因代码许可证而重新授权，见 [DATA_LICENSE.md](DATA_LICENSE.md)。
