import {
  CATEGORY_LABELS,
  foodIndex,
  foods,
  SOURCE_LEVELS,
  STORE_TEMPLATE,
} from "./data/foods.js?version=v0.4.0";
import {
  buildCalorieProgress,
  DEFAULT_DAILY_CALORIE_GOAL,
  normalizeDailyCalorieGoal,
} from "./core/calorie-goal.js?version=v0.4.0";
import {
  buildMealAssessment,
  calculateMeal,
  formatValue,
  NUTRIENT_META,
} from "./core/nutrition.js?version=v0.4.0";

const state = {
  category: "all",
  query: "",
  dailyCalorieGoal: loadDailyCalorieGoal(),
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
  heroMealKcal: document.querySelector("#hero-meal-kcal"),
  heroFoodCount: document.querySelector("#hero-food-count"),
  macroCoverage: document.querySelector("#macro-coverage"),
  sodiumCoverage: document.querySelector("#sodium-coverage"),
  sodiumCoverageBar: document.querySelector("#sodium-coverage-bar"),
  officialCoverage: document.querySelector("#official-coverage"),
  storeTemplateName: document.querySelector("#store-template-name"),
  storeTemplateMeta: document.querySelector("#store-template-meta"),
  storeTemplateCount: document.querySelector("#store-template-count"),
  dailyCalorieGoal: document.querySelector("#daily-calorie-goal"),
  calorieGoalValue: document.querySelector("#calorie-goal-value"),
  calorieGoalRatio: document.querySelector("#calorie-goal-ratio"),
  calorieGoalRemaining: document.querySelector("#calorie-goal-remaining"),
  calorieGoalBar: document.querySelector("#calorie-goal-bar"),
  calorieGoalStatus: document.querySelector("#calorie-goal-status"),
  offlineStatus: document.querySelector("#offline-status"),
  toast: document.querySelector("#toast"),
};

function render() {
  renderCategoryFilters();
  renderFoodList();
  renderMeal();
  renderDataCoverage();
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
        <article class="food-card category-${food.category} ${selectedQuantity > 0 ? "selected" : ""}">
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
            <span class="missing-flag ${food.nutrients.sodiumMg === null ? "" : "complete"}">
              <i>${food.nutrients.sodiumMg === null ? "!" : "✓"}</i>
              ${food.nutrients.sodiumMg === null
                ? "钠待补充"
                : `钠 ${food.nutrients.sodiumMg}mg`}
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
          <p>从左侧挑选菜品，自由搭配这一餐。</p>
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
  renderDailyCalorieGoal(meal.values.kcal);
}

function renderDataCoverage() {
  const sodiumCount = foods.filter((food) => food.nutrients.sodiumMg !== null).length;
  const officialCount = foods.filter((food) => food.source.type === "official").length;
  const sodiumRatio = sodiumCount / foods.length;

  elements.macroCoverage.textContent = `${foods.length} / ${foods.length}`;
  elements.sodiumCoverage.textContent = `${sodiumCount} / ${foods.length}`;
  elements.sodiumCoverageBar.style.width = `${sodiumRatio * 100}%`;
  elements.officialCoverage.textContent = `${officialCount} / ${foods.length}`;
  elements.storeTemplateName.textContent = STORE_TEMPLATE.name;
  elements.storeTemplateMeta.textContent =
    `${STORE_TEMPLATE.city}${STORE_TEMPLATE.district} · ${STORE_TEMPLATE.scope}`;
  elements.storeTemplateCount.textContent = `${foods.length} 条`;
}

function renderDailyCalorieGoal(mealKcal) {
  const progress = buildCalorieProgress(mealKcal, state.dailyCalorieGoal);
  const percentage = progress.percentage === null
    ? 0
    : Math.round(progress.percentage);

  elements.dailyCalorieGoal.value = progress.goal;
  elements.calorieGoalValue.textContent = `${progress.goal} kcal`;
  elements.calorieGoalRatio.textContent = `${percentage}%`;
  elements.calorieGoalBar.style.width = `${progress.progressPercentage}%`;
  elements.calorieGoalBar.classList.toggle("over", progress.exceeded);

  if (progress.mealKcal === null) {
    elements.calorieGoalRemaining.textContent = "选餐后显示";
    elements.calorieGoalStatus.textContent = "当前只比较本餐与每日目标，不记录其他餐次。";
    return;
  }

  elements.calorieGoalRemaining.textContent = progress.exceeded
    ? `超出 ${Math.round(Math.abs(progress.remainingKcal))} kcal`
    : `剩余 ${Math.round(progress.remainingKcal)} kcal`;
  elements.calorieGoalStatus.textContent = progress.exceeded
    ? "本餐已超过设定的每日热量目标。"
    : `本餐约占每日目标的 ${percentage}%。`;
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

function selectedItems() {
  return Array.from(state.selected, ([foodId, quantity]) => ({ foodId, quantity }));
}

function loadDailyCalorieGoal() {
  try {
    return normalizeDailyCalorieGoal(
      localStorage.getItem("lxj-daily-calorie-goal"),
      DEFAULT_DAILY_CALORIE_GOAL,
    );
  } catch {
    return DEFAULT_DAILY_CALORIE_GOAL;
  }
}

function setDailyCalorieGoal(value) {
  state.dailyCalorieGoal = normalizeDailyCalorieGoal(value);
  try {
    localStorage.setItem(
      "lxj-daily-calorie-goal",
      String(state.dailyCalorieGoal),
    );
  } catch {
    // The goal still works for this session when storage is unavailable.
  }
  renderMeal();
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
    `每日热量目标：${state.dailyCalorieGoal} kcal`,
    `本餐占比：${Math.round(
      buildCalorieProgress(meal.values.kcal, state.dailyCalorieGoal).percentage ?? 0,
    )}%`,
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
elements.dailyCalorieGoal.addEventListener("input", (event) => {
  if (event.target.value !== "" && event.target.validity.valid) {
    setDailyCalorieGoal(event.target.value);
  }
});
elements.dailyCalorieGoal.addEventListener("change", (event) => {
  setDailyCalorieGoal(event.target.value);
});

document.addEventListener("click", (event) => {
  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton) {
    state.category = categoryButton.dataset.category;
    renderCategoryFilters();
    renderFoodList();
    return;
  }

  const calorieGoalButton = event.target.closest("[data-calorie-goal]");
  if (calorieGoalButton) {
    setDailyCalorieGoal(calorieGoalButton.dataset.calorieGoal);
    showToast(`每日热量目标已设为 ${state.dailyCalorieGoal} kcal`);
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
  }
});

function updateConnectionStatus() {
  const offline = !navigator.onLine;
  elements.offlineStatus.classList.toggle("offline", offline);
  elements.offlineStatus.querySelector("span").textContent = offline
    ? "当前离线 · 缓存可用"
    : "在线 · 已支持离线";
}

window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);

if ("serviceWorker" in navigator) {
  let refreshingForServiceWorkerUpdate = false;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshingForServiceWorkerUpdate) {
      return;
    }

    refreshingForServiceWorkerUpdate = true;
    window.location.reload();
  });

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "./service-worker.js",
        {
          scope: "./",
          updateViaCache: "none",
        },
      );
      await registration.update();
      updateConnectionStatus();
    } catch (error) {
      console.warn("Service Worker 注册失败：", error);
      elements.offlineStatus.querySelector("span").textContent = "离线缓存暂不可用";
    }
  });
}

render();
updateConnectionStatus();
