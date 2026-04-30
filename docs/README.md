<div align="center">

# 📚 Kitep Space
### Library Management System with Admin Dashboard

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-kitep.space-4F46E5?style=for-the-badge)](https://kitep.space)
[![Backend](https://img.shields.io/badge/⚙️%20Backend%20API-Railway-0B0D0E?style=for-the-badge&logo=railway)](https://librarymanagementsystem-production-fc6e.up.railway.app)

<br/>

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Redux](https://img.shields.io/badge/Redux%20Toolkit-2.x-764ABC?style=flat-square&logo=redux&logoColor=white)
![MUI](https://img.shields.io/badge/Material%20UI-6.x-007FFF?style=flat-square&logo=mui&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Google](https://img.shields.io/badge/Google-OAuth2-4285F4?style=flat-square&logo=google&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3-F55036?style=flat-square&logo=meta&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-Deploy-00C7B7?style=flat-square&logo=netlify&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-Deploy-0B0D0E?style=flat-square&logo=railway&logoColor=white)

<br/>

> **Kitep Space** is a full-stack, production-deployed Library Management System featuring an admin dashboard, P2P book exchange with deposit protection, AI assistant, social features, and a public book catalog — built as a diploma thesis at Ala-Too International University, Bishkek, 2026.

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [🏗 Architecture](#-architecture)
- [🚀 Quick Start](#-quick-start)
- [🔑 Environment Variables](#-environment-variables)
- [☁️ Deployment](#-deployment)
- [📁 Project Structure](#-project-structure)
- [📖 Documentation](#-documentation)

---

## ✨ Features

### 👤 For Library Members

| Feature | Description |
|:---|:---|
| 📚 **Book Catalog** | Browse, search, and filter thousands of books by title, author, or genre with live debounced search |
| 🔐 **Authentication** | Email/password login + Google OAuth2 social login with JWT tokens |
| 📖 **Book Borrowing** | Borrow, renew, and return books within your subscription limits |
| 📅 **Reservations** | Join a queue for unavailable books — get an email when your book is ready |
| 💰 **Fine Management** | Automated overdue fine calculation with full payment history |
| 🏷️ **Subscriptions** | Monthly, quarterly, or yearly plans with configurable borrowing limits |
| ⭐ **Reviews & Ratings** | Write reviews and rate books 1–5 stars; Verified Reader badge for completed loans |
| ❤️ **Wishlist** | Save and manage a personal book wishlist |
| 🔄 **P2P Book Exchange** | List personal books, request borrows, with virtual deposit risk protection |
| 👤 **Public Profiles** | View any user's reputation, exchange stats, phone, and last seen |
| 👥 **Friends & Messages** | Add friends, send direct messages, view conversation history |
| 🤖 **AI Assistant** | Chat with LLaMA 3.3 70B — answers questions using your live account data |
| 🌍 **Public Browse** | Browse books at `/books` without an account — no login required |
| 📄 **About & Contact** | Public-facing informational pages with contact form |

### 🛡️ For Administrators

| Feature | Description |
|:---|:---|
| 📊 **Dashboard** | Real-time metrics: total users, books, active loans, revenue |
| 📚 **Book Management** | Full CRUD — add, edit, activate/deactivate books and genres |
| 👤 **User Management** | View users, edit roles, verify/block accounts |
| 📋 **Loan Management** | Process checkouts, returns, and renewals on behalf of users |
| 💸 **Fine Management** | Issue, process payments, and waive fines with documented reasons |
| 🏷️ **Subscription Plans** | Create and manage membership tiers with custom pricing and limits |
| 📌 **Reservations** | Monitor queue positions and manage holds |
| 🔄 **Exchange Management** | Moderate reports, view user reputations, grant coin balances, block/unblock |
| 💳 **Payments** | Full transaction history across all payment types |
| 📝 **Book Reviews** | Moderate user reviews and ratings |

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|:---|:---:|:---|
| ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black&style=flat-square) **React** | 18.x | UI framework with concurrent features |
| ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white&style=flat-square) **Vite** | 5.x | Build tool — sub-100ms HMR |
| ![Redux](https://img.shields.io/badge/-Redux-764ABC?logo=redux&logoColor=white&style=flat-square) **Redux Toolkit** | 2.x | State management with `createAsyncThunk` |
| ![MUI](https://img.shields.io/badge/-MUI-007FFF?logo=mui&logoColor=white&style=flat-square) **Material UI** | 6.x | Component library with custom theme |
| ![Tailwind](https://img.shields.io/badge/-Tailwind-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square) **Tailwind CSS** | 3.x | Utility-first responsive styling |
| ![Axios](https://img.shields.io/badge/-Axios-5A29E4?logo=axios&logoColor=white&style=flat-square) **Axios** | 1.x | HTTP client with JWT request interceptor |
| ![React Router](https://img.shields.io/badge/-React%20Router-CA4245?logo=reactrouter&logoColor=white&style=flat-square) **React Router** | 6.x | Client-side routing (SPA) |

### Backend

| Technology | Version | Purpose |
|:---|:---:|:---|
| ![Spring Boot](https://img.shields.io/badge/-Spring%20Boot-6DB33F?logo=springboot&logoColor=white&style=flat-square) **Spring Boot** | 3.5 | REST API framework |
| ![Spring Security](https://img.shields.io/badge/-Spring%20Security-6DB33F?logo=springsecurity&logoColor=white&style=flat-square) **Spring Security** | 6.x | Auth, CORS, role-based access control |
| ![Hibernate](https://img.shields.io/badge/-Hibernate-59666C?logo=hibernate&logoColor=white&style=flat-square) **Hibernate / JPA** | 6.x | ORM — `ddl-auto=update` schema management |
| ![MySQL](https://img.shields.io/badge/-MySQL-4479A1?logo=mysql&logoColor=white&style=flat-square) **MySQL** | 8.x | Relational database — 22 tables |
| ![JWT](https://img.shields.io/badge/-JWT-000000?logo=jsonwebtokens&logoColor=white&style=flat-square) **JWT** | — | Stateless authentication (HMAC-SHA256, 24h expiry) |
| ![Google](https://img.shields.io/badge/-Google%20OAuth2-4285F4?logo=google&logoColor=white&style=flat-square) **Google OAuth2** | — | Social login |
| ![Groq](https://img.shields.io/badge/-Groq%20AI-F55036?logo=meta&logoColor=white&style=flat-square) **Groq / LLaMA 3.3** | — | AI assistant inference |
| **Gmail SMTP** | — | Email notifications |

### Infrastructure

| Service | Purpose |
|:---|:---|
| ![Netlify](https://img.shields.io/badge/-Netlify-00C7B7?logo=netlify&logoColor=white&style=flat-square) **Netlify** | Frontend hosting + global CDN + custom domain |
| ![Railway](https://img.shields.io/badge/-Railway-0B0D0E?logo=railway&logoColor=white&style=flat-square) **Railway** | Backend hosting + managed MySQL database |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     USER BROWSER                         │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────┐
│              NETLIFY CDN  (https://kitep.space)         │
│              Serves React SPA — _redirects SPA routing  │
└────────────────────────┬────────────────────────────────┘
                         │ REST API + JWT
                         ▼
┌─────────────────────────────────────────────────────────┐
│            RAILWAY — Spring Boot 3.5                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │  Security   │  │  Controllers │  │   Schedulers   │ │
│  │  JWT Filter │  │  Services    │  │  (fines, overdue│ │
│  │  CORS Filter│  │  Repositories│  │   exchange)    │ │
│  └─────────────┘  └──────┬───────┘  └────────────────┘ │
└─────────────────────────┬───────────────────────────────┘
                          │ JPA/JDBC
                          ▼
┌─────────────────────────────────────────────────────────┐
│            RAILWAY — MySQL 8  (22 tables)                │
└─────────────────────────────────────────────────────────┘

Browser ──────────────────────────────► Groq Cloud API
         Direct HTTPS (AI assistant)    LLaMA 3.3 70B
```

**Key design decisions:**
- 🔒 Stateless REST API — JWT validated on every request, no server-side sessions
- 🌐 SPA routing — all 404s return `index.html` via Netlify `_redirects`
- 🤖 AI calls go browser → Groq directly (keeps backend free of AI latency)
- 🛡️ Two-layer CORS: `@Order(HIGHEST_PRECEDENCE)` filter + Spring Security CORS config
- 📅 Scheduled tasks: overdue fines at `02:00`, exchange overdues at `02:30`

---

## 🚀 Quick Start

### Prerequisites

- **Java 21** (Amazon Corretto recommended)
- **Node.js 20 LTS** + npm
- **Git**

> ✅ No local MySQL needed — the app connects to the Railway database by default.

### 1. Clone the Repository

```bash
git clone https://github.com/kkylych/library-management-system.git
cd library-management-system
```

### 2. Start the Backend

```bash
cd source/Backend-springboot

# Run with Maven wrapper (connects to Railway MySQL by default)
./mvnw spring-boot:run

# ✅ API ready at http://localhost:8080
```

### 3. Start the Frontend

```bash
cd source/Frontend-Vite

npm install

# The .env file already points to localhost:8080
npm run dev

# ✅ App ready at http://localhost:5173
```

### 4. Open in Browser

Navigate to **http://localhost:5173** — you can register a new account or sign in with Google.

> 💡 **Tip:** The admin dashboard is at `/admin`. To create an admin account, register normally then update the user role in MySQL directly or via the `/api/users/{id}/role` endpoint.

---

## 🔑 Environment Variables

### Backend (`application.properties` / Railway Variables)

| Variable | Default | Required | Description |
|:---|:---|:---:|:---|
| `DB_HOST` | `monorail.proxy.rlwy.net` | ✅ | MySQL TCP proxy host |
| `DB_PORT` | `47188` | ✅ | MySQL TCP proxy port |
| `DB_NAME` | `railway` | ✅ | Database name |
| `DB_USERNAME` | `root` | ✅ | MySQL username |
| `DB_PASSWORD` | — | ✅ | MySQL password |
| `MAIL_USERNAME` | *(empty)* | ⬜ | Gmail sender address |
| `MAIL_PASSWORD` | *(empty)* | ⬜ | Gmail app password |
| `GOOGLE_CLIENT_ID` | `dummy` | ⬜ | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | `dummy` | ⬜ | Google OAuth2 client secret |
| `FRONTEND_URL` | `http://localhost:5173` | ✅ | Used in OAuth2 redirects & reset emails |
| `BASE_URL` | `http://localhost:8080` | ✅ | Backend URL for OAuth2 redirect URI |
| `PORT` | `8080` | ⬜ | Server port |

### Frontend (`.env`)

| Variable | Description |
|:---|:---|
| `VITE_API_BASE_URL` | Backend base URL (e.g. `https://librarymanagementsystem-production-fc6e.up.railway.app`) |
| `VITE_GROQ_API_KEY` | Groq API key for the AI assistant |

---

## ☁️ Deployment

### Frontend → Netlify

```
Build command:    npm run build
Publish dir:      dist
Node version:     20
```

**Steps:**
1. Connect your GitHub repo to Netlify
2. Set build settings as above
3. Add environment variables in Netlify → **Site settings → Environment variables**
4. Add custom domain `kitep.space` in Netlify → **Domain management**
5. The `public/_redirects` file handles SPA routing automatically:
   ```
   /* /index.html 200
   ```

### Backend → Railway

**Steps:**
1. Connect GitHub repo — Railway auto-detects Maven and builds with Nixpacks
2. Add a **MySQL** plugin/service in the same project
3. Set environment variables using Railway's reference syntax:

```
DB_HOST     = ${{MySQL.RAILWAY_TCP_PROXY_DOMAIN}}
DB_PORT     = ${{MySQL.RAILWAY_TCP_PROXY_PORT}}
DB_NAME     = ${{MySQL.MYSQL_DATABASE}}
DB_USERNAME = ${{MySQL.MYSQLUSER}}
DB_PASSWORD = ${{MySQL.MYSQL_ROOT_PASSWORD}}
FRONTEND_URL = https://kitep.space
BASE_URL     = https://librarymanagementsystem-production-fc6e.up.railway.app
```

> ⚠️ **Important:** Use the TCP **proxy** domain and port, NOT `mysql.railway.internal` — the internal hostname only resolves within Railway's private network. The public TCP proxy works from anywhere.

Hibernate `ddl-auto=update` creates and updates all tables on startup automatically.

---

## 📁 Project Structure

```
Library-Management-System/
├── source/
│   ├── Backend-springboot/
│   │   └── src/main/java/com/kylych/
│   │       ├── configurations/     # SecurityConfig, CorsFixFilter, JwtValidator
│   │       ├── controller/         # REST controllers
│   │       ├── service/            # Business logic (interface + impl)
│   │       ├── repository/         # Spring Data JPA repositories
│   │       ├── modal/              # JPA entities (DB tables)
│   │       ├── payload/            # DTOs, request/response objects
│   │       ├── domain/             # Enums (status, role, type)
│   │       ├── exchange/           # ← P2P exchange sub-module
│   │       │   ├── controller/     #   ExchangeBook/Request/Borrow/Report/Admin
│   │       │   ├── service/        #   Business logic + deposit + overdue scheduler
│   │       │   ├── model/          #   ExchangeBook, ExchangeDeposit, UserReputation…
│   │       │   ├── repository/     #   Spring Data JPA repos
│   │       │   ├── dto/            #   DTOs and request classes
│   │       │   └── domain/         #   Status enums
│   │       ├── oauth2/             # Google OAuth2 handlers
│   │       ├── scheduler/          # BookLoan + Subscription schedulers
│   │       └── exception/          # Custom exceptions + GlobalExceptionHandler
│   │
│   └── Frontend-Vite/
│       └── src/
│           ├── Admin/              # Admin layout, pages (books, users, fines…)
│           ├── components/
│           │   ├── books/          # BookCard, CheckoutDialog, GenreFilter
│           │   ├── chat/           # AI Assistant widget (ChatAssistant.jsx)
│           │   ├── layout/         # UserLayout, SidebarDrawer, Navbar
│           │   ├── notification/   # NotificationBell, NotificationPage
│           │   └── user/           # UserProfileModal
│           ├── config/
│           │   └── muiTheme.js     # ← Centralized MUI design system
│           ├── pages/
│           │   ├── Exchange/       # ← P2P Exchange page (5 tabs)
│           │   ├── Friends/        # Friends + messaging
│           │   ├── Dashboard/      # Stats cards + active loans
│           │   ├── Books/          # Authenticated book catalog
│           │   ├── AboutPage.jsx   # Public about page
│           │   ├── ContactPage.jsx # Public contact page + form
│           │   └── PublicBooksPage.jsx  # Unauthenticated browse
│           ├── store/features/     # Redux slices + thunks per feature
│           └── utils/
│               ├── api.js          # Axios instance + JWT interceptors
│               └── groq.js         # Groq AI integration + system prompt builder
│
└── docs/
    ├── README.md           ← You are here
    ├── USER_GUIDE.md       ← End-user feature guide
    ├── DEVELOPER_GUIDE.md  ← Architecture, API reference, setup
    └── DATABASE.md         ← Full schema (22 tables) + DBML
```

---

## 📖 Documentation

| Document | Description |
|:---|:---|
| 📘 [USER_GUIDE.md](USER_GUIDE.md) | Complete end-user guide for all 12 feature areas |
| 🔧 [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) | Architecture deep-dive, API reference, business logic flows |
| 🗄️ [DATABASE.md](DATABASE.md) | All 22 tables documented + full DBML for dbdiagram.io |

---

## 📊 Performance

| Metric | Value |
|:---|:---|
| ⚡ Avg API response time | < 200 ms |
| 🏆 Lighthouse Performance | 91 / 100 |
| ♿ Lighthouse Accessibility | 88 / 100 |
| ✅ Lighthouse Best Practices | 95 / 100 |
| 🔍 Lighthouse SEO | 90 / 100 |
| ⏱️ Largest Contentful Paint | 1.3 s |
| 🟢 Uptime since deployment | 99.6% |

---

<div align="center">

**Built with ❤️ by Kylychbek Parpiev**  
Ala-Too International University · Bishkek, Kyrgyz Republic · 2026  
Supervisor: Talgat Mendekov

</div>
