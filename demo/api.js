// 示範版的 js/api.js:介面一樣(window.mamaFufoodApi),但一個請求都不送出去。
//
// - 登入:Google 憑證只在瀏覽器裡解開、讀出 Email 拿來顯示,不送去任何地方;不管誰登入都是管理員,
//   登入狀態存在這一頁自己的 localStorage(index.html 已替 key 加上前綴),重新整理後還在。
// - 讀取:用 data.js(公用資料、匯出格式)與 fixtures.js(意見回饋、管理員、App 版本設定)回答,
//   回應格式和後端 routes/admin.py 一樣。
// - 寫入(儲存、發布、新增、刪除):不改任何資料,跳出提示「示範版不會更新正式資料」。
// 這支會被 demo/tools/build.py 原樣複製到 demo-en/,顯示給使用者看的文字都放在 fixtures.js。
(function () {
  const KEY = "mff_admin_token";
  const EMAIL_KEY = "mff_demo_email";
  const catalog = window.MAMA_FUFOOD_DEMO_CATALOG || {};
  const fx = window.MAMA_FUFOOD_DEMO_FIXTURES || { text: {} };

  function read(k) {
    try { return localStorage.getItem(k); } catch (e) { return null; }
  }
  function write(k, v) {
    try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) { /* 私密瀏覽 */ }
  }
  function token() { return read(KEY); }
  function setToken(t) {
    write(KEY, t);
    if (!t) write(EMAIL_KEY, null);
  }

  // Google 給的 ID token 是 JWT:中間那段 base64url 是 JSON,裡面有 email。不驗簽,只拿來顯示。
  function emailFrom(credential) {
    try {
      const part = credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const bytes = Uint8Array.from(atob(part), (c) => c.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes)).email || fx.guestEmail;
    } catch (e) {
      return fx.guestEmail;
    }
  }

  function toast(text) {
    let box = document.getElementById("demo-toast");
    if (!box) {
      box = document.createElement("div");
      box.id = "demo-toast";
      box.setAttribute("role", "status");
      box.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:1000;" +
        "max-width:calc(100vw - 32px);padding:12px 18px;border-radius:12px;background:var(--text);color:var(--bg);" +
        "font-size:14px;box-shadow:0 6px 20px rgba(0,0,0,.25);transition:opacity .2s;";
      document.body.appendChild(box);
    }
    box.textContent = text;
    box.style.opacity = "1";
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { box.style.opacity = "0"; }, 3000);
  }

  // 寫入的動作:只跳提示。丟出的錯誤沒有文字,畫面上的「已儲存」之類的訊息不會出現。
  const silent = { status: 0, error: "", toString: () => "" };
  function readOnly() {
    toast(fx.text.readOnly);
    throw silent;
  }

  function overview() {
    const fl = catalog.food_list, un = catalog.units;
    const flag = (x) => ({ ...x, published: true });
    const release = (ds) => ({
      version: ds.version, published_at: catalog.publishedAt, published_by: fx.publisher,
      has_changes: false, history: [{ version: ds.version, published_at: catalog.publishedAt, published_by: fx.publisher }],
    });
    return {
      draft: { groups: fl.content.groups.map(flag), foods: fl.content.foods.map(flag), units: un.content.units.map(flag) },
      releases: { food_list: release(fl), units: release(un) },
      cache: { loaded: true, loaded_at: fx.cacheLoadedAt, datasets: { food_list: fl.version, units: un.version } },
      cache_consistent: true,
      feedback_table_mb: 0.02,
      feedback_table_limit_mb: 150,
      commit: "demo",
    };
  }

  function feedbackList(query) {
    const q = new URLSearchParams(query);
    const items = fx.feedback.filter((f) => ["kind", "status", "app_version", "device_model"].every((k) => !q.get(k) || f[k] === q.get(k)));
    const page = Math.max(parseInt(q.get("page") || "1", 10) || 1, 1);
    const perPage = 50;
    const uniq = (k) => [...new Set(fx.feedback.map((f) => f[k]))].sort();
    return {
      total: items.length, page, per_page: perPage,
      items: items.slice((page - 1) * perPage, page * perPage).map((f) => ({ ...f, description: f.description.slice(0, 120) })),
      app_versions: uniq("app_version").reverse(), device_models: uniq("device_model"),
    };
  }

  async function call(method, path, body) {
    await new Promise((r) => setTimeout(r, 150));
    const [route, query = ""] = path.split("?");
    if (method === "POST" && route === "/api/admin/login") {
      write(EMAIL_KEY, emailFrom(body && body.credential));
      return { token: "demo" };
    }
    if (method === "POST" && route === "/api/admin/logout") return { ok: true };
    if (!token()) throw { status: 401, error: "" };
    if (method === "GET") {
      if (route === "/api/admin/me") return { email: read(EMAIL_KEY) || fx.guestEmail };
      if (route === "/api/admin/overview") return overview();
      if (route === "/api/admin/app-config") return { ...fx.appConfig };
      if (route === "/api/admin/formats") return { formats: catalog.formats };
      if (route === "/api/admin/admins") return { admins: fx.admins };
      if (route === "/api/admin/feedback") return feedbackList(query);
      const m = route.match(/^\/api\/admin\/feedback\/(.+)$/);
      if (m) {
        const f = fx.feedback.find((x) => x.id === m[1]);
        if (f) return f;
      }
      throw { status: 404, error: fx.text.notFound };
    }
    // 重新載入快取不改資料,照常回應。
    if (method === "POST" && route === "/api/admin/cache/reload") return overview().cache;
    return readOnly();
  }

  window.mamaFufoodApi = { call, token, setToken };
})();
