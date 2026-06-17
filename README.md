# 成功大學排課工具 (NCKU Course Planner)

一款專為成功大學學生設計的高性能、直覺式智慧排課網頁系統。本專案將複雜的學校課程歷史髒資料，透過獨立自動化爬蟲模組進行跨學期動態擷取，搭配後端管線精準清洗與結構化，並結合前端高動態響應的 **三欄式主版面（3-Column Layout）** 與 **CSS Grid 網格系統**，提供流暢、現代且無衝突的課程規劃體驗。

使用者可至本專案線上展示頁面進行操作：[線上成果展示 Link](https://x807x.github.io/course-planner-ncku/)

---

## 🏗️ 系統架構與核心模組

本專案採用「數據擷取、清洗預處理、前端高響應渲染」三端解耦的現代化架構：

```text
┌──────────────────────────────┐
│    course-crawler-ncku       │ ──> 自動化動態網頁資料擷取端 (Selenium Python)
└──────────────────────────────┘
               │ (原始 NCKU_Full_History_to_114_2.csv)
               ▼
┌──────────────────────────────┐
│        translate.py          │ ──> 縱向空字串阻斷歸併與數據標準化清洗引擎
└──────────────────────────────┘
               │ (依學期、系所分割的輕量級 JSON 碎片檔案庫)
               ▼
┌──────────────────────────────┐
│     course-planner-ncku      │ ──> 前端高性能高響應排課系統 (Vite + React + TS)
└──────────────────────────────┘

```

### 1. 獨立自動化動態爬蟲端 (Data Ingestion Module)

* 專屬儲存庫位置：[course-crawler-ncku](https://github.com/x807x/course-crawler-ncku)
* **動態網頁自動化技術：** 由於成大開課查詢系統採用動態非同步查詢機制，常規的靜態 HTML 解析器（如 Requests）無法穿透。本模組使用 Python 結合動態自動化框架，驅動瀏覽器核心（如 Selenium WebDriver）進行跨學期、多欄位的自動化連動選取與表單提交。
* **高防禦性阻塞控制：** 內建高度穩健的動態元素等待機制（WebDriverWait），能精準穿透高達數分鐘之久的大型學院伺服器資料響應延遲（Server Timeout Protection），並完整將歷史開課資料自動化導出為標準化的全校開課 CSV 大檔。

### 2. 後端高效數據清洗引擎 (Data Processing Pipeline - `translate.py`)

* **多時段全域捕獲：** 完美破解成大特有如 `[1]2~3 [3]5~6` 這類跨星期、跨非連續節次的複雜課程時間字串，精準映射至高度結構化的 JSON 陣列。
* **縱向空字串阻斷與歸併技術 (Vertical Forward-Fill Merge)：** 完美克服原始開課系統中「附屬實習課/實驗課（系所名稱、年級、選必修等欄位常為空字串）」的資料斷層漏洞。後端管線維護狀態快取列（Row Cache），自動追蹤主課物件，在遭遇空系所欄位時，將其實習課的 `slots` 與 `locations` 自動追加（Append/Extend）進主課物件中，確保資料鏈結不漏失。
* **雜訊與重複列防禦：** 在預處理管線中，自動屏蔽並清洗掉包含「科目序號選課」、「選項」等冗餘的開課提示列，維持最純粹乾淨的資料來源。

### 3. 前端極致效能優化 (High-Performance UI Architecture)

* **精準延遲載入 (Granular Lazy Loading)：** 打破全校數萬筆課程一次性載入造成的瀏覽器卡頓。系統將資料依「四碼學期代碼（如 `0114-1`, `0095-1`）」與「系所代碼」進行雙層分治拆分。只有當使用者切換條件時，前端才發送輕量化的非同步 `fetch()` 請求，將單次網路負載收縮至數十筆。
* **Search All 全校搜尋快取：** 當切換至全校搜尋模式時，系統利用 `Promise.all` 併發異步捕獲該學院底下所有的 JSON 碎片並即時融合，達成零效能衝擊之併發加載，完全不阻塞主執行緒（Main Thread）。
* **Grid 格子內絕對層對齊（貼紙層機制）：** 當多個實驗課或重選課程時間代碼完全重合時，卡片徹底脫離常規文檔流的大小計算，避免同節次多筆資料將下方的 Grid 網格無限擠壓變形。

---

## 🌟 智慧排課輔助與現代化 UI 特徵

* **成大專屬混合時間軸：** 使用 CSS Grid 完美繪製包含成大特殊節次（`1~9`, `N`, `A`, `B`, `C`）的功課表畫布。
* **滑鼠懸停即時審計 (Inspection Hub)：** 滑鼠移至左側課程卡片時，系統會自動在微觀層面動態調低該課程專屬色彩之亮度並混入透明度，在課表上投射出「半透明預覽框」，並實時觸發衝堂演算法，不需點擊即可即時得知是否衝突。
* **衝堂暫存決策鏈：** 取代傳統突兀的 `alert` 彈窗攔截。發生衝突的課程會優雅地推入右側數據面板，提供「取代 (Replace)」與「放棄 (Discard)」的現代化雙向決策機制。
* **多功能交叉篩選面板：** 左側控制台支援「全部年級（All Grades）」、特定年級以及「必修」、「選修」、「排除衝堂課程」的無縫即時過濾管線。
* **智慧一鍵加入必修：** 根據所選年級或切換至 `All Grades` 時，系統自動掃描並批量打包當前系所下無衝突的全部必修課。
* **持久化與雲端備份：** 整合瀏覽器 `localStorage` 進行本地暫存（具備跨學期防禦性校準與自動變更年份機制），並支援一鍵「JSON 課表外部匯出與匯入」功能。

---

## 🛠️ 開發環境本地與部署指南

### 本地開發步驟

1. **複製本儲存庫**
```bash
git clone https://github.com/x807x/course-planner-ncku.git
cd course-planner-ncku

```


2. **後端數據預處理 (清洗爬蟲導出的原始 CSV)**
將從 [course-crawler-ncku](https://github.com/x807x/course-crawler-ncku) 爬蟲專案中擷取出來的原始 CSV 檔案命名為 `NCKU_Full_History_to_114_2.csv` 並放置於專案根目錄下，接著執行轉換腳本：
```bash
python translate.py

```


執行成功後，腳本會自動於 `public/` 目錄下生成符合前端 Lazy Loading 格式的 `departments.json`、`semesterList.json` 以及 `course-data/` 分割子目錄。
3. **安裝前端依賴套件 (推薦使用 pnpm)**
```bash
pnpm install

```


4. **啟動 Vite 熱更新開發伺服器**
```bash
pnpm dev

```


開啟瀏覽器至 `http://localhost:3000` 即可開始進行本地開發與即時調試。

### 自動化 GitHub Pages 部署

專案已完整整合 `gh-pages` 套件，並於前端 Fetch 機制中全面利用 Vite 的安全環境變數 `import.meta.env.BASE_URL` 進行相對路徑動態前綴拼接。

1. 確認 `vite.config.ts` 中的 `base` 屬性已精準對齊您的 GitHub 倉庫名稱：
```typescript
export default defineConfig({
  base: '/course-planner-ncku/',
  // ...其餘設定
});

```


2. 執行一鍵建置與發布指令：
```bash
pnpm run deploy

```


本指令將自動編譯打包前端生產級資產，並推送到遠端的 `gh-pages` 分支，完美解決靜態資源路徑錯位導致的部署 404/MIME 阻擋錯誤。

---

## 📝 工程與團隊風格規範

* **全英文程式碼註解 (Full English Code Comments)：** 程式碼內部的核心邏輯、資料結構常數、排課衝突演算法皆保持精簡、高效、無中文冗餘的註解風格。
* **在地化中文使用者介面 (Localized UI)：** 所有最終暴露給同學操作的標籤、選單、狀態提示與決策按鈕，皆經過嚴謹的本地化中文化置換，確保最佳的使用者體驗。
* **Conventional Commits 規範：** Git 的提交歷史（Commit History）皆遵循業界標準規格（例如 `feat:`, `fix:`, `docs:`, `chore:`），展現嚴謹的軟體工程專業素養。

---

## 🗂️ 專案目錄結構

```text
.
├── course-data/            # 轉化後的學期與科系 JSON 資料庫 (符合 Lazy Loading 格式)
├── public/                 # Vite 靜態資源路由區塊
│   ├── course-data/        # 部署/本地 fetch 使用的課程碎片資料 (如 C1.json, F7.json)
│   ├── departments.json    # 學院與科系樹狀索引清單
│   └── semesterList.json   # 歷史學期對照清單 (具備 4 碼前導零格式，如 0114-1)
├── src/
│   ├── components/
│   │   ├── Metrics.tsx     # 右側衝堂決策緩衝佇列 (Staging Queue) 與數據監控面板
│   │   ├── Sidebar.tsx     # 左側多功能多重篩選器、全校搜尋與課程控制台
│   │   └── TopNav.tsx      # 頂部導覽列 (學期防禦性切換警告、JSON 課表匯入匯出中心)
│   ├── styles/
│   │   └── componentStyles.ts # 全域抽離之獨立物件樣式表 (CSS-in-JS 強型別守護)
│   ├── CourseGrid.tsx      # 核心課表畫布組件 (CSS Grid 多節次縱向融合與貼紙對齊演算)
│   ├── types.ts            # 全域強型別核心定義與核心衝突稽核演算法
│   └── index.tsx           # 專案全域狀態核心控制中心與進入點
├── translate.py            # 後端 Python 縱向空字串阻斷歸併與時間全域捕獲清洗腳本
├── vite.config.ts          # Vite 專案配置文件
└── package.json            # 專案套件與自動化部署指令配置

```
