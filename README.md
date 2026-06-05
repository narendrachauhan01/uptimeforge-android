# UptimeForge Android

UptimeForge ka Android application — React 19 + Vite 8 + Capacitor 8 se bana native Android app.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 (Rolldown) | Build tool |
| Capacitor | 8.x | Web → Native Android bridge |
| Recharts | 3.x | Performance charts |
| React Router | 7 | Client-side routing |
| Axios | — | API calls (cookies, withCredentials) |

**Backend API:** `https://uptimeapi.narendrasingh.site`  
**App ID:** `site.narendrasingh.uptimeforge`

---

## Project Structure

```
uptimeforge-android/
├── android/                    # Native Android project (Capacitor)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/site/narendrasingh/uptimeforge/
│   │   │   │   └── MainActivity.java    # Cookie setup
│   │   │   └── res/                     # App icons, strings
│   │   └── build.gradle
│   └── gradlew
├── src/
│   ├── api/
│   │   └── axios.js            # Axios instance (baseURL, withCredentials)
│   ├── components/
│   │   ├── BottomNav.jsx       # 5-tab nav with alert badge
│   │   └── Toast.jsx           # Toast notifications
│   ├── pages/
│   │   ├── AddSite.jsx         # Add new monitoring site
│   │   ├── Alerts.jsx          # Downtime / recovery alerts
│   │   ├── ChangePassword.jsx  # Change password
│   │   ├── CompleteProfile.jsx # First-time profile + edit profile
│   │   ├── Dashboard.jsx       # Home: sites overview + stats
│   │   ├── DomainSSL.jsx       # SSL & domain expiry monitor
│   │   ├── ForgotPassword.jsx  # Forgot password (email reset link)
│   │   ├── Integrations.jsx    # Slack / Discord / Telegram / Webhook
│   │   ├── Login.jsx           # Email login + Google Sign-In
│   │   ├── Notifications.jsx   # In-app notifications
│   │   ├── PaymentHistory.jsx  # Subscription payment records
│   │   ├── Performance.jsx     # Response time charts (1H / 24H / 7D)
│   │   ├── PingMonitor.jsx     # TCP ping targets (add / delete / live ping)
│   │   ├── Plans.jsx           # Razorpay subscription plans
│   │   ├── Profile.jsx         # Account info, referral, billing, delete
│   │   ├── Recipients.jsx      # SMS/WhatsApp alert recipients
│   │   ├── Register.jsx        # Registration with email OTP verification
│   │   ├── SiteDetail.jsx      # Site stats, chart, edit, delete
│   │   ├── Sites.jsx           # All monitored sites list
│   │   ├── Splash.jsx          # Splash screen on app open
│   │   └── Support.jsx         # Help tickets with conversation view
│   ├── App.jsx                 # Routes, auth context, guards
│   └── main.jsx                # React entry point
├── public/
│   └── logo.png                # App logo
├── index.html                  # Razorpay script included
├── vite.config.js              # Vite build config
├── capacitor.config.json       # Capacitor config
└── package.json
```

---

## Pages / Features

| Page | Route | API |
|---|---|---|
| Login | `/login` | `POST /api/users/login`, Google OAuth |
| Register | `/register` | `POST /api/users/register/send-otp` → `verify-otp` |
| Forgot Password | `/forgot-password` | `POST /api/users/forgot-password` |
| Dashboard | `/dashboard` | `GET /api/servers` |
| Sites | `/sites` | `GET /api/servers` |
| Add Site | `/add-site` | `POST /api/servers` |
| Site Detail + Edit | `/sites/:id` | `GET/PUT/DELETE /api/servers/:id` |
| Alerts | `/alerts` | `GET /api/alerts` |
| Performance Charts | `/performance` | `GET /api/servers/:id/history?range=` |
| SSL & Domain | `/domain-ssl` | `GET /api/servers` + `GET /api/expiry/:id` |
| Ping Monitor | `/ping-monitor` | `GET/POST/DELETE /api/ping-targets` |
| Plans & Payment | `/plans` | Razorpay + `/api/payment/*` |
| Payment History | `/payment-history` | `GET /api/payment/my-requests` |
| Notifications | `/notifications` | `GET/PUT/DELETE /api/notifications` |
| Profile | `/profile` | `GET /api/users/referral-stats` |
| Edit Profile | `/edit-profile` | `PUT /api/users/profile` |
| Change Password | `/change-password` | `PUT /api/users/change-password` |
| Recipients | `/recipients` | `GET/POST/PUT/DELETE /api/recipients` |
| Integrations | `/integrations` | `GET/POST/DELETE /api/integrations/:type` |
| Support | `/support` | `POST/GET /api/users/support` + reply |

---

## Authentication

- Cookie-based auth: `sm_token` (httpOnly)
- **No localStorage** anywhere — only cookies
- `withCredentials: true` on all API calls
- `capacitor.config.json` hostname = `servermonitor.narendrasingh.site` (same-site cookies)
- `MainActivity.java` enables third-party cookies in Android WebView

---

## Local Development

### Prerequisites

- Node.js 20+
- JDK 21
- Android Studio (for running on device/emulator)

### Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start dev server (browser preview)
npm run dev
```

### Build Web + Sync to Android

```bash
# Build React app → sync to Android
npm run cap:build

# OR individually:
npm run build          # builds → www/
npx cap sync android   # syncs www/ → android/app/src/main/assets/public/
```

### Run on Android Device / Emulator

```bash
# Open in Android Studio
npx cap open android

# Then in Android Studio:
# Run → Run 'app' (or Shift+F10)
```

### Build Debug APK manually

```bash
npm run cap:build

cd android
./gradlew assembleDebug

# APK output:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## GitHub Actions (Auto Build)

APK is automatically built on every push to `main`.

**Workflow:** `.github/workflows/build-apk.yml`

- Node 24 + JDK 21
- `npm install --legacy-peer-deps`
- `npm run build` → `npx cap sync android` → `./gradlew assembleDebug`
- APK uploaded as artifact: **UptimeForge-debug-apk** (kept 30 days)

**Download APK:**  
GitHub → Repository → Actions → latest "Build UptimeForge APK" run → Artifacts → `UptimeForge-debug-apk`

---

## Google Sign-In Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials (Android)
3. Add the **SHA-1** from the debug keystore (shown in GitHub Actions build log)
4. Package name: `site.narendrasingh.uptimeforge`

---

## Key Files

| File | Purpose |
|---|---|
| `src/api/axios.js` | API base URL + withCredentials + error interceptor |
| `src/App.jsx` | Auth context, route guards, suspended/grace handling |
| `android/app/src/main/java/.../MainActivity.java` | Enables cookies in WebView |
| `capacitor.config.json` | App ID, hostname (for cookie domain), Google Auth config |
| `index.html` | Razorpay checkout.js CDN script |
| `vite.config.js` | Rolldown external: capacitor-google-auth (native plugin) |
