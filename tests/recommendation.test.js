import test from "node:test";
import assert from "node:assert/strict";

import { foodIndex, foods } from "../src/data/foods.js";
import {
  enumerateMealCandidates,
  recommendMeals,
} from "../src/core/recommendation.js";

test("candidate generation creates every staple-main-vegetable combination", () => {
  const candidates = enumerateMealCandidates(foods);

  assert.equal(candidates.length, 4);
  assert.ok(candidates.every((items) => items.length === 3));
});

test("balanced recommendation is deterministic and returns three meals", () => {
  const first = recommendMeals(foods, foodIndex, "balanced", 3);
  const second = recommendMeals(foods, foodIndex, "balanced", 3);

  assert.equal(first.available, true);
  assert.equal(first.results.length, 3);
  assert.deepEqual(
    first.results.map((result) => result.items),
    second.results.map((result) => result.items),
  );
});

test("low sodium mode refuses to rank meals when sodium is missing", () => {
  const recommendation = recommendMeals(foods, foodIndex, "low_sodium", 3);

  assert.equal(recommendation.available, false);
  assert.equal(recommendation.results.length, 0);
  assert.match(recommendation.reason, /缺少钠含量/);
});

test("unknown recommendation goal is rejected", () => {
  assert.throws(
    () => recommendMeals(foods, foodIndex, "mystery"),
    /未知配餐目标/,
  );
});
