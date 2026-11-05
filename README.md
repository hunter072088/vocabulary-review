# 英語全方位學習與測驗系統 (Tech & Business Vocabulary Learning Suite)

一套專為**半導體製程工程、商務法務、職涯培訓與高頻口語**打造的互動式英語學習 Web App。純前端靜態架構（HTML5 / CSS3 / Vanilla JS），零外部框架依賴，本地端雙擊或啟動靜態伺服器即可運行，並可直接一鍵部署至 **GitHub Pages**。

## ✨ 四大核心模組功能

1. **核心字彙解析 & 3D 記憶閃卡 (Vocabulary Breakdown & Flashcards)**
   - 收錄 59 個核心單字與片語，涵蓋音標、詞性、中譯、情境例句與字根記憶法。
   - 內建瀏覽器原生 **Web Speech API 真人美式發音**（支援單字與完整例句朗讀）。
   - 支援四大主題分類篩選、即時關鍵字搜尋、以及「待加強弱點本 / 已熟記」進度追蹤（自動保存於 `localStorage`）。
   - 支援 **3D 翻轉閃卡模式**（可使用鍵盤 `←` `→` 切換與 `空白鍵` 翻面）。

2. **閱讀理解挑戰 (Reading Comprehension)**
   - 將全部核心字彙自然融入一篇科技職場實境短文《From Process Crisis to Triumph》。
   - **互動式單字點擊彈窗**：點擊文章中任何高亮單字，即時聽發音並檢視字義與記憶技巧。
   - 附帶 3 題上下文推論選擇題與即時批改解析。

3. **聽力與口說訓練腳本 (Listening & Shadowing Studio)**
   - 雙人工程師情境對話（Jamie & Alex），支援**分角色自動連播**與**單句跟讀 (Shadowing)**。
   - 支援語速調整（`0.75x` / `0.9x` / `1.0x` / `1.15x`）與中英對照切換。
   - 內建 3 組**互動式聽力填空 (Dictation)** 即時檢核。

4. **綜合測驗中心 (Interactive Quiz & Weak-Word Booster)**
   - **Part A**：字義配對與語境選擇題（5 題）
   - **Part B**：上下文字首提示填空題（5 題）
   - **Part C**：翻譯與指定單字造句題（2 題，具備指定關鍵字自動檢核與參考範本）
   - **智慧弱點強化**：答錯的題目會自動收錄至「待加強弱點本」，並可點擊 **「⚡ 專攻待加強單字測驗」** 動態生成個人化複習考卷。

## 🚀 本地端執行方式

### 方法一：直接開啟
直接在檔案總管雙擊 [index.html](file:///e:/AI%20agent/vocabulary%20review/index.html) 即可在瀏覽器中使用所有功能。

### 方法二：使用本地端 HTTP 伺服器（推薦）
```bash
# 若已安裝 Python
python -m http.server 8080

# 或使用 Node.js npx
npx serve .
```
接著於瀏覽器開啟 `http://localhost:8080`。

## 📦 部署至 GitHub Pages
1. 將本資料夾初始化為 Git 儲存庫並推送至 GitHub：
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Interactive Vocabulary Learning App"
   git branch -M main
   git remote add origin https://github.com/<你的帳號>/<你的倉庫名稱>.git
   git push -u origin main
   ```
2. 進入 GitHub Repository → **Settings** → **Pages**，在 **Build and deployment** 選擇 `Deploy from a branch`（`main` / `root`），儲存後即可獲得線上版網址！

