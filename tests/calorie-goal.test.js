import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCalorieProgress,
  DEFAULT_DAILY_CALORIE_GOAL,
  normalizeDailyCalorieGoal,
} from "../src/core/calorie-goal.js";

test("daily calorie goals are normalized to the supported range", () => {
  assert.equal(normalizeDailyCalorieGoal("1850"), 1850);
  assert.equal(normalizeDailyCalorieGoal(500), 800);
  assert.equal(normalizeDailyCalorieGoal(9000), 6000);
  assert.equal(normalizeDailyCalorieGoal(null), DEFAULT_DAILY_CALORIE_GOAL);
  assert.equal(normalizeDailyCalorieGoal("invalid"), DEFAULT_DAILY_CALORIE_GOAL);
});

test("calorie progress reports percentage and remaining calories", () => {
  const progress = buildCalorieProgress(650, 2000);

  assert.equal(progress.percentage, 32.5);
  assert.equal(progress.remainingKcal, 1350);
  assert.equal(progress.exceeded, false);
});

test("calorie progress caps the visual bar but preserves overage", () => {
  const progress = buildCalorieProgress(2300, 2000);

  assert.equal(progress.progressPercentage, 100);
  assert.equal(progress.remainingKcal, -300);
  assert.equal(progress.exceeded, true);
});
