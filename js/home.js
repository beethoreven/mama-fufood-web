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
    $("login-note").textContent = "確認中…(後端可能正在喚醒,最多約一分鐘)";
    try {
      const data = await api.call("POST", "/api/admin/login", { credential: resp.credential });
      api.setToken(data.token);
      $("login-note").textContent = "";
      await showAdmin();
    } catch (e) {
      api.setToken(null);
      $("login-note").textContent = e.status === 403 ? "已登入。這個帳號不是管理員,網站上沒有其他功能。" : e.error;
    }
  }

  window.mffHomeGsiReady = function () {
    if (!cfg.googleClientId || !window.google) {
      $("login-note").textContent = "";
      return;
    }
    google.accounts.id.initialize({ client_id: cfg.googleClientId, callback: onCredential, auto_select: false });
    google.accounts.id.renderButton($("gsi"), { type: "icon", shape: "circle", theme: "outline", size: "large" });
  };

  if (api.token()) showAdmin();
})();
