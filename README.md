# 中文

## 媽媽記副食品 — 網站與管理後台

寶寶副食品紀錄 App「媽媽記副食品」的網站(首頁、使用者條款、隱私權政策、判斷邏輯說明)與管理後台。純靜態網頁,部署在 GitHub Pages。這份文件分成兩個獨立的部分,請依需求閱讀:

- **[專案報告](#專案報告)**:網站有哪些頁面、後台怎麼登入、為什麼這樣設計 —— 給想了解「這是什麼」的人看。
- **[架設 SOP](#架設-sop)**:在自己電腦上預覽、部署時要填的設定 —— 給想「動手把它跑起來」的人看。

這兩部分刻意分開,不要交叉閱讀;報告是背景知識,SOP 是操作手冊。

程式註解裡的「SPEC 第 N 節」、`design/DESIGN_SYSTEM.md`、`tools/sync_texts.py` 等,是只留在開發者本機的規格、設計文件與工具,不在 repo 裡。

---

## 專案報告

### 這是什麼

三種頁面:

| 頁面 | 內容 |
|---|---|
| `index.html` | 首頁:App 的介紹、「你的資料只在你手上」的說明、下載(目前尚未上架)、文件連結。右上角可以用 Google 登入:一般使用者登入沒有作用;管理員登入後才出現「管理後台」的入口。 |
| `legal.html?doc=terms` / `privacy` / `judgement_guide` | 使用者條款、隱私權政策、判斷邏輯說明。隱私權政策的公開網址,將來上架時要填進 Google Play。 |
| `admin.html` | 管理後台,五個分頁:公用資料(食材清單與單位的編輯、發布)、App 版本(強制更新門檻與提示文字)、意見回饋、管理員、系統(快取與資料庫的版本、重新載入快取)。 |

### 系統架構

整個專案是一個 git meta-repo(`mama-fufood`)透過 submodule 掛載三個獨立 repo:

```
mama-fufood/                     ← meta-repo,本機開發統一入口,本身不部署
├── mama-fufood-app/             ← Flutter Android App,本機打包、用 adb 安裝
├── mama-fufood-backend/         ← 後端 API,部署到 Render(Flask + gunicorn)
└── mama-fufood-web/             ← 本 repo,部署到 GitHub Pages(純靜態 HTML/CSS/JS)
```

沒有任何前端框架或建置流程,`.html`、`.css`、`.js` 直接交給 GitHub Pages。唯一的外部 script 是 Google Identity Services(Google 登入的按鈕);管理後台的資料都向 `mama-fufood-backend` 的 `/api/admin/*` 讀寫。

### 前端的鎖只是方便,權限在後端

首頁只有管理員登入後才顯示「管理後台」的入口,但這只是方便,不是安全措施:任何人都能直接打開 `admin.html`。真正的檢查在後端:`/api/admin/*` 的每一個請求都要帶管理員的 session,而且後端每次都會確認「這個 Email 現在還是不是管理員」;不是管理員的人打後台 API 一律被拒。後端的 CORS 也只允許這個網站的網址(與本機預覽的 `http://localhost:8003`)呼叫後台 API。

### 登入:Google 的憑證只用一次

Google 的 ID token 大約一小時就過期,不能當長期憑證,否則後台開著超過一小時就會在操作中途失效。所以:

- 管理員登入時,網頁把 Google 的憑證送到後端,後端驗證後發一張我們自己的 session token;之後的請求都帶這張(`js/api.js`)。
- session token 存在這個瀏覽器的 `localStorage`;滑動式有效期,連續 90 天沒用才過期。後端回 401 時就清掉,讓使用者重新登入。
- 首頁的 Google 登入,憑證也只送到後端確認是不是管理員,用完即丟(隱私權政策第二條寫明)。

### 條款與政策是 Markdown,和 App 內建的是同一份

使用者條款、隱私權政策、判斷邏輯說明的內容在 `legal/*.md`,和 App 內建的文字是同一份,從同一份草案產生,所以網站與 App 不會說兩套話。不要直接改這裡的檔案。

顯示時用自己寫的一支很小的 Markdown 轉換器(`js/md.js`),只處理這些文件用到的語法(標題、段落、清單、粗體、連結、表格、引言、分隔線),不用第三方函式庫,少一個要追版本的外部依賴。內容雖然是我們自己的檔案,仍然**先跳脫 HTML 再轉換**,連結只接受 `http(s)://`。

### 慢回應不能蓋掉新畫面

後台的資料都是非同步讀的。如果在一個請求還沒回來時就切到別的分頁、或按了重新整理,晚到的舊回應可能把新畫面整個重畫掉(例如剛勾好的選項被清空)。`js/admin.js` 對「公用資料」「意見回饋列表」「意見回饋內容」各有一個世代計數(`gen`):每次發出請求就加一,回應回來時如果世代已經不是最新的,就直接丟掉。

### 後端在休眠時

Render 免費方案閒置 15 分鐘會休眠,喚醒約 1 分鐘。所以每個請求最多等 75 秒;連不上時顯示「連不上後端(可能正在喚醒,請等一下再試)」,登入時也先說明「後端可能正在喚醒,最多約一分鐘」,不會讓人以為壞掉了。

Google 登入的 script 如果載入失敗(例如被擋廣告的外掛擋掉),頁面會直接說明原因,而不是只留一塊空白。

### 檔案結構

```
index.html              首頁
legal.html              條款、政策、判斷邏輯說明(?doc= 指定哪一份)
admin.html              管理後台
css/style.css           樣式(設計風格「可愛粉藍」,跟著系統的深淺色)
js/
  ├── config.js          網站設定:後端網址、Google 用戶端 ID、Google Play 網址
  ├── api.js             呼叫後端、保存管理員 session
  ├── md.js              很小的 Markdown 轉換器(先跳脫 HTML)
  ├── home.js            首頁的 Google 登入與後台入口
  └── admin.js           管理後台的五個分頁
legal/                  條款、政策、判斷邏輯說明、資料運用原則、政策版本(和 App 內建的是同一份)
favicon.png、apple-touch-icon.png、icon_256.png   圖示
.nojekyll               讓 GitHub Pages 原樣提供檔案,不經過 Jekyll 處理
```

### 已知限制

- **還沒有實際部署過**;`js/config.js` 的 Google 用戶端 ID 與 Google Play 網址都還是空的。
- 沒有自動化測試,改了之後要自己在瀏覽器上點過一次。
- 管理後台要後端醒著才能用;後端剛喚醒時,第一個動作可能要等將近一分鐘。
- 本機預覽管理後台時,要暫時把 `js/config.js` 的後端網址改成本機的(見 SOP Part A),**改完記得改回來,不要提交**。

---

# 架設 SOP / Setup Guide

## Part A. 在你的 Mac 上預覽

### 1. 啟動本機網頁伺服器

```bash
cd mama-fufood-web
python3 -m http.server 8003
```

瀏覽器打開 `http://localhost:8003`。首頁、條款與政策不需要後端,打開就看得到。

`8003` 不要隨便改:Google 登入會連 port 一起比對「已授權的 JavaScript 來源」,後端的 `ALLOWED_ORIGINS` 也是。

### 2.(要試管理後台時)接上本機的後端

1. 照 `mama-fufood-backend` 的 README 把後端跑在 `http://localhost:5003`,`.env` 填好 `GOOGLE_CLIENT_ID`、`FIRST_ADMIN_EMAIL`、`SESSION_SECRET`,`ALLOWED_ORIGINS` 包含 `http://localhost:8003`(範本已經有)。
2. Google Cloud 的「網頁應用程式」用戶端,「已授權的 JavaScript 來源」要有 `http://localhost:8003`。
3. 暫時改 `js/config.js`:`apiBase` 改成 `http://localhost:5003`、`googleClientId` 填網頁應用程式的用戶端 ID。**試完把 `apiBase` 改回正式的網址,不要提交本機的網址。**
4. 重新整理首頁 → 右上角用 `FIRST_ADMIN_EMAIL` 的帳號登入 → 出現「管理後台」。

按 `Control + C` 停止網頁伺服器。

---

## Part B. 部署到 GitHub Pages

上線要和後端、App、Google Cloud 互相填網址與用戶端 ID,所以完整步驟集中寫在 meta repo [`mama-fufood`](https://github.com/beethoreven/mama-fufood) README 的「上線 SOP」,照那份的順序做。GitHub Pages 本身的設定:

1. repo 的 **Settings → Pages**。
2. **Build and deployment → Source** 選 **Deploy from a branch**。
3. **Branch** 選 `main`、資料夾選 `/ (root)` → **Save**。
4. 一兩分鐘後打開 `https://beethoreven.github.io/mama-fufood-web/` 看得到首頁。之後每次推上 `main`,Pages 會自動更新。

GitHub 免費方案的 Pages 只能用在**公開**的 repo。

---

## Part C. 設定值總覽(`js/config.js`)

這些值都不是秘密(用戶端 ID 本來就會出現在網頁裡),但每個人的設定不同,部署前要填好再推上去。

| 欄位 | 必填? | 說明 |
|---|---|---|
| `apiBase` | **必填** | 後端網址(Render),例如 `https://mama-fufood-backend.onrender.com`,**結尾不要斜線**。 |
| `googleClientId` | **必填**(要用 Google 登入時) | Google Cloud「網頁應用程式」用戶端 ID(和後端的 `GOOGLE_CLIENT_ID` 是同一個)。空白時不顯示登入按鈕。 |
| `playUrl` | 選填 | 上架後填 Google Play 的網址;空白時首頁顯示「目前尚未在 Google Play 上架」。 |

---

# English

## Mama's Baby Food Log — Website and Admin Console

The website (home page, terms of use, privacy policy, judgement-logic guide) and admin console for *媽媽記副食品* ("Mama's Baby Food Log"), an app for logging a baby's complementary food. Plain static pages, deployed on GitHub Pages. This document is split into two independent parts — read whichever fits what you need:

- **[Project Report](#project-report)**: which pages the site has, how admin login works, and why it is designed this way — for anyone who wants to understand "what is this."
- **[Setup Guide](#setup-guide)**: previewing on your own machine and the settings needed for deployment — for anyone who wants to "get it running."

These two parts are deliberately kept separate — don't read them interleaved; the report is background knowledge, the guide is an operating manual.

References in code comments such as "SPEC 第 N 節" (SPEC section N), `design/DESIGN_SYSTEM.md` and `tools/sync_texts.py` point to specs, design documents and tools that live only on the developer's machine; they are not in this repo.

## Project Report

### What This Is

Three kinds of pages:

| Page | Contents |
|---|---|
| `index.html` | Home: an introduction to the app, a "your data stays in your hands" explanation, downloads (not on Google Play yet) and document links. Google sign-in sits at the top right: signing in does nothing for regular users; only admins get an entry point to the admin console. |
| `legal.html?doc=terms` / `privacy` / `judgement_guide` | Terms of use, privacy policy, judgement-logic guide. The privacy policy's public URL is what will go into Google Play when the app is listed. |
| `admin.html` | Admin console with five tabs: public data (editing and publishing the food list and units), app version (force-update threshold and notice text), feedback, admins, and system (cache and database versions, reloading the cache). |

### System Architecture

The whole project is a git meta-repo (`mama-fufood`) that wraps three independent repos via submodules:

```
mama-fufood/                     ← meta-repo, unified local-dev entry point, never deployed itself
├── mama-fufood-app/             ← Flutter Android app, built locally and installed via adb
├── mama-fufood-backend/         ← backend API, deployed to Render (Flask + gunicorn)
└── mama-fufood-web/             ← this repo, deployed to GitHub Pages (pure static HTML/CSS/JS)
```

There is no frontend framework or build step — the `.html`, `.css` and `.js` files are served directly by GitHub Pages. The only external script is Google Identity Services (the Google sign-in button); all admin-console data is read from and written to `mama-fufood-backend`'s `/api/admin/*`.

### The Frontend Lock Is a Convenience; Permissions Live in the Backend

The home page only shows the admin-console entry point after an admin signs in, but that's a convenience, not a security measure: anyone can open `admin.html` directly. The real check is in the backend: every `/api/admin/*` request must carry an admin session, and the backend re-checks "is this email still an admin right now" each time; anyone who isn't an admin is rejected by every admin API. The backend's CORS also only allows this site's origin (plus `http://localhost:8003` for local preview) to call the admin APIs.

### Sign-In: The Google Credential Is Used Once

Google ID tokens expire after roughly an hour, so they can't be used as a long-lived credential — otherwise the admin console would fail mid-task after an hour. So:

- When an admin signs in, the page sends the Google credential to the backend, which verifies it and issues a session token of our own; every later request carries that token (`js/api.js`).
- The session token is stored in this browser's `localStorage`, with sliding expiry: it only expires after 90 consecutive days without use. When the backend answers 401 it is cleared so the user signs in again.
- Google sign-in on the home page also only sends the credential to the backend to check whether this is an admin, and then discards it (stated in section 2 of the privacy policy).

### Terms and Policies Are Markdown, Identical to the App's Built-In Copy

The content of the terms of use, privacy policy and judgement-logic guide lives in `legal/*.md`, identical to the text built into the app and generated from the same drafts, so the website and the app never say two different things. Don't edit these files directly.

They are rendered by a tiny hand-written Markdown converter (`js/md.js`) that only handles the syntax these documents use (headings, paragraphs, lists, bold, links, tables, block quotes, horizontal rules) — no third-party library, so one less external dependency to keep updated. Even though the content is our own files, it **escapes HTML before converting**, and links only accept `http(s)://`.

### A Slow Response Must Not Overwrite a Newer Screen

All admin-console data is loaded asynchronously. If you switch tabs or press refresh while a request is still in flight, the late, stale response could redraw the whole new screen (for example, wiping options you just ticked). `js/admin.js` keeps a generation counter (`gen`) each for "public data", "feedback list" and "feedback detail": it increments on every request, and a response whose generation is no longer the latest is simply dropped.

### When the Backend Is Asleep

Render's free tier sleeps after 15 minutes idle and takes about a minute to wake. So every request waits up to 75 seconds; when the backend can't be reached the page says "連不上後端(可能正在喚醒,請等一下再試)" (can't reach the backend — it may be waking up, please wait a moment), and sign-in also explains up front that the backend may take up to a minute to wake, so nobody mistakes it for being broken.

If the Google sign-in script fails to load (for example, blocked by an ad-blocking extension), the page explains why instead of leaving an empty gap.

### File Layout

```
index.html              home page
legal.html              terms, policy, judgement-logic guide (?doc= picks which one)
admin.html              admin console
css/style.css           styles (the "cute powder blue" design style, follows the system's light/dark mode)
js/
  ├── config.js          site settings: backend URL, Google client ID, Google Play URL
  ├── api.js             backend calls, keeps the admin session
  ├── md.js              tiny Markdown converter (escapes HTML first)
  ├── home.js            Google sign-in and the admin entry point on the home page
  └── admin.js           the admin console's five tabs
legal/                  terms, policy, judgement-logic guide, data-use principles, policy version (identical to the app's built-in copy)
favicon.png, apple-touch-icon.png, icon_256.png   icons
.nojekyll               makes GitHub Pages serve files as-is, without Jekyll processing
```

### Known Limitations

- **Not deployed yet**; the Google client ID and Google Play URL in `js/config.js` are still empty.
- No automated tests — after a change, click through it yourself in a browser.
- The admin console only works while the backend is awake; right after the backend wakes, the first action may take close to a minute.
- Previewing the admin console locally means temporarily pointing `js/config.js` at the local backend (see Setup Guide Part A) — **remember to change it back and never commit it**.

---

# Setup Guide

## Part A. Preview on Your Mac

### 1. Start a Local Web Server

```bash
cd mama-fufood-web
python3 -m http.server 8003
```

Open `http://localhost:8003` in your browser. The home page, terms and policies need no backend and show up right away.

Don't change `8003` casually: Google sign-in matches the "Authorized JavaScript origins" including the port, and so does the backend's `ALLOWED_ORIGINS`.

### 2. (To Try the Admin Console) Connect a Local Backend

1. Run the backend at `http://localhost:5003` per `mama-fufood-backend`'s README, with `GOOGLE_CLIENT_ID`, `FIRST_ADMIN_EMAIL` and `SESSION_SECRET` filled in `.env`, and `ALLOWED_ORIGINS` including `http://localhost:8003` (the template already does).
2. In Google Cloud, the "Web application" client's "Authorized JavaScript origins" must include `http://localhost:8003`.
3. Temporarily edit `js/config.js`: set `apiBase` to `http://localhost:5003` and `googleClientId` to the web application client ID. **When you're done, change `apiBase` back to the production URL — never commit the local URL.**
4. Refresh the home page → sign in at the top right with the `FIRST_ADMIN_EMAIL` account → "管理後台" (Admin console) appears.

Press `Control + C` to stop the web server.

---

## Part B. Deploy to GitHub Pages

Going live means filling URLs and client IDs back and forth between the backend, the app and Google Cloud, so the complete steps live in the "Setup Guide" of the meta repo [`mama-fufood`](https://github.com/beethoreven/mama-fufood) README — follow that order. GitHub Pages' own settings:

1. The repo's **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Choose branch `main` and folder `/ (root)` → **Save**.
4. A minute or two later, `https://beethoreven.github.io/mama-fufood-web/` shows the home page. Every push to `main` updates Pages automatically afterwards.

On GitHub's free plan, Pages only works for **public** repos.

---

## Part C. Settings Overview (`js/config.js`)

None of these are secrets (the client ID appears in the web page anyway), but everyone's settings differ, so fill them in before pushing.

| Field | Required? | Description |
|---|---|---|
| `apiBase` | **Required** | The backend URL (Render), e.g. `https://mama-fufood-backend.onrender.com`, **no trailing slash**. |
| `googleClientId` | **Required** (for Google sign-in) | The Google Cloud "Web application" client ID (the same one as the backend's `GOOGLE_CLIENT_ID`). When empty, no sign-in button is shown. |
| `playUrl` | Optional | The Google Play URL once listed; when empty, the home page says "目前尚未在 Google Play 上架" (not on Google Play yet). |
