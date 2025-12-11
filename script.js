// ---------------------------
// 定数・ストレージキー
// ---------------------------

const STORAGE_KEYS = {
  profile: "jinsei_os_profile",
  strategy: "jinsei_os_strategy",
  principles: "jinsei_os_principles",
  routines: "jinsei_os_routines",
};

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
  renderRoutines(routines);
}

function setupRoutineEvents() {
  const addBtn = document.getElementById("add-routine");
  const filterSelect = document.getElementById("routine-filter");
  const msgEl = document.getElementById("routine-message");

  addBtn.addEventListener("click", () => {
    const nameEl = document.getElementById("routine-name");
    const typeEl = document.getElementById("routine-type");
    const noteEl = document.getElementById("routine-note");

    const name = nameEl.value.trim();
    const routineType = typeEl.value;
    const note = noteEl.value.trim();

    if (!name) {
      showMessage(msgEl, "ルーティーン名を入力してください。", true);
      return;
    }

    let routines = getRoutines();

    if (editingRoutineId) {
      routines = routines.map((r) =>
        r.id === editingRoutineId ? { ...r, name, type: routineType, note } : r
      );
      editingRoutineId = null;
      addBtn.textContent = "ルーティーンを追加 / 更新";
    } else {
      const newRoutine = {
        id: "r_" + Date.now(),
        name,
        type: routineType,
        note,
        done: false,
        createdAt: new Date().toISOString(),
      };
      routines.unshift(newRoutine);
    }

    localStorage.setItem(
      STORAGE_KEYS.routines,
      JSON.stringify(routines)
    );

    nameEl.value = "";
    noteEl.value = "";
    typeEl.value = "Daily";

    showMessage(msgEl, "ルーティーンを保存しました。");

    renderRoutines(routines, filterSelect.value);
  });

  filterSelect.addEventListener("change", () => {
    const filter = filterSelect.value;
    const routines = getRoutines();
    renderRoutines(routines, filter);
  });
}

function getRoutines() {
  const dataJSON = localStorage.getItem(STORAGE_KEYS.routines);
  if (!dataJSON) return [];
  try {
    return JSON.parse(dataJSON);
  } catch {
    return [];
  }
}

function renderRoutines(routines, filter = "all") {
  const listEl = document.getElementById("routine-list");
  listEl.innerHTML = "";

  const filtered = routines.filter((r) => {
    if (filter === "all") return true;
    return r.type === filter;
  });

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML =
      '<p class="card-description">まだルーティーンがありません。人生OSを支える「核となる習慣」から少しずつ追加していきましょう。</p>';
    listEl.appendChild(empty);
    return;
  }

  filtered.forEach((r) => {
    const item = document.createElement("div");
    item.className = "routine-item";

    const header = document.createElement("div");
    header.className = "item-header";

    const titleEl = document.createElement("div");
    titleEl.className = "item-title";
    titleEl.textContent = r.name;

    const chip = document.createElement("div");
    chip.className = "item-chip";
    chip.textContent = r.type;

    header.appendChild(titleEl);
    header.appendChild(chip);

    const bodyEl = document.createElement("div");
    bodyEl.className = "item-body";
    bodyEl.textContent = r.note || "";

    const meta = document.createElement("div");
    meta.className = "routine-meta";

    const checkWrap = document.createElement("label");
    checkWrap.className = "routine-check";

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = !!r.done;
    check.addEventListener("change", () => {
      toggleRoutineDone(r.id, check.checked);
    });

    const checkText = document.createElement("span");
    checkText.textContent = "今日やった";

    checkWrap.appendChild(check);
    checkWrap.appendChild(checkText);

    meta.appendChild(checkWrap);

    const actions = document.createElement("div");
    actions.className = "item-actions";

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

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    meta.appendChild(actions);

    item.appendChild(header);
    if (r.note) item.appendChild(bodyEl);
    item.appendChild(meta);

    listEl.appendChild(item);
  });
}

function startEditRoutine(id) {
  const routines = getRoutines();
  const target = routines.find((r) => r.id === id);
  if (!target) return;

  document.getElementById("routine-name").value = target.name;
  document.getElementById("routine-type").value = target.type;
  document.getElementById("routine-note").value = target.note || "";

  editingRoutineId = id;
  document.getElementById("add-routine").textContent =
    "ルーティーンを更新";
}

function deleteRoutine(id) {
  if (!confirm("このルーティーンを削除しますか？")) return;
  let routines = getRoutines();
  routines = routines.filter((r) => r.id !== id);
  localStorage.setItem(
    STORAGE_KEYS.routines,
    JSON.stringify(routines)
  );

  const filter = document.getElementById("routine-filter").value;
  renderRoutines(routines, filter);
}

function toggleRoutineDone(id, done) {
  const routines = getRoutines();
  const updated = routines.map((r) =>
    r.id === id ? { ...r, done: !!done } : r
  );
  localStorage.setItem(
    STORAGE_KEYS.routines,
    JSON.stringify(updated)
  );
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
