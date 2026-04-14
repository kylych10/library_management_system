# Database Documentation — Library Management System

This document describes the complete database schema for the Library Management System, including all tables, columns, data types, constraints, relationships, and indexes.

**Database Engine:** MySQL 8.x
**Hosted on:** Railway (managed cloud MySQL)
**Schema management:** Hibernate DDL auto (`spring.jpa.hibernate.ddl-auto=update`)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Table Reference](#2-table-reference)
   - [users](#21-users)
   - [books](#22-books)
   - [genres](#23-genres)
   - [book_loans](#24-book_loans)
   - [reservations](#25-reservations)
   - [fines](#26-fines)
   - [subscriptions](#27-subscriptions)
   - [subscription_plans](#28-subscription_plans)
   - [wishlists](#29-wishlists)
   - [book_reviews](#210-book_reviews)
   - [notifications](#211-notifications)
   - [notification_settings](#212-notification_settings)
   - [friendships](#213-friendships)
   - [messages](#214-messages)
   - [payments](#215-payments)
   - [push_tokens](#216-push_tokens)
   - [password_reset_tokens](#217-password_reset_tokens)
3. [Entity Relationship Summary](#3-entity-relationship-summary)
4. [Indexes and Constraints Summary](#4-indexes-and-constraints-summary)
5. [Enumerations (ENUM Values)](#5-enumerations-enum-values)
6. [Connection Details](#6-connection-details)

---

## 1. Overview

The database schema is designed around the core library domain:

- **Catalog layer:** `genres` → `books`
- **Borrowing layer:** `users` → `book_loans` → `books`
- **Reservation layer:** `users` → `reservations` → `books`
- **Financial layer:** `book_loans` → `fines`
- **Subscription layer:** `users` → `subscriptions` → `subscription_plans`
- **Social layer:** `users` ↔ `friendships` ↔ `users`, `users` → `messages` → `users`
- **Engagement layer:** `users` → `book_reviews` → `books`, `users` → `wishlists` → `books`
- **System layer:** `notifications`, `notification_settings`, `push_tokens`, `password_reset_tokens`, `payments`

All tables include `created_at` timestamps at minimum. Most include `updated_at` timestamps as well. Soft deletes are used for books (`active` flag) and reviews (`is_active` flag).

---

## 2. Table Reference

### 2.1 `users`

Stores all registered user accounts. Both LOCAL (email/password) and GOOGLE OAuth2 users are stored here.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT | NOT NULL | AUTO_INCREMENT | Primary key |
| `full_name` | VARCHAR(255) | NOT NULL | — | User's display name |
| `password` | VARCHAR(255) | YES | NULL | BCrypt-hashed password. NULL for Google OAuth users |
| `email` | VARCHAR(255) | NOT NULL | — | Unique email address. Used as login identifier |
| `phone` | VARCHAR(255) | YES | NULL | Optional phone number |
| `auth_provider` | VARCHAR(20) | NOT NULL | `'LOCAL'` | `LOCAL` or `GOOGLE` (enum: AuthProvider) |
| `google_id` | VARCHAR(255) | YES | NULL | Google user sub (subject) ID for OAuth users |
| `profile_image` | TEXT | YES | NULL | URL or base64 of profile picture |
| `role` | VARCHAR(20) | NOT NULL | — | User role: `USER` or `ADMIN` (enum: UserRole) |
| `verified` | TINYINT(1) | NOT NULL | `0` | Whether the account email is verified |
| `created_at` | DATETIME | NOT NULL | (auto) | Account creation timestamp |
| `updated_at` | DATETIME | NOT NULL | (auto) | Last profile update timestamp |
| `last_login` | DATETIME | YES | NULL | Timestamp of most recent login |

**Constraints:**
- `PRIMARY KEY (id)`
- `UNIQUE (email)`

---

### 2.2 `books`

The main library catalog. Each row represents a unique book title/edition identified by ISBN.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT | NOT NULL | AUTO_INCREMENT | Primary key |
| `isbn` | VARCHAR(20) | NOT NULL | — | International Standard Book Number (unique) |
| `title` | VARCHAR(255) | NOT NULL | — | Book title |
| `author` | VARCHAR(255) | NOT NULL | — | Author name(s) |
| `genre_id` | BIGINT | NOT NULL | — | FK → `genres.id` |
| `publisher` | VARCHAR(100) | YES | NULL | Publisher name |
| `publication_date` | DATE | YES | NULL | Original publication date |
| `language` | VARCHAR(20) | YES | NULL | Language of the book |
| `pages` | INT | YES | NULL | Page count (1–50000) |
| `description` | VARCHAR(2000) | YES | NULL | Book synopsis/description |
| `total_copies` | INT | NOT NULL | — | Total physical copies held by the library |
| `available_copies` | INT | NOT NULL | — | Copies not currently on loan |
| `price` | DECIMAL(10,2) | YES | NULL | Reference price (display only) |
| `cover_image_url` | VARCHAR(500) | YES | NULL | URL to cover image |
| `active` | TINYINT(1) | NOT NULL | `1` | Soft delete flag. `0` = deleted |
| `created_at` | DATETIME | NOT NULL | (auto) | Record creation timestamp |
| `updated_at` | DATETIME | NOT NULL | (auto) | Last update timestamp |

**Constraints:**
- `PRIMARY KEY (id)`
- `UNIQUE (isbn)` — enforced by index `idx_isbn`
- `available_copies <= total_copies` — enforced by `@AssertTrue` in the entity

**Indexes:**
- `idx_isbn (isbn)` — UNIQUE
- `idx_title (title)`
- `idx_author (author)`
- `idx_genre (genre_id)`

---

### 2.3 `genres`

Hierarchical genre taxonomy for classifying books. Supports parent/child nesting.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT | NOT NULL | AUTO_INCREMENT | Primary key |
| `code` | VARCHAR(50) | NOT NULL | — | Unique uppercase code (e.g., `FICTION`, `SCI_FI`) |
| `name` | VARCHAR(100) | NOT NULL | — | Display name |
| `description` | VARCHAR(500) | YES | NULL | Genre description |
| `display_order` | INT | YES | `0` | For UI ordering of genres |
| `active` | TINYINT(1) | NOT NULL | `1` | Whether genre is visible to users |
| `parent_genre_id` | BIGINT | YES | NULL | Self-referencing FK → `genres.id` for hierarchy |
| `created_at` | DATETIME | NOT NULL | (auto) | Record creation timestamp |
| `updated_at` | DATETIME | NOT NULL | (auto) | Last update timestamp |

**Constraints:**
- `PRIMARY KEY (id)`
- `UNIQUE (code)` — enforced by `idx_genre_code`

**Indexes:**
- `idx_genre_code (code)` — UNIQUE
- `idx_genre_name (name)`
- `idx_genre_active (active)`

---

### 2.4 `book_loans`

Tracks each individual book checkout event from creation to return.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT | NOT NULL | AUTO_INCREMENT | Primary key |
| `user_id` | BIGINT | NOT NULL | — | FK → `users.id` |
| `book_id` | BIGINT | NOT NULL | — | FK → `books.id` |
| `type` | VARCHAR(20) | NOT NULL | — | Loan type: `REGULAR`, `EXTENDED`, etc. (enum: BookLoanType) |
| `status` | VARCHAR(20) | NOT NULL | — | `CHECKED_OUT`, `RETURNED`, `OVERDUE`, `LOST` (enum: BookLoanStatus) |
| `checkout_date` | DATE | NOT NULL | — | Date the book was checked out |
| `due_date` | DATE | NOT NULL | — | Date the book must be returned by |
| `return_date` | DATE | YES | NULL | Actual return date (NULL if not yet returned) |
| `renewal_count` | INT | NOT NULL | `0` | Number of times this loan has been renewed |
| `max_renewals` | INT | NOT NULL | `2` | Maximum renewals allowed for this loan |
| `notes` | VARCHAR(500) | YES | NULL | Staff notes |
| `is_overdue` | TINYINT(1) | NOT NULL | `0` | Whether the loan is currently overdue |
| `overdue_days` | INT | YES | `0` | Number of days past due date |
| `created_at` | DATETIME | NOT NULL | (auto) | Record creation timestamp |
| `updated_at` | DATETIME | NOT NULL | (auto) | Last update timestamp |

**Constraints:**
- `PRIMARY KEY (id)`
- `FOREIGN KEY (user_id) REFERENCES users(id)`
- `FOREIGN KEY (book_id) REFERENCES books(id)`

**Indexes:**
- `idx_user_id (user_id)`
- `idx_book_id (book_id)`
- `idx_status (status)`
- `idx_due_date (due_date)`
- `idx_checkout_date (checkout_date)`

> **Note:** Fine records are stored in the `fines` table as a `@OneToMany` relationship to `book_loans`.

---

### 2.5 `reservations`

Manages book hold/reservation queue. Allows users to be notified when an unavailable book becomes available.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT | NOT NULL | AUTO_INCREMENT | Primary key |
| `user_id` | BIGINT | NOT NULL | — | FK → `users.id` |
| `book_id` | BIGINT | NOT NULL | — | FK → `books.id` |
| `status` | VARCHAR(20) | NOT NULL | `'PENDING'` | `PENDING`, `AVAILABLE`, `FULFILLED`, `CANCELLED`, `EXPIRED` (enum: ReservationStatus) |
| `reserved_at` | DATETIME | NOT NULL | — | When the reservation was created |
| `available_at` | DATETIME | YES | NULL | When the book became available for this user |
| `available_until` | DATETIME | YES | NULL | Deadline for the user to pick up the book |
| `fulfilled_at` | DATETIME | YES | NULL | When the user actually checked out the reserved book |
| `cancelled_at` | DATETIME | YES | NULL | When the reservation was cancelled or expired |
| `queue_position` | INT | YES | NULL | Position in the queue for this book |
| `notification_sent` | TINYINT(1) | NOT NULL | `0` | Whether the availability notification has been sent |
| `notes` | TEXT | YES | NULL | Cancellation reason or other notes |
| `created_at` | DATETIME | NOT NULL | (auto) | Record creation timestamp |
| `updated_at` | DATETIME | NOT NULL | (auto) | Last update timestamp |

**Constraints:**
- `PRIMARY KEY (id)`
- `FOREIGN KEY (user_id) REFERENCES users(id)`
- `FOREIGN KEY (book_id) REFERENCES books(id)`

**Indexes:**
- `idx_user_id (user_id)`
- `idx_book_id (book_id)`
- `idx_status (status)`
- `idx_reserved_at (reserved_at)`
- `idx_available_until (available_until)`

---

### 2.6 `fines`

Stores individual fine records. Multiple fines can be associated with a single book loan (e.g., different fine types).

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT | NOT NULL | AUTO_INCREMENT | Primary key |
| `book_loan_id` | BIGINT | NOT NULL | — | FK → `book_loans.id` |
| `user_id` | BIGINT | NOT NULL | — | FK → `users.id` (denormalised for quick query) |
| `type` | VARCHAR(20) | NOT NULL | — | Fine type: `OVERDUE`, `DAMAGE`, `LOST` (enum: FineType) |
| `amount` | BIGINT | NOT NULL | — | Total fine amount in smallest currency unit (e.g., paise, cents) |
| `amount_paid` | BIGINT | NOT NULL | `0` | Amount paid so far |
| `status` | VARCHAR(20) | NOT NULL | `'PENDING'` | `PENDING`, `PARTIALLY_PAID`, `PAID`, `WAIVED` (enum: FineStatus) |
| `reason` | VARCHAR(500) | YES | NULL | Human-readable reason for the fine |
| `notes` | VARCHAR(1000) | YES | NULL | Additional notes |
| `waived_by_user_id` | BIGINT | YES | NULL | FK → `users.id` — admin who waived the fine |
| `waived_at` | DATETIME | YES | NULL | Timestamp of waiver |
| `waiver_reason` | VARCHAR(500) | YES | NULL | Reason admin provided for waiver |
| `paid_at` | DATETIME | YES | NULL | Timestamp of full payment |
| `processed_by_user_id` | BIGINT | YES | NULL | FK → `users.id` — staff who processed the payment |
| `transaction_id` | VARCHAR(100) | YES | NULL | External payment gateway transaction reference |
| `created_at` | DATETIME | NOT NULL | (auto) | Record creation timestamp |
| `updated_at` | DATETIME | NOT NULL | (auto) | Last update timestamp |

**Constraints:**
- `PRIMARY KEY (id)`
- `FOREIGN KEY (book_loan_id) REFERENCES book_loans(id) ON DELETE CASCADE`
- `FOREIGN KEY (user_id) REFERENCES users(id)`
- `FOREIGN KEY (waived_by_user_id) REFERENCES users(id)`
- `FOREIGN KEY (processed_by_user_id) REFERENCES users(id)`

**Indexes:**
- `idx_fine_book_loan_id (book_loan_id)`
- `idx_fine_user_id (user_id)`
- `idx_fine_status (status)`
- `idx_fine_type (type)`

---

### 2.7 `subscriptions`

Records each subscription activation for a user. A user can have a history of multiple subscriptions over time, but only one may be active at a time.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT | NOT NULL | AUTO_INCREMENT | Primary key |
| `user_id` | BIGINT | NOT NULL | — | FK → `users.id` |
| `plan_id` | BIGINT | NOT NULL | — | FK → `subscription_plans.id` |
| `plan_name` | VARCHAR(100) | YES | NULL | Cached plan name at time of purchase |
| `plan_code` | VARCHAR(50) | YES | NULL | Cached plan code at time of purchase |
| `price` | BIGINT | YES | NULL | Cached price at time of purchase (smallest currency unit) |
| `currency` | VARCHAR(3) | YES | NULL | Cached ISO 4217 currency code at time of purchase |
| `start_date` | DATE | NOT NULL | — | Subscription start date |
| `end_date` | DATE | NOT NULL | — | Subscription end date |
| `is_active` | TINYINT(1) | NOT NULL | `1` | Whether the subscription is currently active |
| `max_books_allowed` | INT | NOT NULL | — | Concurrent book limit (cached from plan) |
| `max_days_per_book` | INT | NOT NULL | — | Max loan days (cached from plan) |
| `auto_renew` | TINYINT(1) | NOT NULL | `0` | Auto-renewal flag |
| `cancelled_at` | DATETIME | YES | NULL | Cancellation timestamp |
| `cancellation_reason` | TEXT | YES | NULL | Reason for cancellation |
| `notes` | TEXT | YES | NULL | Admin notes |
| `created_at` | DATETIME | NOT NULL | (auto) | Record creation timestamp |
| `updated_at` | DATETIME | YES | (auto) | Last update timestamp |

**Constraints:**
- `PRIMARY KEY (id)`
- `FOREIGN KEY (user_id) REFERENCES users(id)`
- `FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)`

**Indexes:**
- `idx_user_id (user_id)`
- `idx_is_active (is_active)`
- `idx_end_date (end_date)`
- `idx_plan_id (plan_id)`

> **Design note:** Plan details (name, code, price, currency, max books, max days) are cached on the subscription record at the time of purchase. This preserves historical accuracy even if the plan is later modified or deleted.

---

### 2.8 `subscription_plans`

Defines the subscription tiers available for users to purchase. Managed exclusively by admins.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT | NOT NULL | AUTO_INCREMENT | Primary key |
| `plan_code` | VARCHAR(50) | NOT NULL | — | Unique machine code (e.g., `MONTHLY`, `YEARLY`) |
| `name` | VARCHAR(100) | NOT NULL | — | Display name |
| `description` | TEXT | YES | NULL | Detailed plan description |
| `duration_days` | INT | NOT NULL | — | Plan duration in days |
| `price` | BIGINT | NOT NULL | — | Price in smallest currency unit |
| `currency` | VARCHAR(3) | NOT NULL | `'INR'` | ISO 4217 currency code |
| `max_books_allowed` | INT | NOT NULL | — | Max concurrent borrows |
| `max_days_per_book` | INT | NOT NULL | — | Max loan period per checkout |
| `display_order` | INT | YES | `0` | Sort order for display |
| `is_active` | TINYINT(1) | NOT NULL | `1` | Whether plan is available for purchase |
| `is_featured` | TINYINT(1) | NOT NULL | `0` | Whether plan is highlighted/recommended |
| `badge_text` | VARCHAR(50) | YES | NULL | Marketing badge (e.g., "Best Value") |
| `admin_notes` | TEXT | YES | NULL | Internal admin notes |
| `created_at` | DATETIME | NOT NULL | (auto) | Record creation timestamp |
| `updated_at` | DATETIME | YES | (auto) | Last update timestamp |
| `created_by` | VARCHAR(100) | YES | NULL | Admin who created the plan |
| `updated_by` | VARCHAR(100) | YES | NULL | Admin who last modified the plan |

**Constraints:**
- `PRIMARY KEY (id)`
- `UNIQUE (plan_code)` — enforced by `idx_plan_code`

**Indexes:**
- `idx_plan_name (name)`
- `idx_plan_code (plan_code)` — UNIQUE
- `idx_is_active (is_active)`

---

### 2.9 `wishlists`

Stores books a user has saved for future reference. Each (user, book) pair must be unique.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT | NOT NULL | AUTO_INCREMENT | Primary key |
| `user_id` | BIGINT | NOT NULL | — | FK → `users.id` |
| `book_id` | BIGINT | NOT NULL | — | FK → `books.id` |
| `added_at` | DATETIME | NOT NULL | (auto) | When the book was added to the wishlist |
| `notes` | VARCHAR(500) | YES | NULL | User's personal notes about this item |

**Constraints:**
- `PRIMARY KEY (id)`
- `UNIQUE (user_id, book_id)` — constraint name: `uk_user_book_wishlist`
- `FOREIGN KEY (user_id) REFERENCES users(id)`
- `FOREIGN KEY (book_id) REFERENCES books(id)`

**Indexes:**
- `idx_user_wishlist (user_id)`
- `idx_book_wishlist (book_id)`

---

### 2.10 `book_reviews`

Stores user-written reviews and ratings for books. One review per (user, book) pair.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT | NOT NULL | AUTO_INCREMENT | Primary key |
| `user_id` | BIGINT | NOT NULL | — | FK → `users.id` |
| `book_id` | BIGINT | NOT NULL | — | FK → `books.id` |
| `rating` | INT | NOT NULL | — | Star rating: 1–5 |
| `review_text` | VARCHAR(2000) | NOT NULL | — | Written review body (10–2000 chars) |
| `title` | VARCHAR(200) | YES | NULL | Optional review title |
| `is_verified_reader` | TINYINT(1) | NOT NULL | `0` | `1` if user has a completed loan for this book |
| `is_active` | TINYINT(1) | NOT NULL | `1` | Soft delete / moderation flag |
| `helpful_count` | INT | NOT NULL | `0` | Number of users who marked this review as helpful |
| `created_at` | DATETIME | NOT NULL | (auto) | Record creation timestamp |
| `updated_at` | DATETIME | NOT NULL | (auto) | Last update timestamp |

**Constraints:**
- `PRIMARY KEY (id)`
- `UNIQUE (user_id, book_id)` — constraint name: `uk_user_book_review`
- `FOREIGN KEY (user_id) REFERENCES users(id)`
- `FOREIGN KEY (book_id) REFERENCES books(id)`
- `CHECK (rating BETWEEN 1 AND 5)` — enforced by `@Min` / `@Max` validation

**Indexes:**
- `idx_book_id (book_id)`
- `idx_user_id (user_id)`
- `idx_rating (rating)`

---

### 2.11 `notifications`

Stores in-app notifications for users (loan reminders, reservation updates, etc.).

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT | NOT NULL | AUTO_INCREMENT | Primary key |
| `user_id` | BIGINT | NOT NULL | — | FK → `users.id` (notification recipient) |
| `title` | VARCHAR(255) | NOT NULL | — | Short notification title |
| `message` | TEXT | YES | NULL | Full notification message body |
| `type` | VARCHAR(50) | YES | NULL | Notification category (enum: NotificationType) |
| `is_read` | TINYINT(1) | NOT NULL | `0` | Whether the user has read this notification |
| `created_at` | DATETIME | NOT NULL | (auto) | Notification creation timestamp |
| `related_entity_id` | BIGINT | YES | NULL | ID of related object (e.g., loan ID, reservation ID) |
| `delivery_method` | VARCHAR(50) | YES | `'IN_APP'` | `IN_APP`, `EMAIL`, `PUSH` (enum: DeliveryMethod) |
| `read_at` | DATETIME | YES | NULL | Timestamp when user read the notification |

**Constraints:**
- `PRIMARY KEY (id)`
- `FOREIGN KEY (user_id) REFERENCES users(id)`

**Indexes:**
- `idx_user_id (user_id)`
- `idx_is_read (is_read)`
- `idx_created_at (created_at)`

---

### 2.12 `notification_settings`

Stores per-user notification preferences (which notification types they want to receive).

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT | NOT NULL | AUTO_INCREMENT | Primary key |
| `user_id` | BIGINT | NOT NULL | — | FK → `users.id` |
| `notification_type` | VARCHAR(50) | NOT NULL | — | The type of notification (enum: NotificationType) |
| `in_app_enabled` | TINYINT(1) | NOT NULL | `1` | Whether in-app delivery is enabled |
| `email_enabled` | TINYINT(1) | NOT NULL | `1` | Whether email delivery is enabled |
| `push_enabled` | TINYINT(1) | NOT NULL | `0` | Whether push notification delivery is enabled |
| `created_at` | DATETIME | YES | (auto) | Record creation timestamp |
| `updated_at` | DATETIME | YES | (auto) | Last update timestamp |

**Constraints:**
- `PRIMARY KEY (id)`
- `FOREIGN KEY (user_id) REFERENCES users(id)`

---

### 2.13 `friendships`

Manages friend relationships between users. A friendship is directional (requester → receiver) but logically bidirectional once accepted.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT | NOT NULL | AUTO_INCREMENT | Primary key |
| `requester_id` | BIGINT | NOT NULL | — | FK → `users.id` — the user who sent the request |
| `receiver_id` | BIGINT | NOT NULL | — | FK → `users.id` — the user who received the request |
| `status` | VARCHAR(20) | NOT NULL | `'PENDING'` | `PENDING`, `ACCEPTED`, `DECLINED` (enum: FriendshipStatus) |
| `created_at` | DATETIME | YES | (auto) | When the request was sent |
| `updated_at` | DATETIME | YES | (auto) | When the status last changed |

**Constraints:**
- `PRIMARY KEY (id)`
- `UNIQUE (requester_id, receiver_id)` — prevents duplicate requests in the same direction
- `FOREIGN KEY (requester_id) REFERENCES users(id)`
- `FOREIGN KEY (receiver_id) REFERENCES users(id)`

---

### 2.14 `messages`

Stores private messages between users. Only accepted friends can message each other (enforced at the service layer).

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT | NOT NULL | AUTO_INCREMENT | Primary key |
| `sender_id` | BIGINT | NOT NULL | — | FK → `users.id` — message author |
| `receiver_id` | BIGINT | NOT NULL | — | FK → `users.id` — message recipient |
| `content` | TEXT | NOT NULL | — | Message body |
| `is_read` | TINYINT(1) | NOT NULL | `0` | Whether the recipient has read the message |
| `created_at` | DATETIME | YES | (auto) | Message send timestamp |

**Constraints:**
- `PRIMARY KEY (id)`
- `FOREIGN KEY (sender_id) REFERENCES users(id)`
- `FOREIGN KEY (receiver_id) REFERENCES users(id)`

---

### 2.15 `payments`

Records payment transactions for subscriptions. Supports both gateway-initiated payments and demo-mode free activations.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT | NOT NULL | AUTO_INCREMENT | Primary key |
| `user_id` | BIGINT | NOT NULL | — | FK → `users.id` |
| `subscription_id` | BIGINT | YES | NULL | FK → `subscriptions.id` |
| `amount` | BIGINT | NOT NULL | — | Payment amount in smallest currency unit |
| `currency` | VARCHAR(3) | NOT NULL | — | ISO 4217 currency code |
| `status` | VARCHAR(20) | NOT NULL | — | `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED` |
| `gateway` | VARCHAR(50) | YES | NULL | Payment gateway used (e.g., `RAZORPAY`, `STRIPE`, `FREE`) |
| `gateway_order_id` | VARCHAR(255) | YES | NULL | Order ID from the payment gateway |
| `gateway_payment_id` | VARCHAR(255) | YES | NULL | Payment ID from the payment gateway |
| `gateway_signature` | VARCHAR(500) | YES | NULL | Signature/hash from gateway for verification |
| `created_at` | DATETIME | NOT NULL | (auto) | Payment initiation timestamp |
| `updated_at` | DATETIME | YES | (auto) | Last status update timestamp |

**Constraints:**
- `PRIMARY KEY (id)`
- `FOREIGN KEY (user_id) REFERENCES users(id)`
- `FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)`

---

### 2.16 `push_tokens`

Stores device push notification tokens (FCM/APNs) for enabling push notifications.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT | NOT NULL | AUTO_INCREMENT | Primary key |
| `user_id` | BIGINT | NOT NULL | — | FK → `users.id` |
| `token` | TEXT | NOT NULL | — | Device push token |
| `platform` | VARCHAR(20) | YES | NULL | `ANDROID`, `IOS`, `WEB` |
| `created_at` | DATETIME | YES | (auto) | Token registration timestamp |
| `updated_at` | DATETIME | YES | (auto) | Last update timestamp |

**Constraints:**
- `PRIMARY KEY (id)`
- `FOREIGN KEY (user_id) REFERENCES users(id)`

---

### 2.17 `password_reset_tokens`

Stores time-limited tokens for the forgot-password / reset-password flow.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | BIGINT | NOT NULL | AUTO_INCREMENT | Primary key |
| `user_id` | BIGINT | NOT NULL | — | FK → `users.id` |
| `token` | VARCHAR(255) | NOT NULL | — | Unique random token string |
| `expiry_date` | DATETIME | NOT NULL | — | Token expiration timestamp |
| `used` | TINYINT(1) | NOT NULL | `0` | Whether the token has already been used |
| `created_at` | DATETIME | YES | (auto) | Token creation timestamp |

**Constraints:**
- `PRIMARY KEY (id)`
- `UNIQUE (token)`
- `FOREIGN KEY (user_id) REFERENCES users(id)`

---

## 3. Entity Relationship Summary

```
users ─────────────────────────────────────────────────────────┐
  │                                                             │
  ├──< book_loans >──── books ────< genres                     │
  │        │                                                    │
  │        └──< fines                                          │
  │                                                             │
  ├──< reservations >── books                                  │
  │                                                             │
  ├──< subscriptions >── subscription_plans                    │
  │                                                             │
  ├──< wishlists >────── books                                 │
  │                                                             │
  ├──< book_reviews >── books                                  │
  │                                                             │
  ├──< notifications                                           │
  │                                                             │
  ├──< notification_settings                                   │
  │                                                             │
  ├──< friendships >─── users (self-referencing)              │
  │                                                             │
  ├──< messages >─────── users (sender & receiver)            │
  │                                                             │
  ├──< payments >─────── subscriptions                        │
  │                                                             │
  ├──< push_tokens                                             │
  │                                                             │
  └──< password_reset_tokens                                   │
                                                               │
  ┌────────────────────────────────────────────────────────────┘
  └── (fines also reference users as waived_by and processed_by)
```

**Cardinality Summary:**

| Relationship | Type |
|---|---|
| User → Book Loans | One-to-Many |
| Book → Book Loans | One-to-Many |
| Book Loan → Fines | One-to-Many |
| User → Reservations | One-to-Many |
| Book → Reservations | One-to-Many |
| User → Subscriptions | One-to-Many |
| Subscription Plan → Subscriptions | One-to-Many |
| User → Wishlists | One-to-Many |
| Book → Wishlists | One-to-Many |
| User → Book Reviews | One-to-Many |
| Book → Book Reviews | One-to-Many |
| User ↔ Friendships | Many-to-Many (via join table) |
| User → Messages (sent) | One-to-Many |
| User → Messages (received) | One-to-Many |
| Genre → Books | One-to-Many |
| Genre → Sub-Genres | One-to-Many (self) |
| User → Notifications | One-to-Many |
| User → Notification Settings | One-to-Many |
| User → Payments | One-to-Many |
| Subscription → Payments | One-to-Many |

---

## 4. Indexes and Constraints Summary

### Unique Constraints

| Table | Column(s) | Purpose |
|---|---|---|
| `users` | `email` | Prevent duplicate accounts |
| `books` | `isbn` | Unique book identifier |
| `genres` | `code` | Unique genre codes |
| `subscription_plans` | `plan_code` | Unique plan identifiers |
| `wishlists` | `(user_id, book_id)` | One wishlist entry per book per user |
| `book_reviews` | `(user_id, book_id)` | One review per book per user |
| `friendships` | `(requester_id, receiver_id)` | No duplicate friend requests in one direction |
| `password_reset_tokens` | `token` | Token uniqueness |

### Performance Indexes

Critical queries are supported by indexes on:
- `book_loans`: `user_id`, `book_id`, `status`, `due_date`, `checkout_date`
- `reservations`: `user_id`, `book_id`, `status`, `reserved_at`, `available_until`
- `fines`: `book_loan_id`, `user_id`, `status`, `type`
- `subscriptions`: `user_id`, `is_active`, `end_date`, `plan_id`
- `notifications`: `user_id`, `is_read`, `created_at`

---

## 5. Enumerations (ENUM Values)

These are stored as `VARCHAR` strings in MySQL (using `@Enumerated(EnumType.STRING)`).

| Enum | Values |
|---|---|
| `UserRole` | `USER`, `ADMIN` |
| `AuthProvider` | `LOCAL`, `GOOGLE` |
| `BookLoanStatus` | `CHECKED_OUT`, `RETURNED`, `OVERDUE`, `LOST` |
| `BookLoanType` | `REGULAR`, `EXTENDED` (and others as applicable) |
| `FineStatus` | `PENDING`, `PARTIALLY_PAID`, `PAID`, `WAIVED` |
| `FineType` | `OVERDUE`, `DAMAGE`, `LOST` |
| `ReservationStatus` | `PENDING`, `AVAILABLE`, `FULFILLED`, `CANCELLED`, `EXPIRED` |
| `FriendshipStatus` | `PENDING`, `ACCEPTED`, `DECLINED` |
| `NotificationType` | `LOAN_DUE`, `LOAN_OVERDUE`, `RESERVATION_AVAILABLE`, `SUBSCRIPTION_EXPIRING`, `FINE_GENERATED`, `FINE_WAIVED`, `FRIEND_REQUEST`, `MESSAGE_RECEIVED` (and others) |
| `DeliveryMethod` | `IN_APP`, `EMAIL`, `PUSH` |

---

## 6. Connection Details

### 6.1 Local Development

```properties
# application.properties (local overrides)
spring.datasource.url=jdbc:mysql://localhost:3306/library_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&createDatabaseIfNotExist=true
spring.datasource.username=library_user
spring.datasource.password=yourpassword
```

Or set environment variables and let `application.properties` resolve them:

```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=library_db
export DB_USERNAME=library_user
export DB_PASSWORD=yourpassword
```

---

### 6.2 Railway (Production)

Railway provides a managed MySQL plugin. The connection variables are automatically injected into the service environment. Map them to the backend's expected variable names in the Railway service settings:

| Backend Variable | Source (Railway) |
|---|---|
| `DB_HOST` | `MYSQLHOST` |
| `DB_PORT` | `MYSQLPORT` |
| `DB_NAME` | `MYSQLDATABASE` |
| `DB_USERNAME` | `MYSQLUSER` |
| `DB_PASSWORD` | `MYSQLPASSWORD` |

Connection pool settings in `application.properties`:
```properties
spring.datasource.hikari.connection-timeout=30000   # 30 seconds
spring.datasource.hikari.maximum-pool-size=5        # Max 5 concurrent DB connections
spring.datasource.hikari.initialization-fail-timeout=-1  # Don't fail on slow DB startup
```

The `initialization-fail-timeout=-1` setting is important for Railway's cloud environment where the MySQL service may take a few seconds to become available after the backend starts.

---

### 6.3 Connecting with a MySQL Client (Adminer, TablePlus, DBeaver)

To inspect the production database, use Railway's connection details:

1. Go to your Railway project → MySQL plugin → **Connect** tab.
2. Copy the connection string or individual credentials.
3. In your SQL client:
   - **Host:** `<MYSQLHOST>`
   - **Port:** `<MYSQLPORT>`
   - **Database:** `<MYSQLDATABASE>`
   - **Username:** `<MYSQLUSER>`
   - **Password:** `<MYSQLPASSWORD>`
   - **SSL:** Enabled (Railway requires SSL)

---

### 6.4 Schema Migration

The project uses `spring.jpa.hibernate.ddl-auto=update`, which means:
- On startup, Hibernate compares the entity model against the current database schema.
- It **adds** new tables and columns automatically.
- It does **not** drop or rename existing columns (non-destructive).
- For destructive schema changes (dropping columns, renaming tables), manual SQL migration is required.

For production schema migrations in future iterations, consider adopting **Flyway** or **Liquibase** as a migration tool alongside or replacing the `ddl-auto=update` strategy.

---

*For user-facing documentation, see [USER_GUIDE.md](./USER_GUIDE.md).*
*For developer and API documentation, see [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md).*
