<div align="center">

# 🔧 Kitep Space — Developer Guide

[![Live](https://img.shields.io/badge/🌐%20Live-kitep.space-4F46E5?style=for-the-badge)](https://kitep.space)
[![Backend](https://img.shields.io/badge/⚙️%20API-Railway-0B0D0E?style=for-the-badge&logo=railway)](https://librarymanagementsystem-production-fc6e.up.railway.app)

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-20%20LTS-339933?style=flat-square&logo=nodedotjs&logoColor=white)

</div>

---

## 📋 Table of Contents

- [📁 Project Structure](#-project-structure)
- [🚀 Local Setup](#-local-setup)
- [🔑 Environment Variables](#-environment-variables)
- [🏗 Architecture Overview](#-architecture-overview)
- [⚙️ Backend Architecture](#-backend-architecture)
- [🎨 Frontend Architecture](#-frontend-architecture)
- [🔐 Authentication Flows](#-authentication-flows)
- [💡 Key Business Logic](#-key-business-logic)
- [🔄 P2P Exchange Module](#-p2p-exchange-module)
- [🤖 AI Assistant Integration](#-ai-assistant-integration)
- [📡 API Reference](#-api-reference)
- [☁️ Deployment Guide](#-deployment-guide)

---

## 📁 Project Structure

```
Library-Management-System/
├── source/
│   ├── Backend-springboot/
│   │   └── src/main/java/com/kylych/
│   │       ├── configurations/        # SecurityConfig, CorsFixFilter, JwtValidator
│   │       ├── controller/            # REST controllers
│   │       ├── service/impl/          # Business logic
│   │       ├── repository/            # Spring Data JPA
│   │       ├── modal/                 # JPA entities
│   │       ├── payload/               # DTOs, requests, responses
│   │       ├── domain/                # Enums
│   │       ├── exchange/              # ← P2P Exchange sub-module
│   │       │   ├── controller/        #   5 controllers
│   │       │   ├── service/           #   6 services + scheduler
│   │       │   ├── model/             #   6 entities
│   │       │   ├── repository/        #   5 repositories
│   │       │   ├── dto/               #   DTOs + request classes
│   │       │   └── domain/            #   7 status enums
│   │       ├── oauth2/                # Google OAuth2 handlers
│   │       ├── scheduler/             # Loan + subscription schedulers
│   │       └── exception/             # GlobalExceptionHandler
│   │
│   └── Frontend-Vite/
│       └── src/
│           ├── Admin/                 # Admin dashboard + layout
│           ├── components/
│           │   ├── books/             # BookCard, CheckoutDialog, GenreFilter
│           │   ├── chat/              # ChatAssistant.jsx (AI widget)
│           │   ├── layout/            # UserLayout, SidebarDrawer, Navbar
│           │   ├── notification/      # NotificationBell
│           │   └── user/              # UserProfileModal
│           ├── config/
│           │   └── muiTheme.js        # ← Centralized MUI design system
│           ├── pages/
│           │   ├── Exchange/          # ← P2P Exchange (5 tabs)
│           │   ├── Friends/           # Friends + messaging
│           │   ├── Dashboard/         # Stats + active loans
│           │   ├── Books/             # Authenticated catalog
│           │   ├── AboutPage.jsx      # Public
│           │   ├── ContactPage.jsx    # Public + contact form
│           │   └── PublicBooksPage.jsx # Unauthenticated browse
│           ├── store/features/        # Redux slices + thunks (11 features)
│           └── utils/
│               ├── api.js             # Axios + JWT interceptors
│               └── groq.js            # Groq AI + system prompt builder
│
└── docs/
    ├── README.md          ← Project overview + badges
    ├── USER_GUIDE.md      ← End-user feature guide
    ├── DEVELOPER_GUIDE.md ← You are here
    └── DATABASE.md        ← Full schema (22 tables) + DBML
```

---

## 🚀 Local Setup

### Prerequisites

| Tool | Version |
|:---|:---:|
| Java JDK | 21 LTS |
| Node.js | 20 LTS |
| Git | latest |

> ✅ **No local MySQL needed** — the app connects to Railway MySQL by default.

### Backend

```bash
cd source/Backend-springboot
./mvnw spring-boot:run
# API ready at http://localhost:8080
```

### Frontend

```bash
cd source/Frontend-Vite
npm install
npm run dev
# App ready at http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend

| Variable | Default | Description |
|:---|:---|:---|
| `DB_HOST` | `monorail.proxy.rlwy.net` | MySQL TCP proxy host |
| `DB_PORT` | `47188` | MySQL TCP proxy port |
| `DB_NAME` | `railway` | Database name |
| `DB_USERNAME` | `root` | MySQL username |
| `DB_PASSWORD` | *(required)* | MySQL password |
| `MAIL_USERNAME` | *(empty)* | Gmail sender address |
| `MAIL_PASSWORD` | *(empty)* | Gmail app password |
| `GOOGLE_CLIENT_ID` | `dummy` | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | `dummy` | Google OAuth2 secret |
| `FRONTEND_URL` | `http://localhost:5173` | OAuth2 redirect + reset email links |
| `BASE_URL` | `http://localhost:8080` | OAuth2 redirect URI base |

### Frontend (`.env`)

| Variable | Description |
|:---|:---|
| `VITE_API_BASE_URL` | Backend URL |
| `VITE_GROQ_API_KEY` | Groq API key |

---

## 🏗 Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                      BROWSER                              │
│  React SPA (Redux + MUI + Tailwind)                       │
│   │  REST + JWT                   │ Groq API (direct)     │
└───┼───────────────────────────────┼───────────────────────┘
    │                               │
    ▼                               ▼
┌─────────────────────┐    ┌────────────────────┐
│  Railway            │    │  Groq Cloud         │
│  Spring Boot 3.5    │    │  LLaMA 3.3 70B      │
│  ┌───────────────┐  │    └────────────────────┘
│  │  MySQL 8      │  │
│  │  22 tables    │  │
│  └───────────────┘  │
└─────────────────────┘
```

**Key decisions:**
- 🔒 **Stateless REST** — JWT on every request, no server sessions
- 🚀 **SPA** — all 404s → `index.html` via Netlify `_redirects`
- 🤖 **AI in browser** — Groq calls go browser→Groq (no backend latency)
- 🛡️ **Two-layer CORS** — `@Order(HIGHEST_PRECEDENCE)` filter + Spring Security CORS
- ⏰ **Schedulers** — `02:00` fine calc, `02:30` exchange overdue check

---

## ⚙️ Backend Architecture

### Security Filter Chain

```
Request
  │
  ▼
CorsFixFilter (@Order HIGHEST_PRECEDENCE)
  → Adds Access-Control-* to ALL responses (including 500 errors)
  → Handles OPTIONS preflight → 200 OK immediately
  │
  ▼
JwtValidator (OncePerRequestFilter)
  → Extracts Bearer token from Authorization header
  → Validates HMAC-SHA256 + expiry
  → Sets SecurityContextHolder
  │
  ▼
Spring Security Authorization
  → GET /api/books/**, GET /api/genres/** → permitAll
  → /auth/**                              → permitAll
  → /api/super-admin/**                   → hasRole("ADMIN")
  → /api/**                               → authenticated
  │
  ▼
Controller
```

### Scheduled Tasks

| Scheduler | Cron | Action |
|:---|:---|:---|
| `BookLoanScheduler` | `0 0 2 * * ?` | Marks overdue loans, creates Fine records |
| `SubscriptionScheduler` | `0 0 2 * * ?` | Sets expired subscriptions `isActive=false` |
| `ExchangeOverdueScheduler` | `0 30 2 * * ?` | Marks exchange borrows overdue, forfeits deposits, applies penalty points |

---

## 🎨 Frontend Architecture

### MUI Design System (`config/muiTheme.js`)

| Token | Value |
|:---|:---|
| Primary | `#4F46E5` (indigo) |
| Secondary | `#7C3AED` (purple) |
| Button gradient | `linear-gradient(135deg, #4F46E5, #7C3AED)` |
| Card radius | `20px` |
| Dialog radius | `24px` |
| Font | Inter (Google Fonts) |
| Breakpoints | `xs:0 sm:480 md:768 lg:1024 xl:1280` |

### HTTP Client (`utils/api.js`)

```javascript
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

// Auto-attach JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Clear token on 401
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) localStorage.removeItem('jwt');
    return Promise.reject(err);
  }
);
```

---

## 🔐 Authentication Flows

### Email/Password

```
POST /auth/login { email, password }
  → Validate BCrypt hash
  → Return { token: "eyJ..." }
  → Frontend: localStorage.setItem('jwt', token)
  → Axios interceptor attaches to all future requests
```

### Google OAuth2

```
Click "Continue with Google"
  → /oauth2/authorization/google
  → Spring Security → Google login page
  → User authenticates
  → Google → /login/oauth2/code/google?code=...
  → CustomOAuth2UserService:
      If new user    → CREATE account (provider=GOOGLE)
      If first login → update name/photo from Google
      If returning   → leave name/photo unchanged
  → OAuth2LoginSuccessHandler → issue JWT
  → Redirect to {FRONTEND_URL}/oauth2/callback?token=eyJ...
  → Frontend stores token, navigates to dashboard
```

---

## 💡 Key Business Logic

### Borrowing Eligibility

```java
@Transactional
public BookLoanDTO checkoutBook(Long bookId, User user) {
    // 1. Active subscription
    Subscription sub = subscriptionRepo.findActiveByUser(user)
        .orElseThrow(() -> new SubscriptionException("No subscription"));

    // 2. Borrowing limit
    if (loanRepo.countActive(user) >= sub.getMaxBooksAllowed())
        throw new BookLoanException("Limit reached");

    // 3. Availability (atomic decrement)
    Book book = bookRepo.findById(bookId).orElseThrow(...);
    if (book.getAvailableCopies() <= 0)
        throw new BookLoanException("Not available");

    book.setAvailableCopies(book.getAvailableCopies() - 1);
    bookRepo.save(book);

    return mapper.toDTO(loanRepo.save(BookLoan.builder()
        .user(user).book(book).status(CHECKED_OUT)
        .dueDate(LocalDate.now().plusDays(sub.getMaxDaysPerBook()))
        .build()));
}
```

### Reservation Queue

```
Book returned
  │
  ├─ Increment availableCopies
  │
  └─ Check for earliest PENDING reservation
        │
        ├─ None → book freely available
        │
        └─ Found → status=AVAILABLE, availableUntil=now+72h
                   Send email notification
                   Do NOT increment copies (held for holder)
```

---

## 🔄 P2P Exchange Module

### Complete Flow

```
1. List book      → ExchangeBook{status=AVAILABLE}
2. Send request   → ExchangeRequest{status=PENDING}
                     ExchangeBook{status=REQUESTED}
3. Accept         → lockDeposit(borrower, 500 coins)
                     ExchangeDeposit{status=LOCKED}
                     ExchangeBorrowRecord{status=ACTIVE}
                     ExchangeBook{status=BORROWED}
4. Return         → releaseDeposit(borrower, 500 coins)
                     ExchangeDeposit{status=RELEASED}
                     ExchangeBorrowRecord{status=RETURNED}
                     ExchangeBook{status=AVAILABLE} ← auto-relisted
5. Daily 02:30    → if dueDate < today:
                       ExchangeDeposit{status=FORFEITED}
                       applyPenalty(borrower, 2 pts)
                       if penaltyPts >= 10: blocked=true
6. Rate           → rolling avg: score = score*0.8 + rating*0.2
```

### Deposit Logic

```java
// Lock (on accept)
public void lockDeposit(User user, long amount) {
    UserReputation rep = getOrCreate(user);
    if (rep.getExchangeBalance() < amount)
        throw new IllegalStateException("Insufficient balance. Need "
            + amount + " coins, have " + rep.getExchangeBalance());
    rep.setExchangeBalance(rep.getExchangeBalance() - amount);
    reputationRepository.save(rep);
}

// Release (on return)
public void releaseDeposit(User user, long amount) {
    UserReputation rep = getOrCreate(user);
    rep.setExchangeBalance(rep.getExchangeBalance() + amount);
    reputationRepository.save(rep);
}
```

---

## 🤖 AI Assistant Integration

```javascript
// utils/groq.js — called on every user message
async function getAIResponse(message, history) {

  // Step 1: Parallel fetch live user data
  const keywords = message.split(' ').filter(w => w.length > 3);
  const [books, loans, fines, subscription] = await Promise.all([
    api.get(`/api/books?search=${keywords.join('+')}&size=5`),
    api.get('/api/book-loans/my?size=100'),
    api.get('/api/fines/my?status=PENDING'),
    api.get('/api/subscriptions/user/active').catch(() => ({ data: null })),
  ]);

  // Step 2: Build system prompt with live data
  const systemPrompt = `You are a library assistant at Kitep Space.
ACTIVE LOANS: ${loans.data.content.map(l =>
  `"${l.book.title}" due ${l.dueDate} (${l.status})`).join(', ') || 'None'}
FINES: ${fines.data.map(f =>
  `${f.amount} coins (${f.status})`).join(', ') || 'None'}
SUBSCRIPTION: ${subscription.data?.planName || 'None'}
BOOKS FOUND: ${books.data.content?.map(b =>
  `"${b.title}" by ${b.author} (${b.availableCopies > 0 ? 'Available' : 'Checked Out'})`
).join(', ') || 'None'}
Answer ONLY from the data above. Be concise and friendly.`;

  // Step 3: Groq API call (OpenAI-compatible)
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: message },
      ],
    }),
  });

  return (await res.json()).choices[0].message.content;
}
```

---

## 📡 API Reference

### Public (No Auth)

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/auth/signup` | Register |
| `POST` | `/auth/login` | Login → JWT |
| `POST` | `/auth/forgot-password` | Send reset email |
| `GET` | `/api/books` | Book catalog (paginated, searchable) |
| `GET` | `/api/books/{id}` | Single book |
| `GET` | `/api/genres/active` | Active genres |

### Authenticated

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/users/profile` | Current user |
| `PUT` | `/api/users/profile` | Update profile |
| `GET` | `/api/users/{id}/public-profile` | Any user's public profile |
| `GET` | `/api/book-loans/my` | My loans |
| `POST` | `/api/book-loans/checkout/{bookId}` | Borrow |
| `PUT` | `/api/book-loans/{id}/return` | Return |
| `PUT` | `/api/book-loans/{id}/renew` | Renew |
| `GET` | `/api/fines/my` | My fines |
| `GET` | `/api/subscriptions/user/active` | Active subscription |
| `POST` | `/api/subscriptions/subscribe/{planId}` | Subscribe |
| `GET` | `/api/exchange/books` | Marketplace |
| `GET` | `/api/exchange/books/balance` | My coin balance |
| `POST` | `/api/exchange/books` | List a book |
| `PATCH` | `/api/exchange/books/{id}/toggle` | Toggle availability |
| `POST` | `/api/exchange/requests/{bookId}` | Send request |
| `PUT` | `/api/exchange/requests/{id}/accept` | Accept (locks deposit) |
| `PUT` | `/api/exchange/requests/{id}/reject` | Reject |
| `PUT` | `/api/exchange/borrows/{id}/return` | Return (releases deposit) |
| `POST` | `/api/exchange/borrows/{id}/rate-lender` | Rate lender |
| `POST` | `/api/exchange/borrows/{id}/rate-borrower` | Rate borrower |
| `POST` | `/api/friends/request/{id}` | Add friend |
| `GET` | `/api/friends/my` | Friends list |
| `GET` | `/api/messages/conversations` | All conversations |
| `POST` | `/api/messages/send/{receiverId}` | Send message |

### Admin Only (`/api/super-admin/**`)

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/super-admin/exchange/reports` | All reports |
| `PUT` | `/api/super-admin/exchange/reports/{id}/resolve` | Resolve report |
| `GET` | `/api/super-admin/exchange/reputations` | User reputations |
| `PUT` | `/api/super-admin/exchange/users/{id}/block` | Block from exchange |
| `PUT` | `/api/super-admin/exchange/users/{id}/unblock` | Unblock |
| `PUT` | `/api/super-admin/exchange/users/{id}/grant-balance` | Grant coins |

---

## ☁️ Deployment Guide

### Netlify (Frontend)

```
Build command:  npm run build
Publish dir:    dist
Node version:   20
```

Environment variables in Netlify dashboard:
```
VITE_API_BASE_URL = https://librarymanagementsystem-production-fc6e.up.railway.app
VITE_GROQ_API_KEY = gsk_xxxxxxxx
```

Custom domain: Netlify → Domain management → Add `kitep.space`

### Railway (Backend)

```
DB_HOST     = ${{MySQL.RAILWAY_TCP_PROXY_DOMAIN}}
DB_PORT     = ${{MySQL.RAILWAY_TCP_PROXY_PORT}}
DB_NAME     = ${{MySQL.MYSQL_DATABASE}}
DB_USERNAME = ${{MySQL.MYSQLUSER}}
DB_PASSWORD = ${{MySQL.MYSQL_ROOT_PASSWORD}}
FRONTEND_URL = https://kitep.space
BASE_URL     = https://librarymanagementsystem-production-fc6e.up.railway.app
```

> ⚠️ Use `RAILWAY_TCP_PROXY_DOMAIN` — NOT `mysql.railway.internal`. The internal hostname only resolves within Railway's private network and causes startup failures from outside.

### Manual DB Migrations

Hibernate `ddl-auto=update` handles most schema changes. For column type changes:

```sql
-- Widen cover_image_url (was VARCHAR 500, needs TEXT for base64)
ALTER TABLE exchange_books MODIFY COLUMN cover_image_url LONGTEXT;

-- Verify exchange tables were created correctly
SHOW COLUMNS FROM exchange_books;
SHOW COLUMNS FROM exchange_deposits;
SHOW COLUMNS FROM user_reputations;
```

---

<div align="center">

**Kitep Space** · Ala-Too International University · Bishkek, Kyrgyz Republic · 2026
Author: **Kylychbek Parpiev** · Supervisor: **Talgat Mendekov**

</div>
