// 狀態管理 (儲存於 localStorage)
const STORAGE_KEY = "vocab_app_progress_v1";
const CUSTOM_VOCAB_KEY = "vocab_app_custom_data_v2";

// 當前運行單字庫 (由預設 VOCAB_DATA + 自訂新增/刪除動態組合)
let activeVocabList = [];

let appState = {
  masteredIds: [],
  weakIds: [],
  currentCategory: "all",
  searchQuery: "",
  viewMode: "list", // 'list' | 'flashcard'
  flashcardIndex: 0,
  showReadingZh: true,
  showDialogueZh: true,
  activeQuizMC: [],
  activeQuizFIB: [],
  activeModalWordId: null,

  // 需求 1: Shadowing 單字跟讀狀態
  shadowSelectedWordId: null,
  shadowLoopTimer: null,
  shadowIsPlaying: false,
  shadowCurrentIteration: 0,
  shadowTotalIterations: 5,

  // 需求 2: 總表篩選狀態
  tableCategory: "all",
  tableSearch: ""
};

// 全域 PWA 安裝事件暫存
window.deferredInstallPrompt = null;

// 監聽 Chrome / Edge / Android 原生安裝事件
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.deferredInstallPrompt = e;
  console.log("VocabBuddy PWA install prompt ready!");

  if (!sessionStorage.getItem("vocab_pwa_dismissed")) {
    const banner = document.getElementById("pwa-install-banner");
    if (banner) banner.style.display = "flex";
  }

  const headerBtn = document.getElementById("open-install-modal-btn");
  if (headerBtn) {
    headerBtn.innerHTML = "<span>📲</span> 立即安裝 APP";
  }
});

window.addEventListener("appinstalled", () => {
  window.deferredInstallPrompt = null;
  const banner = document.getElementById("pwa-install-banner");
  if (banner) banner.style.display = "none";
  window.closeInstallModal();
  alert("🎉 恭喜！VocabBuddy 已成功安裝到您的桌面／主畫面！");
});

// 頂部「📱 安裝 APP」按鈕點擊處理
window.handleHeaderInstallClick = async function () {
  window.openInstallModal();

  if (window.deferredInstallPrompt) {
    try {
      window.deferredInstallPrompt.prompt();
      const { outcome } = await window.deferredInstallPrompt.userChoice;
      if (outcome === "accepted") {
        const banner = document.getElementById("pwa-install-banner");
        if (banner) banner.style.display = "none";
      }
      window.deferredInstallPrompt = null;
    } catch (err) {
      console.warn("PWA prompt error:", err);
    }
  }
};

window.openInstallModal = function () {
  const modal = document.getElementById("install-modal");
  if (!modal) return;

  const fileWarn = document.getElementById("file-protocol-warning");
  if (fileWarn) {
    fileWarn.classList.toggle("hidden", location.protocol !== "file:");
  }

  const publicUrl = "https://hunter072088.github.io/vocabulary-review/";
  const urlInput = document.getElementById("install-url-input");
  if (urlInput) urlInput.value = publicUrl;

  const qrContainer = document.getElementById("install-qr-container");
  if (qrContainer) {
    if (typeof createQRCodeSVG === "function") {
      qrContainer.innerHTML = createQRCodeSVG(publicUrl, 130);
    } else {
      qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(publicUrl)}" width="130" height="130" alt="QR Code" />`;
    }
  }

  modal.classList.remove("hidden");
};

window.closeInstallModal = function () {
  const modal = document.getElementById("install-modal");
  if (modal) modal.classList.add("hidden");
};

window.triggerPWAInstall = async function () {
  if (window.deferredInstallPrompt) {
    window.deferredInstallPrompt.prompt();
    const { outcome } = await window.deferredInstallPrompt.userChoice;
    if (outcome === "accepted") {
      const banner = document.getElementById("pwa-install-banner");
      if (banner) banner.style.display = "none";
      window.closeInstallModal();
    }
    window.deferredInstallPrompt = null;
  } else if (location.protocol === "file:") {
    if (
      confirm(
        "⚠️ 您目前是直接點開本地 HTML 檔案 (file://)，瀏覽器規定必須在伺服器網址下才能彈出安裝視窗。\n\n是否立即前往本地端伺服器 (http://localhost:8090) 進行一鍵安裝？"
      )
    ) {
      window.location.href = "http://localhost:8090/";
    }
  } else {
    alert(
      "💡 一鍵安裝指引：\n\n1. 【電腦 Chrome / Edge】：請看瀏覽器網址列最右邊的「📥 安裝圖示」，或點右上角「⋮」➔「儲存並分享 / 應用程式」➔「安裝 VocabBuddy」。\n2. 【Android 手機】：點 Chrome 右上角「⋮」➔「安裝應用程式」或「加到主畫面」。\n3. 【iPhone / iPad】：點 Safari 底部「分享」➔「加入主畫面」。"
    );
  }
};

window.copyInstallUrl = function () {
  const urlInput = document.getElementById("install-url-input");
  if (!urlInput) return;
  navigator.clipboard.writeText(urlInput.value).then(() => {
    const btn = document.getElementById("btn-copy-url");
    if (btn) {
      btn.textContent = "✅ 已複製！";
      setTimeout(() => (btn.textContent = "複製網址"), 2000);
    }
  });
};

// ==================== 資料載入與持久化 (支援匯入/刪除) ====================
function initVocabData() {
  try {
    const saved = localStorage.getItem(CUSTOM_VOCAB_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        activeVocabList = parsed;
        return;
      }
    }
  } catch (e) {
    console.warn("無法讀取自訂單字庫:", e);
  }
  // 預設深拷貝原有的 VOCAB_DATA
  activeVocabList = JSON.parse(JSON.stringify(VOCAB_DATA));
}

function saveVocabData() {
  try {
    localStorage.setItem(CUSTOM_VOCAB_KEY, JSON.stringify(activeVocabList));
  } catch (e) {
    console.warn("無法寫入自訂單字庫:", e);
  }
  updateHeaderStats();
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      appState.masteredIds = Array.isArray(parsed.masteredIds) ? parsed.masteredIds : [];
      appState.weakIds = Array.isArray(parsed.weakIds) ? parsed.weakIds : [];
    }
  } catch (e) {
    console.warn("無法讀取進度:", e);
  }
}

function saveProgress() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        masteredIds: appState.masteredIds,
        weakIds: appState.weakIds
      })
    );
  } catch (e) {
    console.warn("無法寫入進度:", e);
  }
  updateHeaderStats();
}

function updateHeaderStats() {
  const total = activeVocabList.length;
  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-mastered").textContent = appState.masteredIds.length;
  document.getElementById("stat-weak").textContent = appState.weakIds.length;
  document.getElementById("weak-count-chip").textContent = appState.weakIds.length;
  document.getElementById("mastered-count-chip").textContent = appState.masteredIds.length;
  const catAllEl = document.getElementById("cat-count-all");
  if (catAllEl) catAllEl.textContent = total;
}

// 語音合成 (Web Speech API)
let dialogueStopFlag = false;

function speakText(text, rate = 1.0, pitch = 1.0, onEndCallback = null) {
  if (!("speechSynthesis" in window)) {
    alert("您的瀏覽器不支援語音合成功能。");
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = rate;
  utter.pitch = pitch;

  const voices = window.speechSynthesis.getVoices();
  const enVoice =
    voices.find((v) => v.lang === "en-US" && v.name.includes("Natural")) ||
    voices.find((v) => v.lang === "en-US" && v.name.includes("Google")) ||
    voices.find((v) => v.lang.startsWith("en-US")) ||
    voices.find((v) => v.lang.startsWith("en"));
  if (enVoice) utter.voice = enVoice;

  if (onEndCallback) {
    utter.onend = onEndCallback;
    utter.onerror = () => {
      // 避免中斷時卡住回調
      onEndCallback();
    };
  }
  window.speechSynthesis.speak(utter);
}

// 切換單字狀態 (已熟記 / 待加強)
function toggleMastered(id) {
  const idx = appState.masteredIds.indexOf(id);
  if (idx > -1) {
    appState.masteredIds.splice(idx, 1);
  } else {
    appState.masteredIds.push(id);
    const wIdx = appState.weakIds.indexOf(id);
    if (wIdx > -1) appState.weakIds.splice(wIdx, 1);
  }
  saveProgress();
  renderVocabSection();
  renderVocabTable();
  updateShadowWordTarget();
}

function toggleWeak(id, forceAdd = false) {
  const idx = appState.weakIds.indexOf(id);
  if (forceAdd) {
    if (idx === -1) appState.weakIds.push(id);
    const mIdx = appState.masteredIds.indexOf(id);
    if (mIdx > -1) appState.masteredIds.splice(mIdx, 1);
  } else {
    if (idx > -1) {
      appState.weakIds.splice(idx, 1);
    } else {
      appState.weakIds.push(id);
      const mIdx = appState.masteredIds.indexOf(id);
      if (mIdx > -1) appState.masteredIds.splice(mIdx, 1);
    }
  }
  saveProgress();
  renderVocabSection();
  renderVocabTable();
  updateShadowWordTarget();
}

// 取得篩選後的卡片清單
function getFilteredVocab() {
  return activeVocabList.filter((item) => {
    if (appState.currentCategory === "weak" && !appState.weakIds.includes(item.id)) return false;
    if (appState.currentCategory === "mastered" && !appState.masteredIds.includes(item.id)) return false;
    if (
      appState.currentCategory !== "all" &&
      appState.currentCategory !== "weak" &&
      appState.currentCategory !== "mastered" &&
      item.category !== appState.currentCategory
    ) {
      return false;
    }

    if (appState.searchQuery.trim() !== "") {
      const q = appState.searchQuery.toLowerCase().trim();
      const matchWord = item.word.toLowerCase().includes(q);
      const matchZh = item.zh.toLowerCase().includes(q);
      const matchEx = (item.example || "").toLowerCase().includes(q);
      return matchWord || matchZh || matchEx;
    }
    return true;
  });
}

// ==================== 模組 1：渲染字彙列表與閃卡 ====================
function renderVocabSection() {
  const list = getFilteredVocab();
  const listView = document.getElementById("vocab-list-view");
  const fcView = document.getElementById("vocab-flashcard-view");

  if (appState.viewMode === "list") {
    listView.classList.remove("hidden");
    fcView.classList.add("hidden");

    if (list.length === 0) {
      listView.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <h3>找不到符合條件的單字</h3>
          <p class="text-muted">請嘗試切換上方分類標籤或至「📋 單字總表」匯入新單字。</p>
        </div>
      `;
      return;
    }

    listView.innerHTML = list
      .map((item) => {
        const isWeak = appState.weakIds.includes(item.id);
        const isMastered = appState.masteredIds.includes(item.id);
        return `
        <article class="vocab-card ${isWeak ? "is-weak" : ""} ${isMastered ? "is-mastered" : ""}">
          <div>
            <div class="vc-top">
              <div class="vc-word-group">
                <span class="vc-word">${item.word}</span>
                <span class="pos-tag">${item.pos || "n."}</span>
                <span class="vc-phonetic">${item.phonetic || ""}</span>
              </div>
              <span class="badge cat-${item.category || "custom"}">${item.categoryLabel || "自訂"}</span>
            </div>
            <div class="vc-zh">${item.zh}</div>
            <div class="vc-example">
              <div class="en">${item.example || "無例句"}</div>
              <div class="zh">${item.exampleZh || ""}</div>
            </div>
            ${item.memory ? `
              <div class="vc-memory">
                <strong>💡 記憶與搭配：</strong>${item.memory}
              </div>
            ` : ""}
          </div>
          <div class="vc-actions">
            <div>
              <button class="btn-audio btn-sm" onclick="speakText('${item.word.replace(/'/g, "\\'")}')">🔊 單字</button>
              ${item.example ? `<button class="btn-audio btn-sm" onclick="speakText('${item.example.replace(/'/g, "\\'")}', 0.95)">🔈 例句</button>` : ""}
              <button class="btn-secondary btn-sm" onclick="quickJumpToShadow(${item.id})" title="跳至跟讀訓練室反覆練習">🎧 跟讀</button>
            </div>
            <div class="vc-status-btns">
              <button class="btn-warning btn-sm ${isWeak ? "active" : ""}" onclick="toggleWeak(${item.id})">
                ${isWeak ? "⚡ 待加強中" : "⚡ 待加強"}
              </button>
              <button class="btn-success btn-sm ${isMastered ? "active" : ""}" onclick="toggleMastered(${item.id})">
                ${isMastered ? "✅ 已熟記" : "✅ 熟記"}
              </button>
            </div>
          </div>
        </article>
      `;
      })
      .join("");
  } else {
    listView.classList.add("hidden");
    fcView.classList.remove("hidden");
    renderFlashcard(list);
  }
}

function renderFlashcard(list) {
  if (list.length === 0) {
    document.getElementById("fc-word").textContent = "無符合單字";
    document.getElementById("fc-phonetic").textContent = "";
    document.getElementById("fc-counter").textContent = "0 / 0";
    return;
  }
  if (appState.flashcardIndex >= list.length) appState.flashcardIndex = 0;
  if (appState.flashcardIndex < 0) appState.flashcardIndex = list.length - 1;

  const item = list[appState.flashcardIndex];
  const box = document.getElementById("flashcard-box");
  box.classList.remove("flipped");

  document.getElementById("fc-counter").textContent = `${appState.flashcardIndex + 1} / ${list.length}`;
  const catEl = document.getElementById("fc-category");
  catEl.textContent = item.categoryLabel || "自訂";
  catEl.className = `badge cat-${item.category || "custom"}`;

  document.getElementById("fc-word").textContent = item.word;
  document.getElementById("fc-phonetic").textContent = item.phonetic || "";
  document.getElementById("fc-back-word").textContent = item.word;
  document.getElementById("fc-pos").textContent = item.pos || "n.";
  document.getElementById("fc-zh").textContent = item.zh;
  document.getElementById("fc-example").textContent = item.example || "";
  document.getElementById("fc-example-zh").textContent = item.exampleZh || "";
  document.getElementById("fc-memory").textContent = item.memory || "多開口跟讀朗讀以強化大腦直覺連結。";

  const weakBtn = document.getElementById("fc-mark-weak");
  const mastBtn = document.getElementById("fc-mark-mastered");
  weakBtn.textContent = appState.weakIds.includes(item.id) ? "⚡ 已在待加強本" : "⚡ 加入待加強";
  mastBtn.textContent = appState.masteredIds.includes(item.id) ? "✅ 已標記熟記" : "✅ 標記已熟記";
}

// ==================== 模組 2：單獨單字/片語 Shadowing 連續重複播放 ====================
function initShadowingStation() {
  populateShadowWordDropdown();
  if (activeVocabList.length > 0 && !appState.shadowSelectedWordId) {
    appState.shadowSelectedWordId = activeVocabList[0].id;
  }
  updateShadowWordTarget();

  // 下拉選單切換單字
  const selectEl = document.getElementById("shadow-word-select");
  if (selectEl) {
    selectEl.addEventListener("change", (e) => {
      stopShadowLoop();
      appState.shadowSelectedWordId = Number(e.target.value);
      updateShadowWordTarget();
    });
  }

  // 播放與停止按鈕
  document.getElementById("shadow-start-btn").addEventListener("click", startShadowLoop);
  document.getElementById("shadow-stop-btn").addEventListener("click", stopShadowLoop);
  document.getElementById("shadow-speak-ex-btn").addEventListener("click", () => {
    const item = activeVocabList.find((v) => v.id === appState.shadowSelectedWordId);
    if (item && item.example) {
      speakText(item.example, parseFloat(document.getElementById("shadow-rate").value) || 1.0);
    }
  });

  // 上下一個單字按鈕
  document.getElementById("shadow-prev-btn").addEventListener("click", () => {
    navigateShadowWord(-1);
  });
  document.getElementById("shadow-next-btn").addEventListener("click", () => {
    navigateShadowWord(1);
  });
}

function populateShadowWordDropdown() {
  const selectEl = document.getElementById("shadow-word-select");
  if (!selectEl) return;
  const currentVal = appState.shadowSelectedWordId;

  selectEl.innerHTML = activeVocabList
    .map((item) => {
      const isMastered = appState.masteredIds.includes(item.id);
      const isWeak = appState.weakIds.includes(item.id);
      const tag = isMastered ? " [已熟記]" : isWeak ? " [待加強]" : "";
      return `<option value="${item.id}">${item.word} - ${item.zh}${tag}</option>`;
    })
    .join("");

  if (currentVal && activeVocabList.some((v) => v.id === currentVal)) {
    selectEl.value = currentVal;
  } else if (activeVocabList.length > 0) {
    selectEl.value = activeVocabList[0].id;
    appState.shadowSelectedWordId = activeVocabList[0].id;
  }
}

function updateShadowWordTarget() {
  const item = activeVocabList.find((v) => v.id === appState.shadowSelectedWordId);
  if (!item) return;

  const selectEl = document.getElementById("shadow-word-select");
  if (selectEl && selectEl.value !== String(item.id)) {
    selectEl.value = item.id;
  }

  document.getElementById("shadow-word").textContent = item.word;
  document.getElementById("shadow-phonetic").textContent = item.phonetic || "";
  document.getElementById("shadow-pos").textContent = item.pos || "n.";
  document.getElementById("shadow-zh").textContent = item.zh;
  document.getElementById("shadow-cat").textContent = item.categoryLabel || "自訂";
  document.getElementById("shadow-cat").className = `badge cat-${item.category || "custom"}`;

  const statusTag = document.getElementById("shadow-status-tag");
  if (appState.masteredIds.includes(item.id)) {
    statusTag.textContent = "✅ 已熟記";
    statusTag.className = "status-indicator mastered";
  } else if (appState.weakIds.includes(item.id)) {
    statusTag.textContent = "⚡ 待加強弱點";
    statusTag.className = "status-indicator weak";
  } else {
    statusTag.style.display = "none";
  }

  document.getElementById("shadow-ex-en").textContent = item.example || "（目前無設定專屬例句）";
  document.getElementById("shadow-ex-zh").textContent = item.exampleZh || "";
}

function navigateShadowWord(direction) {
  stopShadowLoop();
  if (activeVocabList.length === 0) return;
  let idx = activeVocabList.findIndex((v) => v.id === appState.shadowSelectedWordId);
  if (idx === -1) idx = 0;
  idx = (idx + direction + activeVocabList.length) % activeVocabList.length;
  appState.shadowSelectedWordId = activeVocabList[idx].id;
  updateShadowWordTarget();
}

function quickJumpToShadow(wordId) {
  stopShadowLoop();
  appState.shadowSelectedWordId = wordId;
  // 切換至 Tab 2 (listening)
  const tabBtn = document.querySelector('.nav-tab[data-tab="listening"]');
  if (tabBtn) tabBtn.click();
  updateShadowWordTarget();
  const box = document.getElementById("shadow-target-box");
  if (box) box.scrollIntoView({ behavior: "smooth", block: "center" });
}

function startShadowLoop() {
  const item = activeVocabList.find((v) => v.id === appState.shadowSelectedWordId);
  if (!item) return;

  stopShadowLoop();
  appState.shadowIsPlaying = true;
  appState.shadowCurrentIteration = 0;

  const repeatVal = parseInt(document.getElementById("shadow-repeat-count").value, 10) || 5;
  appState.shadowTotalIterations = repeatVal;

  const targetBox = document.getElementById("shadow-target-box");
  if (targetBox) targetBox.classList.add("is-looping");

  runNextShadowIteration();
}

function runNextShadowIteration() {
  if (!appState.shadowIsPlaying) return;

  const item = activeVocabList.find((v) => v.id === appState.shadowSelectedWordId);
  if (!item) {
    stopShadowLoop();
    return;
  }

  appState.shadowCurrentIteration++;
  const mode = document.getElementById("shadow-play-target").value; // 'word' | 'both' | 'example'
  const rate = parseFloat(document.getElementById("shadow-rate").value) || 1.0;
  const intervalSec = parseFloat(document.getElementById("shadow-interval").value) || 1.8;

  const iterText =
    appState.shadowTotalIterations >= 999
      ? `第 ${appState.shadowCurrentIteration} 次 (無限循環中)`
      : `第 ${appState.shadowCurrentIteration} / ${appState.shadowTotalIterations} 次播放`;
  document.getElementById("shadow-status-text").textContent = `🔊 正在播放：${item.word}（${iterText}）... 請仔細聽並跟讀！`;

  let speechText = item.word;
  if (mode === "example" && item.example) {
    speechText = item.example;
  } else if (mode === "both" && item.example) {
    speechText = `${item.word}... ${item.example}`;
  }

  speakText(speechText, rate, 1.0, () => {
    if (!appState.shadowIsPlaying) return;

    if (
      appState.shadowTotalIterations < 999 &&
      appState.shadowCurrentIteration >= appState.shadowTotalIterations
    ) {
      document.getElementById("shadow-status-text").textContent = `🎉 已完成 ${appState.shadowTotalIterations} 次連續跟讀！開口記憶力滿點！`;
      stopShadowLoop(false);
      return;
    }

    document.getElementById("shadow-status-text").textContent = `⏳ 停頓 ${intervalSec} 秒留給你複述開口跟讀 (Shadowing)...`;
    appState.shadowLoopTimer = setTimeout(() => {
      runNextShadowIteration();
    }, intervalSec * 1000);
  });
}

function stopShadowLoop(resetStatus = true) {
  appState.shadowIsPlaying = false;
  if (appState.shadowLoopTimer) {
    clearTimeout(appState.shadowLoopTimer);
    appState.shadowLoopTimer = null;
  }
  window.speechSynthesis.cancel();

  const targetBox = document.getElementById("shadow-target-box");
  if (targetBox) targetBox.classList.remove("is-looping");

  if (resetStatus) {
    const statusText = document.getElementById("shadow-status-text");
    if (statusText) statusText.textContent = "已停止播放，待機中";
  }
}

// ==================== 模組 3：單字總表管理 (匯入、刪除、過濾、匯出) ====================
function renderVocabTable() {
  const tbody = document.getElementById("vocab-table-body");
  if (!tbody) return;

  const q = (appState.tableSearch || "").toLowerCase().trim();
  const cat = appState.tableCategory || "all";

  const filtered = activeVocabList.filter((item) => {
    if (cat === "mastered" && !appState.masteredIds.includes(item.id)) return false;
    if (cat === "weak" && !appState.weakIds.includes(item.id)) return false;
    if (cat !== "all" && cat !== "mastered" && cat !== "weak" && item.category !== cat) return false;

    if (q !== "") {
      const matchWord = item.word.toLowerCase().includes(q);
      const matchZh = item.zh.toLowerCase().includes(q);
      const matchPos = (item.pos || "").toLowerCase().includes(q);
      const matchEx = (item.example || "").toLowerCase().includes(q);
      return matchWord || matchZh || matchPos || matchEx;
    }
    return true;
  });

  document.getElementById("table-showing-count").textContent = filtered.length;
  document.getElementById("table-total-count").textContent = activeVocabList.length;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 36px; color: var(--text-muted);">
          🔍 沒有符合過濾條件的單字。可點擊上方「📥 批次匯入新單字」新增！
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered
    .map((item, idx) => {
      const isMastered = appState.masteredIds.includes(item.id);
      const isWeak = appState.weakIds.includes(item.id);
      const rowClass = isMastered ? "row-mastered" : isWeak ? "row-weak" : "";
      return `
      <tr class="${rowClass}">
        <td><strong>${idx + 1}</strong></td>
        <td>
          <div class="table-word-cell">
            <span>${item.word}</span>
            <button class="btn-audio btn-sm" onclick="speakText('${item.word.replace(/'/g, "\\'")}')" title="播放發音">🔊</button>
          </div>
        </td>
        <td class="table-phonetic-cell">${item.phonetic || "-"}</td>
        <td><span class="pos-tag">${item.pos || "n."}</span></td>
        <td><strong>${item.zh}</strong></td>
        <td><span class="badge cat-${item.category || "custom"}">${item.categoryLabel || "自訂"}</span></td>
        <td>
          <div class="table-ex-en">${item.example || "-"}</div>
          <div class="table-ex-zh">${item.exampleZh || ""}</div>
        </td>
        <td>
          <div class="table-action-btns">
            <button class="btn-icon-sm" onclick="quickJumpToShadow(${item.id})" title="跳至跟讀訓練室反覆練習">🎧 跟讀</button>
            <button class="btn-icon-sm" onclick="toggleMastered(${item.id})" title="切換已熟記狀態">
              ${isMastered ? "✅ 熟" : "⬜ 熟"}
            </button>
            <button class="btn-icon-sm btn-del-sm" onclick="deleteSingleWord(${item.id})" title="刪除此單字">🗑️ 刪除</button>
          </div>
        </td>
      </tr>
    `;
    })
    .join("");
}

// 刪除熟悉或不需要的單字 (需求 2)
function deleteSingleWord(id) {
  const item = activeVocabList.find((v) => v.id === id);
  if (!item) return;

  if (confirm(`確定要從單字總表刪除單字「${item.word} (${item.zh})」嗎？\n（刪除後若需要可隨時透過「還原預設單字庫」或重新匯入）`)) {
    activeVocabList = activeVocabList.filter((v) => v.id !== id);
    appState.masteredIds = appState.masteredIds.filter((wId) => wId !== id);
    appState.weakIds = appState.weakIds.filter((wId) => wId !== id);

    if (appState.shadowSelectedWordId === id) {
      stopShadowLoop();
      appState.shadowSelectedWordId = activeVocabList.length > 0 ? activeVocabList[0].id : null;
    }

    saveVocabData();
    saveProgress();
    renderVocabSection();
    renderVocabTable();
    populateShadowWordDropdown();
    updateShadowWordTarget();
  }
}

// 批次匯入新單字解析器 (需求 2)
function handleBatchImport() {
  const textarea = document.getElementById("import-textarea");
  const text = textarea.value.trim();
  if (!text) {
    alert("請先貼上或輸入您要匯入的單字清單！");
    return;
  }

  const selectedCat = document.getElementById("import-cat-select").value;
  const catLabels = {
    engineering: "製程與工程",
    business: "商務與管理",
    career: "培訓與職涯",
    idiom: "口語片語",
    custom: "自訂新增"
  };

  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  let importedCount = 0;
  let nextId = activeVocabList.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;

  lines.forEach((line) => {
    // 支援 Tab、逗號、多空格分隔：word \t zh \t pos \t example
    let parts = line.includes("\t")
      ? line.split("\t")
      : line.includes(",")
      ? line.split(",")
      : line.split(/\s{2,}|\s+-\s+|\s*[:：]\s*/);

    if (parts.length === 1) {
      // 嘗試用第一個空格拆分
      const firstSpaceIdx = line.indexOf(" ");
      if (firstSpaceIdx > -1) {
        parts = [line.slice(0, firstSpaceIdx), line.slice(firstSpaceIdx + 1)];
      }
    }

    const word = (parts[0] || "").trim();
    if (!word) return;

    let zh = (parts[1] || "").trim() || "待補中文釋義";
    let pos = "n.";
    let example = "";
    let exampleZh = "";

    if (parts.length >= 3) {
      // 如果第二部分是詞性 (例如 v. / n.)
      if (/^(n\.|v\.|adj\.|adv\.|prep\.|phr\.)/i.test(parts[1].trim())) {
        pos = parts[1].trim();
        zh = parts[2].trim();
        if (parts.length >= 4) example = parts[3].trim();
      } else {
        pos = parts[2].trim();
        if (parts.length >= 4) example = parts[3].trim();
      }
    }

    // 檢查是否重複，若已存在則更新中文釋義
    const existing = activeVocabList.find((v) => v.word.toLowerCase() === word.toLowerCase());
    if (existing) {
      existing.zh = zh;
      if (example) existing.example = example;
    } else {
      activeVocabList.push({
        id: nextId++,
        word: word,
        phonetic: "",
        pos: pos,
        zh: zh,
        category: selectedCat,
        categoryLabel: catLabels[selectedCat] || "自訂新增",
        example: example || `Please ensure that you understand the usage of ${word}.`,
        exampleZh: `請確保您理解 ${word} 的具體用法。`,
        memory: "自訂匯入新單字，可透過跟讀播放器加強記憶！"
      });
      importedCount++;
    }
  });

  saveVocabData();
  renderVocabSection();
  renderVocabTable();
  populateShadowWordDropdown();

  textarea.value = "";
  document.getElementById("import-modal").classList.add("hidden");
  alert(`🎉 成功匯入／更新了 ${importedCount} 個新單字！總字彙量現為 ${activeVocabList.length} 個。`);
}

// 新增單筆單字
function handleAddSingleWord() {
  const word = document.getElementById("add-input-word").value.trim();
  const zh = document.getElementById("add-input-zh").value.trim();
  if (!word || !zh) {
    alert("請至少填寫「英文單字」與「中文釋義」！");
    return;
  }

  const phonetic = document.getElementById("add-input-phonetic").value.trim();
  const pos = document.getElementById("add-input-pos").value.trim() || "n.";
  const category = document.getElementById("add-input-category").value;
  const example = document.getElementById("add-input-example").value.trim();
  const exampleZh = document.getElementById("add-input-example-zh").value.trim();
  const memory = document.getElementById("add-input-memory").value.trim();

  const catLabels = {
    engineering: "製程與工程",
    business: "商務與管理",
    career: "培訓與職涯",
    idiom: "口語片語",
    custom: "自訂新增"
  };

  const nextId = activeVocabList.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
  activeVocabList.push({
    id: nextId,
    word,
    phonetic,
    pos,
    zh,
    category,
    categoryLabel: catLabels[category] || "自訂新增",
    example: example || `Let's focus on mastering the term ${word}.`,
    exampleZh: exampleZh || `讓我們專注掌握 ${word} 這個單字。`,
    memory: memory || "自主新增單字"
  });

  saveVocabData();
  renderVocabSection();
  renderVocabTable();
  populateShadowWordDropdown();

  // 清空表單
  document.getElementById("add-input-word").value = "";
  document.getElementById("add-input-phonetic").value = "";
  document.getElementById("add-input-zh").value = "";
  document.getElementById("add-input-example").value = "";
  document.getElementById("add-input-example-zh").value = "";
  document.getElementById("add-input-memory").value = "";
  document.getElementById("add-word-modal").classList.add("hidden");

  alert(`✅ 單字「${word}」已成功新增至總表庫存中！`);
}

// 匯出備份 JSON
function exportVocabJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeVocabList, null, 2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `vocabbuddy_backup_${new Date().toISOString().slice(0, 10)}.json`);
  dlAnchor.click();
  dlAnchor.remove();
}

// 還原為預設 59 個單字
function restoreDefaultVocab() {
  if (confirm("確定要將單字總表還原為初始的 59 個半導體、工程與商務單字嗎？\n（您自訂新增的單字將被重設）")) {
    activeVocabList = JSON.parse(JSON.stringify(VOCAB_DATA));
    saveVocabData();
    renderVocabSection();
    renderVocabTable();
    populateShadowWordDropdown();
    updateShadowWordTarget();
    alert("🔄 已成功還原初始 59 個核心字彙清單！");
  }
}

// ==================== 模組 4：閱讀理解挑戰 ====================
function findVocabBySurfaceWord(surface) {
  const clean = surface.toLowerCase().trim();
  return (
    activeVocabList.find((v) => v.word.toLowerCase() === clean) ||
    activeVocabList.find((v) => clean.startsWith(v.word.toLowerCase().slice(0, 5)))
  );
}

function formatTextWithHighlights(text) {
  return text.replace(/\*\*(.+?)\*\*/g, (match, p1) => {
    const found = findVocabBySurfaceWord(p1);
    const idAttr = found ? `data-word-id="${found.id}"` : "";
    return `<span class="vocab-highlight" ${idAttr}>${p1}</span>`;
  });
}

function renderReadingSection() {
  document.getElementById("reading-title").textContent = READING_DATA.title;
  const contentEl = document.getElementById("reading-content");

  contentEl.innerHTML = READING_DATA.paragraphs
    .map(
      (p) => `
      <div class="reading-para">
        <p>${formatTextWithHighlights(p.en)}</p>
        <div class="reading-para-zh ${appState.showReadingZh ? "" : "hidden"}">${p.zh}</div>
      </div>
    `
    )
    .join("");

  contentEl.querySelectorAll(".vocab-highlight").forEach((el) => {
    el.addEventListener("click", () => {
      const id = Number(el.getAttribute("data-word-id"));
      if (id) openWordModal(id);
    });
  });

  const qContainer = document.getElementById("reading-questions-container");
  qContainer.innerHTML = READING_DATA.questions
    .map(
      (q, qIdx) => `
      <div class="question-block" data-rq-index="${qIdx}">
        <p class="question-title">${q.q}</p>
        <div class="options-list">
          ${q.options
            .map(
              (opt, optIdx) => `
            <label class="option-label" data-opt-index="${optIdx}">
              <input type="radio" name="rq_${qIdx}" value="${optIdx}" />
              <span>${opt}</span>
            </label>
          `
            )
            .join("")}
        </div>
        <div class="explanation-box hidden" id="rq-exp-${qIdx}">
          <strong>解析：</strong>${q.explanation}
        </div>
      </div>
    `
    )
    .join("");
}

function checkReadingQuiz() {
  let correctCount = 0;
  READING_DATA.questions.forEach((q, qIdx) => {
    const block = document.querySelector(`.question-block[data-rq-index="${qIdx}"]`);
    const selected = block.querySelector(`input[name="rq_${qIdx}"]:checked`);
    const selectedVal = selected ? Number(selected.value) : -1;

    block.querySelectorAll(".option-label").forEach((lbl) => {
      lbl.classList.remove("correct", "wrong");
      const idx = Number(lbl.getAttribute("data-opt-index"));
      if (idx === q.answer) {
        lbl.classList.add("correct");
      } else if (idx === selectedVal && selectedVal !== q.answer) {
        lbl.classList.add("wrong");
      }
    });

    if (selectedVal === q.answer) correctCount++;
    document.getElementById(`rq-exp-${qIdx}`).classList.remove("hidden");
  });

  const banner = document.getElementById("reading-score-banner");
  banner.classList.remove("hidden");
  banner.textContent = `🎉 閱讀測驗批改完成！您的得分：${correctCount} / ${READING_DATA.questions.length} 題正確。`;
}

// 雙人對話短文播放器
function renderListeningSection() {
  const listEl = document.getElementById("dialogue-list");
  listEl.innerHTML = DIALOGUE_DATA.map(
    (turn, idx) => `
    <div class="dialogue-turn" id="dialogue-turn-${idx}">
      <div class="turn-header">
        <div class="speaker-badge ${turn.speaker === "Alex" ? "speaker-alex" : ""}">
          <span class="speaker-dot"></span>
          <span>${turn.speaker} (${turn.role})</span>
        </div>
        <button class="btn-audio btn-sm" onclick="playSingleTurn(${idx})">🔊 單句朗讀跟讀</button>
      </div>
      <p class="turn-en">${turn.en}</p>
      <p class="turn-zh ${appState.showDialogueZh ? "" : "hidden"}">${turn.zh}</p>
    </div>
  `
  ).join("");

  const dictEl = document.getElementById("dictation-container");
  dictEl.innerHTML = DICTATION_ITEMS.map(
    (item, idx) => `
    <div class="dictation-item" data-dict-idx="${idx}">
      <div>
        <button class="btn-audio btn-sm" onclick="speakText('${item.audioText.replace(/'/g, "\\'")}', getSelectedSpeechRate())">
          🔊 播放第 ${idx + 1} 題音檔
        </button>
      </div>
      <div class="dictation-line">
        ${item.before}
        <input type="text" class="inline-input" data-ans="${item.blanks[0].answer}" placeholder="${item.blanks[0].hint}" />
        ${item.middle1}
        <input type="text" class="inline-input" data-ans="${item.blanks[1].answer}" placeholder="${item.blanks[1].hint}" />
        ${item.middle2}
        <input type="text" class="inline-input" data-ans="${item.blanks[2].answer}" placeholder="${item.blanks[2].hint}" />
        ${item.after}
      </div>
    </div>
  `
  ).join("");
}

function getSelectedSpeechRate() {
  return parseFloat(document.getElementById("speech-rate").value) || 1.0;
}

function playSingleTurn(idx) {
  dialogueStopFlag = true;
  document.querySelectorAll(".dialogue-turn").forEach((el) => el.classList.remove("playing"));
  const turnEl = document.getElementById(`dialogue-turn-${idx}`);
  if (turnEl) turnEl.classList.add("playing");
  const turn = DIALOGUE_DATA[idx];
  speakText(turn.en, getSelectedSpeechRate(), turn.pitch, () => {
    if (turnEl) turnEl.classList.remove("playing");
  });
}

function playFullDialogue(startIdx = 0) {
  if (startIdx === 0) dialogueStopFlag = false;
  if (dialogueStopFlag || startIdx >= DIALOGUE_DATA.length) {
    document.querySelectorAll(".dialogue-turn").forEach((el) => el.classList.remove("playing"));
    return;
  }
  document.querySelectorAll(".dialogue-turn").forEach((el) => el.classList.remove("playing"));
  const turnEl = document.getElementById(`dialogue-turn-${startIdx}`);
  if (turnEl) {
    turnEl.classList.add("playing");
    turnEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  const turn = DIALOGUE_DATA[startIdx];
  speakText(turn.en, getSelectedSpeechRate(), turn.pitch, () => {
    if (!dialogueStopFlag) {
      setTimeout(() => playFullDialogue(startIdx + 1), 350);
    }
  });
}

function checkDictation(reveal = false) {
  document.querySelectorAll("#dictation-container .inline-input").forEach((input) => {
    const ans = input.getAttribute("data-ans").toLowerCase().trim();
    if (reveal) {
      input.value = input.getAttribute("data-ans");
      input.classList.remove("is-wrong");
      input.classList.add("is-correct");
      return;
    }
    const userVal = input.value.toLowerCase().trim();
    input.classList.remove("is-correct", "is-wrong");
    if (userVal === ans) {
      input.classList.add("is-correct");
    } else {
      input.classList.add("is-wrong");
    }
  });
}

// ==================== 模組 5：綜合測驗中心 ====================
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function loadStandardQuiz() {
  appState.activeQuizMC = [...QUIZ_BANK.multipleChoice];
  appState.activeQuizFIB = [...QUIZ_BANK.fillInBlank];
  renderQuizDOM();
}

function generateDynamicQuiz(onlyWeak = false) {
  let pool = onlyWeak
    ? activeVocabList.filter((v) => appState.weakIds.includes(v.id))
    : [...activeVocabList];

  if (onlyWeak && pool.length < 5) {
    alert(`目前「待加強弱點本」只有 ${pool.length} 個單字，系統將自動補齊其他高頻單字組成完整測驗！`);
    const others = shuffleArray(activeVocabList.filter((v) => !appState.weakIds.includes(v.id)));
    pool = [...pool, ...others.slice(0, 10 - pool.length)];
  }

  const shuffled = shuffleArray(pool);
  const mcItems = shuffled.slice(0, 5).map((target) => {
    const distractors = shuffleArray(activeVocabList.filter((v) => v.id !== target.id && v.pos === target.pos))
      .slice(0, 3)
      .map((d) => d.word);
    while (distractors.length < 3) {
      const rand = activeVocabList[Math.floor(Math.random() * activeVocabList.length)].word;
      if (rand !== target.word && !distractors.includes(rand)) distractors.push(rand);
    }
    const regex = new RegExp(`\\b${target.word}\\b`, "gi");
    const maskedSentence = (target.example || `${target.word} is important.`).replace(regex, "__________");
    return {
      q: `${maskedSentence} （提示：${target.zh}）`,
      options: shuffleArray([target.word, ...distractors]),
      answer: target.word,
      wordId: target.id,
      explanation: `正確單字為 ${target.word} (${target.pos || "n."} ${target.zh})。完整例句：${target.example || ""}`
    };
  });

  const fibSource = shuffled.slice(5, 10).length >= 5 ? shuffled.slice(5, 10) : shuffled.slice(0, 5);
  const fibItems = fibSource.map((target) => {
    const regex = new RegExp(`\\b${target.word}\\b`, "gi");
    const masked = (target.example || `${target.word} is key.`).replace(regex, "__________");
    return {
      sentence: masked,
      prefix: target.word.slice(0, 1),
      zhHint: target.zh,
      answer: target.word,
      wordId: target.id,
      explanation: `${target.word}（${target.zh}）。記憶提示：${target.memory || ""}`
    };
  });

  appState.activeQuizMC = mcItems;
  appState.activeQuizFIB = fibItems;
  renderQuizDOM();
}

function renderQuizDOM() {
  document.getElementById("quiz-score-summary").classList.add("hidden");

  // Part A
  const partA = document.getElementById("quiz-part-a");
  partA.innerHTML = appState.activeQuizMC
    .map(
      (item, idx) => `
      <div class="question-block" data-mc-idx="${idx}">
        <p class="question-title">${idx + 1}. ${item.q}</p>
        <div class="options-list">
          ${item.options
            .map(
              (opt) => `
            <label class="option-label" data-opt-val="${opt}">
              <input type="radio" name="q_mc_${idx}" value="${opt}" />
              <span>${opt}</span>
            </label>
          `
            )
            .join("")}
        </div>
        <div class="explanation-box hidden" id="mc-exp-${idx}">
          <strong>正確解答：${item.answer}</strong>｜${item.explanation}
        </div>
      </div>
    `
    )
    .join("");

  // Part B
  const partB = document.getElementById("quiz-part-b");
  partB.innerHTML = appState.activeQuizFIB
    .map(
      (item, idx) => `
      <div class="question-block" data-fib-idx="${idx}">
        <p class="question-title">
          ${idx + 1}. ${item.sentence}
          <span class="badge" style="margin-left:6px;">字首提示：${item.prefix}...（${item.zhHint}）</span>
        </p>
        <div>
          <input type="text" class="inline-input" id="fib-input-${idx}" placeholder="請輸入 ${item.prefix} 開頭單字" style="width: 240px;" />
        </div>
        <div class="explanation-box hidden" id="fib-exp-${idx}">
          <strong>正確解答：${item.answer}</strong>｜${item.explanation}
        </div>
      </div>
    `
    )
    .join("");

  // Part C
  const partC = document.getElementById("quiz-part-c");
  partC.innerHTML = QUIZ_BANK.sentenceMaking
    .map(
      (item, idx) => `
      <div class="question-block">
        <span class="badge">${item.tag}</span>
        <p class="question-title" style="margin-top:8px;">${idx + 1}. ${item.promptZh}</p>
        <p class="text-muted">必用指定單字：<code>${item.requiredWords.join(" , ")}</code></p>
        <textarea class="sentence-textarea" id="sm-input-${idx}" placeholder="請在此輸入您的英文翻譯或造句..."></textarea>
        <div class="explanation-box hidden" id="sm-exp-${idx}">
          <div id="sm-check-${idx}" style="margin-bottom:6px;"></div>
          <strong>參考範本：</strong>${item.sampleAnswer}<br/>
          <strong>寫作解析：</strong>${item.explanation}
        </div>
      </div>
    `
    )
    .join("");
}

function submitAndGradeQuiz(revealOnly = false) {
  let score = 0;
  let weakAddedCount = 0;

  appState.activeQuizMC.forEach((item, idx) => {
    const block = document.querySelector(`.question-block[data-mc-idx="${idx}"]`);
    const checked = block.querySelector(`input[name="q_mc_${idx}"]:checked`);
    const userVal = checked ? checked.value : "";

    block.querySelectorAll(".option-label").forEach((lbl) => {
      lbl.classList.remove("correct", "wrong");
      const val = lbl.getAttribute("data-opt-val");
      if (val.toLowerCase() === item.answer.toLowerCase()) {
        lbl.classList.add("correct");
      } else if (!revealOnly && val === userVal && userVal.toLowerCase() !== item.answer.toLowerCase()) {
        lbl.classList.add("wrong");
      }
    });

    if (!revealOnly) {
      if (userVal.toLowerCase() === item.answer.toLowerCase()) {
        score += 10;
      } else if (item.wordId) {
        toggleWeak(item.wordId, true);
        weakAddedCount++;
      }
    }
    document.getElementById(`mc-exp-${idx}`).classList.remove("hidden");
  });

  appState.activeQuizFIB.forEach((item, idx) => {
    const input = document.getElementById(`fib-input-${idx}`);
    const userVal = input.value.trim().toLowerCase();
    const ans = item.answer.toLowerCase();
    input.classList.remove("is-correct", "is-wrong");

    if (revealOnly) {
      input.value = item.answer;
      input.classList.add("is-correct");
    } else if (userVal === ans) {
      score += 10;
      input.classList.add("is-correct");
    } else {
      input.classList.add("is-wrong");
      if (item.wordId) {
        toggleWeak(item.wordId, true);
        weakAddedCount++;
      }
    }
    document.getElementById(`fib-exp-${idx}`).classList.remove("hidden");
  });

  QUIZ_BANK.sentenceMaking.forEach((item, idx) => {
    const val = document.getElementById(`sm-input-${idx}`).value.toLowerCase();
    const missing = item.requiredWords.filter((w) => !val.includes(w.toLowerCase()));
    const checkEl = document.getElementById(`sm-check-${idx}`);
    if (val.trim() === "") {
      checkEl.innerHTML = `<span style="color:#b45309;">⚠️ 您尚未作答，請參考下方標準範本練習！</span>`;
    } else if (missing.length === 0) {
      checkEl.innerHTML = `<span style="color:#059669;font-weight:700;">✅ 太棒了！您已完整運用所有指定核心單字！</span>`;
    } else {
      checkEl.innerHTML = `<span style="color:#dc2626;">💡 提醒：您的句子中還缺少指定字詞：<strong>${missing.join(", ")}</strong></span>`;
    }
    document.getElementById(`sm-exp-${idx}`).classList.remove("hidden");
  });

  if (!revealOnly) {
    const summary = document.getElementById("quiz-score-summary");
    summary.classList.remove("hidden");
    summary.innerHTML = `
      🎯 <strong>隨堂測驗批改結果：${score} / 100 分</strong>
      ${
        weakAddedCount > 0
          ? `<br/>⚡ 系統已自動將您本輪答錯的 <strong>${weakAddedCount}</strong> 個單字加入「待加強弱點本」，可隨時點擊上方「⚡ 專攻待加強單字測驗」進行第二輪特訓！`
          : `<br/>🌟 恭喜滿分過關！所有單字皆精準掌握！`
      }
    `;
    summary.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// ==================== 彈窗 Modal 控制 ====================
function openWordModal(id) {
  const item = activeVocabList.find((v) => v.id === id);
  if (!item) return;
  appState.activeModalWordId = id;

  const catEl = document.getElementById("modal-cat");
  catEl.textContent = item.categoryLabel || "自訂";
  catEl.className = `badge cat-${item.category || "custom"}`;

  document.getElementById("modal-word").textContent = item.word;
  document.getElementById("modal-pos").textContent = item.pos || "n.";
  document.getElementById("modal-phonetic").textContent = item.phonetic || "";
  document.getElementById("modal-zh").textContent = item.zh;
  document.getElementById("modal-ex").textContent = item.example || "";
  document.getElementById("modal-ex-zh").textContent = item.exampleZh || "";
  document.getElementById("modal-memory").textContent = item.memory || "";

  document.getElementById("word-modal").classList.remove("hidden");
  speakText(item.word);
}

// ==================== 初始化與事件綁定 ====================
document.addEventListener("DOMContentLoaded", () => {
  initVocabData();
  loadProgress();
  updateHeaderStats();
  renderVocabSection();
  initShadowingStation();
  renderListeningSection();
  renderVocabTable();
  loadStandardQuiz();

  // 切換五大模組 Tabs
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.getAttribute("data-tab");
      document.getElementById(`tab-${target}`).classList.add("active");
      window.speechSynthesis.cancel();
      stopShadowLoop();
      dialogueStopFlag = true;

      if (target === "table") {
        renderVocabTable();
      }
    });
  });

  // 搜尋與分類篩選 (卡片)
  document.getElementById("vocab-search").addEventListener("input", (e) => {
    appState.searchQuery = e.target.value;
    appState.flashcardIndex = 0;
    renderVocabSection();
  });

  document.querySelectorAll("#category-filters .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#category-filters .chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      appState.currentCategory = chip.getAttribute("data-cat");
      appState.flashcardIndex = 0;
      renderVocabSection();
    });
  });

  // 切換列表 / 閃卡檢視
  document.getElementById("view-list-btn").addEventListener("click", () => {
    appState.viewMode = "list";
    document.getElementById("view-list-btn").classList.add("active");
    document.getElementById("view-flashcard-btn").classList.remove("active");
    renderVocabSection();
  });

  document.getElementById("view-flashcard-btn").addEventListener("click", () => {
    appState.viewMode = "flashcard";
    document.getElementById("view-flashcard-btn").classList.add("active");
    document.getElementById("view-list-btn").classList.remove("active");
    renderVocabSection();
  });

  // 閃卡翻面與切換
  const fcBox = document.getElementById("flashcard-box");
  fcBox.addEventListener("click", (e) => {
    if (e.target.id === "fc-speak-front") return;
    fcBox.classList.toggle("flipped");
  });

  document.getElementById("fc-speak-front").addEventListener("click", (e) => {
    e.stopPropagation();
    const list = getFilteredVocab();
    if (list[appState.flashcardIndex]) {
      speakText(list[appState.flashcardIndex].word);
    }
  });

  document.getElementById("fc-prev").addEventListener("click", () => {
    appState.flashcardIndex--;
    renderVocabSection();
  });

  document.getElementById("fc-next").addEventListener("click", () => {
    appState.flashcardIndex++;
    renderVocabSection();
  });

  document.getElementById("fc-mark-weak").addEventListener("click", () => {
    const list = getFilteredVocab();
    if (list[appState.flashcardIndex]) toggleWeak(list[appState.flashcardIndex].id);
  });

  document.getElementById("fc-mark-mastered").addEventListener("click", () => {
    const list = getFilteredVocab();
    if (list[appState.flashcardIndex]) toggleMastered(list[appState.flashcardIndex].id);
  });

  // 鍵盤快捷鍵支援閃卡
  document.addEventListener("keydown", (e) => {
    if (appState.viewMode !== "flashcard") return;
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
    if (e.key === "ArrowRight") {
      appState.flashcardIndex++;
      renderVocabSection();
    } else if (e.key === "ArrowLeft") {
      appState.flashcardIndex--;
      renderVocabSection();
    } else if (e.key === " ") {
      e.preventDefault();
      fcBox.classList.toggle("flipped");
    }
  });

  // 總表管理事件綁定 (需求 2)
  document.getElementById("table-search-input").addEventListener("input", (e) => {
    appState.tableSearch = e.target.value;
    renderVocabTable();
  });

  document.getElementById("table-cat-filter").addEventListener("change", (e) => {
    appState.tableCategory = e.target.value;
    renderVocabTable();
  });

  document.getElementById("btn-open-import-modal").addEventListener("click", () => {
    document.getElementById("import-modal").classList.remove("hidden");
  });

  document.getElementById("btn-submit-import").addEventListener("click", handleBatchImport);

  document.getElementById("btn-open-add-single").addEventListener("click", () => {
    document.getElementById("add-word-modal").classList.remove("hidden");
  });

  document.getElementById("btn-save-single-word").addEventListener("click", handleAddSingleWord);
  document.getElementById("btn-export-vocab").addEventListener("click", exportVocabJson);
  document.getElementById("btn-restore-defaults").addEventListener("click", restoreDefaultVocab);

  // 閱讀模組按鈕
  document.getElementById("btn-toggle-reading-zh").addEventListener("click", () => {
    appState.showReadingZh = !appState.showReadingZh;
    document.querySelectorAll(".reading-para-zh").forEach((el) => {
      el.classList.toggle("hidden", !appState.showReadingZh);
    });
  });

  document.getElementById("btn-read-article").addEventListener("click", () => {
    const fullText = READING_DATA.paragraphs.map((p) => p.en.replace(/\*\*/g, "")).join(" ");
    speakText(fullText, 0.95);
  });

  document.getElementById("btn-check-reading").addEventListener("click", checkReadingQuiz);
  document.getElementById("btn-reset-reading").addEventListener("click", () => {
    renderReadingSection();
    document.getElementById("reading-score-banner").classList.add("hidden");
  });

  // 聽力對話模組按鈕
  document.getElementById("btn-play-dialogue").addEventListener("click", () => playFullDialogue(0));
  document.getElementById("btn-stop-dialogue").addEventListener("click", () => {
    dialogueStopFlag = true;
    window.speechSynthesis.cancel();
    document.querySelectorAll(".dialogue-turn").forEach((el) => el.classList.remove("playing"));
  });

  document.getElementById("btn-toggle-dialogue-zh").addEventListener("click", () => {
    appState.showDialogueZh = !appState.showDialogueZh;
    document.querySelectorAll(".turn-zh").forEach((el) => {
      el.classList.toggle("hidden", !appState.showDialogueZh);
    });
  });

  document.getElementById("btn-check-dictation").addEventListener("click", () => checkDictation(false));
  document.getElementById("btn-show-dictation-ans").addEventListener("click", () => checkDictation(true));

  // 綜合測驗中心按鈕
  document.getElementById("btn-quiz-standard").addEventListener("click", loadStandardQuiz);
  document.getElementById("btn-quiz-random").addEventListener("click", () => generateDynamicQuiz(false));
  document.getElementById("btn-quiz-weak").addEventListener("click", () => generateDynamicQuiz(true));
  document.getElementById("btn-submit-quiz").addEventListener("click", () => submitAndGradeQuiz(false));
  document.getElementById("btn-reveal-quiz").addEventListener("click", () => submitAndGradeQuiz(true));

  // 重置進度
  document.getElementById("btn-reset-progress").addEventListener("click", () => {
    if (confirm("確定要清除所有「已熟記」與「待加強」紀錄嗎？（單字庫資料會保留）")) {
      appState.masteredIds = [];
      appState.weakIds = [];
      saveProgress();
      renderVocabSection();
      renderVocabTable();
    }
  });

  // 單字小卡 Modal 事件
  document.getElementById("modal-close").addEventListener("click", () => {
    document.getElementById("word-modal").classList.add("hidden");
  });
  document.getElementById("word-modal").addEventListener("click", (e) => {
    if (e.target.id === "word-modal") {
      document.getElementById("word-modal").classList.add("hidden");
    }
  });
  document.getElementById("modal-speak").addEventListener("click", () => {
    const item = activeVocabList.find((v) => v.id === appState.activeModalWordId);
    if (item) speakText(item.word);
  });
  document.getElementById("modal-btn-weak").addEventListener("click", () => {
    if (appState.activeModalWordId) toggleWeak(appState.activeModalWordId);
    document.getElementById("word-modal").classList.add("hidden");
  });
  document.getElementById("modal-btn-mastered").addEventListener("click", () => {
    if (appState.activeModalWordId) toggleMastered(appState.activeModalWordId);
    document.getElementById("word-modal").classList.add("hidden");
  });

  // 安裝 Modal 背景點擊關閉
  document.getElementById("install-modal").addEventListener("click", (e) => {
    if (e.target.id === "install-modal") {
      window.closeInstallModal();
    }
  });

  // 偵測 LINE / FB / IG 內建瀏覽器
  const ua = navigator.userAgent || navigator.vendor || window.opera || "";
  if (/Line\/|FBAN|FBAV|Instagram|MicroMessenger/i.test(ua)) {
    const inAppBanner = document.getElementById("inapp-browser-banner");
    if (inAppBanner) inAppBanner.style.display = "flex";
  }

  // 註冊 Service Worker
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch((err) => {
        console.warn("SW registration skipped:", err);
      });
    });
  }
});
