// 由 demo/tools/build.py 從 js/admin.js 產生,不要手改。
// 管理後台。
// ★ 前端的鎖是化妝品:每一支後台 API 在後端都要求管理員的 session。
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
    const dirty = r.has_changes ? '<span class="pill warn">Draft has unpublished changes</span>' : '<span class="pill">Same as published</span>';
    return `<div class="row release-line"><strong>${label}</strong><span class="muted">Published: ${esc(r.version || "none")}</span>${dirty}
      <span class="grow"></span>
      <button data-publish="${name}" class="primary" ${r.has_changes ? "" : "disabled"}>Publish</button></div>`;
  }

  function renderData() {
    const d = overview.draft;
    const groups = d.groups;
    if (foodGroup === null && groups.length) foodGroup = groups[0].id;
    const cacheWarn = overview.cache_consistent ? "" :
      '<div class="banner warn">The cache version does not match the database version. Go to System and click Reload cache.</div>';
    const fbWarn = overview.feedback_table_mb >= overview.feedback_table_limit_mb ?
      `<div class="banner warn">The feedback table has reached ${overview.feedback_table_mb} MB (limit ${overview.feedback_table_limit_mb} MB); log files are not accepted for now.</div>` : "";
    const groupRows = groups.map((g) => `<tr>
        <td>${g.id}</td>
        <td><input data-g="${g.id}" data-f="name" value="${esc(g.name)}" class="cell-name"></td>
        <td><input data-g="${g.id}" data-f="emoji" value="${esc(g.emoji)}" class="field-emoji"></td>
        <td><input data-g="${g.id}" data-f="sort" value="${g.sort}" class="cell-sort" inputmode="numeric"></td>
        <td><label><input type="checkbox" data-g="${g.id}" data-f="disabled" ${g.disabled ? "checked" : ""}> Disabled</label></td>
        <td>${g.published ? '<span class="muted">Published</span>' : `<button data-del-group="${g.id}" class="danger">Delete</button>`}</td>
      </tr>`).join("");
    const foods = d.foods.filter((f) => f.group_id === foodGroup);
    const foodRows = foods.map((f) => `<tr>
        <td>${f.id}</td>
        <td><input data-food="${f.id}" data-f="name" value="${esc(f.name)}" class="cell-name"></td>
        <td><input data-food="${f.id}" data-f="emoji" value="${esc(f.emoji)}" class="field-emoji"></td>
        <td><input data-food="${f.id}" data-f="sort" value="${f.sort}" class="cell-sort" inputmode="numeric"></td>
        <td><select data-food="${f.id}" data-f="group_id">${groups.map((g) => `<option value="${g.id}" ${g.id === f.group_id ? "selected" : ""}>${esc(g.emoji + " " + g.name)}</option>`).join("")}</select></td>
        <td><label><input type="checkbox" data-food="${f.id}" data-f="disabled" ${f.disabled ? "checked" : ""}> Disabled</label></td>
        <td>${f.published ? '<span class="muted">Published</span>' : `<button data-del-food="${f.id}" class="danger">Delete</button>`}</td>
      </tr>`).join("");
    const unitRows = d.units.map((u) => `<tr>
        <td>${u.id}</td>
        <td><input data-unit="${u.id}" data-f="name" value="${esc(u.name)}" class="cell-name"></td>
        <td><input data-unit="${u.id}" data-f="sort" value="${u.sort}" class="cell-sort" inputmode="numeric"></td>
        <td><label><input type="radio" name="default-unit" data-unit="${u.id}" data-f="default" ${u.default ? "checked" : ""}> Default</label></td>
        <td><label><input type="checkbox" data-unit="${u.id}" data-f="disabled" ${u.disabled ? "checked" : ""}> Disabled</label></td>
        <td>${u.published ? '<span class="muted">Published</span>' : `<button data-del-unit="${u.id}" class="danger">Delete</button>`}</td>
      </tr>`).join("");
    $("tab-data").innerHTML = `${cacheWarn}${fbWarn}
      <div class="card">
        <p class="muted">Changes are saved as a draft first; a new version for the App to download is created only when you click Publish. IDs can never be changed, deleted or reused: published items can only be disabled.
        Food names are at most 3 Chinese characters; the icon must be exactly one emoji.</p>
        ${releaseLine("food_list", "Food list")}
        ${releaseLine("units", "Units")}
      </div>
      <div class="card"><h3 style="margin-top:0">Groups</h3>
        <div class="scroll-x"><table><thead><tr><th>ID</th><th>Name</th><th>Icon</th><th>Order</th><th></th><th></th></tr></thead><tbody>${groupRows}</tbody></table></div>
        <div class="row" style="margin-top:8px"><input id="new-group-name" class="field-name" placeholder="Group name"><input id="new-group-emoji" class="field-emoji" placeholder="🍚"><button id="add-group">Add group</button></div>
      </div>
      <div class="card"><h3 style="margin-top:0">Foods</h3>
        <div class="row"><span class="muted">Group:</span><select id="food-group">${groups.map((g) => `<option value="${g.id}" ${g.id === foodGroup ? "selected" : ""}>${esc(g.emoji + " " + g.name)}</option>`).join("")}</select></div>
        <div class="scroll-x"><table><thead><tr><th>ID</th><th>Name</th><th>Icon</th><th>Order</th><th>Group</th><th></th><th></th></tr></thead><tbody>${foodRows}</tbody></table></div>
        <div class="row" style="margin-top:8px"><input id="new-food-name" class="field-name" placeholder="Food name"><input id="new-food-emoji" class="field-emoji" placeholder="🍎"><button id="add-food">Add to this group</button></div>
      </div>
      <div class="card"><h3 style="margin-top:0">Units</h3>
        <div class="scroll-x"><table><thead><tr><th>ID</th><th>Name</th><th>Order</th><th></th><th></th><th></th></tr></thead><tbody>${unitRows}</tbody></table></div>
        <div class="row" style="margin-top:8px"><input id="new-unit-name" class="field-name" placeholder="Unit name"><button id="add-unit">Add unit</button></div>
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
        }, "Saved as draft");
      };
    });
    box.querySelectorAll("[data-del-group],[data-del-food],[data-del-unit]").forEach((el) => {
      el.onclick = () => {
        const [kind, id] = el.dataset.delGroup ? ["groups", el.dataset.delGroup] : el.dataset.delFood ? ["foods", el.dataset.delFood] : ["units", el.dataset.delUnit];
        if (!confirm("Delete this draft item that has never been published?")) return;
        run(async () => { await api.call("DELETE", `/api/admin/${kind}/${id}`); await loadData(); }, "Deleted");
      };
    });
    box.querySelectorAll("[data-publish]").forEach((el) => {
      el.onclick = () => {
        if (!confirm("Once published, the App downloads this version on its next check. Publish?")) return;
        run(async () => {
          const r = await api.call("POST", `/api/admin/publish/${el.dataset.publish}`);
          await loadData();
          message(`Published version ${r.version}${r.cache_reloaded ? "" : " (the cache has not updated yet; reload it on the System tab)"}`);
        });
      };
    });
    $("food-group").onchange = (ev) => { foodGroup = parseInt(ev.target.value, 10); renderData(); };
    $("add-group").onclick = () => run(async () => {
      await api.call("POST", "/api/admin/groups", { name: $("new-group-name").value, emoji: $("new-group-emoji").value });
      await loadData();
    }, "Group added (draft)");
    $("add-food").onclick = () => run(async () => {
      await api.call("POST", "/api/admin/foods", { group_id: foodGroup, name: $("new-food-name").value, emoji: $("new-food-emoji").value });
      await loadData();
    }, "Food added (draft)");
    $("add-unit").onclick = () => run(async () => {
      await api.call("POST", "/api/admin/units", { name: $("new-unit-name").value });
      await loadData();
    }, "Unit added (draft)");
  }

  // ── App 版本 ────────────────────────────────────────────
  async function loadVersion() {
    await run(async () => {
      const c = await api.call("GET", "/api/admin/app-config");
      $("tab-version").innerHTML = `<div class="card">
        <p class="muted">Use required updates only for serious problems, legal conflicts or judgement-rule fixes. They only take effect on phones that are online and run the daily check.
        The reason written here is shown on the update screen.</p>
        <p><label>Minimum App version (x.y.z)<br><input id="cfg-min" value="${esc(c.min_app_version)}"></label></p>
        <p><label>Reason for the required update<br><textarea id="cfg-reason" maxlength="300">${esc(c.force_reason)}</textarea></label></p>
        <p><label>Update link (https://; can be left empty before release)<br><input id="cfg-url" value="${esc(c.update_url)}" style="width:100%"></label></p>
        <p><label>"New App version needed" notice<br><input id="cfg-notice" value="${esc(c.dataset_notice)}" style="width:100%"></label></p>
        <p class="muted">Last changed: ${esc(fmtTime(c.updated_at))} ${esc(c.updated_by)}</p>
        <button id="cfg-save" class="primary">Save</button></div>`;
      $("cfg-save").onclick = () => {
        if (!confirm("Changes take effect immediately. Save?")) return;
        run(async () => {
          await api.call("PUT", "/api/admin/app-config", {
            min_app_version: $("cfg-min").value.trim(), force_reason: $("cfg-reason").value,
            update_url: $("cfg-url").value.trim(), dataset_notice: $("cfg-notice").value,
          });
          await loadVersion();
        }, "Saved");
      };
    });
  }

  // ── 意見回饋 ────────────────────────────────────────────
  const STATUS = { new: "New", in_progress: "In progress", done: "Done", wont_fix: "Won't fix" };
  const KIND = { suggestion: "Suggestion", problem: "Problem" };

  async function loadFeedback() {
    const mine = ++gen.feedback;
    await run(async () => {
      const q = new URLSearchParams(Object.entries(feedbackFilters).filter(([, v]) => v)).toString();
      const data = await api.call("GET", "/api/admin/feedback?" + q);
      if (mine !== gen.feedback) return;
      const opt = (values, labels, current) => '<option value="">All</option>' +
        values.map((v) => `<option value="${esc(v)}" ${v === current ? "selected" : ""}>${esc(labels ? labels[v] : v)}</option>`).join("");
      $("tab-feedback").innerHTML = `<div class="card">
          <div class="row">
            <select id="f-kind">${opt(Object.keys(KIND), KIND, feedbackFilters.kind)}</select>
            <select id="f-status">${opt(Object.keys(STATUS), STATUS, feedbackFilters.status)}</select>
            <select id="f-ver">${opt(data.app_versions, null, feedbackFilters.app_version)}</select>
            <select id="f-model">${opt(data.device_models, null, feedbackFilters.device_model)}</select>
            <span class="muted">${data.total} total (kept up to 90 days)</span>
          </div>
          <div class="scroll-x"><table><thead><tr><th>Time</th><th>Type</th><th>Status</th><th>Description</th><th>Version</th><th>Model</th></tr></thead><tbody>
          ${data.items.map((i) => `<tr data-fb="${i.id}" style="cursor:pointer">
            <td>${esc(fmtTime(i.received_at))}</td><td>${esc(KIND[i.kind])}</td><td>${esc(STATUS[i.status])}</td>
            <td>${esc(i.description)}</td><td>${esc(i.app_version)}</td><td>${esc(i.device_model)}</td></tr>`).join("")}
          </tbody></table></div>
          <div class="row" style="margin-top:8px">
            <button id="f-prev" ${data.page <= 1 ? "disabled" : ""}>Previous</button>
            <span class="muted">Page ${data.page}</span>
            <button id="f-next" ${data.page * data.per_page >= data.total ? "disabled" : ""}>Next</button>
          </div>
        </div>
        <div id="fb-detail"></div>
        <div class="card"><h3 style="margin-top:0">Personal data deletion request</h3>
          <p class="muted">Delete all feedback from one email address (Privacy Policy, Section 7).</p>
          <div class="row"><input id="del-email" class="field-name" placeholder="email@example.com"><button id="del-email-btn" class="danger">Delete all</button></div>
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
        if (!email || !confirm(`Delete all feedback from ${email}? This cannot be undone.`)) return;
        run(async () => {
          const r = await api.call("POST", "/api/admin/feedback/delete-by-email", { email });
          message(`Deleted ${r.deleted}`);
          await loadFeedback();
        });
      };
    });
  }

  function renderLogs(logs) {
    if (!logs) return '<p class="muted">No log files (suggestions do not include logs).</p>';
    const lines = (logs.logs || []).map((l) => {
      const { t, lv, c, ...rest } = l;
      return `${t} ${String(lv).toUpperCase().padEnd(5)} ${c} ${Object.keys(rest).length ? JSON.stringify(rest) : ""}`;
    });
    return `<h4>Logs (${lines.length} lines)</h4><pre class="log">${esc(lines.join("\n"))}</pre>
      ${logs.exit_reasons && logs.exit_reasons.length ? `<h4>Last exit reasons</h4><pre class="log">${esc(JSON.stringify(logs.exit_reasons, null, 1))}</pre>` : ""}
      ${logs.native_crash ? `<h4>Native crash</h4><pre class="log">${esc(logs.native_crash)}</pre>` : ""}
      ${logs.logcat ? `<h4>logcat excerpt</h4><pre class="log">${esc(logs.logcat)}</pre>` : ""}
      ${logs.text ? `<pre class="log">${esc(logs.text)}</pre>` : ""}`;
  }

  async function showFeedback(id) {
    const mine = ++gen.detail;
    await run(async () => {
      const f = await api.call("GET", "/api/admin/feedback/" + id);
      if (mine !== gen.detail) return;
      $("fb-detail").innerHTML = `<div class="card">
        <div class="row"><strong>${esc(KIND[f.kind])}</strong><span class="muted">${esc(f.id)}</span><span class="grow"></span>
          <button id="fb-close">Close</button></div>
        <p>${esc(f.description).replace(/\n/g, "<br>")}</p>
        <p class="muted">Email: ${esc(f.email)} | Received: ${esc(fmtTime(f.received_at))} | Phone time: ${esc(fmtTime(f.device_time))}<br>
        App ${esc(f.app_version)}(${esc(f.build_number)})|${esc(f.device_model)}|${esc(f.os_version)} | Install ID ${esc(f.install_id)}</p>
        <div class="row">
          <select id="fb-status">${Object.keys(STATUS).map((s) => `<option value="${s}" ${s === f.status ? "selected" : ""}>${STATUS[s]}</option>`).join("")}</select>
          <input id="fb-note" class="grow" value="${esc(f.admin_note)}" placeholder="Admin note">
          <button id="fb-save" class="primary">Save</button>
          <button id="fb-delete" class="danger">Delete</button>
        </div>
        <h4>Snapshot</h4><pre class="log">${esc(JSON.stringify(f.snapshot, null, 1))}</pre>
        ${renderLogs(f.logs)}
      </div>`;
      $("fb-close").onclick = () => { $("fb-detail").innerHTML = ""; };
      $("fb-save").onclick = () => run(async () => {
        await api.call("PATCH", "/api/admin/feedback/" + id, { status: $("fb-status").value, admin_note: $("fb-note").value });
        await loadFeedback();
      }, "Saved");
      $("fb-delete").onclick = () => {
        if (!confirm("Delete this feedback?")) return;
        run(async () => { await api.call("DELETE", "/api/admin/feedback/" + id); await loadFeedback(); }, "Deleted");
      };
      $("fb-detail").scrollIntoView({ behavior: "smooth" });
    });
  }

  // ── 管理員 ──────────────────────────────────────────────
  async function loadAdmins() {
    await run(async () => {
      const data = await api.call("GET", "/api/admin/admins");
      $("tab-admins").innerHTML = `<div class="card">
        <table><thead><tr><th>Email</th><th>Note</th><th></th></tr></thead><tbody>
        ${data.admins.map((a) => `<tr><td>${esc(a.email)}</td><td>${esc(a.note)}</td>
          <td>${a.fixed ? '<span class="muted">Set by environment variable</span>' : `<button data-rm="${esc(a.email)}" class="danger">Remove</button>`}</td></tr>`).join("")}
        </tbody></table>
        <div class="row" style="margin-top:8px"><input id="adm-email" class="field-name" placeholder="Email"><input id="adm-note" class="field-name" placeholder="Note"><button id="adm-add" class="primary">Add admin</button></div>
      </div>`;
      $("adm-add").onclick = () => run(async () => {
        await api.call("POST", "/api/admin/admins", { email: $("adm-email").value.trim(), note: $("adm-note").value.trim() });
        await loadAdmins();
      }, "Added");
      document.querySelectorAll("[data-rm]").forEach((b) => {
        b.onclick = () => {
          if (!confirm(`Remove ${b.dataset.rm}?`)) return;
          run(async () => { await api.call("DELETE", "/api/admin/admins/" + encodeURIComponent(b.dataset.rm)); await loadAdmins(); }, "Removed");
        };
      });
    });
  }

  // ── 系統 ────────────────────────────────────────────────
  async function loadSystem() {
    await run(async () => {
      const o = await api.call("GET", "/api/admin/overview");
      const f = await api.call("GET", "/api/admin/formats");
      const cache = o.cache.loaded ? Object.entries(o.cache.datasets).map(([k, v]) => `${k}=${v}`).join(", ") : "not loaded yet";
      const db = Object.entries(o.releases).map(([k, v]) => `${k}=${v.version}`).join(", ");
      $("tab-system").innerHTML = `<div class="card">
        <p>Cache versions: ${esc(cache)}<br>Database versions: ${esc(db)}<br>
        ${o.cache_consistent ? '<span class="ok">Consistent</span>' : '<span class="warn">Inconsistent</span>'}
        <span class="muted">(cache loaded at ${esc(fmtTime(o.cache.loaded_at))})</span></p>
        <button id="reload-cache">Reload cache</button>
        <p class="muted">If the data was ever changed directly with SQL, click this button or restart the backend. Backend version: ${esc(o.commit || "local")}</p>
      </div>
      <div class="card"><h3 style="margin-top:0">Export format definitions (released with the backend code; read-only)</h3>
        ${f.formats.map((x) => `<details><summary>Version ${x.format_version} (${esc(x.status)}, minimum App ${esc(x.min_app_version)})</summary>
          <pre class="log">${esc(JSON.stringify(x.definition, null, 1))}</pre></details>`).join("")}
      </div>`;
      $("reload-cache").onclick = () => run(async () => { await api.call("POST", "/api/admin/cache/reload"); await loadSystem(); }, "Reloaded");
    });
  }

  start();
})();
