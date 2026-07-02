const NUTRIENT_FIELDS = Object.freeze([
  "kcal",
  "proteinG",
  "fatG",
  "carbG",
  "sodiumMg",
]);

export const NUTRIENT_META = Object.freeze({
  kcal: { label: "热量", unit: "kcal", digits: 0 },
  proteinG: { label: "蛋白质", unit: "g", digits: 1 },
  fatG: { label: "脂肪", unit: "g", digits: 1 },
  carbG: { label: "碳水", unit: "g", digits: 1 },
  sodiumMg: { label: "钠", unit: "mg", digits: 0 },
  saltEquivalentG: { label: "食盐当量", unit: "g", digits: 2 },
});

export function roundTo(value, digits = 1) {
  if (!Number.isFinite(value)) {
    return null;
  }

  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function normalizeQuantity(quantity) {
  const parsed = Number(quantity);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new TypeError("quantity 必须是大于 0 的数字");
  }

  const rounded = roundTo(parsed, 2);
  if (rounded <= 0) {
    throw new TypeError("quantity 精确到两位小数后必须大于 0");
  }

  return rounded;
}

export function calculateMeal(items, foodsById) {
  const normalizedItems = items.map((item) => {
    const food = foodsById.get(item.foodId);
    if (!food) {
      throw new RangeError(`找不到菜品：${item.foodId}`);
    }

    return {
      food,
      quantity: normalizeQuantity(item.quantity),
    };
  });

  const values = {};
  const knownSubtotals = {};
  const missingByNutrient = {};

  for (const field of NUTRIENT_FIELDS) {
    let subtotal = 0;
    const missingItems = [];

    for (const { food, quantity } of normalizedItems) {
      const value = food.nutrients[field];
      if (value === null || value === undefined) {
        missingItems.push(food.id);
      } else {
        subtotal += value * quantity;
      }
    }

    const digits = NUTRIENT_META[field].digits;
    knownSubtotals[field] = roundTo(subtotal, digits);
    missingByNutrient[field] = missingItems;
    values[field] = normalizedItems.length === 0 || missingItems.length > 0
      ? null
      : roundTo(subtotal, digits);
  }

  values.saltEquivalentG = values.sodiumMg === null
    ? null
    : roundTo(values.sodiumMg * 2.5 / 1000, 2);

  const completeFields = normalizedItems.length === 0
    ? 0
    : NUTRIENT_FIELDS.filter(
      (field) => missingByNutrient[field].length === 0,
    ).length;

  return {
    items: normalizedItems,
    values,
    knownSubtotals,
    missingByNutrient,
    completeness: {
      completeFields,
      totalFields: NUTRIENT_FIELDS.length,
      ratio: normalizedItems.length === 0
        ? 0
        : roundTo(completeFields / NUTRIENT_FIELDS.length, 2),
    },
    sourceBreakdown: countSourceTypes(normalizedItems),
  };
}

function countSourceTypes(items) {
  return items.reduce(
    (counts, { food }) => {
      const sourceType = food.source.type;
      counts[sourceType] = (counts[sourceType] ?? 0) + 1;
      return counts;
    },
    { official: 0, third_party: 0, estimated: 0 },
  );
}

export function buildMealAssessment(meal) {
  if (meal.items.length === 0) {
    return {
      tone: "neutral",
      title: "先选几道菜",
      messages: ["加入菜品后，这里会显示可解释的营养摘要。"],
    };
  }

  const { values } = meal;
  const messages = [];
  const hasVegetable = meal.items.some(
    ({ food }) => food.category === "vegetable",
  );

  if (values.proteinG !== null) {
    messages.push(`这份组合包含 ${formatValue("proteinG", values.proteinG)} 蛋白质。`);
  }

  if (!hasVegetable) {
    messages.push("当前组合没有独立蔬菜菜品，可按个人需要补充。");
  }

  if (values.sodiumMg === null) {
    messages.push("所选菜品缺少钠数据，暂时不能判断食盐当量或控钠表现。");
  } else {
    const dailyRatio = roundTo(values.saltEquivalentG / 5 * 100, 0);
    messages.push(`食盐当量约占成人每日 5g 参考上限的 ${dailyRatio}%。`);
  }

  if (meal.sourceBreakdown.official === 0) {
    messages.push("当前数值全部来自第三方整理，建议与官方营养标识交叉核验。");
  }

  return {
    tone: values.sodiumMg === null ? "caution" : "positive",
    title: values.sodiumMg === null ? "结果可算，但仍有关键缺口" : "本餐营养概览",
    messages,
  };
}

export function formatValue(field, value) {
  const meta = NUTRIENT_META[field];
  if (!meta) {
    throw new RangeError(`未知营养字段：${field}`);
  }

  if (value === null || value === undefined) {
    return "待补充";
  }

  return `${Number(value).toFixed(meta.digits)} ${meta.unit}`;
}
