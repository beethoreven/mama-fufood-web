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
        "Couldn't load Google Sign-In (the rest of the site still works).",
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
