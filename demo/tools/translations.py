"""英文示範版(demo-en/)的中英對照表,給 build.py 用。

每個檔案一串 (中文原文, 英文),依序替換;每一句都必須在原文裡找得到,找不到 build.py 就報錯
(多半是正式版改了字,這裡要跟著改)。

術語表(全站統一):
    媽媽記副食品 → mama-fufood          本 App → the App
    使用者條款 → Terms of Use           隱私權政策 → Privacy Policy
    判斷邏輯說明 → How Results Are Determined
    資料運用原則 → Data Use Principles  意見回饋 → Feedback
    公用資料 → shared data              登入通行證 → sign-in pass
    紀錄與雲端同步 → Sync records to cloud
    照片存到雲端 → Save photos to cloud
    食材判斷 → Food Results             腹瀉嘔吐(頁籤)→ Diarrhea & Vomiting
    過敏狀況 → allergy status           用食反應 → eating response
    穩定/風險/過敏 → Stable/Risk/Allergy
    排斥/接受/喜歡 → Dislike/Accept/Like
    正常/腹瀉/嘔吐 → Normal/Diarrhea/Vomiting
    當天/隔天 → same day/next day
    營運者名稱「阿舍老師」照原文保留。
"""

INDEX = [
    ('lang="zh-Hant-TW"', 'lang="en"'),
    ("<title>媽媽記副食品</title>", "<title>mama-fufood</title>"),
    (
        'content="記錄寶寶副食品的 App：吃了什麼、吃多少、有沒有過敏狀況。紀錄只存在你的手機與你自己的 Google 雲端硬碟。"',
        "content=\"An app for logging a baby's first foods: what they ate, how much, and whether there was an allergic reaction. Records stay on your phone and in your own Google Drive.\"",
    ),
    ('<span class="title">媽媽記副食品</span>', '<span class="title">mama-fufood</span>'),
    (">管理後台</a>", ">Admin console</a>"),
    (">介紹</button>", ">About</button>"),
    (">使用者條款</button>", ">Terms of Use</button>"),
    (">隱私權政策</button>", ">Privacy Policy</button>"),
    (">判斷邏輯說明</button>", ">How Results Are Determined</button>"),
    ('alt="App 圖示"', 'alt="App icon"'),
    ('font-size: 22px">媽媽記副食品</h1>', 'font-size: 22px">mama-fufood</h1>'),
    (
        "記錄寶寶的副食品：每次吃了什麼、吃多少、有沒有過敏狀況、寶寶喜不喜歡，\n"
        "              並整理成月曆、統計與簡單的判斷結果。",
        "Log your baby's first foods: what they ate each time, how much, whether there was an allergic reaction,\n"
        "              and whether they liked it, all organized into a calendar, statistics and simple results.",
    ),
    (">你的資料只在你手上</h2>", ">Your data stays with you</h2>"),
    (
        "<li>寶寶的名稱、紀錄與照片只存在你的手機，或你自己的 Google 雲端硬碟（開啟雲端功能時）。</li>",
        "<li>Your baby's name, records and photos are stored only on your phone, or in your own Google Drive when you turn on cloud features.</li>",
    ),
    (
        "<li>匯出檔整份加密，只能用匯出時的 Google 帳號匯入；我們拿不到金鑰。</li>",
        "<li>Export files are fully encrypted and can only be imported with the Google account that created them. We never have the key.</li>",
    ),
    ("<li>沒有廣告，也沒有任何分析工具。</li>", "<li>No ads and no analytics tools.</li>"),
    (
        "本 App 僅供記錄與參考，非基於醫學知識做的判斷。寶寶有任何反應，請諮詢醫師。",
        "The App is for record-keeping and reference only. Its results are not medical judgements. If your baby has any reaction, please consult a doctor.",
    ),
    ('font-size: 17px">下載</h2>', 'font-size: 17px">Download</h2>'),
    (">下載最新版媽媽記副食品</a>", ">Download the latest mama-fufood</a>"),
    ("目前尚未在 Google Play 上架。", "Not yet available on Google Play."),
    (
        "無法載入 Google 登入元件（不影響瀏覽網站）。",
        "Could not load Google Sign-In (the rest of the site still works).",
    ),
]

HOME = [
    ('"到 Google Play 下載"', '"Get it on Google Play"'),
    ("`版本 ${v}`", "`Version ${v}`"),
    (
        '{ terms: "使用者條款", privacy: "隱私權政策", judgement_guide: "判斷邏輯說明" }',
        '{ terms: "Terms of Use", privacy: "Privacy Policy", judgement_guide: "How Results Are Determined" }',
    ),
    ('" - 媽媽記副食品" : "媽媽記副食品"', '" - mama-fufood" : "mama-fufood"'),
    ('<p class="muted">載入中…</p>', '<p class="muted">Loading…</p>'),
    ("<p>載入失敗，請重新整理。</p>", "<p>Couldn't load this page. Please refresh.</p>"),
    (
        "確認中…（後端可能正在喚醒，最多約一分鐘）",
        "Checking… (the server may be waking up; this can take up to a minute)",
    ),
    (
        "已登入。這個帳號不是管理員，網站上沒有其他功能。",
        "Signed in. This account isn't an administrator, so there's nothing more to do on this site.",
    ),
    ('{ type: "icon",', '{ locale: "en", type: "icon",'),
]

# demo-en/legal/ 的英文是手寫的翻譯。這裡記著翻譯時中文原文(legal/*.md)的 SHA-256:
# 中文改了,build.py 會報錯,重翻對應的英文檔之後再更新這裡的值(build.py 會印出新的值)。
LEGAL_SOURCES = {
    "terms": "bd1f4e9d23fb9a63cd6c8465b00f508c5926c59b4b9c1add3d82078c8fc715b4",
    "privacy": "510f33a4f341ee21bbb64676ace26577f31e4b97d899bcd8dfb26b044140d483",
    "judgement_guide": "7eb25c886f40af23f12e51cd046c9ed442fe41a8829893c4645052e843b21f6e",
}

# 首頁上示範版自己加的「不用 Google 帳號直接進入」按鈕(build.py 插入中文,這裡換成英文)。
INDEX += [
    (">不用 Google 帳號直接進入</button>", ">Enter without a Google account</button>"),
]

ADMIN_HTML = [
    ('lang="zh-Hant-TW"', 'lang="en"'),
    ("<title>管理後台 - 媽媽記副食品</title>", "<title>Admin console - mama-fufood</title>"),
    ('alt="回首頁"', 'alt="Home"'),
    ('<span class="title">管理後台</span>', '<span class="title">Admin console</span>'),
    (">登出</button>", ">Sign out</button>"),
    (">公用資料</button>", ">Shared data</button>"),
    (">App 版本</button>", ">App version</button>"),
    (">意見回饋</button>", ">Feedback</button>"),
    (">管理員</button>", ">Admins</button>"),
    (">系統</button>", ">System</button>"),
]

ADMIN = [
    # 公用資料
    ('<span class="pill warn">草稿有未發布的修改</span>', '<span class="pill warn">Draft has unpublished changes</span>'),
    ('<span class="pill">和發布版本一樣</span>', '<span class="pill">Same as published</span>'),
    ("目前發布：${esc(r.version || \"沒有\")}", "Published: ${esc(r.version || \"none\")}"),
    ('class="primary" ${r.has_changes ? "" : "disabled"}>發布</button>', 'class="primary" ${r.has_changes ? "" : "disabled"}>Publish</button>'),
    (
        "快取版本和資料庫版本不一致，請到「系統」按「重新載入快取」。",
        "The cache version does not match the database version. Go to System and click Reload cache.",
    ),
    (
        "意見回饋資料表已達 ${overview.feedback_table_mb} MB（上限 ${overview.feedback_table_limit_mb} MB），目前不收記錄檔。",
        "The feedback table has reached ${overview.feedback_table_mb} MB (limit ${overview.feedback_table_limit_mb} MB); log files are not accepted for now.",
    ),
    (" 停用</label>", " Disabled</label>"),
    ('<span class="muted">已發布</span>', '<span class="muted">Published</span>'),
    (">刪除</button>", ">Delete</button>"),
    (" 預設</label>", " Default</label>"),
    (
        "修改會先存成草稿，按「發布」才會產生新版本、讓 App 下載。ID 永遠不可改、不可刪、不可重用：發布過的項目只能停用。",
        "Changes are saved as a draft first; a new version for the App to download is created only when you click Publish. IDs can never be changed, deleted or reused: published items can only be disabled.",
    ),
    ("食材名稱 3 個字以內；圖示要剛好一個 emoji。", "Food names are at most 3 Chinese characters; the icon must be exactly one emoji."),
    ('releaseLine("food_list", "副食品清單")', 'releaseLine("food_list", "Food list")'),
    ('releaseLine("units", "單位")', 'releaseLine("units", "Units")'),
    ('<h3 style="margin-top:0">分組</h3>', '<h3 style="margin-top:0">Groups</h3>'),
    ("<th>名稱</th>", "<th>Name</th>"),
    ("<th>圖示</th>", "<th>Icon</th>"),
    ("<th>排序</th>", "<th>Order</th>"),
    ("<th>分組</th>", "<th>Group</th>"),
    ('placeholder="分組名稱"', 'placeholder="Group name"'),
    (">新增分組</button>", ">Add group</button>"),
    ('<h3 style="margin-top:0">食材</h3>', '<h3 style="margin-top:0">Foods</h3>'),
    ('<span class="muted">分組：</span>', '<span class="muted">Group:</span>'),
    ('placeholder="食材（3 字內）"', 'placeholder="Food name"'),
    (">新增到這個分組</button>", ">Add to this group</button>"),
    ('<h3 style="margin-top:0">單位</h3>', '<h3 style="margin-top:0">Units</h3>'),
    ('placeholder="單位名稱"', 'placeholder="Unit name"'),
    (">新增單位</button>", ">Add unit</button>"),
    ('"已存成草稿"', '"Saved as draft"'),
    ("確定刪除這個還沒發布過的草稿嗎？", "Delete this draft item that has never been published?"),
    ("發布之後，App 下次檢查時就會下載這個版本。確定發布？", "Once published, the App downloads this version on its next check. Publish?"),
    ("已發布版本 ${r.version}", "Published version ${r.version}"),
    ("（快取還沒更新，請到「系統」重新載入）", " (the cache has not updated yet; reload it on the System tab)"),
    ('"已新增分組（草稿）"', '"Group added (draft)"'),
    ('"已新增食材（草稿）"', '"Food added (draft)"'),
    ('"已新增單位（草稿）"', '"Unit added (draft)"'),
    # App 版本
    (
        "強制更新只在重大問題、法律衝突或判斷規則修正時使用；只對有網路、而且有做每日檢查的手機生效。",
        "Use required updates only for serious problems, legal conflicts or judgement-rule fixes. They only take effect on phones that are online and run the daily check.",
    ),
    ("畫面上會顯示這裡寫的原因。", "The reason written here is shown on the update screen."),
    ("最低可用 App 版本（x.y.z）", "Minimum App version (x.y.z)"),
    ("強制更新的原因", "Reason for the required update"),
    ("更新連結（https://，上架前可以留空）", "Update link (https://; can be left empty before release)"),
    ("「需要新版 App」的通知文字", "\"New App version needed\" notice"),
    ("最後修改：", "Last changed: "),
    (">儲存</button>", ">Save</button>"),
    ("儲存後立即生效。確定？", "Changes take effect immediately. Save?"),
    ('"已儲存"', '"Saved"'),
    # 意見回饋
    (
        '{ new: "新的", in_progress: "處理中", done: "已處理", wont_fix: "不處理" }',
        '{ new: "New", in_progress: "In progress", done: "Done", wont_fix: "Won\'t fix" }',
    ),
    ('{ suggestion: "提供建議", problem: "遇到問題" }', '{ suggestion: "Suggestion", problem: "Problem" }'),
    ('<option value="">全部</option>', '<option value="">All</option>'),
    ("共 ${data.total} 則（最長保留 90 天）", "${data.total} total (kept up to 90 days)"),
    (
        "<th>時間</th><th>類型</th><th>狀態</th><th>描述</th><th>版本</th><th>機型</th>",
        "<th>Time</th><th>Type</th><th>Status</th><th>Description</th><th>Version</th><th>Model</th>",
    ),
    (">上一頁</button>", ">Previous</button>"),
    ("第 ${data.page} 頁", "Page ${data.page}"),
    (">下一頁</button>", ">Next</button>"),
    ("個資刪除請求", "Personal data deletion request"),
    ("刪掉某個 Email 的所有意見回饋（隱私權政策第七條）。", "Delete all feedback from one email address (Privacy Policy, Section 7)."),
    (">全部刪除</button>", ">Delete all</button>"),
    ("確定刪除 ${email} 的所有意見回饋？無法復原。", "Delete all feedback from ${email}? This cannot be undone."),
    ("已刪除 ${r.deleted} 則", "Deleted ${r.deleted}"),
    ('"已刪除"', '"Deleted"'),
    ("沒有記錄檔（「提供建議」不附記錄檔）。", "No log files (suggestions do not include logs)."),
    ("記錄檔（${lines.length} 行）", "Logs (${lines.length} lines)"),
    ("<h4>上次結束原因</h4>", "<h4>Last exit reasons</h4>"),
    ("<h4>原生層當機</h4>", "<h4>Native crash</h4>"),
    ("<h4>logcat 摘錄</h4>", "<h4>logcat excerpt</h4>"),
    (">關閉</button>", ">Close</button>"),
    ("Email：", "Email: "),
    ("|收到：", " | Received: "),
    ("|手機時間：", " | Phone time: "),
    ("|安裝 ID ", " | Install ID "),
    ('placeholder="處理備註"', 'placeholder="Admin note"'),
    ("確定刪除這則意見回饋？", "Delete this feedback?"),
    ("<h4>快照</h4>", "<h4>Snapshot</h4>"),
    # 管理員
    ("<th>備註</th>", "<th>Note</th>"),
    ('<span class="muted">環境變數設定</span>', '<span class="muted">Set by environment variable</span>'),
    (">移除</button>", ">Remove</button>"),
    ('placeholder="備註"', 'placeholder="Note"'),
    (">新增管理員</button>", ">Add admin</button>"),
    ('}, "已新增");', '}, "Added");'),
    ("確定移除 ${b.dataset.rm}？", "Remove ${b.dataset.rm}?"),
    ('"已移除"', '"Removed"'),
    # 系統
    ('"還沒載入"', '"not loaded yet"'),
    ('.join("、")', '.join(", ")'),
    ("快取版本：", "Cache versions: "),
    ("資料庫版本：", "Database versions: "),
    ('<span class="ok">一致</span>', '<span class="ok">Consistent</span>'),
    ('<span class="warn">不一致</span>', '<span class="warn">Inconsistent</span>'),
    ("（快取載入時間 ${esc(fmtTime(o.cache.loaded_at))}）", "(cache loaded at ${esc(fmtTime(o.cache.loaded_at))})"),
    (">重新載入快取</button>", ">Reload cache</button>"),
    (
        "萬一曾用 SQL 直接改了資料，按這個鈕或重啟後端即可。後端版本：",
        "If the data was ever changed directly with SQL, click this button or restart the backend. Backend version: ",
    ),
    ('"本機"', '"local"'),
    ("匯出格式定義（跟著後端程式發布，只能看）", "Export format definitions (released with the backend code; read-only)"),
    (
        "第 ${x.format_version} 版（${esc(x.status)}，最低 App ${esc(x.min_app_version)}）",
        "Version ${x.format_version} (${esc(x.status)}, minimum App ${esc(x.min_app_version)})",
    ),
    ('"已重新載入"', '"Reloaded"'),
]

# 英文示範版的公用資料:分組、食材、單位的名稱(ID 對應)。正式資料新增了項目,這裡沒有就報錯。
GROUP_NAMES = {
    "五穀": "Grains", "根莖": "Roots", "葉菜": "Leafy greens", "瓜果": "Gourds", "豆類": "Beans",
    "菇類": "Mushrooms", "水果": "Fruits", "蛋肉": "Eggs & meat", "海鮮": "Seafood", "乳製品": "Dairy",
    "堅果種子": "Nuts & seeds",
}
FOOD_NAMES = {
    "十倍粥": "Rice porridge", "糙米粥": "Brown rice porridge", "燕麥": "Oats", "小米": "Millet", "玉米": "Corn",
    "麵條": "Noodles", "吐司": "Toast",
    "地瓜": "Sweet potato", "馬鈴薯": "Potato", "胡蘿蔔": "Carrot", "山藥": "Chinese yam", "芋頭": "Taro",
    "白蘿蔔": "Daikon", "洋蔥": "Onion", "竹筍": "Bamboo shoot", "蘆筍": "Asparagus",
    "高麗菜": "Cabbage", "青江菜": "Shanghai bok choy", "小白菜": "Bok choy", "菠菜": "Spinach",
    "地瓜葉": "Sweet potato leaves", "莧菜": "Amaranth greens", "空心菜": "Water spinach", "油菜": "Yu choy",
    "娃娃菜": "Baby napa cabbage", "大陸妹": "Leaf lettuce", "A菜": "Stem lettuce leaves", "芥菜": "Mustard greens",
    "水蓮": "Water snowflake", "綠花椰": "Broccoli", "白花椰": "Cauliflower",
    "南瓜": "Pumpkin", "小黃瓜": "Cucumber", "櫛瓜": "Zucchini", "絲瓜": "Luffa", "冬瓜": "Winter melon",
    "苦瓜": "Bitter melon", "茄子": "Eggplant", "甜椒": "Bell pepper", "青椒": "Green pepper", "秋葵": "Okra",
    "玉米筍": "Baby corn",
    "豆腐": "Tofu", "四季豆": "Green beans", "豌豆": "Peas", "豆芽菜": "Bean sprouts", "黃豆": "Soybeans",
    "豆漿": "Soy milk",
    "香菇": "Shiitake", "鴻禧菇": "Beech mushroom", "秀珍菇": "Oyster mushroom", "雪白菇": "White beech mushroom",
    "金針菇": "Enoki", "木耳": "Wood ear",
    "蘋果": "Apple", "香蕉": "Banana", "梨子": "Pear", "芭樂": "Guava", "木瓜": "Papaya", "西瓜": "Watermelon",
    "葡萄": "Grape", "草莓": "Strawberry", "奇異果": "Kiwi", "火龍果": "Dragon fruit", "藍莓": "Blueberry",
    "哈密瓜": "Cantaloupe", "芒果": "Mango", "鳳梨": "Pineapple", "橘子": "Mandarin", "柚子": "Pomelo",
    "酪梨": "Avocado", "蓮霧": "Wax apple", "柿子": "Persimmon", "龍眼": "Longan", "櫻桃": "Cherry",
    "榴蓮": "Durian", "番茄": "Tomato",
    "蛋黃": "Egg yolk", "蛋白": "Egg white", "全蛋": "Whole egg", "雞肉": "Chicken", "豬肉": "Pork",
    "牛肉": "Beef", "羊肉": "Lamb", "鴨肉": "Duck", "鵝肉": "Goose",
    "鮭魚": "Salmon", "台灣鯛": "Tilapia", "虱目魚": "Milkfish", "鮪魚": "Tuna", "石斑魚": "Grouper",
    "吻仔魚": "Whitebait", "蝦子": "Shrimp", "螃蟹": "Crab", "花枝": "Cuttlefish", "魷魚": "Squid",
    "蚵仔": "Oyster", "蛤蜊": "Clam", "干貝": "Scallop",
    "優格": "Yogurt", "起司": "Cheese", "牛奶": "Milk",
    "花生": "Peanut", "堅果": "Tree nuts", "芝麻": "Sesame",
}
UNIT_NAMES = {"克": "g", "毫升": "ml", "口": "bite", "小匙": "tsp", "大匙": "tbsp"}

# 匯出格式定義裡的說明(後端 export_formats/v*.json 的 description)。
FORMAT_DESCRIPTIONS = {
    0: "data.json of export format version 0 (the pre-release format, App 0.x). All fields are required.",
    1: "data.json of export format version 1 (App 1.x). Compared with version 0, each record adds digestive "
       "(diarrhea or vomiting). All fields are required; digestive may be null (not filled in).",
}
