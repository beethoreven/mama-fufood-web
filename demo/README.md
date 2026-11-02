# 示範版（demo/ 與 demo-en/）

- 中文：https://beethoreven.github.io/mama-fufood-web/demo/
- 英文：https://beethoreven.github.io/mama-fufood-web/demo-en/

網站首頁與管理後台的示範版。畫面和正式版一樣（直接載入正式版的 `../css/`、`../js/md.js`，中文版也直接用 `../js/home.js`、`../js/admin.js`），但**一個請求都不送到後端**：

- 用 Google 登入，或按「不用 Google 帳號直接進入」，都會變成管理員，出現「管理後台」的入口。Google 的憑證只在瀏覽器裡解開、讀出 Email 拿來顯示，不送去任何地方。登入狀態存在這一頁自己的 localStorage，重新整理後還在；後台按「登出」才登出。
- 後台顯示的是目前的公用資料（App 內建的食材清單與單位、後端的匯出格式定義），意見回饋、管理員與 App 版本設定是假資料（`fixtures.js`，Email 都是 example.com）。
- 儲存、發布、新增、刪除都不會改資料，只跳出提示「demo版本不會更新正式資料」。

之後不需要了，把 `demo/`、`demo-en/` 兩個資料夾刪掉就好，正式版不受影響。

## 不能影響正式版

- **正式版的檔案一個都不改。** 示範版需要的轉接全部由 `demo/tools/build.py` 在示範版的資料夾裡產生。
- 示範版和正式版同一個網域，localStorage 是共用的。示範版的 `index.html` 最前面替這一頁所有的 key 加上前綴（`demo:`、`demo-en:`），讀不到正式版的管理員 session。
- 示範版的 `config.js` 後端網址是空的：萬一載入了真的 `api.js`，請求也只會打到 github.io 自己。

## 檔案

| 檔案 | 怎麼來的 |
|---|---|
| `demo/api.js` | 手寫：假的後端，回應格式和 `mama-fufood-backend/routes/admin.py` 一樣；寫入的動作只跳提示 |
| `demo/fixtures.js`、`demo-en/fixtures.js` | 手寫：假的意見回饋、管理員、App 版本設定，以及假後端要顯示的文字（中英文各一份，要一起改） |
| `demo/tools/build.py` | 手寫：產生下面所有「產生」的檔案；`--check` 只檢查是不是最新的 |
| `demo/tools/translations.py` | 手寫：英文版的中英對照表與術語表 |
| `demo-en/legal/*.md` | 手寫：條款、政策、判斷邏輯說明的英文翻譯（開頭註明以中文版為準） |
| `demo/index.html`、`demo-en/index.html` | 產生：從正式版的 `index.html` 改路徑、換成示範版的 `config.js` 與 `api.js`、加上「不用 Google 帳號直接進入」；英文版另外換成英文、改用拉丁字型 |
| `demo/admin.html`、`demo-en/admin.html` | 產生：從正式版的 `admin.html`，轉接方式同上 |
| `demo/data.js`、`demo-en/data.js` | 產生：App 的 `assets/datasets/` 與後端的 `export_formats/`；英文版照對照表換成英文名稱 |
| `demo/config.js`、`demo-en/config.js` | 產生：正式版的 `js/config.js`，後端網址清空 |
| `demo/legal/*.md` | 產生：正式版 `legal/` 的原樣複製 |
| `demo-en/home.js`、`demo-en/admin.js` | 產生：正式版的 `js/home.js`、`js/admin.js` 換成英文 |
| `demo-en/api.js` | 產生：`demo/api.js` 的複製 |

## 改了正式版之後

改了 `index.html`、`admin.html`、`js/home.js`、`js/admin.js`、`js/config.js`、`legal/`、`demo/` 底下的檔案，或 App 的公用資料、後端的匯出格式之後，提交之前：

```bash
python3 demo/tools/build.py
```

會報錯的情況：

- 對照表的中文原文在正式版找不到（正式版改了字）：更新 `demo/tools/translations.py`。
- 英文版產出的檔案（註解以外）還有中文字：在對照表補上那一句。
- 公用資料新增了分組、食材或單位，或多了新的匯出格式版本：在 `translations.py` 補上英文名稱或說明。
- 正式版的後台多了新的 API：在 `demo/api.js` 補上對應的假回應（沒補的讀取會顯示「找不到這筆資料」）。
- 正式版的 `legal/*.md` 改了：重翻 `demo-en/legal/` 對應的檔案，再照錯誤訊息更新 `translations.py` 的 `LEGAL_SOURCES`。

本機預覽：在 `mama-fufood-web` 執行 `python3 -m http.server 8003`，打開 http://localhost:8003/demo/ 與 http://localhost:8003/demo-en/ 。
