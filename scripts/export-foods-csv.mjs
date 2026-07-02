import { writeFile } from "node:fs/promises";
import { foods } from "../src/data/foods.js";

const outputPath = process.argv[2] ?? "data/foods.csv";
const fields = [
  "food_id",
  "name",
  "category",
  "serving_amount",
  "serving_unit",
  "serving_weight_g",
  "kcal",
  "protein_g",
  "fat_g",
  "carb_g",
  "sodium_mg",
  "source_type",
  "source_publisher",
  "source_url",
  "accessed_at",
  "notes",
];

function cell(value) {
  if (value === null || value === undefined) {
    return "";
  }
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const rows = foods.map((food) => [
  food.id,
  food.name,
  food.category,
  food.serving.amount,
  food.serving.unit,
  food.serving.weightG,
  food.nutrients.kcal,
  food.nutrients.proteinG,
  food.nutrients.fatG,
  food.nutrients.carbG,
  food.nutrients.sodiumMg,
  food.source.type,
  food.source.publisher,
  food.source.url,
  food.source.accessedAt,
  food.notes.join("；"),
]);

const csv = [
  fields.join(","),
  ...rows.map((row) => row.map(cell).join(",")),
  "",
].join("\n");

await writeFile(outputPath, csv, "utf8");
console.log(`Exported ${foods.length} foods to ${outputPath}.`);
