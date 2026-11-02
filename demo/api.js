// 示範版的 js/api.js:介面一樣(window.mffApi),但一個請求都不送出去。
//
// 首頁只會呼叫兩個後台 API:
// - POST /api/admin/login:用 Google 憑證換管理員 session。示範版一律回 403,
//   也就是「已登入,但不是管理員」,和一般訪客在正式版看到的一樣。Google 的憑證不送去任何地方。
// - GET /api/admin/me:只有手上有 session 才會呼叫;示範版永遠沒有 session,所以不會走到。
// 這支會被 demo/tools/build.py 原樣複製到 demo-en/,所以這裡不能有顯示給使用者看的中文。
(function () {
  function token() {
    return null;
  }
  function setToken() {}

  async function call(method, path) {
    await new Promise((r) => setTimeout(r, 300));
    if (method === "POST" && path === "/api/admin/login") throw { status: 403 };
    throw { status: 404, error: "Not available in the demo" };
  }

  window.mffApi = { call, token, setToken };
})();
