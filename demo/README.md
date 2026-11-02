# 示範版（demo/ 與 demo-en/）

- 中文：https://beethoreven.github.io/mama-fufood-web/demo/
- 英文：https://beethoreven.github.io/mama-fufood-web/demo-en/

網站首頁的示範版。畫面和正式版的首頁一樣（直接載入正式版的 `../css/`、`../js/md.js`，中文版也直接用 `../js/home.js`），但**一個請求都不送到後端**：Google 登入後只會顯示「已登入，這個帳號不是管理員」，和一般訪客在正式版看到的一樣，Google 的憑證不送去任何地方。之後不需要了，把 `demo/`、`demo-en/` 兩個資料夾刪掉就好，正式版不受影響。

## 不能影響正式版

- **正式版的檔案一個都不改。** 示範版需要的轉接全部由 `demo/tools/build.py` 在示範版的資料夾裡產生。
- 示範版和正式版同一個網域，localStorage 是共用的。示範版的 `index.html` 最前面替這一頁所有的 key 加上前綴（`demo:`、`demo-en:`），讀不到正式版的管理員 session。
- 示範版的 `config.js` 後端網址是空的：萬一載入了真的 `api.js`，請求也只會打到 github.io 自己。

## 檔案

| 檔案 | 怎麼來的 |
|---|---|
| `demo/api.js` | 手寫：假的後端，登入一律回「不是管理員」 |
| `demo/tools/build.py` | 手寫：產生下面所有「產生」的檔案；`--check` 只檢查是不是最新的 |
| `demo/tools/translations.py` | 手寫：英文版的中英對照表與術語表 |
| `demo-en/legal/*.md` | 手寫：條款、政策、判斷邏輯說明的英文翻譯（開頭註明以中文版為準） |
| `demo/index.html`、`demo-en/index.html` | 產生：從正式版的 `index.html` 改路徑、換成示範版的 `config.js` 與 `api.js`；英文版另外換成英文、改用拉丁字型 |
| `demo/config.js`、`demo-en/config.js` | 產生：正式版的 `js/config.js`，後端網址清空 |
| `demo/legal/*.md` | 產生：正式版 `legal/` 的原樣複製 |
| `demo-en/home.js` | 產生：正式版的 `js/home.js` 換成英文 |
| `demo-en/api.js` | 產生：`demo/api.js` 的複製 |

## 改了正式版之後

改了 `index.html`、`js/home.js`、`js/config.js`、`legal/` 或 `demo/` 底下的檔案，提交之前：

```bash
python3 demo/tools/build.py
```

會報錯的情況：

- 對照表的中文原文在正式版找不到（正式版改了字）：更新 `demo/tools/translations.py`。
- 英文版產出的檔案（註解以外）還有中文字：在對照表補上那一句。
- 正式版的 `legal/*.md` 改了：重翻 `demo-en/legal/` 對應的檔案，再照錯誤訊息更新 `translations.py` 的 `LEGAL_SOURCES`。

本機預覽：在 `mama-fufood-web` 執行 `python3 -m http.server 8003`，打開 http://localhost:8003/demo/ 與 http://localhost:8003/demo-en/ 。
