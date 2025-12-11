// ---------------------------
// 定数・ストレージキー
// ---------------------------

const STORAGE_KEYS = {
  profile: "jinsei_os_profile",
  strategy: "jinsei_os_strategy",
  principles: "jinsei_os_principles",
  routines: "jinsei_os_routines",
};

const ROUTINE_BUTTON_DEFAULT = "時刻表を追加 / 更新";
const ROUTINE_BUTTON_EDIT = "時刻表を更新";

const DEFAULT_ROUTINES = [
  {
    id: "r_0830",
    time: "08:30",
    activity: "起床 / 水分補給・ストレッチ / 身支度",
  },
  { id: "r_0900", time: "09:00", activity: "朝食" },
  { id: "r_0920", time: "09:20", activity: "英語学習（集中①）" },
  { id: "r_1120", time: "11:20", activity: "休憩（散歩・コーヒー）" },
  { id: "r_1140", time: "11:40", activity: "昼食調理・食事" },
  { id: "r_1220", time: "12:20", activity: "自由休憩（仮眠 OK）" },
  { id: "r_1300", time: "13:00", activity: "軽い家事・雑務" },
  { id: "r_1400", time: "14:00", activity: "AI キャッチアップ" },
  { id: "r_1430", time: "14:30", activity: "フリー枠（買い物・雑務など）" },
  { id: "r_1500", time: "15:00", activity: "就活対策（1 時間）" },
  {
    id: "r_1600",
    time: "16:00",
    activity: "筋トレ（45 分）、ストレッチ、シャワー・水分",
  },
  { id: "r_1730", time: "17:30", activity: "英語学習（集中②／軽め）" },
  { id: "r_1830", time: "18:30", activity: "夕食調理・食事" },
  { id: "r_1930", time: "19:30", activity: "余暇（読書・動画）" },
  { id: "r_2100", time: "21:00", activity: "日記・家計簿・翌日の ToDo 決め" },
  { id: "r_2200", time: "22:00", activity: "入浴（湯船）" },
  { id: "r_2230", time: "22:30", activity: "瞑想・ライトダウン" },
  { id: "r_2300", time: "23:00", activity: "読書・就寝準備" },
  { id: "r_0030", time: "00:30", activity: "就寝（翌日）" },
];

// 編集中ID管理用
let editingPrincipleId = null;
let editingRoutineId = null;

// ---------------------------
// 初期化
// ---------------------------

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  loadProfile();
  loadStrategy();
  loadPrinciples();
  loadRoutines();
  setupProfileEvents();
  setupStrategyEvents();
  setupPrincipleEvents();
  setupRoutineEvents();
  registerServiceWorker();
});

// ---------------------------
// タブ切り替え
// ---------------------------

function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabPages = document.querySelectorAll(".tab-page");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;

      tabButtons.forEach((b) => b.classList.remove("active"));
      tabPages.forEach((page) => page.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(targetId).classList.add("active");
    });
  });
}

// ---------------------------
// プロフィール
// ---------------------------

function loadProfile() {
  const dataJSON = localStorage.getItem(STORAGE_KEYS.profile);
  if (!dataJSON) return;

  try {
    const data = JSON.parse(dataJSON);
    document.getElementById("profile-name").value = data.name || "";
    document.getElementById("profile-career").value = data.career || "";
    document.getElementById("profile-values").value = data.values || "";
    document.getElementById("profile-strengths").value = data.strengths || "";
    document.getElementById("profile-hobbies").value = data.hobbies || "";
    document.getElementById("profile-lifestyle").value =
      data.lifestyle || "";
    document.getElementById("profile-tags").value = data.tags || "";
  } catch (e) {
    console.error("Failed to parse profile data", e);
  }
}

function setupProfileEvents() {
  const saveBtn = document.getElementById("save-profile");
  const msgEl = document.getElementById("profile-message");

  saveBtn.addEventListener("click", () => {
    const profileData = {
      name: document.getElementById("profile-name").value.trim(),
      career: document.getElementById("profile-career").value.trim(),
      values: document.getElementById("profile-values").value.trim(),
      strengths: document.getElementById("profile-strengths").value.trim(),
      hobbies: document.getElementById("profile-hobbies").value.trim(),
      lifestyle: document.getElementById("profile-lifestyle").value.trim(),
      tags: document.getElementById("profile-tags").value.trim(),
    };

    localStorage.setItem(
      STORAGE_KEYS.profile,
      JSON.stringify(profileData)
    );
    showMessage(msgEl, "プロフィールを保存しました。");
  });
}

// ---------------------------
// 戦略
// ---------------------------

function loadStrategy() {
  const dataJSON = localStorage.getItem(STORAGE_KEYS.strategy);
  if (!dataJSON) return;

  try {
    const data = JSON.parse(dataJSON);
    document.getElementById("strategy-long").value = data.long || "";
    document.getElementById("strategy-mid").value = data.mid || "";
    document.getElementById("strategy-year").value = data.year || "";
    document.getElementById("strategy-experiments").value =
      data.experiments || "";
  } catch (e) {
    console.error("Failed to parse strategy data", e);
  }
}

function setupStrategyEvents() {
  const saveBtn = document.getElementById("save-strategy");
  const msgEl = document.getElementById("strategy-message");

  saveBtn.addEventListener("click", () => {
    const strategyData = {
      long: document.getElementById("strategy-long").value.trim(),
      mid: document.getElementById("strategy-mid").value.trim(),
      year: document.getElementById("strategy-year").value.trim(),
      experiments: document
        .getElementById("strategy-experiments")
        .value.trim(),
    };

    localStorage.setItem(
      STORAGE_KEYS.strategy,
      JSON.stringify(strategyData)
    );
    showMessage(msgEl, "戦略を保存しました。");
  });
}

// ---------------------------
// 処世術（5つのOS）
// ---------------------------

function loadPrinciples() {
  const listEl = document.getElementById("principle-list");
  const dataJSON = localStorage.getItem(STORAGE_KEYS.principles);
  let principles = [];
  if (dataJSON) {
    try {
      principles = JSON.parse(dataJSON);
    } catch (e) {
      console.error("Failed to parse principles data", e);
    }
  }
  renderPrinciples(principles);
}

function setupPrincipleEvents() {
  const addBtn = document.getElementById("add-principle");
  const filterSelect = document.getElementById("principle-filter");
  const msgEl = document.getElementById("principle-message");

  addBtn.addEventListener("click", () => {
    const titleEl = document.getElementById("principle-title");
    const categoryEl = document.getElementById("principle-category");
    const bodyEl = document.getElementById("principle-body");
    const tagsEl = document.getElementById("principle-tags");

    const title = titleEl.value.trim();
    const category = categoryEl.value;
    const body = bodyEl.value.trim();
    const tags = tagsEl.value.trim();

    if (!title || !body) {
      showMessage(msgEl, "タイトルと本文を入力してください。", true);
      return;
    }

    let principles = getPrinciples();

    if (editingPrincipleId) {
      // 更新
      principles = principles.map((p) =>
        p.id === editingPrincipleId
          ? { ...p, title, category, body, tags }
          : p
      );
      editingPrincipleId = null;
      addBtn.textContent = "処世術カードを追加 / 更新";
    } else {
      // 新規
      const newPrinciple = {
        id: "p_" + Date.now(),
        title,
        category,
        body,
        tags,
        createdAt: new Date().toISOString(),
      };
      principles.unshift(newPrinciple);
    }

    localStorage.setItem(
      STORAGE_KEYS.principles,
      JSON.stringify(principles)
    );

    // 入力クリア
    titleEl.value = "";
    bodyEl.value = "";
    tagsEl.value = "";
    categoryEl.value = "内部OS";

    showMessage(msgEl, "処世術カードを保存しました。");

    // 再描画（フィルタ維持）
    renderPrinciples(principles, filterSelect.value);
  });

  filterSelect.addEventListener("change", () => {
    const filter = filterSelect.value;
    const principles = getPrinciples();
    renderPrinciples(principles, filter);
  });
}

function getPrinciples() {
  const dataJSON = localStorage.getItem(STORAGE_KEYS.principles);
  if (!dataJSON) return [];
  try {
    return JSON.parse(dataJSON);
  } catch {
    return [];
  }
}

function renderPrinciples(principles, filter = "all") {
  const listEl = document.getElementById("principle-list");
  listEl.innerHTML = "";

  const filtered = principles.filter((p) => {
    if (filter === "all") return true;
    return p.category === filter;
  });

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML =
      '<p class="card-description">まだ処世術カードがありません。日々の気づきや名言から、自分のOSになりそうなものを書き留めていきましょう。</p>';
    listEl.appendChild(empty);
    return;
  }

  filtered.forEach((p) => {
    const item = document.createElement("div");
    item.className = "principle-item";

    const header = document.createElement("div");
    header.className = "item-header";

    const titleEl = document.createElement("div");
    titleEl.className = "item-title";
    titleEl.textContent = p.title;

    const chip = document.createElement("div");
    chip.className = "item-chip";
    chip.textContent = p.category;

    header.appendChild(titleEl);
    header.appendChild(chip);

    const bodyEl = document.createElement("div");
    bodyEl.className = "item-body";
    bodyEl.textContent = p.body;

    const tagsEl = document.createElement("div");
    tagsEl.className = "item-tags";
    if (p.tags) {
      tagsEl.textContent = "タグ: " + p.tags;
    }

    const actions = document.createElement("div");
    actions.className = "item-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn-ghost edit";
    editBtn.textContent = "編集";
    editBtn.addEventListener("click", () => {
      startEditPrinciple(p.id);
    });

    const delBtn = document.createElement("button");
    delBtn.className = "btn-ghost delete";
    delBtn.textContent = "削除";
    delBtn.addEventListener("click", () => {
      deletePrinciple(p.id);
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    item.appendChild(header);
    item.appendChild(bodyEl);
    if (p.tags) item.appendChild(tagsEl);
    item.appendChild(actions);

    listEl.appendChild(item);
  });
}

function startEditPrinciple(id) {
  const principles = getPrinciples();
  const target = principles.find((p) => p.id === id);
  if (!target) return;

  document.getElementById("principle-title").value = target.title;
  document.getElementById("principle-category").value = target.category;
  document.getElementById("principle-body").value = target.body;
  document.getElementById("principle-tags").value = target.tags || "";

  editingPrincipleId = id;
  document.getElementById("add-principle").textContent =
    "処世術カードを更新";
}

function deletePrinciple(id) {
  if (!confirm("この処世術カードを削除しますか？")) return;
  let principles = getPrinciples();
  principles = principles.filter((p) => p.id !== id);
  localStorage.setItem(
    STORAGE_KEYS.principles,
    JSON.stringify(principles)
  );

  const filter = document.getElementById("principle-filter").value;
  renderPrinciples(principles, filter);
}

// ---------------------------
// ルーティーン
// ---------------------------

function loadRoutines() {
  const dataJSON = localStorage.getItem(STORAGE_KEYS.routines);
  let routines = [];
  if (dataJSON) {
    try {
      routines = JSON.parse(dataJSON);
    } catch (e) {
      console.error("Failed to parse routines data", e);
    }
  }
  let normalized = normalizeTimetable(routines);

  if (!normalized.length) {
    normalized = normalizeTimetable(DEFAULT_ROUTINES);
    localStorage.setItem(STORAGE_KEYS.routines, JSON.stringify(normalized));
  }

  renderRoutines(normalized);
}

function setupRoutineEvents() {
  const addBtn = document.getElementById("add-routine");
  const msgEl = document.getElementById("routine-message");

  addBtn.addEventListener("click", () => {
    const timeEl = document.getElementById("routine-time");
    const activityEl = document.getElementById("routine-activity");

    const time = timeEl.value.trim();
    const activity = activityEl.value.trim();

    if (!time || !activity) {
      showMessage(msgEl, "時刻と内容を入力してください。", true);
      return;
    }

    const normalizedTime = normalizeTime(time);
    if (!normalizedTime) {
      showMessage(msgEl, "時刻は 00:00 〜 23:59 形式で入力してください。", true);
      return;
    }

    let routines = getRoutines();

    if (editingRoutineId) {
      routines = routines.map((r) =>
        r.id === editingRoutineId ? { ...r, time: normalizedTime, activity } : r
      );
      editingRoutineId = null;
      addBtn.textContent = ROUTINE_BUTTON_DEFAULT;
    } else {
      const newRoutine = {
        id: "r_" + Date.now(),
        time: normalizedTime,
        activity,
      };
      routines.push(newRoutine);
    }

    routines = sortRoutines(routines);

    localStorage.setItem(
      STORAGE_KEYS.routines,
      JSON.stringify(routines)
    );

    timeEl.value = "";
    activityEl.value = "";

    showMessage(msgEl, "時刻表を保存しました。");

    renderRoutines(routines);
  });
}

function getRoutines() {
  const dataJSON = localStorage.getItem(STORAGE_KEYS.routines);
  if (!dataJSON) return [];
  try {
    const parsed = JSON.parse(dataJSON);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function renderRoutines(routines) {
  const listEl = document.getElementById("routine-list");
  listEl.innerHTML = "";

  routines = sortRoutines(routines);

  if (!routines.length) {
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML =
      '<p class="card-description">まだ時刻表がありません。1日の流れを時刻付きで追加してください。</p>';
    listEl.appendChild(empty);
    return;
  }

  const table = document.createElement("table");
  table.className = "timetable";

  const thead = document.createElement("thead");
  thead.innerHTML = "<tr><th>時刻</th><th>内容</th><th></th></tr>";
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  routines.forEach((r) => {
    const row = document.createElement("tr");

    const timeTd = document.createElement("td");
    timeTd.className = "timetable-time";
    timeTd.textContent = r.time;
    row.appendChild(timeTd);

    const activityTd = document.createElement("td");
    activityTd.className = "timetable-activity";
    activityTd.textContent = r.activity || "";
    row.appendChild(activityTd);

    const actionsTd = document.createElement("td");
    actionsTd.className = "timetable-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn-ghost edit";
    editBtn.textContent = "編集";
    editBtn.addEventListener("click", () => {
      startEditRoutine(r.id);
    });

    const delBtn = document.createElement("button");
    delBtn.className = "btn-ghost delete";
    delBtn.textContent = "削除";
    delBtn.addEventListener("click", () => {
      deleteRoutine(r.id);
    });

    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(delBtn);

    row.appendChild(actionsTd);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  listEl.appendChild(table);
}

function startEditRoutine(id) {
  const routines = getRoutines();
  const target = routines.find((r) => r.id === id);
  if (!target) return;

  document.getElementById("routine-time").value = target.time;
  document.getElementById("routine-activity").value = target.activity || "";

  editingRoutineId = id;
  document.getElementById("add-routine").textContent =
    ROUTINE_BUTTON_EDIT;
}

function deleteRoutine(id) {
  if (!confirm("この時刻表の行を削除しますか？")) return;
  let routines = getRoutines();
  routines = routines.filter((r) => r.id !== id);
  routines = sortRoutines(routines);
  localStorage.setItem(
    STORAGE_KEYS.routines,
    JSON.stringify(routines)
  );

  renderRoutines(routines);
}

function isValidTime(value) {
  // 00-23 for hours, 00-59 for minutes (zero padded)
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function parseTimeToMinutes(value) {
  if (!isValidTime(value)) return -1;
  const [h, m] = value.split(":").map((n) => parseInt(n, 10));
  return h * 60 + m;
}

function sortRoutines(routines) {
  return [...routines].sort((a, b) => {
    const aMin = parseTimeToMinutes(a.time);
    const bMin = parseTimeToMinutes(b.time);
    const safeA = aMin === -1 ? Number.MAX_SAFE_INTEGER : aMin;
    const safeB = bMin === -1 ? Number.MAX_SAFE_INTEGER : bMin;
    return safeA - safeB;
  });
}

function normalizeTime(value) {
  const match = /^(\d{1,2}):([0-5]\d)$/.exec(value);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  if (hours > 23) return null;
  return `${String(hours).padStart(2, "0")}:${match[2]}`;
}

function normalizeTimetable(routines) {
  if (!Array.isArray(routines)) return [];
  return routines.reduce((acc, r) => {
    if (typeof r.activity !== "string") return acc;
    const normalizedTime = normalizeTime(r.time);
    if (!normalizedTime) return acc;
    acc.push({ ...r, time: normalizedTime });
    return acc;
  }, []);
}

// ---------------------------
// 共通：メッセージ表示
// ---------------------------

function showMessage(el, text, isError = false) {
  el.textContent = text;
  el.style.color = isError ? "#e57373" : "#4c9a7f";
  if (!text) return;
  setTimeout(() => {
    el.textContent = "";
  }, 2000);
}

// ---------------------------
// Service Worker 登録
// ---------------------------

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("service-worker.js")
      .catch((err) => console.error("SW registration failed:", err));
  }
}
