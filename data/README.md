# 数据目录

`foods.csv` 是便于审阅和后续导入的数据快照，空单元格代表未知值，不代表零。

当前网页运行时使用 `src/data/foods.js` 与 `src/data/report-foods.generated.js`。CSV 通过 `node scripts/export-foods-csv.mjs` 自动生成，不应人工维护。

字段说明见 [`docs/data-methodology.md`](../docs/data-methodology.md)，已知缺口见 [`docs/data-gaps.md`](../docs/data-gaps.md)。
