export const CATEGORY_LABELS = Object.freeze({
  all: "全部",
  staple: "主食",
  main_dish: "主菜",
  vegetable: "蔬菜",
});

export const SOURCE_LEVELS = Object.freeze({
  official: {
    label: "官方公开",
    tone: "high",
  },
  third_party: {
    label: "第三方整理",
    tone: "medium",
  },
  estimated: {
    label: "估算",
    tone: "low",
  },
});

export const foods = Object.freeze([
  {
    id: "lxj-lu-ji-tui",
    name: "卤鸡腿",
    category: "main_dish",
    serving: {
      amount: 1,
      unit: "份",
      weightG: 65,
      label: "1份（65克）",
    },
    nutrients: {
      kcal: 129,
      proteinG: 14,
      fatG: 7,
      carbG: 2,
      sodiumMg: null,
    },
    source: {
      type: "third_party",
      publisher: "FatSecret",
      title: "老乡鸡 卤鸡腿的热量和营养成分",
      url: "https://www.fatsecret.cn/热量营养/老乡鸡/卤鸡腿/1份",
      accessedAt: "2026-07-02",
    },
    notes: ["钠含量未公开"],
  },
  {
    id: "lxj-cong-you-cai-tai",
    name: "葱油菜苔",
    category: "vegetable",
    serving: {
      amount: 100,
      unit: "克",
      weightG: 100,
      label: "每100克",
    },
    nutrients: {
      kcal: 83,
      proteinG: 2.3,
      fatG: 5.9,
      carbG: 4.2,
      sodiumMg: null,
    },
    source: {
      type: "third_party",
      publisher: "FatSecret",
      title: "老乡鸡 葱油菜苔的热量和营养成分",
      url: "https://www.fatsecret.cn/热量营养/老乡鸡/葱油菜苔/100克",
      accessedAt: "2026-07-02",
    },
    notes: ["钠含量未公开", "门店实际份量未公开"],
  },
  {
    id: "lxj-chi-zhi-yu-kuai",
    name: "豉汁鱼块",
    category: "main_dish",
    serving: {
      amount: 100,
      unit: "克",
      weightG: 100,
      label: "每100克",
    },
    nutrients: {
      kcal: 121,
      proteinG: 12.7,
      fatG: 7.3,
      carbG: 1.2,
      sodiumMg: null,
    },
    source: {
      type: "third_party",
      publisher: "FatSecret",
      title: "老乡鸡 豉汁鱼块的热量和营养成分",
      url: "https://www.fatsecret.cn/热量营养/老乡鸡/豉汁鱼块/100克",
      accessedAt: "2026-07-02",
    },
    notes: ["钠含量未公开", "门店实际份量未公开"],
  },
  {
    id: "lxj-zheng-nen-dou-fu",
    name: "蒸嫩豆腐",
    category: "main_dish",
    serving: {
      amount: 100,
      unit: "克",
      weightG: 100,
      label: "每100克",
    },
    nutrients: {
      kcal: 112,
      proteinG: 7.2,
      fatG: 4.5,
      carbG: 10.5,
      sodiumMg: null,
    },
    source: {
      type: "third_party",
      publisher: "FatSecret",
      title: "老乡鸡 蒸嫩豆腐的热量和营养成分",
      url: "https://www.fatsecret.cn/热量营养/老乡鸡/蒸嫩豆腐/100克",
      accessedAt: "2026-07-02",
    },
    notes: ["钠含量未公开", "门店实际份量未公开"],
  },
  {
    id: "lxj-broccoli-chicken",
    name: "西兰花炒鸡胸肉",
    category: "main_dish",
    serving: {
      amount: 100,
      unit: "克",
      weightG: 100,
      label: "每100克",
    },
    nutrients: {
      kcal: 94,
      proteinG: 8.3,
      fatG: 5.2,
      carbG: 3.5,
      sodiumMg: null,
    },
    source: {
      type: "third_party",
      publisher: "FatSecret",
      title: "老乡鸡 西兰花炒鸡胸肉的热量和营养成分",
      url: "https://www.fatsecret.cn/热量营养/老乡鸡/西兰花炒鸡胸肉/100克",
      accessedAt: "2026-07-02",
    },
    notes: ["钠含量未公开", "门店实际份量未公开"],
  },
  {
    id: "lxj-san-hei-yuan-qi-fan",
    name: "三黑元气饭",
    category: "staple",
    serving: {
      amount: 1,
      unit: "份",
      weightG: null,
      label: "1份（克重未公开）",
    },
    nutrients: {
      kcal: 508,
      proteinG: 9,
      fatG: 3,
      carbG: 111,
      sodiumMg: null,
    },
    source: {
      type: "third_party",
      publisher: "FatSecret",
      title: "老乡鸡 三黑元气饭的热量和营养成分",
      url: "https://www.fatsecret.cn/热量营养/老乡鸡/三黑元气饭/1份",
      accessedAt: "2026-07-02",
    },
    notes: ["钠含量未公开", "每份克重未公开"],
  },
]);

export const foodIndex = new Map(foods.map((food) => [food.id, food]));
