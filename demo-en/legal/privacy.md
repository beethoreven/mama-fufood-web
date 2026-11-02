> **This English translation is provided for demonstration only. If it differs from the Traditional Chinese version, the Traditional Chinese version prevails.**

Effective date: October 24, 2026

## In one sentence

**Your baby's name, records and photos are stored only on your phone and in your own Google Drive; our server does not keep them.** We receive your email address and debugging data only when you send feedback. At all other times, the server discards what it receives as soon as it is done with it.

## 1. Who handles your data

阿舍老師 ("we" or "us"). Contact: tutorarthurouat@outlook.com.

## 2. What data we come into contact with

Each feature is described separately. **We do not collect any data that is not listed here**: no location, contacts, list of other apps, advertising ID, IMEI or serial number, and the App contains no advertising or analytics SDKs.

| What you do | Where the data goes | What we receive | How long it is kept |
|---|---|---|---|
| Log records on your phone without signing in | Only on your phone | Nothing | — |
| Sign in with a Google account | Google gives the App your account email, name and profile picture, which the App uses to show which account you are signed in with. The App then sends the sign-in credential to our server in exchange for a "sign-in pass" (containing your Google account's permanent ID, email and expiry time, signed by us to prevent forgery). The pass is stored on your phone and used for update checks, feedback and format conversion | The sign-in credential (containing your Google account's permanent ID and email), used only to issue the pass | Account details and the pass stay on your phone and are cleared when you sign out. The pass lasts up to 180 days and is extended automatically while you use the App. The server keeps neither the sign-in credential nor the pass |
| Check for shared data updates (after signing in; automatically when the App opens, or manually) | Sent to our server | The sign-in pass (containing your Google account's permanent ID and email), the App version and platform (Android or iOS), the data format versions the App supports, and the versions of shared data on your phone | Used to confirm your identity and reply with updates, then discarded and never written to the database. The server only remembers in memory how many times this account has checked today (counted by the account's permanent ID), cleared every day at midnight Taipei time |
| Turn on "Sync records to cloud" or "Save photos to cloud" | Stored in an area of **your own** Google Drive that only the App can read | Our server receives nothing | Kept by your Google account until you delete it |
| Export | Encrypted and saved to **your own** Google Drive (in the App's own folder); the key is stored in an area of Google Drive that only the App can read | Our server receives nothing and never gets the key | Kept by you |
| Import an export file from an older version whose format is not compatible | After decrypting on your phone, the App temporarily sends the record data (baby names and record contents, **without photos or email**) to our server to convert the format | This record data and the sign-in pass | **Not kept before or after conversion, and the contents are not logged.** Each account can convert up to 5 times per day; the count is kept only in server memory |
| Send feedback | Sent to our server and stored in the database | See Section 3 | Up to 90 days; may be deleted earlier once debugging is done |
| Usage logs on your phone | Only on your phone | We receive nothing (unless you send feedback) | Deleted automatically after 7 days |
| Sign in with Google on the website (the sign-in button on the home page) | The sign-in credential is sent to our server to check whether you are an administrator | The sign-in credential (containing your Google account's permanent ID and email) | Discarded after use and never written to the database; only administrators keep a signed-in session for the admin console |
| The App crashes | Android: if your phone settings allow sharing diagnostic data with Google, Google Play gives us crash statistics that do not identify you. iPhone: if you allow "Share with App Developers" for analytics in your phone settings and the App was installed from the App Store or TestFlight, Apple gives us crash reports that do not identify you | Statistics or reports that do not identify you | As set by Google Play or Apple |

In addition, our hosting provider (Render) keeps connection records in its system logs for 7 days; its official documentation does not say whether these include your IP address. We do not keep IP addresses ourselves, and our program logs do not record email addresses or sign-in credentials.

## 3. What feedback sends

After you tap "Send", the App first lists the items to be sent, and nothing is sent until you tap "Confirm and send".

- **Always sent**: your email address (taken from the sign-in pass and used to reply to you; this is the only personal data in feedback), the description you write, the feedback number, your phone's time and time zone, an install ID (a random code generated the first time the App opens, used to tell apart different phones on the same account), the App version and shared data versions, a settings summary (week start day, theme, cloud switches and sign-in status, plus counts such as the number of babies, records, photos and pending uploads; no baby names or record contents), and your phone model and system version.
- **Also sent when you choose "Report a problem"**: phone status (for example, free storage, battery level and network type), cloud sync status, usage logs from the last 7 days, the reason the App last ended abnormally, and an excerpt of the App's own system logs. These logs **contain no baby names, notes or record contents**. Any email address, sign-in credential, file name, baby name or IP address that appears in the logs is masked before sending.
- **Never sent**: screenshots, photos, location, IP address.
- We keep your description exactly as written, so please do not include personal data such as your baby's full name.
- If there is no network when you send, the feedback is saved on your phone and resent automatically the next time you open the App, for up to 30 days.

## 4. Purposes

- Providing shared data updates and preventing abuse (update checks).
- Converting the format of export files from older versions (when importing).
- Replying to your feedback and finding and fixing problems (feedback).

We do not use your data for any purpose other than those above, and we do not sell, rent or use it for advertising.

## 5. Where data is stored and who receives it

- Our server and database are located in **Singapore** (Render and Neon data centers); feedback is stored there.
- Cloud sync and export data are stored in your own Google account and kept by Google. Your phone's automatic backups are stored in your own Google account (Android) or iCloud (iPhone, when iCloud Backup is on), kept by Google and Apple respectively; Apple's privacy policy is at <https://www.apple.com/legal/privacy/>.
- Services that help us operate: Google (sign-in, Google Drive, Google Play), Render (hosting, with Cloudflare protection in front), Neon (database). These services only provide technical services to us. Google's privacy policy is at <https://policies.google.com/privacy>, Render's at <https://render.com/privacy>, and Neon's at <https://neon.com/privacy-policy>.
- Except where required by law (for example, a lawful request from a court or prosecutors), we do not provide your data to anyone else.

## 6. Use of Google user data

The App uses your Google data in accordance with the Google API Services User Data Policy, only to provide features you can see, never passing it to third parties or using it for advertising:

| Permission | Purpose | When it is requested |
|---|---|---|
| Basic profile (email, name, profile picture) and authentication | Sign-in, showing your account in the App, update checks, contact details for feedback | When you tap sign in |
| Access only to the App's own Drive data area (`drive.appdata`) | Record sync, photos in the cloud, storing the export file key | When you turn on cloud features or export or import for the first time (requested only when needed) |
| Access only to files created by the App or chosen by you (`drive.file`) | Saving and reading export files | When you export or import for the first time (requested only when needed) |

The App does not read any other files in your Google Drive. We (the developers) do not read the data in your Google Drive; it is read and written only by the App on your phone.

## 7. Your rights

Under the Personal Data Protection Act, you may exercise the following rights over the data we keep about you (in practice, only feedback): to inquire about or review it, to request a copy, to request additions or corrections, to request that we stop collecting, processing or using it, and to request its deletion.

- How: email tutorarthurouat@outlook.com, stating your email address and what you would like us to do.
- Timing: we reply to requests to inquire, review or copy within 15 days, and to requests to correct, stop or delete within 30 days; where necessary, we may extend this as permitted by law and will let you know.
- You manage the data on your phone and in your Google Drive yourself: deleting a baby in the App deletes the data on your phone and, when cloud sync is on, the matching data in your Google Drive. Exported files are not deleted; please delete them in Google Drive yourself.

## 8. What happens if you do not provide data

- Not signing in: you can still log records and view statistics and results on your phone, but you cannot update shared data, use cloud sync, export or import, or send feedback.
- Not sending feedback: no feature is affected; we just will not know about the problems you run into.

## 9. Children

The App's users are parents and caregivers, not children. The baby data you record stays only on your phone and in your own Google Drive, and we do not collect it.

## 10. Data security

- All connections between your phone and our server use encryption (HTTPS).
- Export files are fully encrypted, and the key is stored only in your own Google Drive.
- The server keeps only feedback; all other data is processed in memory and discarded after use.
- Only our administrators can view feedback.

## 11. Changes to this Policy

We may change this Policy. After a change, the first time you open the App you will see the updated "Data Use Principles" and must confirm them before continuing. The updated Policy is published both in the App and on the website. If we want to use your data in a new way, we will notify you and ask for your consent first.

## 12. Contact us

阿舍老師
Email: tutorarthurouat@outlook.com
Website: <https://beethoreven.github.io/mama-fufood-web/>
