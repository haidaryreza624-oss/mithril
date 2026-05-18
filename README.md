
#  High‑Level Architecture
![Project's high level arctucture.](/assets/ab8580ce-c5b1-4089-93ff-199b597a1442.png "High Arcture photo")
#  Overview
This React Native mobile application allows students to log in to the HEMIS (Higher Education Management Information System) portal, fetch their academic data (profile, semester scores, final scores, timetable), and display it in a clean, local dashboard.

# POINT
The project original design uses a fastapi backend - its a private repo - this `sub_branch`is public available

Key difference from original design:
The app does not use an external FastAPI backend. Instead, it directly scrapes the HEMIS website using a custom HTTP client with cookie‑based session management. All parsers are implemented in TypeScript using node-html-parser.


#   Setting Up
Make sure you have `node.js` installed 
```bash
    git clone https://github.com/haidaryreza624-oss/mithril.git
    cd source
    npm install
    npx expo start
```
Install the `EXPO GO` app in your Smart phone:
Scan the QrCode 


# Tech Stack
| Layer  | Technology |
| ------------- |:-------------:|
| Framework     | React Native (Expo)     |
| Navigation     | React Navigation (Stack + Bottom Tabs)     |
| State Management      | React Context + Hooks (no global store)     |
| HTTP Client      | Native `fetch` with manual redirect & cookie handling     |
| HTML Parsing      | `node-html-parser`     |
| Secure Storage      | `expo-secure-store` (tokens) + `@react-native-async-storage/async-storage` (cookies)     |
| Animations     | React Native Animated API     |
| UI Components      | Custom theming + `react-native-safe-area-context`     |
| Form Validation      | Manual validation on login screen     |


# Core Modules
## `hemisScraper.ts` – Direct Scraper
Responsible for all communication with the HEMIS portal.
* Main functions:
    * `login(email, password)`
    * `getProfile()`, `getScore()`, `getFinalScore()`, `getSchedule()`
    * `logout()`

* Key mechanisms:
    * Manual redirect handling to capture all `Set-Cookie` headers.
    * Cookie jar stored in `AsyncStorage` (key `hemis_cookie_jar`).
    * CSRF token extraction from the login page (`<input name="_token">`).
    * Parsers using `node-html-parser` to extract data from `<table>` elements (profile, scores, schedule).
* Data flow (login):
    * `GET /student/login` → obtain `_token` and initial `XSRF‑TOKEN`.
    * `POST /student/login` with credentials + `_token` → receive session cookies.
    * Follow redirect to `/student/profile` → store merged cookie jar.
    * For subsequent requests: attach cookie jar, fetch pages, re‑store any new cookies from responses.


## `hemisApi.ts` – Compatibility Wrapper
Exports functions with the same names as the original FastAPI client, so screens remain unchanged.
| Function (old signature)  | Internal call |
| ------------- |:-------------:|
| `loginRequest(email, password)`      | `scraperLogin(...)` → returns dummy token    |
| `fetchProfile(token)`      | `scraperGetProfile()`  (ignores token)   |
| `fetchScore(token)`      | `scraperGetScore()`     |
| `fetchFinalScore(token)`      | `scraperGetFinalScore()`     |
| `fetchSchedule(token)`      | `scraperGetSchedule()`     |
| `logoutRequest(token)`      | `scraperLogout()`     |


## AuthContext (`useAuth`)
* Stores a dummy token in `expo-secure-store` (used only to know if user is logged in).
* On app start, calls `checkSession()` to validate the stored cookie.
* If cookie is valid, keeps logged in; otherwise clears storage.
* Provides `login()`, `logout()` to screens.
