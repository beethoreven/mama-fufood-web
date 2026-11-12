"""從正式版產生示範版:demo/(中文)與 demo-en/(英文)。

    python3 demo/tools/build.py           # 產生(覆寫)所有產生的檔案
    python3 demo/tools/build.py --check   # 只檢查產生的檔案是不是最新的,不寫檔

正式版的檔案一個都不改;示範版需要的轉接全部在這裡做:
- index.html:從正式版的 index.html 改路徑,把 js/config.js、js/api.js 換成示範版自己的,
  最前面加一段替 localStorage 的 key 加前綴的 script(跟正式版同一個網域,不能互相讀到)。
- config.js:從正式版的 js/config.js 複製,後端網址清空(萬一載入了真的 api.js,請求也只會打到 github.io)。
- 首頁多一個「不用 Google 帳號直接進入」的按鈕;登入後的「管理後台」連到示範版自己的 admin.html。
- admin.html:從正式版的 admin.html 改路徑,同樣換成示範版的 config.js 與 api.js(假後台)。
- data.js:App 內建的公用資料(食材清單、單位)與後端的匯出格式定義,給假後台當「目前的資料」。
- 中文版的條款、政策、判斷邏輯說明:原樣複製正式版的 legal/*.md(首頁用相對路徑讀)。
- 英文版:照 translations.py 的對照表把 index.html、admin.html、js/home.js、js/admin.js 與公用資料換成英文;
  api.js 從 demo/ 複製;fixtures.js(假的意見回饋等)是手寫的;
  條款、政策、判斷邏輯說明是手寫的翻譯(demo-en/legal/),中文原文改了就報錯。
- 英文版產出的檔案(註解以外)不能留有中文字,只有營運者名稱例外。

只用標準函式庫,用系統的 python3 就能跑。
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import translations  # noqa: E402

WEB = Path(__file__).resolve().parents[2]
CODEBASE = WEB.parent
DATASETS = CODEBASE / "mama-fufood-app" / "assets" / "datasets"
FORMATS = CODEBASE / "router-backend" / "apps" / "mama_fufood" / "export_formats"
DEMO = WEB / "demo"
DEMO_EN = WEB / "demo-en"
DOCS = ["terms", "privacy", "judgement_guide"]

CJK = re.compile(r"[　-〿㐀-鿿＀-￯]")
CJK_ALLOWED = ["阿舍老師"]

def html_mark(source: str) -> str:
    return f"<!-- 由 demo/tools/build.py 從正式版的 {source} 產生，不要手改。 -->\n"


GUEST = (
    "  <script>\n"
    "    // 示範版:不用 Google 帳號也能進後台。登入後(出現「管理後台」入口)就藏起來。\n"
    "    (function () {\n"
    "      var b = document.getElementById(\"demo-guest\");\n"
    "      var admin = document.getElementById(\"admin-link\");\n"
    "      function sync() { b.hidden = !!window.mamaFufoodApi.token() && !admin.hidden; }\n"
    "      b.hidden = !!window.mamaFufoodApi.token();\n"
    "      new MutationObserver(sync).observe(admin, { attributes: true });\n"
    "      b.onclick = function () { window.mamaFufoodApi.setToken(\"demo\"); location.reload(); };\n"
    "    })();\n"
    "  </script>\n"
)

LATIN_FONT = '  <style>body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }</style>\n</head>'


def js_mark(source: str) -> str:
    return f"// 由 demo/tools/build.py 從 {source} 產生,不要手改。\n"


class BuildError(Exception):
    pass


def replace_once(text: str, old: str, new: str, where: str) -> str:
    n = text.count(old)
    if n != 1:
        raise BuildError(f"{where}:預期找到 1 處「{old}」,實際 {n} 處(正式版改了?)")
    return text.replace(old, new)


def translate(text: str, pairs: list[tuple[str, str]], where: str) -> str:
    for zh, en in pairs:
        if zh not in text:
            raise BuildError(f"{where}:對照表的原文找不到:「{zh[:60]}」(正式版改了字?更新 translations.py)")
        text = text.replace(zh, en)
    return text


def storage_shim(prefix: str) -> str:
    return (
        "  <meta name=\"robots\" content=\"noindex\">\n"
        "  <script>\n"
        "    // 示範版跟正式版同一個網域,localStorage 是共用的:這一頁所有的 key 加上前綴,\n"
        "    // 讀不到正式版的管理員 session,也不會寫進正式版的資料。一定要在其他 script 之前執行。\n"
        "    (function () {\n"
        f"      var PREFIX = \"{prefix}\";\n"
        "      var S = Storage.prototype;\n"
        "      var getItem = S.getItem, setItem = S.setItem, removeItem = S.removeItem;\n"
        "      S.getItem = function (k) { return getItem.call(this, PREFIX + k); };\n"
        "      S.setItem = function (k, v) { return setItem.call(this, PREFIX + k, v); };\n"
        "      S.removeItem = function (k) { return removeItem.call(this, PREFIX + k); };\n"
        "    })();\n"
        "  </script>\n"
    )


def common_page(src: str, source: str, lang: str, where: str) -> str:
    """index.html 與 admin.html 共用的轉接:產生標記、localStorage 前綴、相對路徑、示範版的 script。"""
    t = replace_once(src, "<!doctype html>\n", "<!doctype html>\n" + html_mark(source), where)
    t = replace_once(t, '<meta charset="utf-8">\n', '<meta charset="utf-8">\n' + storage_shim("demo-en:" if lang == "en" else "demo:"), where)
    for old, new in [
        ('href="favicon.png"', 'href="../favicon.png"'),
        ('href="css/style.css"', 'href="../css/style.css"'),
        ('src="favicon.png"', 'src="../favicon.png"'),
        ('<script src="js/config.js"></script>', '<script src="config.js"></script>\n  <script src="data.js"></script>\n  <script src="fixtures.js"></script>'),
        ('src="js/api.js"', 'src="api.js"'),
    ]:
        t = replace_once(t, old, new, where)
    if lang == "en":
        # 正式版的字型是中文字型,會把 ’ “ ” — 這些標點畫成全形;英文版改用拉丁字型。
        t = replace_once(t, "</head>", LATIN_FONT, where)
    return t


def build_index(lang: str) -> str:
    where = f"{'demo-en' if lang == 'en' else 'demo'}/index.html"
    t = common_page((WEB / "index.html").read_text(encoding="utf-8"), "index.html", lang, where)
    for old, new in [
        ('href="apple-touch-icon.png"', 'href="../apple-touch-icon.png"'),
        ('src="icon_256.png"', 'src="../icon_256.png"'),
        ('src="js/md.js"', 'src="../js/md.js"'),
        ('src="js/home.js"></script>\n', ('src="home.js"></script>\n' if lang == "en" else 'src="../js/home.js"></script>\n') + GUEST),
        ('<div id="gsi"></div>\n', '<div id="gsi"></div>\n    <button id="demo-guest" type="button" hidden>不用 Google 帳號直接進入</button>\n'),
    ]:
        t = replace_once(t, old, new, where)
    if lang == "en":
        t = translate(t, translations.INDEX, where)
        t = replace_once(t, 'src="https://accounts.google.com/gsi/client"', 'src="https://accounts.google.com/gsi/client?hl=en"', where)
    return t


def build_admin(lang: str) -> str:
    where = f"{'demo-en' if lang == 'en' else 'demo'}/admin.html"
    t = common_page((WEB / "admin.html").read_text(encoding="utf-8"), "admin.html", lang, where)
    t = replace_once(t, 'src="js/admin.js"', 'src="admin.js"' if lang == "en" else 'src="../js/admin.js"', where)
    if lang == "en":
        t = translate(t, translations.ADMIN_HTML, where)
    return t


def build_data(lang: str) -> str:
    """App 內建的公用資料(和後端的初始資料是同一份)與匯出格式定義。英文版把名稱換成英文。"""
    food = json.loads((DATASETS / "food_list.json").read_text(encoding="utf-8"))
    units = json.loads((DATASETS / "units.json").read_text(encoding="utf-8"))
    formats = []
    for p in sorted(FORMATS.glob("v*.json"), key=lambda p: int(p.stem[1:])):
        d = json.loads(p.read_text(encoding="utf-8"))
        formats.append({"format_version": d["format_version"], "definition": d, "status": "active",
                        "min_app_version": d["min_app_version"], "updated_at": "2026-10-26T00:00:00+00:00"})
    if lang == "en":
        def name(table: dict, zh: str, what: str) -> str:
            if zh not in table:
                raise BuildError(f"translations.py 的 {what} 沒有「{zh}」(公用資料新增了項目?)")
            return table[zh]
        for g in food["content"]["groups"]:
            g["name"] = name(translations.GROUP_NAMES, g["name"], "GROUP_NAMES")
        for f in food["content"]["foods"]:
            f["name"] = name(translations.FOOD_NAMES, f["name"], "FOOD_NAMES")
        for u in units["content"]["units"]:
            u["name"] = name(translations.UNIT_NAMES, u["name"], "UNIT_NAMES")
        for f in formats:
            v = f["format_version"]
            if v not in translations.FORMAT_DESCRIPTIONS:
                raise BuildError(f"translations.py 的 FORMAT_DESCRIPTIONS 沒有第 {v} 版")
            f["definition"]["description"] = translations.FORMAT_DESCRIPTIONS[v]
    v = food["version"]
    published_at = f"{v[0:4]}-{v[4:6]}-{v[6:8]}T{v[8:10]}:{v[10:12]}:{v[12:14]}+00:00"
    data = {"food_list": food, "units": units, "formats": formats, "publishedAt": published_at}
    return (js_mark("App 的 assets/datasets/ 與後端的 export_formats/")
            + "window.MAMA_FUFOOD_DEMO_CATALOG = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n")


def build_config() -> str:
    src = (WEB / "js" / "config.js").read_text(encoding="utf-8")
    t, n = re.subn(r'apiBase: "[^"]*"', 'apiBase: ""', src)
    if n != 1:
        raise BuildError(f"js/config.js:預期找到 1 處 apiBase,實際 {n} 處")
    return js_mark("js/config.js") + t


def legal_sha(doc: str) -> str:
    return hashlib.sha256((WEB / "legal" / f"{doc}.md").read_bytes()).hexdigest()


def outputs() -> dict[Path, str]:
    out: dict[Path, str] = {}
    out[DEMO / "index.html"] = build_index("zh")
    out[DEMO / "admin.html"] = build_admin("zh")
    out[DEMO / "data.js"] = build_data("zh")
    out[DEMO / "config.js"] = build_config()
    for doc in DOCS:
        out[DEMO / "legal" / f"{doc}.md"] = (WEB / "legal" / f"{doc}.md").read_text(encoding="utf-8")

    out[DEMO_EN / "index.html"] = build_index("en")
    out[DEMO_EN / "admin.html"] = build_admin("en")
    out[DEMO_EN / "data.js"] = build_data("en")
    out[DEMO_EN / "config.js"] = build_config()
    out[DEMO_EN / "api.js"] = js_mark("demo/api.js") + (DEMO / "api.js").read_text(encoding="utf-8")
    home = (WEB / "js" / "home.js").read_text(encoding="utf-8")
    out[DEMO_EN / "home.js"] = js_mark("js/home.js") + translate(home, translations.HOME, "demo-en/home.js")
    admin = (WEB / "js" / "admin.js").read_text(encoding="utf-8")
    out[DEMO_EN / "admin.js"] = js_mark("js/admin.js") + translate(admin, translations.ADMIN, "demo-en/admin.js")
    return out


def strip_comments(path: Path, text: str) -> str:
    if path.suffix == ".html":
        text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
        # inline script 的註解
        return "\n".join(re.sub(r"^\s*//.*$", "", line) for line in text.splitlines())
    if path.suffix == ".js":
        text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
        lines = []
        for line in text.splitlines():
            line = re.sub(r"^\s*//.*$", "", line)
            line = re.sub(r"\s//\s.*$", "", line)
            lines.append(line)
        return "\n".join(lines)
    return text


def leftover_chinese(path: Path, text: str) -> list[str]:
    body = strip_comments(path, text)
    for ok in CJK_ALLOWED:
        body = body.replace(ok, "")
    found = []
    for i, line in enumerate(body.splitlines(), 1):
        if CJK.search(line):
            found.append(f"{path.relative_to(WEB)}:{i}: {line.strip()[:100]}")
    return found


def check_english(out: dict[Path, str]) -> list[str]:
    problems: list[str] = []
    for path, text in out.items():
        if path.is_relative_to(DEMO_EN):
            problems += leftover_chinese(path, text)
    for doc in DOCS:
        en = DEMO_EN / "legal" / f"{doc}.md"
        if not en.exists():
            problems.append(f"{en.relative_to(WEB)}:找不到英文翻譯")
            continue
        problems += leftover_chinese(en, en.read_text(encoding="utf-8"))
        want = translations.LEGAL_SOURCES.get(doc, "")
        now = legal_sha(doc)
        if want != now:
            problems.append(
                f"legal/{doc}.md 跟翻譯時不一樣了:重翻 demo-en/legal/{doc}.md,"
                f"再把 translations.py 的 LEGAL_SOURCES[\"{doc}\"] 改成 \"{now}\""
            )
    fixtures = DEMO_EN / "fixtures.js"
    problems += leftover_chinese(fixtures, fixtures.read_text(encoding="utf-8"))
    return problems


def main() -> int:
    check_only = "--check" in sys.argv[1:]
    try:
        out = outputs()
    except BuildError as e:
        print(f"錯誤:{e}")
        return 1
    problems = check_english(out)
    if problems:
        print("英文示範版有問題:")
        for p in problems:
            print("  " + p)
        return 1

    stale = [p for p, text in out.items() if not p.exists() or p.read_text(encoding="utf-8") != text]
    if check_only:
        if stale:
            print("這些產生的檔案不是最新的,請執行 python3 demo/tools/build.py:")
            for p in stale:
                print("  " + str(p.relative_to(WEB)))
            return 1
        print("示範版是最新的。")
        return 0
    for p in stale:
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(out[p], encoding="utf-8")
        print("寫入 " + str(p.relative_to(WEB)))
    print(f"完成({len(stale)} 個檔案更新,{len(out) - len(stale)} 個不變)。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
