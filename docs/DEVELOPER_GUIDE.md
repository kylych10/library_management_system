# Developer Guide — Library Management System

This guide covers the technical architecture, local setup, API reference, Redux store structure, and deployment procedures for the Library Management System.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Local Development Setup](#2-local-development-setup)
3. [Environment Variables](#3-environment-variables)
4. [Backend Architecture](#4-backend-architecture)
5. [REST API Reference](#5-rest-api-reference)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Redux Store Structure](#7-redux-store-structure)
8. [Key Design Decisions](#8-key-design-decisions)
9. [Deployment Guide](#9-deployment-guide)
10. [CORS Configuration](#10-cors-configuration)

---

## 1. Project Structure

### 1.1 Top-Level Layout

```
Library Management System/
├── docs/                              # Documentation (this directory)
│   ├── README.md
│   ├── USER_GUIDE.md
│   ├── DEVELOPER_GUIDE.md
│   └── DATABASE.md
└── source/
    ├── Backend-springboot/            # Spring Boot REST API
    └── Frontend-Vite/                 # React + Vite SPA
```

---

### 1.2 Backend Directory Tree

```
source/Backend-springboot/
├── pom.xml                            # Maven build descriptor
└── src/
    └── main/
        ├── java/com/kylych/
        │   ├── LibraryManagementSystemApplication.java   # Entry point
        │   ├── config/                # Security, CORS, OAuth2, Mail configs
        │   ├── controller/            # REST controllers (HTTP layer)
        │   │   ├── AuthController.java
        │   │   ├── BookController.java
        │   │   ├── BookLoanController.java
        │   │   ├── FriendshipController.java
        │   │   ├── MessageController.java
        │   │   ├── SubscriptionController.java
        │   │   └── ...                # Other controllers
        │   ├── domain/                # Enums / domain types
        │   │   ├── AuthProvider.java
        │   │   ├── BookLoanStatus.java
        │   │   ├── BookLoanType.java
        │   │   ├── FineStatus.java
        │   │   ├── FineType.java
        │   │   ├── FriendshipStatus.java
        │   │   ├── NotificationType.java
        │   │   ├── ReservationStatus.java
        │   │   └── UserRole.java
        │   ├── exception/             # Custom exception classes
        │   ├── modal/                 # JPA entity classes
        │   │   ├── Book.java
        │   │   ├── BookLoan.java
        │   │   ├── BookReview.java
        │   │   ├── Fine.java
        │   │   ├── Friendship.java
        │   │   ├── Genre.java
        │   │   ├── Message.java
        │   │   ├── Notification.java
        │   │   ├── Reservation.java
        │   │   ├── Subscription.java
        │   │   ├── SubscriptionPlan.java
        │   │   ├── User.java
        │   │   └── Wishlist.java
        │   ├── payload/               # DTOs and request/response objects
        │   │   ├── dto/               # Data Transfer Objects
        │   │   ├── request/           # Incoming request payloads
        │   │   └── response/          # Outgoing response payloads
        │   ├── repository/            # Spring Data JPA repositories
        │   ├── security/              # JWT filter, UserDetailsService
        │   └── service/               # Business logic layer
        └── resources/
            └── application.properties # Configuration and env var bindings
```

---

### 1.3 Frontend Directory Tree

```
source/Frontend-Vite/
├── package.json                       # npm dependencies
├── vite.config.js                     # Vite build configuration
├── index.html                         # HTML entry point
└── src/
    ├── App.jsx                        # Root component with routing
    ├── App.css                        # Global styles
    ├── main.jsx                       # React DOM entry point
    ├── Admin/                         # Admin-only UI
    │   ├── layout/
    │   │   └── AdminLayout.jsx
    │   └── pages/
    │       ├── AdminDashboard.jsx
    │       ├── AdminProfilePage.jsx
    │       ├── books/AdminBooksPage.jsx
    │       ├── bookLoans/AdminBookLoansPage.jsx
    │       ├── fines/AdminFinesPage.jsx
    │       ├── genres/AdminGenresPage.jsx
    │       ├── payments/AdminPaymentsPage.jsx
    │       ├── reservations/AdminReservationsPage.jsx
    │       ├── bookReviews/AdminBookReviewsPage.jsx
    │       ├── subscriptions/
    │       │   ├── AdminSubscriptionPlansPage.jsx
    │       │   └── AdminUserSubscriptionsPage.jsx
    │       └── users/AdminUsersPage.jsx
    ├── components/                    # Shared/reusable components
    │   ├── layout/
    │   │   └── UserLayout.jsx
    │   └── notification/
    │       └── NotificationPage.jsx
    ├── pages/                         # User-facing pages
    │   ├── LandingPage.jsx
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   ├── ForgotPassword.jsx
    │   ├── ResetPassword.jsx
    │   ├── OAuth2Callback.jsx
    │   ├── ProfilePage.jsx
    │   ├── SettingsPage.jsx
    │   ├── PaymentSuccess.jsx
    │   ├── BookDetailsPage.jsx
    │   ├── Books/BooksPage.jsx
    │   ├── Dashboard/Dashboard.jsx
    │   ├── MyLoan/MyLoansPage.jsx
    │   ├── MyFines/MyFinesPage.jsx
    │   ├── Reservations/ReservationsPage.jsx
    │   ├── subscription/SubscriptionsPage.jsx
    │   ├── Wishlist/WishlistPage.jsx
    │   └── Friends/FriendsPage.jsx
    └── store/                         # Redux Toolkit state management
        ├── store.js                   # Store configuration
        ├── hooks/useRedux.js          # Typed hooks
        └── features/
            ├── auth/
            ├── books/
            ├── bookLoans/
            ├── fines/
            ├── friends/
            ├── genres/
            ├── messages/
            ├── notification/
            ├── notifications/
            ├── payments/
            ├── reservations/
            ├── reviews/
            ├── subscriptions/
            ├── subscriptionPlans/
            └── wishlist/
```

---

## 2. Local Development Setup

### 2.1 Prerequisites

| Tool | Minimum Version | Notes |
|---|---|---|
| Java JDK | 17 | Required for Spring Boot 3.x |
| Maven | 3.8 | Or use the `mvnw` wrapper included |
| Node.js | 18 | LTS recommended |
| npm | 9 | Comes with Node.js 18+ |
| MySQL | 8.0 | Local instance or Docker |
| Git | Any | For cloning the repository |

---

### 2.2 Database Setup

```sql
-- Connect to MySQL as root and create the database
CREATE DATABASE library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'library_user'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON library_db.* TO 'library_user'@'localhost';
FLUSH PRIVILEGES;
```

Hibernate's `ddl-auto=update` will create all tables automatically on first boot.

---

### 2.3 Running the Backend

```bash
cd "source/Backend-springboot"

# Export required environment variables (Linux/macOS)
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=library_db
export DB_USERNAME=library_user
export DB_PASSWORD=yourpassword
export MAIL_USERNAME=your@gmail.com
export MAIL_PASSWORD=your-gmail-app-password
export GOOGLE_CLIENT_ID=your-google-oauth-client-id
export GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
export BASE_URL=http://localhost:8080
export FRONTEND_URL=http://localhost:5173

# Run with Maven wrapper
./mvnw spring-boot:run

# Or with system Maven
mvn spring-boot:run
```

The API server starts on **port 8080** by default. The port is configurable via the `PORT` environment variable.

---

### 2.4 Running the Frontend

```bash
cd "source/Frontend-Vite"

# Install dependencies
npm install

# Create a .env file
echo "VITE_API_URL=http://localhost:8080" > .env

# Start the development server
npm run dev
```

The Vite dev server starts on **port 5173** by default and supports Hot Module Replacement (HMR).

---

### 2.5 Building for Production

```bash
# Backend — produce an executable JAR
cd source/Backend-springboot
mvn clean package -DskipTests
# Output: target/Library-Management-System-0.0.1-SNAPSHOT.jar

# Frontend — produce optimised static assets
cd source/Frontend-Vite
npm run build
# Output: dist/ directory (upload to Netlify or any static host)
```

---

## 3. Environment Variables

### 3.1 Backend Environment Variables

All backend configuration is defined in `application.properties` and read from environment variables at runtime.

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `8080` | HTTP port the server listens on |
| `DB_HOST` | Yes | — | MySQL server hostname or IP |
| `DB_PORT` | Yes | — | MySQL server port (typically 3306) |
| `DB_NAME` | Yes | — | MySQL database name |
| `DB_USERNAME` | Yes | — | MySQL user |
| `DB_PASSWORD` | Yes | — | MySQL password |
| `MAIL_USERNAME` | Yes | — | Gmail address for sending emails |
| `MAIL_PASSWORD` | Yes | — | Gmail App Password (not account password) |
| `GOOGLE_CLIENT_ID` | Yes | — | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | — | Google OAuth2 client secret |
| `BASE_URL` | Yes | — | Public URL of the backend (used for OAuth2 redirect URI) |
| `FRONTEND_URL` | No | `http://localhost:5173` | Frontend base URL (used in password reset emails) |

> **Gmail App Password:** Enable 2-factor authentication on your Google account and generate an App Password at https://myaccount.google.com/apppasswords. Use that 16-character code as `MAIL_PASSWORD`.

---

### 3.2 Frontend Environment Variables (VITE_*)

Vite exposes only variables prefixed with `VITE_` to client-side code.

| Variable | Required | Example | Description |
|---|---|---|---|
| `VITE_API_URL` | Yes | `https://...railway.app` | Base URL of the Spring Boot backend API |

Create a `.env` file in `source/Frontend-Vite/`:

```env
VITE_API_URL=https://librarymanagementsystem-production-fc6e.up.railway.app
```

For local development:

```env
VITE_API_URL=http://localhost:8080
```

---

## 4. Backend Architecture

### 4.1 Layered Architecture

The backend follows the standard Spring Boot layered (n-tier) architecture:

```
HTTP Request
     │
     ▼
┌──────────────────────────────────────┐
│           Controller Layer            │
│  @RestController classes              │
│  - Input validation (@Valid)          │
│  - Auth enforcement (@PreAuthorize)   │
│  - Request routing                    │
│  - Response wrapping                  │
└───────────────────┬──────────────────┘
                    │ calls service methods
                    ▼
┌──────────────────────────────────────┐
│            Service Layer              │
│  @Service classes                     │
│  - Business logic                     │
│  - Transaction management (@Transact.)│
│  - DTO mapping                        │
│  - Exception throwing                 │
└───────────────────┬──────────────────┘
                    │ calls repositories
                    ▼
┌──────────────────────────────────────┐
│          Repository Layer             │
│  @Repository / JpaRepository<E, ID>  │
│  - Spring Data JPA query methods      │
│  - Custom @Query annotations          │
│  - Pagination support                 │
└───────────────────┬──────────────────┘
                    │ reads/writes via JPA
                    ▼
┌──────────────────────────────────────┐
│            Entity Layer               │
│  @Entity (JPA/Hibernate) classes      │
│  - Table mapping                      │
│  - Validation constraints             │
│  - Relationship definitions           │
│  - Business helper methods            │
└──────────────────────────────────────┘
                    │
                    ▼
              MySQL Database
```

---

### 4.2 Security Architecture

- **JWT Authentication:** Every protected endpoint requires a valid JWT Bearer token in the `Authorization` header.
- **JWT Filter:** A servlet filter intercepts all requests, extracts the token, validates its signature and expiry, and loads the `UserDetails` into the Spring Security context.
- **Role-Based Access:** `@PreAuthorize("hasRole('ADMIN')")` or `@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")` annotations on controller methods.
- **Google OAuth2:** Spring Security's OAuth2 client integration handles the full OAuth2 authorization code flow. On success, the backend issues its own JWT and redirects the user to the frontend.
- **Password Reset:** Time-limited tokens are stored in the `password_reset_tokens` table and emailed to users.

---

### 4.3 Scheduled Tasks

Two scheduled jobs run server-side:

| Task | Cron Expression | Purpose |
|---|---|---|
| Overdue loan detection | Daily (configurable) | Marks loans past their due date as OVERDUE and generates fines |
| Subscription expiry check | `0 0 2 * * ?` (2 AM daily) | Deactivates subscriptions past their end date |

---

## 5. REST API Reference

**Base URL (production):** `https://librarymanagementsystem-production-fc6e.up.railway.app`

All protected endpoints require the header:
```
Authorization: Bearer <jwt_token>
```

---

### 5.1 Authentication — `/auth`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | No | Register a new user account |
| `POST` | `/auth/login` | No | Login with email and password; returns JWT |
| `POST` | `/auth/forgot-password` | No | Send a password reset link to the user's email |
| `POST` | `/auth/reset-password` | No | Reset password using the token from email |
| `GET` | `/login/oauth2/code/google` | No | Google OAuth2 callback (handled by Spring Security) |

**Signup request body:**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "role": "USER"
}
```

**Login request body:**
```json
{
  "email": "jane@example.com",
  "password": "SecurePass123!"
}
```

**Login response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": { ... }
}
```

---

### 5.2 Books — `/api/books`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/books` | No | List/search books (query params: `genreId`, `availableOnly`, `page`, `size`, `sortBy`, `sortDirection`) |
| `POST` | `/api/books/search` | No | Advanced search with request body (title, author, ISBN, genre, availability) |
| `GET` | `/api/books/{id}` | No | Get book by database ID |
| `GET` | `/api/books/isbn/{isbn}` | No | Get book by ISBN |
| `GET` | `/api/books/stats` | No | Catalog statistics (total active, total available) |
| `POST` | `/api/books` | Admin | Create a new book |
| `POST` | `/api/books/bulk` | Admin | Bulk create books (array of book DTOs) |
| `PUT` | `/api/books/{id}` | Admin | Update a book |
| `DELETE` | `/api/books/{id}` | Admin | Soft delete (mark inactive) |
| `DELETE` | `/api/books/{id}/permanent` | Admin | Hard delete (remove from DB) |

**Book search query parameters:**
```
GET /api/books?genreId=2&availableOnly=true&page=0&size=20&sortBy=title&sortDirection=ASC
```

---

### 5.3 Book Loans — `/api/book-loans`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/book-loans/checkout` | USER / ADMIN | Checkout a book for the authenticated user |
| `POST` | `/api/book-loans/checkout/user/{userId}` | ADMIN | Admin checkouts a book for a specific user |
| `POST` | `/api/book-loans/checkin` | USER / ADMIN | Return (check in) a book |
| `POST` | `/api/book-loans/renew` | USER / ADMIN | Renew a loan to extend the due date |
| `GET` | `/api/book-loans/{id}` | USER / ADMIN | Get a single loan by ID |
| `GET` | `/api/book-loans/my` | USER / ADMIN | Get authenticated user's loans (filter by status, paginated) |
| `GET` | `/api/book-loans/my/book/{bookId}` | USER / ADMIN | Get authenticated user's loan history for a specific book |
| `GET` | `/api/book-loans/user/{userId}` | ADMIN | Get a specific user's loans |
| `POST` | `/api/book-loans/search` | ADMIN | Search all loans with filters |
| `PUT` | `/api/book-loans/{id}` | ADMIN | Update a loan record |
| `POST` | `/api/book-loans/admin/update-overdue` | ADMIN | Manually trigger overdue status update |
| `GET` | `/api/book-loans/statistics` | ADMIN | Checkout statistics |

**Checkout request body:**
```json
{
  "bookId": 42
}
```

**Checkin request body:**
```json
{
  "bookLoanId": 15
}
```

**Renewal request body:**
```json
{
  "bookLoanId": 15
}
```

---

### 5.4 Subscriptions — `/api/subscriptions`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/subscriptions/subscribe` | USER | Subscribe to a plan (initiates payment flow) |
| `POST` | `/api/subscriptions/subscribe-free` | USER | Subscribe to a plan immediately (demo/free mode) |
| `POST` | `/api/subscriptions/renew-free/{subscriptionId}` | USER / ADMIN | Renew an existing subscription (demo/free mode) |
| `GET` | `/api/subscriptions/history` | USER / ADMIN | Get subscription history for a user |
| `GET` | `/api/subscriptions/user/active` | USER / ADMIN | Get the current active subscription for a user |
| `GET` | `/api/subscriptions/check` | No | Check if a user has a valid subscription |
| `GET` | `/api/subscriptions/{id}` | USER / ADMIN | Get subscription by ID |
| `POST` | `/api/subscriptions/renew/{subscriptionId}` | USER / ADMIN | Renew subscription (payment flow) |
| `POST` | `/api/subscriptions/cancel/{subscriptionId}` | USER / ADMIN | Cancel an active subscription |
| `POST` | `/api/subscriptions/activate` | No | Activate subscription after payment webhook callback |
| `GET` | `/api/subscriptions/admin/active` | ADMIN | Get all active subscriptions (paginated) |
| `POST` | `/api/subscriptions/admin/deactivate-expired` | ADMIN | Manually deactivate all expired subscriptions |

---

### 5.5 Friends — `/api/friends`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/friends/request/{receiverId}` | USER | Send a friend request to another user |
| `PUT` | `/api/friends/accept/{friendshipId}` | USER | Accept an incoming friend request |
| `PUT` | `/api/friends/decline/{friendshipId}` | USER | Decline an incoming friend request |
| `DELETE` | `/api/friends/{friendshipId}` | USER | Remove a friend or cancel a sent request |
| `GET` | `/api/friends/my` | USER | Get accepted friends list |
| `GET` | `/api/friends/requests/pending` | USER | Get incoming pending requests |
| `GET` | `/api/friends/requests/sent` | USER | Get outgoing sent requests |
| `GET` | `/api/friends/search?q={query}` | USER | Search users by name or email |
| `GET` | `/api/friends/status/{otherUserId}` | USER | Get friendship status with a specific user |

---

### 5.6 Messages — `/api/messages`

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/messages/send/{receiverId}` | USER | Send a message to another user (must be friends) |
| `GET` | `/api/messages/conversation/{otherUserId}` | USER | Get full message thread with a user |
| `GET` | `/api/messages/conversations` | USER | Get inbox summary (all conversations, last message) |
| `GET` | `/api/messages/unread-count` | USER | Get count of unread messages |

**Send message request body:**
```json
{
  "content": "Hey, have you read Clean Code?"
}
```

---

### 5.7 Other Endpoints (Additional Controllers)

The following controllers exist beyond those shown above:

| Controller | Base Path | Key Operations |
|---|---|---|
| GenreController | `/api/genres` | CRUD for genres, genre hierarchy |
| ReservationController | `/api/reservations` | Create, cancel, list reservations |
| FineController | `/api/fines` | View, pay, waive fines |
| WishlistController | `/api/wishlists` | Add, remove, list wishlist items |
| BookReviewController | `/api/reviews` | Create, update, delete, list reviews |
| NotificationController | `/api/notifications` | List, mark-read notifications |
| UserController | `/api/users` | Get profile, update profile |
| SubscriptionPlanController | `/api/subscription-plans` | CRUD for subscription plans (Admin) |
| PaymentController | `/api/payments` | Payment history |

---

## 6. Frontend Architecture

### 6.1 Technology Stack

| Library | Version | Role |
|---|---|---|
| React | 19.1 | UI rendering |
| Vite | 7.x | Build tool and dev server |
| React Router DOM | 7.x | Client-side routing |
| Redux Toolkit | 2.x | Global state management |
| React Redux | 9.x | React bindings for Redux |
| Axios | 1.x | HTTP client for API calls |
| MUI (Material UI) | 7.x | Component library |
| Tailwind CSS | 4.x | Utility-first CSS |
| date-fns / dayjs | latest | Date formatting utilities |

---

### 6.2 Routing Architecture

Routes are defined in `App.jsx` with three conditional branches:

**Public routes** (unauthenticated users):
- `/` — Landing page
- `/login` — Login form
- `/register` — Registration form
- `/forgot-password` — Forgot password form
- `/reset-password` — Password reset form (with token)
- `/oauth2/callback` — Google OAuth2 redirect handler

**Admin routes** (users with `ROLE_ADMIN`):
- `/admin` / `/admin/dashboard` — Admin dashboard
- `/admin/books` — Book management (lazy-loaded)
- `/admin/book-loans` — Loan management
- `/admin/reservations` — Reservation management
- `/admin/reviews` — Review moderation
- `/admin/genres` — Genre management
- `/admin/subscription-plans` — Manage subscription plans
- `/admin/user-subscriptions` — View user subscriptions
- `/admin/payments` — Payment records
- `/admin/users` — User management
- `/admin/fines` — Fine management
- `/admin/notifications` — Notification centre
- `/admin/settings` — Admin settings
- `/admin/profile` — Admin profile

**User routes** (authenticated non-admin users):
- `/` — Personal dashboard
- `/books` — Book catalog
- `/books/:id` — Book details
- `/my-loans` — Loan history
- `/my-reservations` — Reservations
- `/my-fines` — Fine management
- `/subscriptions` — Subscription management
- `/wishlist` — Wishlist
- `/friends` — Friends and messaging
- `/profile` — User profile
- `/settings` — Settings
- `/notifications` — Notification centre
- `/payment-success/:subscriptionId` — Post-payment confirmation

---

### 6.3 Authentication Flow

1. On mount, `App.jsx` reads `localStorage.getItem("jwt")`. If a token exists, it dispatches `fetchCurrentUser()`.
2. `fetchCurrentUser` calls the backend's `/api/users/profile` endpoint with the token and populates `auth.user` in the Redux store.
3. Route rendering checks `auth.isAuthenticated` and `auth.user.role` to decide which route set to show.
4. On login/register success, the JWT is stored in `localStorage` and the Redux auth slice is updated.
5. On logout, the JWT is removed from `localStorage` and the Redux state is reset.

---

## 7. Redux Store Structure

The store is configured in `store/store.js` using `configureStore` from Redux Toolkit.

```
store/
├── auth              — authentication state (user, token, loading, error)
├── books             — book catalog (list, selected book, search state, pagination)
├── bookLoans         — loan records (my loans, admin view, checkout/checkin state)
├── subscriptions     — user subscriptions (active subscription, history)
├── subscriptionPlans — available plans list (admin + user view)
├── genres            — genre list (hierarchical)
├── payments          — payment records and history
├── bookReviews       — reviews per book (list, create/update state)
├── wishlist          — user's wishlist items
├── reservations      — user's reservations
├── notification      — in-app notification list and unread count
├── notifications     — notification settings (preferences per notification type)
├── fines             — user's fines list
├── friends           — friend list, pending requests, sent requests, search results
└── messages          — conversations, message threads, unread count
```

Each slice follows the Redux Toolkit pattern:

```js
// Example structure of a slice
{
  data: [],          // The main data array
  item: null,        // Currently selected/active item
  loading: false,    // Async loading flag
  error: null,       // Error message string
  pagination: {      // Where applicable
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0
  }
}
```

Each feature folder contains two files:
- `*Slice.js` — defines the slice (state, reducers, extra reducers for async actions)
- `*Thunk.js` — defines async thunks using `createAsyncThunk` that call Axios API functions

---

## 8. Key Design Decisions

### 8.1 JWT Authentication (Stateless)

The API is fully stateless. No server-side sessions are maintained. Each request carries a JWT signed with a secret key. The token contains the user's ID and roles. This allows horizontal scaling of the backend without session affinity.

---

### 8.2 No Real Payment Gateway (Demo Mode)

The `pom.xml` includes both Razorpay and Stripe SDKs as dependencies, and the `application.properties` has commented-out entries for their API keys. The live deployment uses a **free subscription mode** (`/subscribe-free` and `/renew-free/{id}` endpoints) that activates plans instantly without processing a real payment. This design allows demonstrating the full subscription lifecycle without requiring real financial credentials.

---

### 8.3 Groq AI Integration (AI Chat Assistant)

The AI chat assistant is powered by the Groq API (a high-speed LLM inference provider). The frontend sends user messages to a backend endpoint which proxies the request to Groq's API, appends system context about the library, and returns the response. The Groq API key is stored securely as a backend environment variable — never exposed to the client.

---

### 8.4 Polling for Messages (No WebSockets)

Real-time messaging is simulated via **periodic HTTP polling** rather than WebSockets. The frontend periodically calls `GET /api/messages/unread-count` and `GET /api/messages/conversation/{userId}` to detect new messages. This avoids WebSocket infrastructure complexity while still providing a responsive chat experience. Future enhancement: replace polling with Server-Sent Events (SSE) or WebSocket via Spring's STOMP support.

---

### 8.5 Separate Fine Entities

Instead of embedding fine amounts as a field on `BookLoan`, the system uses a separate `Fine` entity with a `@OneToMany` relationship to `BookLoan`. This design supports:
- Multiple fines per loan (e.g., different fine types)
- Partial payments
- Detailed audit trails (who waived, when paid, transaction ID)
- Admin override and waiver workflows

---

### 8.6 Soft Delete for Books

Books use a soft delete pattern (`active = false`) rather than physical deletion. This preserves referential integrity — loan history and reviews still reference the book record. Hard delete is available via a separate admin endpoint when truly needed.

---

### 8.7 Hierarchical Genres

The `Genre` entity supports a parent/child relationship (`parentGenre` and `subGenres` fields). This allows a flexible genre taxonomy (e.g., "Technology > Programming > Java") without a fixed depth limit.

---

### 8.8 Lazy vs Eager Fetching

Most `@ManyToOne` relationships use `FETCH = LAZY` to avoid N+1 query problems when loading lists. The `SubscriptionPlan` in `Subscription` uses `FETCH = EAGER` because the plan details are always needed alongside a subscription record.

---

## 9. Deployment Guide

### 9.1 Backend Deployment (Railway)

1. **Create a Railway project** at https://railway.app.
2. **Add a MySQL plugin** to the project. Railway provides environment variables (`MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`) automatically.
3. **Connect your GitHub repository** to Railway for automatic deployments.
4. **Configure Railway service environment variables** (Settings → Variables):

```
DB_HOST         = <from Railway MySQL plugin: MYSQLHOST>
DB_PORT         = <from Railway MySQL plugin: MYSQLPORT>
DB_NAME         = <from Railway MySQL plugin: MYSQLDATABASE>
DB_USERNAME     = <from Railway MySQL plugin: MYSQLUSER>
DB_PASSWORD     = <from Railway MySQL plugin: MYSQLPASSWORD>
MAIL_USERNAME   = your@gmail.com
MAIL_PASSWORD   = your-gmail-app-password
GOOGLE_CLIENT_ID        = your-google-oauth-client-id
GOOGLE_CLIENT_SECRET    = your-google-oauth-client-secret
BASE_URL        = https://your-railway-backend-url.railway.app
FRONTEND_URL    = https://kylychlibrary.netlify.app
```

5. Railway automatically builds the Maven project and runs the JAR.
6. The `PORT` variable is automatically set by Railway — `application.properties` reads it via `${PORT:8080}`.

---

### 9.2 Frontend Deployment (Netlify)

1. **Create a Netlify site** at https://app.netlify.com.
2. **Connect your GitHub repository**.
3. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `source/Frontend-Vite`
4. **Environment variables** (Site Settings → Environment Variables):

```
VITE_API_URL = https://your-railway-backend-url.railway.app
```

5. **Netlify redirects:** Create `source/Frontend-Vite/public/_redirects` to enable React Router:

```
/*  /index.html  200
```

6. Deploy. Netlify builds the Vite project and serves the static files from its CDN.

---

### 9.3 Google OAuth2 Configuration

1. Go to https://console.cloud.google.com and create/open your project.
2. Navigate to **APIs & Services → Credentials**.
3. Create an **OAuth 2.0 Client ID** (type: Web Application).
4. Add the following **Authorized redirect URI**:
   ```
   https://your-railway-backend-url.railway.app/login/oauth2/code/google
   ```
5. Add your frontend URL to **Authorized JavaScript origins**:
   ```
   https://kylychlibrary.netlify.app
   ```
6. Copy the Client ID and Client Secret to Railway environment variables.

---

## 10. CORS Configuration

Cross-Origin Resource Sharing (CORS) is configured in the Spring Boot security configuration class (typically `SecurityConfig.java` or a dedicated `CorsConfig.java`).

**Allowed origins:**
- `http://localhost:5173` (local Vite dev server)
- `https://kylychlibrary.netlify.app` (production frontend)

**Allowed methods:**
- `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

**Allowed headers:**
- `Authorization`, `Content-Type`, `Accept`, `Origin`

**Credentials:**
- `allowCredentials = true` (required for cookie/auth header forwarding)

**Pre-flight handling:**
Spring Security is configured to permit all `OPTIONS` pre-flight requests without authentication checks, ensuring that browser CORS pre-flight checks pass before the actual authenticated request is made.

If you add a new frontend origin (e.g., a staging URL), update the CORS configuration in the security config class and redeploy the backend.

---

*For end-user documentation, see [USER_GUIDE.md](./USER_GUIDE.md).*
*For database schema documentation, see [DATABASE.md](./DATABASE.md).*
