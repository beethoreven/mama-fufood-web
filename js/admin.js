// 管理後台(SPEC 第 3 節「管理後台功能」)。
// ★ 前端的鎖是化妝品:每一支後台 API 在後端都要求管理員的 session(auth_utils/access.py)。
(function () {
  const api = window.mffApi;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  // 後台顯示的時間一律換成台北時間:2026-10-24 16:22 GMT+8。解析不了的原樣顯示。
  const TIME_PARTS = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  const fmtTime = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d)) return String(iso);
    const p = Object.fromEntries(TIME_PARTS.formatToParts(d).map((x) => [x.type, x.value]));
    return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute} GMT+8`;
  };
  let overview = null;
  let foodGroup = null;
  // 每次載入都拿一個序號;慢的舊回應回來時,序號已經不是最新的就丟掉,不蓋掉新的畫面
  // (快速連按篩選或連續編輯時,舊的回應可能比新的晚到)。
  const gen = { data: 0, feedback: 0, detail: 0 };
  let feedbackFilters = { kind: "", status: "", app_version: "", device_model: "", page: 1 };

  function message(text, kind) {
    $("msg").innerHTML = text ? `<div class="banner ${kind === "warn" ? "warn" : ""}">${esc(text)}</div>` : "";
    if (text) setTimeout(() => { if ($("msg").textContent.includes(text)) $("msg").innerHTML = ""; }, 6000);
  }

  async function run(fn, okText) {
    try {
      await fn();
      if (okText) message(okText);
    } catch (e) {
      message(e.error || String(e), "warn");
      if (e.status === 401) showLogin();
    }
  }

  // ── 登入 ────────────────────────────────────────────────
  // 登入只在首頁做(首頁登入後才出現後台入口)。這一頁沒有登入狀態時直接回首頁。
  function showLogin() {
    location.replace("index.html");
  }

  async function start() {
    if (!api.token()) return showLogin();
    try {
      const me = await api.call("GET", "/api/admin/me");
      $("who").textContent = me.email;
      $("status").hidden = true;
      $("app").hidden = false;
      $("logout").hidden = false;
      await loadData();
    } catch (e) {
      if (e.status === 401 || e.status === 403) return showLogin();
      // 連不上後端(例如正在喚醒)時登入狀態還在,留在這一頁讓人重新整理。
      $("status-msg").textContent = e.error;
      $("status").hidden = false;
    }
  }

  $("logout").onclick = () => run(async () => {
    try { await api.call("POST", "/api/admin/logout"); } finally { api.setToken(null); showLogin(); }
  });

  $("tabs").onclick = (ev) => {
    const tab = ev.target.dataset && ev.target.dataset.tab;
    if (!tab) return;
    for (const b of $("tabs").querySelectorAll("button")) b.classList.toggle("active", b.dataset.tab === tab);
    for (const t of ["data", "version", "feedback", "admins", "system"]) $("tab-" + t).hidden = t !== tab;
    ({ data: loadData, version: loadVersion, feedback: loadFeedback, admins: loadAdmins, system: loadSystem })[tab]();
  };

  // ── 公用資料 ────────────────────────────────────────────
  async function loadData() {
    const mine = ++gen.data;
    await run(async () => {
      const fresh = await api.call("GET", "/api/admin/overview");
      if (mine !== gen.data) return;
      overview = fresh;
      renderData();
    });
  }

  function releaseLine(name, label) {
    const r = overview.releases[name];
    const dirty = r.has_changes ? '<span class="pill warn">草稿有未發布的修改</span>' : '<span class="pill">和發布版本一樣</span>';
    return `<div class="row release-line"><strong>${label}</strong><span class="muted">目前發布：${esc(r.version || "沒有")}</span>${dirty}
      <span class="grow"></span>
      <button data-publish="${name}" class="primary" ${r.has_changes ? "" : "disabled"}>發布</button></div>`;
  }

  function renderData() {
    const d = overview.draft;
    const groups = d.groups;
    if (foodGroup === null && groups.length) foodGroup = groups[0].id;
    const cacheWarn = overview.cache_consistent ? "" :
      '<div class="banner warn">快取版本和資料庫版本不一致，請到「系統」按「重新載入快取」。</div>';
    const fbWarn = overview.feedback_table_mb >= overview.feedback_table_limit_mb ?
      `<div class="banner warn">意見回饋資料表已達 ${overview.feedback_table_mb} MB（上限 ${overview.feedback_table_limit_mb} MB），目前不收記錄檔。</div>` : "";
    const groupRows = groups.map((g) => `<tr>
        <td>${g.id}</td>
        <td><input data-g="${g.id}" data-f="name" value="${esc(g.name)}" class="cell-name"></td>
        <td><input data-g="${g.id}" data-f="emoji" value="${esc(g.emoji)}" class="field-emoji"></td>
        <td><input data-g="${g.id}" data-f="sort" value="${g.sort}" class="cell-sort" inputmode="numeric"></td>
        <td><label><input type="checkbox" data-g="${g.id}" data-f="disabled" ${g.disabled ? "checked" : ""}> 停用</label></td>
        <td>${g.published ? '<span class="muted">已發布</span>' : `<button data-del-group="${g.id}" class="danger">刪除</button>`}</td>
      </tr>`).join("");
    const foods = d.foods.filter((f) => f.group_id === foodGroup);
    const foodRows = foods.map((f) => `<tr>
        <td>${f.id}</td>
        <td><input data-food="${f.id}" data-f="name" value="${esc(f.name)}" class="cell-name"></td>
        <td><input data-food="${f.id}" data-f="emoji" value="${esc(f.emoji)}" class="field-emoji"></td>
        <td><input data-food="${f.id}" data-f="sort" value="${f.sort}" class="cell-sort" inputmode="numeric"></td>
        <td><select data-food="${f.id}" data-f="group_id">${groups.map((g) => `<option value="${g.id}" ${g.id === f.group_id ? "selected" : ""}>${esc(g.emoji + " " + g.name)}</option>`).join("")}</select></td>
        <td><label><input type="checkbox" data-food="${f.id}" data-f="disabled" ${f.disabled ? "checked" : ""}> 停用</label></td>
        <td>${f.published ? '<span class="muted">已發布</span>' : `<button data-del-food="${f.id}" class="danger">刪除</button>`}</td>
      </tr>`).join("");
    const unitRows = d.units.map((u) => `<tr>
        <td>${u.id}</td>
        <td><input data-unit="${u.id}" data-f="name" value="${esc(u.name)}" class="cell-name"></td>
        <td><input data-unit="${u.id}" data-f="sort" value="${u.sort}" class="cell-sort" inputmode="numeric"></td>
        <td><label><input type="radio" name="default-unit" data-unit="${u.id}" data-f="default" ${u.default ? "checked" : ""}> 預設</label></td>
        <td><label><input type="checkbox" data-unit="${u.id}" data-f="disabled" ${u.disabled ? "checked" : ""}> 停用</label></td>
        <td>${u.published ? '<span class="muted">已發布</span>' : `<button data-del-unit="${u.id}" class="danger">刪除</button>`}</td>
      </tr>`).join("");
    $("tab-data").innerHTML = `${cacheWarn}${fbWarn}
      <div class="card">
        <p class="muted">修改會先存成草稿，按「發布」才會產生新版本、讓 App 下載。ID 永遠不可改、不可刪、不可重用：發布過的項目只能停用。
        食材名稱 3 個字以內；圖示要剛好一個 emoji。</p>
        ${releaseLine("food_list", "副食品清單")}
        ${releaseLine("units", "單位")}
      </div>
      <div class="card"><h3 style="margin-top:0">分組</h3>
        <div class="scroll-x"><table><thead><tr><th>ID</th><th>名稱</th><th>圖示</th><th>排序</th><th></th><th></th></tr></thead><tbody>${groupRows}</tbody></table></div>
        <div class="row" style="margin-top:8px"><input id="new-group-name" class="field-name" placeholder="分組名稱"><input id="new-group-emoji" class="field-emoji" placeholder="🍚"><button id="add-group">新增分組</button></div>
      </div>
      <div class="card"><h3 style="margin-top:0">食材</h3>
        <div class="row"><span class="muted">分組：</span><select id="food-group">${groups.map((g) => `<option value="${g.id}" ${g.id === foodGroup ? "selected" : ""}>${esc(g.emoji + " " + g.name)}</option>`).join("")}</select></div>
        <div class="scroll-x"><table><thead><tr><th>ID</th><th>名稱</th><th>圖示</th><th>排序</th><th>分組</th><th></th><th></th></tr></thead><tbody>${foodRows}</tbody></table></div>
        <div class="row" style="margin-top:8px"><input id="new-food-name" class="field-name" placeholder="食材（3 字內）"><input id="new-food-emoji" class="field-emoji" placeholder="🍎"><button id="add-food">新增到這個分組</button></div>
      </div>
      <div class="card"><h3 style="margin-top:0">單位</h3>
        <div class="scroll-x"><table><thead><tr><th>ID</th><th>名稱</th><th>排序</th><th></th><th></th><th></th></tr></thead><tbody>${unitRows}</tbody></table></div>
        <div class="row" style="margin-top:8px"><input id="new-unit-name" class="field-name" placeholder="單位名稱"><button id="add-unit">新增單位</button></div>
      </div>`;
    bindData();
  }

  function fieldValue(el) {
    if (el.type === "checkbox" || el.type === "radio") return el.checked;
    if (el.dataset.f === "sort" || el.dataset.f === "group_id") return parseInt(el.value, 10);
    return el.value;
  }

  function bindData() {
    const box = $("tab-data");
    box.querySelectorAll("[data-g],[data-food],[data-unit]").forEach((el) => {
      el.onchange = () => {
        const kind = el.dataset.g ? "groups" : el.dataset.food ? "foods" : "units";
        const id = el.dataset.g || el.dataset.food || el.dataset.unit;
        run(async () => {
          await api.call("PATCH", `/api/admin/${kind}/${id}`, { [el.dataset.f]: fieldValue(el) });
          await loadData();
        }, "已存成草稿");
      };
    });
    box.querySelectorAll("[data-del-group],[data-del-food],[data-del-unit]").forEach((el) => {
      el.onclick = () => {
        const [kind, id] = el.dataset.delGroup ? ["groups", el.dataset.delGroup] : el.dataset.delFood ? ["foods", el.dataset.delFood] : ["units", el.dataset.delUnit];
        if (!confirm("確定刪除這個還沒發布過的草稿嗎？")) return;
        run(async () => { await api.call("DELETE", `/api/admin/${kind}/${id}`); await loadData(); }, "已刪除");
      };
    });
    box.querySelectorAll("[data-publish]").forEach((el) => {
      el.onclick = () => {
        if (!confirm("發布之後，App 下次檢查時就會下載這個版本。確定發布？")) return;
        run(async () => {
          const r = await api.call("POST", `/api/admin/publish/${el.dataset.publish}`);
          await loadData();
          message(`已發布版本 ${r.version}${r.cache_reloaded ? "" : "（快取還沒更新，請到「系統」重新載入）"}`);
        });
      };
    });
    $("food-group").onchange = (ev) => { foodGroup = parseInt(ev.target.value, 10); renderData(); };
    $("add-group").onclick = () => run(async () => {
      await api.call("POST", "/api/admin/groups", { name: $("new-group-name").value, emoji: $("new-group-emoji").value });
      await loadData();
    }, "已新增分組（草稿）");
    $("add-food").onclick = () => run(async () => {
      await api.call("POST", "/api/admin/foods", { group_id: foodGroup, name: $("new-food-name").value, emoji: $("new-food-emoji").value });
      await loadData();
    }, "已新增食材（草稿）");
    $("add-unit").onclick = () => run(async () => {
      await api.call("POST", "/api/admin/units", { name: $("new-unit-name").value });
      await loadData();
    }, "已新增單位（草稿）");
  }

  // ── App 版本 ────────────────────────────────────────────
  async function loadVersion() {
    await run(async () => {
      const c = await api.call("GET", "/api/admin/app-config");
      $("tab-version").innerHTML = `<div class="card">
        <p class="muted">強制更新只在重大問題、法律衝突或判斷規則修正時使用；只對有網路、而且有做每日檢查的手機生效。
        畫面上會顯示這裡寫的原因。</p>
        <p><label>最低可用 App 版本（x.y.z）<br><input id="cfg-min" value="${esc(c.min_app_version)}"></label></p>
        <p><label>強制更新的原因<br><textarea id="cfg-reason" maxlength="300">${esc(c.force_reason)}</textarea></label></p>
        <p><label>更新連結（https://，上架前可以留空）<br><input id="cfg-url" value="${esc(c.update_url)}" style="width:100%"></label></p>
        <p><label>「需要新版 App」的通知文字<br><input id="cfg-notice" value="${esc(c.dataset_notice)}" style="width:100%"></label></p>
        <p class="muted">最後修改：${esc(fmtTime(c.updated_at))} ${esc(c.updated_by)}</p>
        <button id="cfg-save" class="primary">儲存</button></div>`;
      $("cfg-save").onclick = () => {
        if (!confirm("儲存後立即生效。確定？")) return;
        run(async () => {
          await api.call("PUT", "/api/admin/app-config", {
            min_app_version: $("cfg-min").value.trim(), force_reason: $("cfg-reason").value,
            update_url: $("cfg-url").value.trim(), dataset_notice: $("cfg-notice").value,
          });
          await loadVersion();
        }, "已儲存");
      };
    });
  }

  // ── 意見回饋 ────────────────────────────────────────────
  const STATUS = { new: "新的", in_progress: "處理中", done: "已處理", wont_fix: "不處理" };
  const KIND = { suggestion: "提供建議", problem: "遇到問題" };

  async function loadFeedback() {
    const mine = ++gen.feedback;
    await run(async () => {
      const q = new URLSearchParams(Object.entries(feedbackFilters).filter(([, v]) => v)).toString();
      const data = await api.call("GET", "/api/admin/feedback?" + q);
      if (mine !== gen.feedback) return;
      const opt = (values, labels, current) => '<option value="">全部</option>' +
        values.map((v) => `<option value="${esc(v)}" ${v === current ? "selected" : ""}>${esc(labels ? labels[v] : v)}</option>`).join("");
      $("tab-feedback").innerHTML = `<div class="card">
          <div class="row">
            <select id="f-kind">${opt(Object.keys(KIND), KIND, feedbackFilters.kind)}</select>
            <select id="f-status">${opt(Object.keys(STATUS), STATUS, feedbackFilters.status)}</select>
            <select id="f-ver">${opt(data.app_versions, null, feedbackFilters.app_version)}</select>
            <select id="f-model">${opt(data.device_models, null, feedbackFilters.device_model)}</select>
            <span class="muted">共 ${data.total} 則（最長保留 90 天）</span>
          </div>
          <div class="scroll-x"><table><thead><tr><th>時間</th><th>類型</th><th>狀態</th><th>描述</th><th>版本</th><th>機型</th></tr></thead><tbody>
          ${data.items.map((i) => `<tr data-fb="${i.id}" style="cursor:pointer">
            <td>${esc(fmtTime(i.received_at))}</td><td>${esc(KIND[i.kind])}</td><td>${esc(STATUS[i.status])}</td>
            <td>${esc(i.description)}</td><td>${esc(i.app_version)}</td><td>${esc(i.device_model)}</td></tr>`).join("")}
          </tbody></table></div>
          <div class="row" style="margin-top:8px">
            <button id="f-prev" ${data.page <= 1 ? "disabled" : ""}>上一頁</button>
            <span class="muted">第 ${data.page} 頁</span>
            <button id="f-next" ${data.page * data.per_page >= data.total ? "disabled" : ""}>下一頁</button>
          </div>
        </div>
        <div id="fb-detail"></div>
        <div class="card"><h3 style="margin-top:0">個資刪除請求</h3>
          <p class="muted">刪掉某個 Email 的所有意見回饋（隱私權政策第七條）。</p>
          <div class="row"><input id="del-email" class="field-name" placeholder="email@example.com"><button id="del-email-btn" class="danger">全部刪除</button></div>
        </div>`;
      const set = (k) => (ev) => { feedbackFilters[k] = ev.target.value; feedbackFilters.page = 1; loadFeedback(); };
      $("f-kind").onchange = set("kind");
      $("f-status").onchange = set("status");
      $("f-ver").onchange = set("app_version");
      $("f-model").onchange = set("device_model");
      $("f-prev").onclick = () => { feedbackFilters.page -= 1; loadFeedback(); };
      $("f-next").onclick = () => { feedbackFilters.page += 1; loadFeedback(); };
      document.querySelectorAll("[data-fb]").forEach((tr) => { tr.onclick = () => showFeedback(tr.dataset.fb); });
      $("del-email-btn").onclick = () => {
        const email = $("del-email").value.trim();
        if (!email || !confirm(`確定刪除 ${email} 的所有意見回饋？無法復原。`)) return;
        run(async () => {
          const r = await api.call("POST", "/api/admin/feedback/delete-by-email", { email });
          message(`已刪除 ${r.deleted} 則`);
          await loadFeedback();
        });
      };
    });
  }

  function renderLogs(logs) {
    if (!logs) return '<p class="muted">沒有記錄檔（「提供建議」不附記錄檔）。</p>';
    const lines = (logs.logs || []).map((l) => {
      const { t, lv, c, ...rest } = l;
      return `${t} ${String(lv).toUpperCase().padEnd(5)} ${c} ${Object.keys(rest).length ? JSON.stringify(rest) : ""}`;
    });
    return `<h4>記錄檔（${lines.length} 行）</h4><pre class="log">${esc(lines.join("\n"))}</pre>
      ${logs.exit_reasons && logs.exit_reasons.length ? `<h4>上次結束原因</h4><pre class="log">${esc(JSON.stringify(logs.exit_reasons, null, 1))}</pre>` : ""}
      ${logs.native_crash ? `<h4>原生層當機</h4><pre class="log">${esc(logs.native_crash)}</pre>` : ""}
      ${logs.logcat ? `<h4>logcat 摘錄</h4><pre class="log">${esc(logs.logcat)}</pre>` : ""}
      ${logs.text ? `<pre class="log">${esc(logs.text)}</pre>` : ""}`;
  }

  async function showFeedback(id) {
    const mine = ++gen.detail;
    await run(async () => {
      const f = await api.call("GET", "/api/admin/feedback/" + id);
      if (mine !== gen.detail) return;
      $("fb-detail").innerHTML = `<div class="card">
        <div class="row"><strong>${esc(KIND[f.kind])}</strong><span class="muted">${esc(f.id)}</span><span class="grow"></span>
          <button id="fb-close">關閉</button></div>
        <p>${esc(f.description).replace(/\n/g, "<br>")}</p>
        <p class="muted">Email：${esc(f.email)}|收到：${esc(fmtTime(f.received_at))}|手機時間：${esc(fmtTime(f.device_time))}<br>
        App ${esc(f.app_version)}(${esc(f.build_number)})|${esc(f.device_model)}|${esc(f.os_version)}|安裝 ID ${esc(f.install_id)}</p>
        <div class="row">
          <select id="fb-status">${Object.keys(STATUS).map((s) => `<option value="${s}" ${s === f.status ? "selected" : ""}>${STATUS[s]}</option>`).join("")}</select>
          <input id="fb-note" class="grow" value="${esc(f.admin_note)}" placeholder="處理備註">
          <button id="fb-save" class="primary">儲存</button>
          <button id="fb-delete" class="danger">刪除</button>
        </div>
        <h4>快照</h4><pre class="log">${esc(JSON.stringify(f.snapshot, null, 1))}</pre>
        ${renderLogs(f.logs)}
      </div>`;
      $("fb-close").onclick = () => { $("fb-detail").innerHTML = ""; };
      $("fb-save").onclick = () => run(async () => {
        await api.call("PATCH", "/api/admin/feedback/" + id, { status: $("fb-status").value, admin_note: $("fb-note").value });
        await loadFeedback();
      }, "已儲存");
      $("fb-delete").onclick = () => {
        if (!confirm("確定刪除這則意見回饋？")) return;
        run(async () => { await api.call("DELETE", "/api/admin/feedback/" + id); await loadFeedback(); }, "已刪除");
      };
      $("fb-detail").scrollIntoView({ behavior: "smooth" });
    });
  }

  // ── 管理員 ──────────────────────────────────────────────
  async function loadAdmins() {
    await run(async () => {
      const data = await api.call("GET", "/api/admin/admins");
      $("tab-admins").innerHTML = `<div class="card">
        <table><thead><tr><th>Email</th><th>備註</th><th></th></tr></thead><tbody>
        ${data.admins.map((a) => `<tr><td>${esc(a.email)}</td><td>${esc(a.note)}</td>
          <td>${a.fixed ? '<span class="muted">環境變數設定</span>' : `<button data-rm="${esc(a.email)}" class="danger">移除</button>`}</td></tr>`).join("")}
        </tbody></table>
        <div class="row" style="margin-top:8px"><input id="adm-email" class="field-name" placeholder="Email"><input id="adm-note" class="field-name" placeholder="備註"><button id="adm-add" class="primary">新增管理員</button></div>
      </div>`;
      $("adm-add").onclick = () => run(async () => {
        await api.call("POST", "/api/admin/admins", { email: $("adm-email").value.trim(), note: $("adm-note").value.trim() });
        await loadAdmins();
      }, "已新增");
      document.querySelectorAll("[data-rm]").forEach((b) => {
        b.onclick = () => {
          if (!confirm(`確定移除 ${b.dataset.rm}？`)) return;
          run(async () => { await api.call("DELETE", "/api/admin/admins/" + encodeURIComponent(b.dataset.rm)); await loadAdmins(); }, "已移除");
        };
      });
    });
  }

  // ── 系統 ────────────────────────────────────────────────
  async function loadSystem() {
    await run(async () => {
      const o = await api.call("GET", "/api/admin/overview");
      const f = await api.call("GET", "/api/admin/formats");
      const cache = o.cache.loaded ? Object.entries(o.cache.datasets).map(([k, v]) => `${k}=${v}`).join("、") : "還沒載入";
      const db = Object.entries(o.releases).map(([k, v]) => `${k}=${v.version}`).join("、");
      $("tab-system").innerHTML = `<div class="card">
        <p>快取版本：${esc(cache)}<br>資料庫版本：${esc(db)}<br>
        ${o.cache_consistent ? '<span class="ok">一致</span>' : '<span class="warn">不一致</span>'}
        <span class="muted">（快取載入時間 ${esc(fmtTime(o.cache.loaded_at))}）</span></p>
        <button id="reload-cache">重新載入快取</button>
        <p class="muted">萬一曾用 SQL 直接改了資料，按這個鈕或重啟後端即可。後端版本：${esc(o.commit || "本機")}</p>
      </div>
      <div class="card"><h3 style="margin-top:0">匯出格式定義（跟著後端程式發布，只能看）</h3>
        ${f.formats.map((x) => `<details><summary>第 ${x.format_version} 版（${esc(x.status)}，最低 App ${esc(x.min_app_version)}）</summary>
          <pre class="log">${esc(JSON.stringify(x.definition, null, 1))}</pre></details>`).join("")}
      </div>`;
      $("reload-cache").onclick = () => run(async () => { await api.call("POST", "/api/admin/cache/reload"); await loadSystem(); }, "已重新載入");
    });
  }

  start();
})();
