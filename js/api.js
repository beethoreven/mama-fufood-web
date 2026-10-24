// 呼叫後端。管理後台用我們自己簽發的 session(登入時用 Google 憑證換來的),存在這個瀏覽器的
// localStorage;不用 Google ID token 當長期憑證(它一小時就過期)。
(function () {
  const KEY = "mff_admin_token";
  const cfg = window.MFF_CONFIG;

  function token() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setToken(t) {
    try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch (e) { /* 私密瀏覽 */ }
  }

  // Render 免費方案閒置 15 分鐘會休眠,喚醒約一分鐘:第一次請求給長一點的時間。
  async function call(method, path, body, { timeoutMs = 75000, raw = false } = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const headers = {};
    const t = token();
    if (t) headers["Authorization"] = "Bearer " + t;
    if (body !== undefined) headers["Content-Type"] = "application/json";
    let resp;
    try {
      resp = await fetch(cfg.apiBase + path, {
        method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: ctrl.signal,
      });
    } catch (e) {
      throw { status: 0, error: "連不上後端（可能正在喚醒，請等一下再試）" };
    } finally {
      clearTimeout(timer);
    }
    if (raw && resp.ok) return resp;
    let data = {};
    try { data = await resp.json(); } catch (e) { /* 不是 JSON */ }
    if (!resp.ok) {
      if (resp.status === 401) setToken(null);
      throw { status: resp.status, code: data.code, error: data.error || `後端回應錯誤（${resp.status}）` };
    }
    return data;
  }

  window.mffApi = { call, token, setToken };
})();
