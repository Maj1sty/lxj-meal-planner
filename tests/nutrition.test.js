import test from "node:test";
import assert from "node:assert/strict";

import { foodIndex } from "../src/data/foods.js";
import {
  buildMealAssessment,
  calculateMeal,
  normalizeQuantity,
} from "../src/core/nutrition.js";

test("calculateMeal sums complete nutrient values with quantities", () => {
  const meal = calculateMeal(
    [
      { foodId: "lxj-lu-ji-tui", quantity: 2 },
      { foodId: "lxj-cong-you-cai-tai", quantity: 1 },
    ],
    foodIndex,
  );

  assert.equal(meal.values.kcal, 341);
  assert.equal(meal.values.proteinG, 30.3);
  assert.equal(meal.values.fatG, 19.9);
  assert.equal(meal.values.carbG, 8.2);
});

test("missing sodium remains unknown instead of being treated as zero", () => {
  const meal = calculateMeal(
    [{ foodId: "lxj-lu-ji-tui", quantity: 1 }],
    foodIndex,
  );

  assert.equal(meal.values.sodiumMg, null);
  assert.equal(meal.values.saltEquivalentG, null);
  assert.deepEqual(meal.missingByNutrient.sodiumMg, ["lxj-lu-ji-tui"]);
});

test("assessment surfaces the sodium data gap", () => {
  const meal = calculateMeal(
    [{ foodId: "lxj-lu-ji-tui", quantity: 1 }],
    foodIndex,
  );
  const assessment = buildMealAssessment(meal);

  assert.equal(assessment.tone, "caution");
  assert.ok(assessment.messages.some((message) => message.includes("钠数据")));
});

test("invalid quantities are rejected", () => {
  assert.throws(() => normalizeQuantity(0), /大于 0/);
  assert.throws(() => normalizeQuantity(0.001), /大于 0/);
  assert.throws(() => normalizeQuantity("not-a-number"), /大于 0/);
});

test("unknown food ids are rejected", () => {
  assert.throws(
    () => calculateMeal([{ foodId: "missing", quantity: 1 }], foodIndex),
    /找不到菜品/,
  );
});

test("an empty meal does not masquerade as a zero-nutrition meal", () => {
  const meal = calculateMeal([], foodIndex);

  assert.equal(meal.values.kcal, null);
  assert.equal(meal.values.sodiumMg, null);
  assert.equal(meal.values.saltEquivalentG, null);
  assert.equal(meal.completeness.completeFields, 0);
  assert.equal(meal.completeness.ratio, 0);
});
