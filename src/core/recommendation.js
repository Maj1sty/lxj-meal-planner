import { calculateMeal, roundTo } from "./nutrition.js";

export const GOALS = Object.freeze({
  balanced: {
    label: "均衡组合",
    shortLabel: "均衡",
    description: "兼顾热量、蛋白质和脂肪，不追求单项极值。",
  },
  lower_calorie: {
    label: "轻负担组合",
    shortLabel: "轻负担",
    description: "在当前候选中优先较低热量，同时保留蛋白质菜。",
  },
  high_protein: {
    label: "高蛋白优先",
    shortLabel: "高蛋白",
    description: "在当前候选中优先蛋白质总量与蛋白质密度。",
  },
  low_sodium: {
    label: "控钠优先",
    shortLabel: "控钠",
    description: "仅在候选菜品钠数据完整时进行排名。",
  },
});

export function enumerateMealCandidates(foods) {
  const staples = foods.filter((food) => food.category === "staple");
  const mains = foods.filter((food) => food.category === "main_dish");
  const vegetables = foods.filter((food) => food.category === "vegetable");
  const candidates = [];

  for (const staple of staples) {
    for (const main of mains) {
      for (const vegetable of vegetables) {
        candidates.push([
          { foodId: staple.id, quantity: 1 },
          { foodId: main.id, quantity: 1 },
          { foodId: vegetable.id, quantity: 1 },
        ]);
      }
    }
  }

  return candidates;
}

export function recommendMeals(foods, foodsById, goal = "balanced", limit = 3) {
  if (!GOALS[goal]) {
    throw new RangeError(`未知配餐目标：${goal}`);
  }

  const rawCandidates = enumerateMealCandidates(foods);

  if (rawCandidates.length === 0) {
    return {
      available: false,
      reason: "至少需要 1 个主食、1 个主菜和 1 个蔬菜菜品。",
      results: [],
    };
  }

  const evaluated = rawCandidates.map((items) => {
    const meal = calculateMeal(items, foodsById);
    const scoring = scoreMeal(meal, goal);

    return {
      items,
      meal,
      ...scoring,
    };
  });

  if (goal === "low_sodium" && evaluated.every((candidate) => !candidate.eligible)) {
    return {
      available: false,
      reason: "所有候选菜品均缺少钠含量，无法负责任地生成控钠排名。",
      results: [],
    };
  }

  const results = evaluated
    .filter((candidate) => candidate.eligible)
    .sort((left, right) => (
      right.score - left.score
      || left.meal.values.kcal - right.meal.values.kcal
      || mealKey(left).localeCompare(mealKey(right))
    ))
    .slice(0, Math.max(1, limit));

  return {
    available: results.length > 0,
    reason: results.length > 0 ? null : "当前数据无法生成符合条件的组合。",
    results,
  };
}

function scoreMeal(meal, goal) {
  const { kcal, proteinG, fatG, sodiumMg } = meal.values;

  if ([kcal, proteinG, fatG].some((value) => value === null)) {
    return {
      eligible: false,
      score: 0,
      explanation: ["热量或宏量营养数据不完整。"],
    };
  }

  if (goal === "low_sodium") {
    if (sodiumMg === null) {
      return {
        eligible: false,
        score: 0,
        explanation: ["钠数据缺失，不能参与控钠排名。"],
      };
    }

    const score = clampScore(100 - sodiumMg / 25);
    return {
      eligible: true,
      score,
      explanation: [
        `已知钠含量 ${Math.round(sodiumMg)} mg。`,
        "钠越低，当前模式得分越高。",
      ],
    };
  }

  if (goal === "lower_calorie") {
    const proteinFloorPenalty = Math.max(0, 22 - proteinG) * 1.2;
    const score = clampScore(105 - kcal / 12 - proteinFloorPenalty);
    return {
      eligible: true,
      score,
      explanation: [
        `总热量 ${Math.round(kcal)} kcal。`,
        `蛋白质 ${proteinG.toFixed(1)} g，未通过删掉主菜来压低热量。`,
      ],
    };
  }

  if (goal === "high_protein") {
    const proteinDensity = proteinG / Math.max(kcal, 1) * 100;
    const score = clampScore(35 + proteinG * 1.15 + proteinDensity * 3);
    return {
      eligible: true,
      score,
      explanation: [
        `蛋白质 ${proteinG.toFixed(1)} g。`,
        `每 100 kcal 含蛋白质 ${proteinDensity.toFixed(1)} g。`,
      ],
    };
  }

  const energyPenalty = Math.abs(kcal - 700) / 13;
  const proteinPenalty = Math.abs(proteinG - 28) * 1.1;
  const fatPenalty = Math.max(0, fatG - 24) * 1.5;
  const score = clampScore(100 - energyPenalty - proteinPenalty - fatPenalty);

  return {
    eligible: true,
    score,
    explanation: [
      `总热量 ${Math.round(kcal)} kcal，蛋白质 ${proteinG.toFixed(1)} g。`,
      "组合固定包含主食、主菜和独立蔬菜。",
    ],
  };
}

function clampScore(value) {
  return roundTo(Math.max(0, Math.min(100, value)), 0);
}

function mealKey(candidate) {
  return candidate.items.map((item) => item.foodId).join("|");
}
