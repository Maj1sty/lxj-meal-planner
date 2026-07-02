import {
  CATEGORY_LABELS,
  foodIndex,
  foods,
  SOURCE_LEVELS,
} from "./data/foods.js";
import {
  buildMealAssessment,
  calculateMeal,
  formatValue,
  NUTRIENT_META,
} from "./core/nutrition.js";
import {
  GOALS,
  recommendMeals,
} from "./core/recommendation.js";

const state = {
  category: "all",
  query: "",
  goal: "balanced",
  selected: new Map([
    ["lxj-san-hei-yuan-qi-fan", 1],
    ["lxj-lu-ji-tui", 1],
    ["lxj-cong-you-cai-tai", 1],
  ]),
};

const elements = {
  categoryFilters: document.querySelector("#category-filters"),
  foodList: document.querySelector("#food-list"),
  foodSearch: document.querySelector("#food-search"),
  selectedFoods: document.querySelector("#selected-foods"),
  nutritionSummary: document.querySelector("#nutrition-summary"),
  mealAssessment: document.querySelector("#meal-assessment"),
  clearMeal: document.querySelector("#clear-meal"),
  copySummary: document.querySelector("#copy-summary"),
  goalSelector: document.querySelector("#goal-selector"),
  recommendationContext: document.querySelector("#recommendation-context"),
  recommendationList: document.querySelector("#recommendation-list"),
  heroMealKcal: document.querySelector("#hero-meal-kcal"),
  heroFoodCount: document.querySelector("#hero-food-count"),
  toast: document.querySelector("#toast"),
};

function render() {
  renderCategoryFilters();
  renderFoodList();
  renderMeal();
  renderGoalSelector();
  renderRecommendations();
}

function renderCategoryFilters() {
  elements.categoryFilters.innerHTML = Object.entries(CATEGORY_LABELS)
    .map(([value, label]) => `
      <button
        class="filter-chip ${state.category === value ? "active" : ""}"
        type="button"
        data-category="${value}"
        aria-pressed="${state.category === value}"
      >
        ${label}
        <span>${value === "all" ? foods.length : foods.filter((food) => food.category === value).length}</span>
      </button>
    `)
    .join("");
}

function renderFoodList() {
  const normalizedQuery = state.query.trim().toLocaleLowerCase("zh-CN");
  const filteredFoods = foods.filter((food) => {
    const matchesCategory = state.category === "all" || food.category === state.category;
    const matchesQuery = food.name.toLocaleLowerCase("zh-CN").includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

  if (filteredFoods.length === 0) {
    elements.foodList.innerHTML = `
      <div class="empty-state">
        <span aria-hidden="true">⌕</span>
        <strong>没有找到匹配菜品</strong>
        <p>换个关键词，或者切回“全部”看看。</p>
      </div>
    `;
    return;
  }

  elements.foodList.innerHTML = filteredFoods
    .map((food) => {
      const selectedQuantity = state.selected.get(food.id) ?? 0;
      const sourceLevel = SOURCE_LEVELS[food.source.type];

      return `
        <article class="food-card ${selectedQuantity > 0 ? "selected" : ""}">
          <div class="food-card-top">
            <span class="category-pill">${CATEGORY_LABELS[food.category]}</span>
            <span class="source-pill ${sourceLevel.tone}">
              <i></i>${sourceLevel.label}
            </span>
          </div>
          <div class="food-card-title">
            <div>
              <h4>${food.name}</h4>
              <p>${food.serving.label}</p>
            </div>
            <div class="calorie-mark">
              <strong>${food.nutrients.kcal}</strong>
              <span>kcal</span>
            </div>
          </div>
          <dl class="macro-row">
            <div><dt>蛋白质</dt><dd>${food.nutrients.proteinG.toFixed(1)}g</dd></div>
            <div><dt>脂肪</dt><dd>${food.nutrients.fatG.toFixed(1)}g</dd></div>
            <div><dt>碳水</dt><dd>${food.nutrients.carbG.toFixed(1)}g</dd></div>
          </dl>
          <div class="food-card-bottom">
            <span class="missing-flag">
              <i>!</i> 钠待补充
            </span>
            <button
              class="add-button"
              type="button"
              data-action="add-food"
              data-food-id="${food.id}"
              aria-label="添加${food.name}"
            >
              ${selectedQuantity > 0 ? `已选 ${selectedQuantity}×` : "加入餐盘"}
              <span aria-hidden="true">${selectedQuantity > 0 ? "✓" : "+"}</span>
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderMeal() {
  const items = selectedItems();
  const meal = calculateMeal(items, foodIndex);
  const assessment = buildMealAssessment(meal);

  if (items.length === 0) {
    elements.selectedFoods.innerHTML = `
      <div class="meal-empty">
        <div class="empty-plate"><span>+</span></div>
        <strong>餐盘还是空的</strong>
        <p>从左侧加入菜品，或者直接采用下方推荐。</p>
      </div>
    `;
  } else {
    elements.selectedFoods.innerHTML = meal.items
      .map(({ food, quantity }) => `
        <div class="selected-item">
          <div class="selected-item-main">
            <span class="selected-dot ${food.category}"></span>
            <div>
              <strong>${food.name}</strong>
              <small>${displayServing(food, quantity)}</small>
            </div>
          </div>
          <div class="quantity-control" aria-label="${food.name}数量">
            <button
              type="button"
              data-action="decrease"
              data-food-id="${food.id}"
              aria-label="减少${food.name}"
            >−</button>
            <span>${quantity}</span>
            <button
              type="button"
              data-action="increase"
              data-food-id="${food.id}"
              aria-label="增加${food.name}"
            >+</button>
          </div>
          <button
            class="remove-button"
            type="button"
            data-action="remove"
            data-food-id="${food.id}"
            aria-label="移除${food.name}"
          >×</button>
        </div>
      `)
      .join("");
  }

  const fields = ["kcal", "proteinG", "fatG", "carbG", "sodiumMg", "saltEquivalentG"];
  elements.nutritionSummary.innerHTML = `
    <div class="nutrition-grid">
      ${fields.map((field) => nutritionTile(field, meal)).join("")}
    </div>
    <div class="completeness-row">
      <div>
        <span>结果完整度</span>
        <strong>${Math.round(meal.completeness.ratio * 100)}%</strong>
      </div>
      <div class="completeness-track">
        <i style="width:${meal.completeness.ratio * 100}%"></i>
      </div>
      <small>${meal.completeness.completeFields}/${meal.completeness.totalFields} 项原始指标完整</small>
    </div>
  `;

  elements.mealAssessment.innerHTML = `
    <div class="assessment-head ${assessment.tone}">
      <span aria-hidden="true">${assessment.tone === "caution" ? "!" : "✓"}</span>
      <strong>${assessment.title}</strong>
    </div>
    <ul>
      ${assessment.messages.map((message) => `<li>${message}</li>`).join("")}
    </ul>
  `;

  elements.clearMeal.disabled = items.length === 0;
  elements.copySummary.disabled = items.length === 0;
  elements.heroMealKcal.textContent = meal.values.kcal === null
    ? "—"
    : Math.round(meal.values.kcal);
  elements.heroFoodCount.textContent = foods.length;
}

function nutritionTile(field, meal) {
  const value = meal.values[field];
  const meta = NUTRIENT_META[field];
  const missingCount = field === "saltEquivalentG"
    ? meal.missingByNutrient.sodiumMg.length
    : (meal.missingByNutrient[field]?.length ?? 0);

  return `
    <div class="nutrition-tile ${value === null ? "missing" : ""}">
      <span>${meta.label}</span>
      <strong>${value === null ? "—" : Number(value).toFixed(meta.digits)}</strong>
      <small>${
        value === null
          ? (meal.items.length === 0 ? "未选择" : `缺 ${missingCount} 项`)
          : meta.unit
      }</small>
    </div>
  `;
}

function renderGoalSelector() {
  elements.goalSelector.innerHTML = Object.entries(GOALS)
    .map(([value, goal]) => `
      <button
        class="goal-button ${state.goal === value ? "active" : ""} ${value === "low_sodium" ? "has-gap" : ""}"
        type="button"
        data-goal="${value}"
        aria-pressed="${state.goal === value}"
      >
        <span class="goal-icon" aria-hidden="true">${goalIcon(value)}</span>
        <span>
          <strong>${goal.label}</strong>
          <small>${goal.description}</small>
        </span>
        ${value === "low_sodium" ? '<i class="goal-warning">数据不足</i>' : ""}
      </button>
    `)
    .join("");
}

function renderRecommendations() {
  const recommendation = recommendMeals(foods, foodIndex, state.goal, 3);
  const goal = GOALS[state.goal];

  elements.recommendationContext.innerHTML = `
    <div>
      <span>当前目标</span>
      <strong>${goal.label}</strong>
    </div>
    <p>${goal.description} 评分只用于当前候选间比较，不是医学健康分。</p>
  `;

  if (!recommendation.available) {
    elements.recommendationList.innerHTML = `
      <div class="recommendation-unavailable">
        <span aria-hidden="true">!</span>
        <div>
          <strong>这个模式暂时不能可靠运行</strong>
          <p>${recommendation.reason}</p>
          <a href="#data-notes">查看缺失数据说明 →</a>
        </div>
      </div>
    `;
    return;
  }

  elements.recommendationList.innerHTML = recommendation.results
    .map((result, index) => {
      const itemNames = result.items
        .map((item) => foodIndex.get(item.foodId).name);
      const values = result.meal.values;

      return `
        <article class="recommendation-card ${index === 0 ? "best" : ""}">
          <div class="recommendation-rank">
            <span>${String(index + 1).padStart(2, "0")}</span>
            ${index === 0 ? "<b>最匹配</b>" : "<b>备选</b>"}
          </div>
          <div class="recommendation-body">
            <div class="recommendation-title-row">
              <div>
                <span class="category-pill">${goal.shortLabel}</span>
                <h3>${itemNames.join(" · ")}</h3>
              </div>
              <div class="score-ring" style="--score:${result.score}">
                <strong>${result.score}</strong>
                <small>适配度</small>
              </div>
            </div>
            <div class="recommendation-macros">
              <span><b>${Math.round(values.kcal)}</b> kcal</span>
              <span><b>${values.proteinG.toFixed(1)}</b>g 蛋白质</span>
              <span><b>${values.fatG.toFixed(1)}</b>g 脂肪</span>
              <span><b>${values.carbG.toFixed(1)}</b>g 碳水</span>
            </div>
            <div class="recommendation-why">
              <strong>为什么推荐</strong>
              <ul>${result.explanation.map((line) => `<li>${line}</li>`).join("")}</ul>
            </div>
            <div class="recommendation-footer">
              <span><i></i> 钠数据仍待补充</span>
              <button
                class="button button-dark"
                type="button"
                data-action="use-recommendation"
                data-recommendation-index="${index}"
              >
                采用这份组合
                <span aria-hidden="true">+</span>
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function selectedItems() {
  return Array.from(state.selected, ([foodId, quantity]) => ({ foodId, quantity }));
}

function displayServing(food, quantity) {
  if (food.serving.unit === "克") {
    return `${food.serving.amount * quantity} 克`;
  }

  if (food.serving.weightG) {
    return `${quantity} 份 · 约 ${food.serving.weightG * quantity} 克`;
  }

  return `${quantity} 份 · 克重未知`;
}

function goalIcon(goal) {
  return {
    balanced: "◒",
    lower_calorie: "↘",
    high_protein: "↗",
    low_sodium: "≈",
  }[goal];
}

function adjustQuantity(foodId, delta) {
  const current = state.selected.get(foodId) ?? 0;
  const next = Math.round((current + delta) * 2) / 2;

  if (next <= 0) {
    state.selected.delete(foodId);
  } else {
    state.selected.set(foodId, Math.min(next, 5));
  }
  renderFoodList();
  renderMeal();
}

function copyMealSummary() {
  const meal = calculateMeal(selectedItems(), foodIndex);
  const itemLines = meal.items.map(
    ({ food, quantity }) => `- ${food.name}：${displayServing(food, quantity)}`,
  );
  const text = [
    "本餐组合",
    ...itemLines,
    "",
    "营养合计",
    `- 热量：${formatValue("kcal", meal.values.kcal)}`,
    `- 蛋白质：${formatValue("proteinG", meal.values.proteinG)}`,
    `- 脂肪：${formatValue("fatG", meal.values.fatG)}`,
    `- 碳水：${formatValue("carbG", meal.values.carbG)}`,
    `- 钠：${formatValue("sodiumMg", meal.values.sodiumMg)}`,
    `- 食盐当量：${formatValue("saltEquivalentG", meal.values.saltEquivalentG)}`,
    "",
    "说明：结果基于公开第三方数据；缺失值未按 0 计算。",
  ].join("\n");

  navigator.clipboard.writeText(text)
    .then(() => showToast("本餐摘要已复制"))
    .catch(() => showToast("复制失败，请检查浏览器权限"));
}

let toastTimer;
function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    elements.toast.classList.remove("visible");
  }, 2400);
}

elements.foodSearch.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderFoodList();
});

elements.clearMeal.addEventListener("click", () => {
  state.selected.clear();
  renderFoodList();
  renderMeal();
  showToast("餐盘已清空");
});

elements.copySummary.addEventListener("click", copyMealSummary);

document.addEventListener("click", (event) => {
  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton) {
    state.category = categoryButton.dataset.category;
    renderCategoryFilters();
    renderFoodList();
    return;
  }

  const goalButton = event.target.closest("[data-goal]");
  if (goalButton) {
    state.goal = goalButton.dataset.goal;
    renderGoalSelector();
    renderRecommendations();
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) {
    return;
  }

  const { action, foodId } = actionButton.dataset;
  if (action === "add-food") {
    adjustQuantity(foodId, 1);
    showToast(`${foodIndex.get(foodId).name} 已加入餐盘`);
  } else if (action === "increase") {
    adjustQuantity(foodId, 0.5);
  } else if (action === "decrease") {
    adjustQuantity(foodId, -0.5);
  } else if (action === "remove") {
    state.selected.delete(foodId);
    renderFoodList();
    renderMeal();
  } else if (action === "use-recommendation") {
    const recommendation = recommendMeals(foods, foodIndex, state.goal, 3);
    const result = recommendation.results[Number(actionButton.dataset.recommendationIndex)];
    if (result) {
      state.selected = new Map(
        result.items.map((item) => [item.foodId, item.quantity]),
      );
      renderFoodList();
      renderMeal();
      document.querySelector("#planner").scrollIntoView({ behavior: "smooth" });
      showToast("推荐组合已放入餐盘");
    }
  }
});

render();
