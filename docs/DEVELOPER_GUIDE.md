# Kitep Space — Developer Guide

**Live:** [https://kitep.space](https://kitep.space)  
**Backend:** [https://librarymanagementsystem-production-fc6e.up.railway.app](https://librarymanagementsystem-production-fc6e.up.railway.app)

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Local Development Setup](#2-local-development-setup)
3. [Environment Variables](#3-environment-variables)
4. [Architecture Overview](#4-architecture-overview)
5. [Backend Architecture](#5-backend-architecture)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Authentication Flow](#7-authentication-flow)
8. [Key Business Logic](#8-key-business-logic)
9. [P2P Exchange Module](#9-p2p-exchange-module)
10. [AI Assistant Integration](#10-ai-assistant-integration)
11. [API Reference](#11-api-reference)
12. [Deployment](#12-deployment)

---

## 1. Project Structure

```
Library-Management-System/
├── source/
│   ├── Backend-springboot/          # Spring Boot REST API
│   │   └── src/main/java/com/kylych/
│   │       ├── configurations/      # Security, CORS, JWT filter
│   │       ├── controller/          # REST controllers
│   │       ├── service/             # Business logic (interface + impl)
│   │       ├── repository/          # Spring Data JPA repositories
│   │       ├── modal/               # JPA entities
│   │       ├── payload/             # DTOs, requests, responses
│   │       ├── domain/              # Enums
│   │       ├── exchange/            # P2P exchange sub-module
│   │       │   ├── controller/
│   │       │   ├── service/
│   │       │   ├── model/
│   │       │   ├── repository/
│   │       │   ├── dto/
│   │       │   └── domain/
│   │       ├── oauth2/              # Google OAuth2 handlers
│   │       ├── scheduler/           # Scheduled tasks
│   │       └── exception/           # Custom exceptions + global handler
│   │
│   └── Frontend-Vite/               # React 18 SPA
│       └── src/
│           ├── Admin/               # Admin dashboard pages + layout
│           ├── components/          # Shared UI components
│           │   ├── books/
│           │   ├── chat/            # AI Assistant widget
│           │   ├── layout/          # UserLayout, Sidebar, Navbar
│           │   ├── notification/
│           │   ├── reviews/
│           │   ├── subscriptions/
│           │   └── user/            # UserProfileModal
│           ├── config/              # MUI theme (muiTheme.js)
│           ├── contexts/            # ThemeContext
│           ├── pages/               # Page components by feature
│           │   ├── Books/
│           │   ├── Dashboard/
│           │   ├── Exchange/        # P2P Exchange page
│           │   ├── Friends/
│           │   ├── MyFines/
│           │   ├── MyLoan/
│           │   ├── Reservations/
│           │   ├── Wishlist/
│           │   ├── subscription/
│           │   ├── AboutPage.jsx    # Public about page
│           │   ├── ContactPage.jsx  # Public contact page
│           │   └── PublicBooksPage.jsx # Unauthenticated book browse
│           ├── store/               # Redux Toolkit store + slices
│           │   └── features/
│           │       ├── auth/
│           │       ├── books/
│           │       ├── bookLoans/
│           │       ├── exchange/    # P2P exchange state
│           │       ├── fines/
│           │       ├── friends/
│           │       ├── messages/
│           │       ├── notification/
│           │       ├── reservations/
│           │       ├── subscriptions/
│           │       └── wishlist/
│           └── utils/
│               ├── api.js           # Axios instance + JWT interceptors
│               └── groq.js          # Groq AI integration
└── docs/
    ├── README.md
    ├── USER_GUIDE.md
    ├── DEVELOPER_GUIDE.md
    └── DATABASE.md
```

---

## 2. Local Development Setup

### Prerequisites

- Java 21 (Amazon Corretto recommended)
- Node.js 20 LTS + npm
- Git

> The application connects to the Railway MySQL database by default — no local MySQL installation needed.

### Backend

```bash
cd source/Backend-springboot

# Run with Maven wrapper
./mvnw spring-boot:run

# API available at http://localhost:8080
# Swagger/Actuator: http://localhost:8080/actuator
```

The `application.properties` defaults connect to Railway MySQL via TCP proxy. Change `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` as environment variables if using a local database.

### Frontend

```bash
cd source/Frontend-Vite

npm install

# .env is already configured for local development
# VITE_API_BASE_URL=http://localhost:8080

npm run dev
# App at http://localhost:5173
```

When deploying to production, set `VITE_API_BASE_URL` to the Railway backend URL in Netlify dashboard.

---

## 3. Environment Variables

### Backend (`application.properties` / Railway)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Server port |
| `DB_HOST` | `monorail.proxy.rlwy.net` | MySQL host |
| `DB_PORT` | `47188` | MySQL port |
| `DB_NAME` | `railway` | Database name |
| `DB_USERNAME` | `root` | MySQL user |
| `DB_PASSWORD` | *(required)* | MySQL password |
| `MAIL_USERNAME` | *(empty)* | Gmail sender address |
| `MAIL_PASSWORD` | *(empty)* | Gmail app password |
| `GOOGLE_CLIENT_ID` | `dummy` | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | `dummy` | Google OAuth2 client secret |
| `FRONTEND_URL` | `http://localhost:5173` | Used for OAuth2 redirect and password reset emails |
| `BASE_URL` | `http://localhost:8080` | Used for OAuth2 redirect URI |

### Frontend (`.env`)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend base URL |
| `VITE_GROQ_API_KEY` | Groq API key for AI assistant |

---

## 4. Architecture Overview

```
[Browser] ──HTTPS──► [Netlify CDN] ──► React SPA (https://kitep.space)
    │
    │ REST API + JWT
    ▼
[Railway] ──► Spring Boot (port 8080)
    │
    │ JPA/JDBC
    ▼
[Railway] ──► MySQL 8

[Browser] ──HTTPS──► [Groq Cloud] ──► LLaMA 3.3 70B (AI assistant)
```

- **Frontend:** Single-Page Application, client-side routing, JWT stored in `localStorage`
- **Backend:** Stateless REST API, JWT validated on every protected request
- **Database:** `ddl-auto=update` — Hibernate manages schema automatically
- **CORS:** Two-layer — `CorsFixFilter` (highest precedence) + Spring Security CORS config

---

## 5. Backend Architecture

### Layers

| Layer | Package | Responsibility |
|---|---|---|
| Controller | `controller/` | HTTP routing, request/response mapping |
| Service | `service/impl/` | Business logic, transactions |
| Repository | `repository/` | JPA data access |
| Model | `modal/` | JPA entities (DB tables) |
| DTO | `payload/dto/` | Data transfer objects |
| Domain | `domain/` | Enums |
| Exception | `exception/` | Custom exceptions + `@RestControllerAdvice` |

### Security Filter Chain

```
Request → CorsFixFilter (HIGHEST_PRECEDENCE)
       → JwtValidator (before BasicAuthenticationFilter)
       → Spring Security authorization rules
       → Controller
```

**Public endpoints (no JWT required):**
- `GET /api/books/**`
- `GET /api/genres/**`
- `/auth/**`
- `/about`, `/contact` (static pages)

**Admin-only endpoints:**
- `/api/super-admin/**`

### Key Security Classes

| Class | Description |
|---|---|
| `JwtProvider` | Generates and validates HMAC-SHA256 signed JWT tokens (24h expiry) |
| `JwtValidator` | `OncePerRequestFilter` — extracts JWT, sets `SecurityContextHolder` |
| `CorsFixFilter` | `@Order(HIGHEST_PRECEDENCE)` — adds CORS headers before Spring Security |
| `CustomOAuth2UserService` | Handles Google OAuth2 user creation/update |
| `OAuth2LoginSuccessHandler` | Generates JWT after OAuth2 login, redirects to frontend callback |

---

## 6. Frontend Architecture

### State Management

Each feature has a dedicated Redux slice + thunk file:

```
store/features/
├── auth/          authSlice.js + authThunk.js
├── books/         bookSlice.js + bookThunk.js
├── bookLoans/     bookLoanSlice.js + bookLoanThunk.js
├── exchange/      exchangeSlice.js + exchangeThunk.js
├── fines/         fineSlice.js + fineThunk.js
├── friends/       friendSlice.js + friendThunk.js
├── messages/      messageSlice.js + messageThunk.js
├── notification/  notificationSlice.js + notificationThunk.js
├── reservations/  reservationSlice.js + reservationThunk.js
├── subscriptions/ subscriptionSlice.js + subscriptionThunk.js
└── wishlist/      wishlistSlice.js + wishlistThunk.js
```

### HTTP Client (`utils/api.js`)

- Axios instance with `baseURL` from `VITE_API_BASE_URL`
- **Request interceptor:** attaches `Authorization: Bearer <token>` from `localStorage`
- **Response interceptor:** clears token on 401, lets Redux redirect

### Design System (`config/muiTheme.js`)

Centralized MUI theme defining:
- **Primary:** `#4F46E5` (indigo) → `#7C3AED` (purple) gradient on buttons
- **Typography:** `clamp()` fluid sizes, Inter font
- **Components:** Cards (20px radius), Dialogs (24px radius), consistent focus rings
- **Breakpoints:** `xs:0, sm:480, md:768, lg:1024, xl:1280`

### Routing

```jsx
// Public (always accessible)
/about          → AboutPage
/contact        → ContactPage
/books          → PublicBooksPage (unauthenticated)

// Unauthenticated only
/               → LandingPage
/login          → Login
/register       → Register

// Authenticated users
/               → Dashboard
/books          → BooksPage (authenticated version)
/exchange       → ExchangePage
/friends        → FriendsPage
/my-loans       → MyLoansPage
/my-fines       → MyFinesPage
/subscriptions  → SubscriptionsPage
/wishlist       → WishlistPage
/my-reservations → ReservationsPage
/profile        → ProfilePage

// Admin only
/admin/**       → AdminLayout + admin pages
```

---

## 7. Authentication Flow

### Email/Password

```
POST /auth/login {email, password}
→ Server validates BCrypt hash
→ Returns { token: "eyJ..." }
→ Frontend stores in localStorage
→ Axios interceptor attaches to all subsequent requests
```

### Google OAuth2

```
User clicks "Continue with Google"
→ Browser navigates to /oauth2/authorization/google
→ Spring Security redirects to Google
→ User authenticates with Google
→ Google redirects to /login/oauth2/code/google
→ CustomOAuth2UserService creates/updates user
→ OAuth2LoginSuccessHandler generates JWT
→ Redirects to {FRONTEND_URL}/oauth2/callback?token=eyJ...
→ Frontend stores token, navigates to dashboard
```

---

## 8. Key Business Logic

### Book Borrowing Eligibility

```java
// In BookLoanService.checkoutBook()
1. Find active subscription → throw if none
2. Count active loans → throw if >= maxBooksAllowed
3. Check availableCopies > 0 → throw if not
4. Decrement availableCopies (within @Transactional)
5. Create BookLoan with status=CHECKED_OUT, dueDate=now+maxDaysPerBook
```

### Fine Calculation Scheduler

```
@Scheduled(cron = "0 0 2 * * ?") — daily at 02:00
For each loan where status=CHECKED_OUT AND dueDate < today:
  - Set status = OVERDUE, isOverdue = true
  - Create/update Fine record with amount = overdueDays × rate
```

### Reservation Queue

```
On book return:
  1. Find earliest PENDING reservation for this book
  2. Set status = AVAILABLE
  3. Set availableUntil = now + 72h
  4. Send email notification to reservation holder
  5. Do NOT increment availableCopies (held for reservation holder)
On reservation expiry (scheduled task):
  6. Set status = EXPIRED
  7. Increment availableCopies
```

---

## 9. P2P Exchange Module

The exchange feature lives in `com.kylych.exchange` — a self-contained sub-module.

### Package Structure

```
exchange/
├── domain/    ExchangeBookStatus, ExchangeRequestStatus,
│              ExchangeBorrowStatus, ExchangeDepositStatus,
│              BookCondition, ExchangeReportReason, ExchangeReportStatus
├── model/     ExchangeBook, ExchangeRequest, ExchangeBorrowRecord,
│              ExchangeDeposit, UserReputation, ExchangeReport
├── repository/ (Spring Data JPA repositories for each model)
├── dto/       ExchangeBookDTO, ExchangeRequestDTO,
│              ExchangeBorrowRecordDTO, UserReputationDTO,
│              ExchangeReportDTO, CreateExchangeBookRequest,
│              ExchangeRatingRequest, ExchangeReportRequest
├── service/   ExchangeBookService, ExchangeRequestService,
│              ExchangeBorrowService, ExchangeReputationService,
│              ExchangeReportService, ExchangeOverdueScheduler
└── controller/ ExchangeBookController, ExchangeRequestController,
                ExchangeBorrowController, ExchangeReportController,
                ExchangeAdminController
```

### Deposit Flow

```
Owner accepts request:
  ExchangeReputationService.lockDeposit(borrower, 500)
  → if balance < 500: throw IllegalStateException
  → decrement exchangeBalance by 500
  → create ExchangeDeposit{status=LOCKED}
  → create ExchangeBorrowRecord

Borrower returns on time:
  ExchangeReputationService.releaseDeposit(borrower, 500)
  → increment exchangeBalance by 500
  → set ExchangeDeposit{status=RELEASED}

Daily scheduler (02:30):
  For each ACTIVE borrow where dueDate < today:
    → set ExchangeDeposit{status=FORFEITED}
    → applyPenalty(borrower, 2 points)
    → if penaltyPoints >= 10: blockedFromExchange = true
```

---

## 10. AI Assistant Integration

File: `src/utils/groq.js`

```
User sends message
→ Extract keywords (words > 3 chars)
→ Promise.all([
    GET /api/books?search={keywords},
    GET /api/book-loans/my,
    GET /api/fines/my?status=PENDING,
    GET /api/subscriptions/user/active
  ])
→ buildSystemPrompt({ books, loans, fines, subscription })
  (injects live data as structured text)
→ POST https://api.groq.com/openai/v1/chat/completions
  { model: "llama-3.3-70b-versatile", messages: [...history, userMsg] }
→ Display response in chat widget
```

The system prompt explicitly constrains the model to answer **only from the provided data**, preventing hallucination.

---

## 11. API Reference

### Public Endpoints (no auth)

| Method | Path | Description |
|---|---|---|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login — returns JWT |
| POST | `/auth/forgot-password` | Send reset email |
| POST | `/auth/reset-password` | Reset password with token |
| GET | `/api/books` | List/search books (paginated) |
| GET | `/api/books/{id}` | Get single book |
| GET | `/api/genres/active` | Get active genres |

### Authenticated Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/users/profile` | Get current user |
| PUT | `/api/users/profile` | Update profile |
| GET | `/api/users/{id}/public-profile` | Public profile + reputation |
| GET | `/api/book-loans/my` | Get my loans |
| POST | `/api/book-loans/checkout/{bookId}` | Borrow a book |
| PUT | `/api/book-loans/{id}/return` | Return a book |
| PUT | `/api/book-loans/{id}/renew` | Renew a loan |
| GET | `/api/fines/my` | Get my fines |
| GET | `/api/subscriptions/plans` | Get all plans |
| GET | `/api/subscriptions/user/active` | Get active subscription |
| POST | `/api/subscriptions/subscribe/{planId}` | Purchase subscription |
| GET | `/api/reservations/my` | Get my reservations |
| POST | `/api/reservations` | Reserve a book |
| GET | `/api/exchange/books` | P2P marketplace |
| GET | `/api/exchange/books/my` | My listed books |
| GET | `/api/exchange/books/balance` | My coin balance |
| POST | `/api/exchange/books` | List a book |
| PATCH | `/api/exchange/books/{id}/toggle` | Toggle availability |
| DELETE | `/api/exchange/books/{id}` | Remove listing |
| POST | `/api/exchange/requests/{bookId}` | Send borrow request |
| PUT | `/api/exchange/requests/{id}/accept` | Accept request |
| PUT | `/api/exchange/requests/{id}/reject` | Reject request |
| PUT | `/api/exchange/requests/{id}/cancel` | Cancel request |
| GET | `/api/exchange/requests/my` | My sent requests |
| GET | `/api/exchange/requests/incoming` | Incoming requests |
| GET | `/api/exchange/borrows/my` | Books I borrowed |
| GET | `/api/exchange/borrows/my-lends` | Books I lent |
| PUT | `/api/exchange/borrows/{id}/return` | Return a book |
| POST | `/api/exchange/borrows/{id}/rate-lender` | Rate the lender |
| POST | `/api/exchange/borrows/{id}/rate-borrower` | Rate the borrower |
| POST | `/api/friends/request/{id}` | Send friend request |
| PUT | `/api/friends/accept/{id}` | Accept friend request |
| GET | `/api/friends/my` | Get friends list |
| GET | `/api/friends/search?q=` | Search users |
| GET | `/api/messages/conversations` | Get conversations |
| POST | `/api/messages/send/{receiverId}` | Send message |
| GET | `/api/messages/conversation/{userId}` | Get messages with user |

### Admin Endpoints (`/api/super-admin/**`)

| Method | Path | Description |
|---|---|---|
| GET | `/api/super-admin/exchange/reports` | All exchange reports |
| PUT | `/api/super-admin/exchange/reports/{id}/resolve` | Resolve a report |
| GET | `/api/super-admin/exchange/reputations` | All user reputations |
| PUT | `/api/super-admin/exchange/users/{id}/block` | Block user from exchange |
| PUT | `/api/super-admin/exchange/users/{id}/unblock` | Unblock user |
| PUT | `/api/super-admin/exchange/users/{id}/grant-balance` | Grant coins to user |
| GET | `/api/super-admin/exchange/borrows` | All exchange borrows |

---

## 12. Deployment

### Frontend (Netlify)

```yaml
Build command: npm run build
Publish directory: dist
```

**Environment variables (Netlify dashboard):**
```
VITE_API_BASE_URL=https://librarymanagementsystem-production-fc6e.up.railway.app
VITE_GROQ_API_KEY=your_groq_key
```

**Custom domain:** Configure `kitep.space` in Netlify → Domain management → Add custom domain.

`public/_redirects`:
```
/* /index.html 200
```

### Backend (Railway)

1. Connect GitHub repo → Railway auto-detects Maven → builds with Nixpacks
2. Add MySQL service in same project
3. Set environment variables using Railway variable references:
   ```
   DB_HOST=${{MySQL.RAILWAY_TCP_PROXY_DOMAIN}}
   DB_PORT=${{MySQL.RAILWAY_TCP_PROXY_PORT}}
   DB_NAME=${{MySQL.MYSQL_DATABASE}}
   DB_USERNAME=${{MySQL.MYSQLUSER}}
   DB_PASSWORD=${{MySQL.MYSQL_ROOT_PASSWORD}}
   FRONTEND_URL=https://kitep.space
   BASE_URL=https://librarymanagementsystem-production-fc6e.up.railway.app
   ```

> **Important:** Use the TCP proxy domain/port, NOT the internal `mysql.railway.internal` hostname — the internal hostname only resolves within Railway's private network.

### After Deployment

Hibernate `ddl-auto=update` creates/updates all tables on startup automatically. For schema changes that Hibernate cannot handle automatically (e.g., column type changes), run the ALTER TABLE manually:

```sql
-- Example: widening a column
ALTER TABLE exchange_books MODIFY COLUMN cover_image_url LONGTEXT;
```
