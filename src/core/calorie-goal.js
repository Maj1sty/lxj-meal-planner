export const DEFAULT_DAILY_CALORIE_GOAL = 2000;
export const MIN_DAILY_CALORIE_GOAL = 800;
export const MAX_DAILY_CALORIE_GOAL = 6000;

export function normalizeDailyCalorieGoal(
  value,
  fallback = DEFAULT_DAILY_CALORIE_GOAL,
) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.round(
    Math.min(
      MAX_DAILY_CALORIE_GOAL,
      Math.max(MIN_DAILY_CALORIE_GOAL, parsed),
    ),
  );
}

export function buildCalorieProgress(mealKcal, dailyGoal) {
  const goal = normalizeDailyCalorieGoal(dailyGoal);
  if (!Number.isFinite(mealKcal)) {
    return {
      goal,
      mealKcal: null,
      percentage: null,
      progressPercentage: 0,
      remainingKcal: goal,
      exceeded: false,
    };
  }

  const percentage = (mealKcal / goal) * 100;
  const remainingKcal = goal - mealKcal;

  return {
    goal,
    mealKcal,
    percentage,
    progressPercentage: Math.min(percentage, 100),
    remainingKcal,
    exceeded: remainingKcal < 0,
  };
}
