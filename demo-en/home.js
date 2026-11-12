// 由 demo/tools/build.py 從 js/home.js 產生,不要手改。
// 首頁:可以用 Google 登入。一般使用者登入沒有作用;管理員登入後才出現後台入口。
// 登入憑證會送到後端確認是不是管理員,用完即丟(隱私權政策第二條)。
(function () {
  const cfg = window.MFF_CONFIG;
  const api = window.mffApi;
  const $ = (id) => document.getElementById(id);

  if (cfg.playUrl) {
    $("play").innerHTML = "";
    const a = document.createElement("a");
    a.href = cfg.playUrl;
    a.className = "btn primary";
    a.textContent = "Get it on Google Play";
    $("play").appendChild(a);
  }

  if (cfg.apkVersion) {
    const v = cfg.apkVersion;
    const a = $("apk-link");
    a.href = `https://github.com/beethoreven/mama-fufood-app/releases/download/v${v}/mama-fufood-${v}.apk`;
    $("apk-version").textContent = `Version ${v}`;
    $("apk").hidden = false;
  }

  // 介紹與三份文件用頁籤切換,不換頁。網址帶 ?doc=privacy 這類參數時直接打開那一份,
  // 切換頁籤時也更新網址,方便複製連結。legal.html 仍保留給 App 與 Google 同意畫面的連結用。
  const DOCS = { terms: "Terms of Use", privacy: "Privacy Policy", judgement_guide: "How Results Are Determined" };
  const loaded = {};
  async function showTab(doc) {
    if (!DOCS[doc]) doc = "";
    for (const b of $("tabs").querySelectorAll("button")) b.classList.toggle("active", b.dataset.doc === doc);
    $("intro").hidden = !!doc;
    $("doc").hidden = !doc;
    document.title = doc ? DOCS[doc] + " - mama-fufood" : "mama-fufood";
    history.replaceState(null, "", doc ? "?doc=" + doc : location.pathname);
    if (!doc) return;
    if (!loaded[doc]) {
      $("doc").innerHTML = '<p class="muted">Loading…</p>';
      try {
        const r = await fetch("legal/" + doc + ".md", { cache: "no-cache" });
        if (!r.ok) throw new Error();
        loaded[doc] = window.renderMarkdown(await r.text());
      } catch (e) {
        $("doc").innerHTML = "<p>Couldn't load this page. Please refresh.</p>";
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
    $("login-note").textContent = "Checking… (the server may be waking up; this can take up to a minute)";
    try {
      const data = await api.call("POST", "/api/admin/login", { credential: resp.credential });
      api.setToken(data.token);
      $("login-note").textContent = "";
      await showAdmin();
    } catch (e) {
      api.setToken(null);
      $("login-note").textContent = e.status === 403 ? "Signed in. This account isn't an administrator, so there's nothing more to do on this site." : e.error;
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
    google.accounts.id.renderButton($("gsi"), { locale: "en", type: "icon", shape: "circle", theme: dark ? "filled_black" : "outline", size: "large" });
  };

  if (api.token()) showAdmin();
})();
