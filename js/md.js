// 很小的 Markdown 轉換器,只處理 texts/ 用到的語法:標題、段落、清單、粗體、連結、表格、引言、分隔線。
// 不用第三方函式庫;內容來自我們自己的 legal/*.md,仍然先跳脫 HTML。
(function () {
  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function inline(s) {
    let t = esc(s);
    // Email 也要點得下去(和 App 一樣):先換成 mailto: 連結,下面的網址規則不會碰到它。
    t = t.replace(/([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g, '<a href="mailto:$1">$1</a>');
    t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" rel="noopener" target="_blank">$1</a>');
    t = t.replace(/&lt;(https?:\/\/[^&\s]+)&gt;/g, '<a href="$1" rel="noopener" target="_blank">$1</a>');
    return t;
  }
  function render(md) {
    const lines = md.split(/\r?\n/);
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }
      let m;
      if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
        const level = Math.min(m[1].length + 1, 4);
        out.push(`<h${level}>${inline(m[2])}</h${level}>`);
        i++;
      } else if (/^---+$/.test(line.trim())) {
        out.push("<hr>");
        i++;
      } else if (line.startsWith(">")) {
        const buf = [];
        while (i < lines.length && lines[i].startsWith(">")) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
        out.push(`<blockquote>${render(buf.join("\n"))}</blockquote>`);
      } else if (line.trim().startsWith("|")) {
        const rows = [];
        while (i < lines.length && lines[i].trim().startsWith("|")) { rows.push(lines[i].trim()); i++; }
        const cells = (r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        const head = cells(rows[0]);
        const body = rows.slice(2).map(cells);
        out.push('<div class="scroll-x"><table><thead><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join("") +
          "</tr></thead><tbody>" + body.map((r) => "<tr>" + r.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>").join("") +
          "</tbody></table></div>");
      } else if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
        const ordered = /^\s*\d+\./.test(line);
        const items = [];
        while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ""));
          i++;
        }
        const tag = ordered ? "ol" : "ul";
        out.push(`<${tag}>` + items.map((x) => `<li>${inline(x)}</li>`).join("") + `</${tag}>`);
      } else {
        const buf = [];
        while (i < lines.length && lines[i].trim() && !/^(#|>|\||\s*([-*]|\d+\.)\s|---)/.test(lines[i])) { buf.push(lines[i]); i++; }
        out.push(`<p>${inline(buf.join(" "))}</p>`);
      }
    }
    return out.join("\n");
  }
  window.renderMarkdown = render;
})();
