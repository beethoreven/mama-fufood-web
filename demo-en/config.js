// 由 demo/tools/build.py 從 js/config.js 產生,不要手改。
// 網站設定。不是秘密(用戶端 ID 本來就公開在網頁裡),但每個人的設定不同:照 meta repo(mama-fufood)
// README 上線 SOP 的 Part F 填好再推上 GitHub Pages。
window.MFF_CONFIG = {
  // 後端網址(Render),不要結尾斜線。
  apiBase: "",
  // Google Cloud 的「網頁應用程式」用戶端 ID(和後端的 GOOGLE_CLIENT_ID 是同一個)。
  googleClientId: "316171912832-3ujfsr17r549hpu000hpnb09as7u5u5c.apps.googleusercontent.com",
  // 上架後填 Google Play 的網址;空白時首頁顯示「目前尚未上架」。
  playUrl: "",
  // 首頁「下載最新版」連到 GitHub Release 上的 APK。發新版時:在 mama-fufood-app 建立
  // v<版本號> 的 Release、附上 mama-fufood-<版本號>.apk,再改這裡的版本號。
  apkVersion: "1.2.0",
};
