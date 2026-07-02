import test from "node:test";
import assert from "node:assert/strict";

import { foods } from "../src/data/foods.js";

const nutrientFields = ["kcal", "proteinG", "fatG", "carbG", "sodiumMg"];

test("food ids are unique and required provenance is present", () => {
  const ids = foods.map((food) => food.id);
  assert.equal(new Set(ids).size, ids.length);

  for (const food of foods) {
    assert.ok(food.name);
    assert.ok(food.serving.label);
    assert.match(food.source.url, /^https:\/\//);
    assert.match(food.source.accessedAt, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("nutrient fields contain numbers or explicit nulls", () => {
  for (const food of foods) {
    for (const field of nutrientFields) {
      const value = food.nutrients[field];
      assert.ok(
        value === null || (Number.isFinite(value) && value >= 0),
        `${food.id}.${field} must be a non-negative number or null`,
      );
    }
  }
});

test("known V1 gaps remain explicit and documented in records", () => {
  assert.ok(foods.every((food) => food.nutrients.sodiumMg === null));
  assert.ok(
    foods.every((food) => food.notes.some((note) => note.includes("钠"))),
  );
});
