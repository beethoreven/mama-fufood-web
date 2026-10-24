// 首頁:可以用 Google 登入。一般使用者登入沒有作用;管理員登入後才出現後台入口
// (SPEC 第 13 節「網站」)。登入憑證會送到後端確認是不是管理員,用完即丟(隱私權政策第二條)。
(function () {
  const cfg = window.MFF_CONFIG;
  const api = window.mffApi;
  const $ = (id) => document.getElementById(id);

  if (cfg.playUrl) {
    $("play").innerHTML = "";
    const a = document.createElement("a");
    a.href = cfg.playUrl;
    a.className = "btn primary";
    a.textContent = "到 Google Play 下載";
    $("play").appendChild(a);
  }

  // 介紹與三份文件用頁籤切換,不換頁。網址帶 ?doc=privacy 這類參數時直接打開那一份,
  // 切換頁籤時也更新網址,方便複製連結。legal.html 仍保留給 App 與 Google 同意畫面的連結用。
  const DOCS = { terms: "使用者條款", privacy: "隱私權政策", judgement_guide: "判斷邏輯說明" };
  const loaded = {};
  async function showTab(doc) {
    if (!DOCS[doc]) doc = "";
    for (const b of $("tabs").querySelectorAll("button")) b.classList.toggle("active", b.dataset.doc === doc);
    $("intro").hidden = !!doc;
    $("doc").hidden = !doc;
    document.title = doc ? DOCS[doc] + " - 媽媽記副食品" : "媽媽記副食品";
    history.replaceState(null, "", doc ? "?doc=" + doc : location.pathname);
    if (!doc) return;
    if (!loaded[doc]) {
      $("doc").innerHTML = '<p class="muted">載入中…</p>';
      try {
        const r = await fetch("legal/" + doc + ".md", { cache: "no-cache" });
        if (!r.ok) throw new Error();
        loaded[doc] = window.renderMarkdown(await r.text());
      } catch (e) {
        $("doc").innerHTML = "<p>載入失敗，請重新整理。</p>";
        return;
      }
    }
    $("doc").innerHTML = loaded[doc];
  }
  $("tabs").onclick = (ev) => {
    const b = ev.target.closest("button");
    if (b) showTab(b.dataset.doc);
  };
  showTab(new URLSearchParams(location.search).get("doc") || "");

  async function showAdmin() {
    try {
      const me = await api.call("GET", "/api/admin/me", undefined, { timeoutMs: 20000 });
      $("account").textContent = me.email;
      $("admin-link").hidden = false;
      $("gsi").hidden = true;
    } catch (e) {
      $("admin-link").hidden = true;
    }
  }

  async function onCredential(resp) {
    $("login-note").textContent = "確認中…（後端可能正在喚醒，最多約一分鐘）";
    try {
      const data = await api.call("POST", "/api/admin/login", { credential: resp.credential });
      api.setToken(data.token);
      $("login-note").textContent = "";
      await showAdmin();
    } catch (e) {
      api.setToken(null);
      $("login-note").textContent = e.status === 403 ? "已登入。這個帳號不是管理員，網站上沒有其他功能。" : e.error;
    }
  }

  window.mffHomeGsiReady = function () {
    if (!cfg.googleClientId || !window.google) {
      $("login-note").textContent = "";
      return;
    }
    google.accounts.id.initialize({ client_id: cfg.googleClientId, callback: onCredential, auto_select: false });
    // 深色模式用深色的按鈕;用預設的 outline 會在深色頁面上變成一個白色的圓框。
    const dark = matchMedia("(prefers-color-scheme: dark)").matches;
    google.accounts.id.renderButton($("gsi"), { type: "icon", shape: "circle", theme: dark ? "filled_black" : "outline", size: "large" });
  };

  if (api.token()) showAdmin();
})();
