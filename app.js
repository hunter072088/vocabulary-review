// 狀態管理 (儲存於 localStorage)
const STORAGE_KEY = "vocab_app_progress_v1";

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
  activeModalWordId: null
};

// 載入儲存的進度
function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      appState.masteredIds = Array.isArray(parsed.masteredIds) ? parsed.masteredIds : [];
      appState.weakIds = Array.isArray(parsed.weakIds) ? parsed.weakIds : [];
    }
  } catch (e) {
    console.warn("無法讀取 localStorage:", e);
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
    console.warn("無法寫入 localStorage:", e);
  }
  updateHeaderStats();
}

function updateHeaderStats() {
  document.getElementById("stat-total").textContent = VOCAB_DATA.length;
  document.getElementById("stat-mastered").textContent = appState.masteredIds.length;
  document.getElementById("stat-weak").textContent = appState.weakIds.length;
  document.getElementById("weak-count-chip").textContent = appState.weakIds.length;
  document.getElementById("mastered-count-chip").textContent = appState.masteredIds.length;
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
}

// 取得篩選後的單字清單
function getFilteredVocab() {
  return VOCAB_DATA.filter((item) => {
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
      const matchEx = item.example.toLowerCase().includes(q);
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
          <p class="text-muted">請嘗試切換上方分類標籤或清除搜尋關鍵字。</p>
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
                <span class="pos-tag">${item.pos}</span>
                <span class="vc-phonetic">${item.phonetic}</span>
              </div>
              <span class="badge cat-${item.category}">${item.categoryLabel}</span>
            </div>
            <div class="vc-zh">${item.zh}</div>
            <div class="vc-example">
              <div class="en">${item.example}</div>
              <div class="zh">${item.exampleZh}</div>
            </div>
            <div class="vc-memory">
              <strong>💡 記憶與搭配：</strong>${item.memory}
            </div>
          </div>
          <div class="vc-actions">
            <div>
              <button class="btn-audio btn-sm" onclick="speakText('${item.word.replace(/'/g, "\\'")}')">🔊 單字</button>
              <button class="btn-audio btn-sm" onclick="speakText('${item.example.replace(/'/g, "\\'")}', 0.95)">🔈 例句</button>
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
  catEl.textContent = item.categoryLabel;
  catEl.className = `badge cat-${item.category}`;

  document.getElementById("fc-word").textContent = item.word;
  document.getElementById("fc-phonetic").textContent = item.phonetic;
  document.getElementById("fc-back-word").textContent = item.word;
  document.getElementById("fc-pos").textContent = item.pos;
  document.getElementById("fc-zh").textContent = item.zh;
  document.getElementById("fc-example").textContent = item.example;
  document.getElementById("fc-example-zh").textContent = item.exampleZh;
  document.getElementById("fc-memory").textContent = item.memory;

  const weakBtn = document.getElementById("fc-mark-weak");
  const mastBtn = document.getElementById("fc-mark-mastered");
  weakBtn.textContent = appState.weakIds.includes(item.id) ? "⚡ 已在待加強本" : "⚡ 加入待加強";
  mastBtn.textContent = appState.masteredIds.includes(item.id) ? "✅ 已標記熟記" : "✅ 標記已熟記";
}

// ==================== 模組 2：閱讀理解挑戰 ====================
function findVocabBySurfaceWord(surface) {
  const clean = surface.toLowerCase().trim();
  return (
    VOCAB_DATA.find((v) => v.word.toLowerCase() === clean) ||
    VOCAB_DATA.find((v) => clean.startsWith(v.word.toLowerCase().slice(0, 5)))
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

  // 綁定點擊高亮單字開啟 Modal
  contentEl.querySelectorAll(".vocab-highlight").forEach((el) => {
    el.addEventListener("click", () => {
      const id = Number(el.getAttribute("data-word-id"));
      if (id) openWordModal(id);
    });
  });

  // 渲染閱讀測驗題目
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

// ==================== 模組 3：聽力與口說訓練腳本 ====================
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

// ==================== 模組 4：綜合測驗中心 ====================
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
    ? VOCAB_DATA.filter((v) => appState.weakIds.includes(v.id))
    : [...VOCAB_DATA];

  if (onlyWeak && pool.length < 5) {
    alert(`目前「待加強弱點本」只有 ${pool.length} 個單字，系統將自動補齊其他高頻單字組成完整測驗！`);
    const others = shuffleArray(VOCAB_DATA.filter((v) => !appState.weakIds.includes(v.id)));
    pool = [...pool, ...others.slice(0, 10 - pool.length)];
  }

  const shuffled = shuffleArray(pool);
  const mcItems = shuffled.slice(0, 5).map((target) => {
    const distractors = shuffleArray(VOCAB_DATA.filter((v) => v.id !== target.id && v.pos === target.pos))
      .slice(0, 3)
      .map((d) => d.word);
    while (distractors.length < 3) {
      const rand = VOCAB_DATA[Math.floor(Math.random() * VOCAB_DATA.length)].word;
      if (rand !== target.word && !distractors.includes(rand)) distractors.push(rand);
    }
    const regex = new RegExp(`\\b${target.word}\\b`, "gi");
    const maskedSentence = target.example.replace(regex, "__________");
    return {
      q: `${maskedSentence} （提示：${target.zh}）`,
      options: shuffleArray([target.word, ...distractors]),
      answer: target.word,
      wordId: target.id,
      explanation: `正確單字為 ${target.word} (${target.pos} ${target.zh})。完整例句：${target.example}`
    };
  });

  const fibSource = shuffled.slice(5, 10).length >= 5 ? shuffled.slice(5, 10) : shuffled.slice(0, 5);
  const fibItems = fibSource.map((target) => {
    const regex = new RegExp(`\\b${target.word}\\b`, "gi");
    const masked = target.example.replace(regex, "__________");
    return {
      sentence: masked,
      prefix: target.word.slice(0, 1),
      zhHint: target.zh,
      answer: target.word,
      wordId: target.id,
      explanation: `${target.word}（${target.zh}）。記憶提示：${target.memory}`
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

  // 批改 Part A (50分)
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

  // 批改 Part B (50分)
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

  // 檢核 Part C 關鍵字
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
  const item = VOCAB_DATA.find((v) => v.id === id);
  if (!item) return;
  appState.activeModalWordId = id;

  const catEl = document.getElementById("modal-cat");
  catEl.textContent = item.categoryLabel;
  catEl.className = `badge cat-${item.category}`;

  document.getElementById("modal-word").textContent = item.word;
  document.getElementById("modal-pos").textContent = item.pos;
  document.getElementById("modal-phonetic").textContent = item.phonetic;
  document.getElementById("modal-zh").textContent = item.zh;
  document.getElementById("modal-ex").textContent = item.example;
  document.getElementById("modal-ex-zh").textContent = item.exampleZh;
  document.getElementById("modal-memory").textContent = item.memory;

  document.getElementById("word-modal").classList.remove("hidden");
  speakText(item.word);
}

// ==================== 初始化與事件綁定 ====================
document.addEventListener("DOMContentLoaded", () => {
  loadProgress();
  updateHeaderStats();
  renderVocabSection();
  renderReadingSection();
  renderListeningSection();
  loadStandardQuiz();

  // 切換四大模組 Tabs
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.getAttribute("data-tab");
      document.getElementById(`tab-${target}`).classList.add("active");
      window.speechSynthesis.cancel();
      dialogueStopFlag = true;
    });
  });

  // 搜尋與分類篩選
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

  // 閃卡互動
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

  // 聽力與口說模組按鈕
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
    if (confirm("確定要清除所有「已熟記」與「待加強」紀錄嗎？")) {
      appState.masteredIds = [];
      appState.weakIds = [];
      saveProgress();
      renderVocabSection();
    }
  });

  // Modal 事件
  document.getElementById("modal-close").addEventListener("click", () => {
    document.getElementById("word-modal").classList.add("hidden");
  });
  document.getElementById("word-modal").addEventListener("click", (e) => {
    if (e.target.id === "word-modal") {
      document.getElementById("word-modal").classList.add("hidden");
    }
  });
  document.getElementById("modal-speak").addEventListener("click", () => {
    const item = VOCAB_DATA.find((v) => v.id === appState.activeModalWordId);
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
});

