# Kitep Space — Database Documentation

**Live:** [https://kitep.space](https://kitep.space)

This document describes the complete MySQL 8 database schema for the Kitep Space Library Management System — 17 tables covering the core library, P2P exchange, social, and authentication modules.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Entity Relationship Summary](#2-entity-relationship-summary)
3. [Core Library Tables](#3-core-library-tables)
4. [Financial Tables](#4-financial-tables)
5. [P2P Exchange Tables](#5-p2p-exchange-tables)
6. [Social Tables](#6-social-tables)
7. [Notification Tables](#7-notification-tables)
8. [Authentication Tables](#8-authentication-tables)
9. [Full DBML Schema](#9-full-dbml-schema)

---

## 1. Overview

| Category | Tables |
|---|---|
| Core Library | `users`, `books`, `genres`, `book_loans`, `reservations` |
| Financial | `fines`, `subscriptions`, `subscription_plans`, `payments` |
| P2P Exchange | `exchange_books`, `exchange_requests`, `exchange_borrow_records`, `exchange_deposits`, `user_reputations`, `exchange_reports` |
| Social | `friendships`, `messages` |
| Content | `book_reviews`, `wishlists` |
| Notifications | `notifications`, `notification_settings`, `push_tokens` |
| Auth | `password_reset_tokens` |

**Total: 22 tables** (17 core + 5 exchange sub-module)

---

## 2. Entity Relationship Summary

```
users
  ├── book_loans (many)         → books (many)
  ├── fines (many)              → book_loans
  ├── reservations (many)       → books
  ├── subscriptions (many)      → subscription_plans
  ├── payments (many)
  ├── book_reviews (many)       → books
  ├── wishlists (many)          → books
  ├── notifications (many)
  ├── notification_settings (1:1)
  ├── push_tokens (many)
  ├── password_reset_tokens (many)
  ├── user_reputations (1:1)
  ├── exchange_books (many, as owner)
  ├── exchange_requests (many, as requester)
  ├── exchange_borrow_records (many, as borrower/lender)
  ├── exchange_reports (many, as reporter/reported)
  ├── friendships (many, as requester/receiver)
  └── messages (many, as sender/receiver)

books
  └── genres (many-to-one, self-referential hierarchy)

exchange_borrow_records
  └── exchange_deposits (1:1)
```

---

## 3. Core Library Tables

### `users`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | |
| full_name | VARCHAR(255) | NOT NULL | |
| password | VARCHAR(255) | | BCrypt hashed, null for OAuth users |
| email | VARCHAR(255) | NOT NULL, UNIQUE | |
| phone | VARCHAR(255) | | |
| auth_provider | VARCHAR(50) | NOT NULL, DEFAULT 'LOCAL' | LOCAL or GOOGLE |
| google_id | VARCHAR(255) | | Google sub claim |
| profile_image | TEXT | | Base64 or URL |
| role | VARCHAR(50) | NOT NULL | ROLE_USER or ROLE_ADMIN |
| verified | BOOLEAN | NOT NULL, DEFAULT false | |
| created_at | DATETIME | NOT NULL | Auto-set on insert |
| updated_at | DATETIME | NOT NULL | Auto-updated |
| last_login | DATETIME | | Updated on each login |

---

### `genres`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | |
| code | VARCHAR(50) | NOT NULL, UNIQUE | e.g. `FICTION`, `SCIENCE` |
| name | VARCHAR(100) | NOT NULL | Display name |
| description | VARCHAR(500) | | |
| display_order | INT | DEFAULT 0 | Sort order in UI |
| active | BOOLEAN | NOT NULL, DEFAULT true | |
| parent_genre_id | BIGINT | FK → genres.id | Self-referential hierarchy |
| created_at | DATETIME | NOT NULL | |
| updated_at | DATETIME | NOT NULL | |

**Indexes:** `code` (unique), `name`, `active`

---

### `books`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | |
| isbn | VARCHAR(20) | NOT NULL, UNIQUE | |
| title | VARCHAR(255) | NOT NULL | |
| author | VARCHAR(255) | NOT NULL | |
| genre_id | BIGINT | NOT NULL, FK → genres.id | |
| publisher | VARCHAR(100) | | |
| publication_date | DATE | | |
| language | VARCHAR(20) | | |
| pages | INT | | |
| description | VARCHAR(2000) | | |
| total_copies | INT | NOT NULL | |
| available_copies | INT | NOT NULL | Decremented on checkout |
| price | DECIMAL(10,2) | | |
| cover_image_url | VARCHAR(500) | | |
| active | BOOLEAN | NOT NULL, DEFAULT true | Soft delete |
| created_at | DATETIME | NOT NULL | |
| updated_at | DATETIME | NOT NULL | |

**Indexes:** `isbn` (unique), `title`, `author`, `genre_id`

---

### `book_loans`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | |
| user_id | BIGINT | NOT NULL, FK → users.id | |
| book_id | BIGINT | NOT NULL, FK → books.id | |
| type | VARCHAR(20) | NOT NULL | PHYSICAL or DIGITAL |
| status | VARCHAR(20) | NOT NULL | CHECKED_OUT, RETURNED, OVERDUE, LOST, DAMAGED |
| checkout_date | DATE | NOT NULL | |
| due_date | DATE | NOT NULL | checkout_date + plan.maxDaysPerBook |
| return_date | DATE | | |
| renewal_count | INT | NOT NULL, DEFAULT 0 | |
| max_renewals | INT | NOT NULL, DEFAULT 2 | |
| notes | VARCHAR(500) | | |
| is_overdue | BOOLEAN | NOT NULL, DEFAULT false | Set by daily scheduler |
| overdue_days | INT | DEFAULT 0 | |
| created_at | DATETIME | NOT NULL | |
| updated_at | DATETIME | NOT NULL | |

**Indexes:** `user_id`, `book_id`, `status`, `due_date`, `checkout_date`

---

### `reservations`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | |
| user_id | BIGINT | NOT NULL, FK → users.id | |
| book_id | BIGINT | NOT NULL, FK → books.id | |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | PENDING, AVAILABLE, FULFILLED, CANCELLED, EXPIRED |
| reserved_at | DATETIME | NOT NULL | |
| available_at | DATETIME | | When book became available |
| available_until | DATETIME | | 72h hold window |
| fulfilled_at | DATETIME | | When checked out |
| cancelled_at | DATETIME | | |
| queue_position | INT | | Position in queue |
| notification_sent | BOOLEAN | NOT NULL, DEFAULT false | |
| notes | TEXT | | |
| created_at | DATETIME | NOT NULL | |
| updated_at | DATETIME | | |

---

## 4. Financial Tables

### `fines`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | |
| book_loan_id | BIGINT | NOT NULL, FK → book_loans.id | |
| user_id | BIGINT | NOT NULL, FK → users.id | |
| type | VARCHAR(20) | NOT NULL | OVERDUE, DAMAGE, LOSS, PROCESSING |
| amount | BIGINT | NOT NULL | In smallest currency unit |
| amount_paid | BIGINT | NOT NULL, DEFAULT 0 | |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | PENDING, PARTIALLY_PAID, PAID, WAIVED |
| reason | VARCHAR(500) | | |
| notes | VARCHAR(1000) | | |
| waived_by_user_id | BIGINT | FK → users.id | Admin who waived |
| waived_at | DATETIME | | |
| waiver_reason | VARCHAR(500) | | |
| paid_at | DATETIME | | |
| processed_by_user_id | BIGINT | FK → users.id | Admin who processed payment |
| transaction_id | VARCHAR(100) | | |
| created_at | DATETIME | NOT NULL | |
| updated_at | DATETIME | NOT NULL | |

---

### `subscription_plans`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | |
| plan_code | VARCHAR(50) | NOT NULL, UNIQUE | e.g. MONTHLY, YEARLY |
| name | VARCHAR(100) | NOT NULL | Display name |
| description | TEXT | | |
| duration_days | INT | NOT NULL | Plan length in days |
| price | BIGINT | NOT NULL | In smallest currency unit |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'INR' | ISO 4217 |
| max_books_allowed | INT | NOT NULL | Max concurrent borrows |
| max_days_per_book | INT | NOT NULL | Loan period |
| display_order | INT | DEFAULT 0 | |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | |
| is_featured | BOOLEAN | NOT NULL, DEFAULT false | |
| badge_text | VARCHAR(50) | | e.g. "Best Value" |
| created_by | VARCHAR(100) | | |
| updated_by | VARCHAR(100) | | |
| created_at | DATETIME | NOT NULL | |
| updated_at | DATETIME | NOT NULL | |

---

### `subscriptions`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | |
| user_id | BIGINT | NOT NULL, FK → users.id | |
| plan_id | BIGINT | NOT NULL, FK → subscription_plans.id | |
| plan_name | VARCHAR(100) | | Cached at purchase time |
| plan_code | VARCHAR(50) | | Cached |
| price | BIGINT | | Cached price paid |
| currency | VARCHAR(3) | | |
| start_date | DATE | NOT NULL | |
| end_date | DATE | NOT NULL | start_date + plan.durationDays |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | |
| max_books_allowed | INT | NOT NULL | Cached from plan |
| max_days_per_book | INT | NOT NULL | Cached from plan |
| auto_renew | BOOLEAN | NOT NULL, DEFAULT false | |
| cancelled_at | DATETIME | | |
| cancellation_reason | TEXT | | |
| notes | TEXT | | |
| created_at | DATETIME | NOT NULL | |
| updated_at | DATETIME | NOT NULL | |

---

### `payments`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | |
| user_id | BIGINT | NOT NULL, FK → users.id | |
| book_loan_id | BIGINT | FK → book_loans.id | If paying a fine |
| subscription_id | BIGINT | FK → subscriptions.id | If paying for subscription |
| fine_id | BIGINT | FK → fines.id | |
| payment_type | VARCHAR(30) | NOT NULL | FINE, SUBSCRIPTION, MEMBERSHIP, REFUND |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED, REFUNDED |
| gateway | VARCHAR(20) | NOT NULL | STRIPE, CASH, MANUAL, FREE |
| amount | BIGINT | NOT NULL | |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'INR' | |
| transaction_id | VARCHAR(255) | | Internal TXN ID |
| gateway_payment_id | VARCHAR(255) | | Stripe payment_intent ID |
| gateway_order_id | VARCHAR(255) | | |
| gateway_signature | VARCHAR(512) | | |
| payment_method | VARCHAR(50) | | card, upi, etc. |
| metadata | TEXT | | JSON from gateway |
| description | TEXT | | |
| failure_reason | TEXT | | |
| retry_count | INT | NOT NULL, DEFAULT 0 | |
| initiated_at | DATETIME | NOT NULL | |
| completed_at | DATETIME | | |
| notification_sent | BOOLEAN | NOT NULL, DEFAULT false | |
| active | BOOLEAN | NOT NULL, DEFAULT true | Soft delete |
| created_at | DATETIME | NOT NULL | |
| updated_at | DATETIME | NOT NULL | |

---

## 5. P2P Exchange Tables

### `exchange_books`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | |
| owner_id | BIGINT | NOT NULL, FK → users.id | |
| title | VARCHAR(255) | NOT NULL | |
| author | VARCHAR(255) | NOT NULL | |
| description | TEXT | | |
| book_condition | VARCHAR(20) | NOT NULL | NEW, GOOD, FAIR, POOR |
| cover_image_url | TEXT | | Base64 or URL |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'AVAILABLE' | AVAILABLE, REQUESTED, BORROWED, RETURNED, UNAVAILABLE |
| isbn | VARCHAR(20) | | Optional |
| genre | VARCHAR(100) | | Free text |
| borrow_duration_days | INT | NOT NULL, DEFAULT 14 | |
| created_at | DATETIME | NOT NULL | |
| updated_at | DATETIME | | |

> **Note:** Column is `book_condition`, not `condition` — `condition` is a reserved MySQL keyword.

---

### `exchange_requests`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | |
| book_id | BIGINT | NOT NULL, FK → exchange_books.id | |
| requester_id | BIGINT | NOT NULL, FK → users.id | |
| message | VARCHAR(500) | | Optional message to owner |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | PENDING, ACCEPTED, REJECTED, CANCELLED |
| created_at | DATETIME | NOT NULL | |
| updated_at | DATETIME | | |

---

### `exchange_borrow_records`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | |
| exchange_request_id | BIGINT | NOT NULL, UNIQUE, FK → exchange_requests.id | |
| borrower_id | BIGINT | NOT NULL, FK → users.id | |
| lender_id | BIGINT | NOT NULL, FK → users.id | |
| book_id | BIGINT | NOT NULL, FK → exchange_books.id | |
| due_date | DATE | NOT NULL | |
| returned_at | DATETIME | | |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | ACTIVE, RETURNED, OVERDUE, LOST |
| borrower_rating | INT | | Rating given by borrower to lender (1–5) |
| borrower_comment | VARCHAR(500) | | |
| lender_rating | INT | | Rating given by lender to borrower (1–5) |
| lender_comment | VARCHAR(500) | | |
| is_overdue | BOOLEAN | NOT NULL, DEFAULT false | |
| penalty_applied | BOOLEAN | NOT NULL, DEFAULT false | |
| created_at | DATETIME | NOT NULL | |
| updated_at | DATETIME | | |

---

### `exchange_deposits`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | |
| borrow_record_id | BIGINT | NOT NULL, UNIQUE, FK → exchange_borrow_records.id | |
| amount | BIGINT | NOT NULL | Default: 500 coins |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'LOCKED' | LOCKED, RELEASED, FORFEITED |
| locked_at | DATETIME | NOT NULL | When deposit was locked |
| resolved_at | DATETIME | | When released or forfeited |

---

### `user_reputations`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | |
| user_id | BIGINT | NOT NULL, UNIQUE, FK → users.id | One per user |
| reputation_score | DOUBLE | NOT NULL, DEFAULT 5.0 | Range 1.0–5.0 |
| total_exchanges | INT | NOT NULL, DEFAULT 0 | Successful books lent |
| total_borrows | INT | NOT NULL, DEFAULT 0 | Successful books borrowed |
| penalty_points | INT | NOT NULL, DEFAULT 0 | Accumulates on overdue |
| blocked_from_exchange | BOOLEAN | NOT NULL, DEFAULT false | Set at 10+ penalty points |
| exchange_balance | BIGINT | NOT NULL, DEFAULT 1000 | Virtual coin balance |
| created_at | DATETIME | NOT NULL | |
| updated_at | DATETIME | | |

---

### `exchange_reports`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | |
| reporter_id | BIGINT | NOT NULL, FK → users.id | |
| reported_user_id | BIGINT | NOT NULL, FK → users.id | |
| borrow_record_id | BIGINT | FK → exchange_borrow_records.id | |
| reason | VARCHAR(30) | NOT NULL | LATE_RETURN, DAMAGED_BOOK, NO_SHOW, FRAUDULENT, OTHER |
| description | TEXT | | |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | PENDING, REVIEWED, RESOLVED, DISMISSED |
| admin_notes | TEXT | | Admin decision notes |
| created_at | DATETIME | NOT NULL | |
| updated_at | DATETIME | | |

---

## 6. Social Tables

### `friendships`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | |
| requester_id | BIGINT | NOT NULL, FK → users.id | |
| receiver_id | BIGINT | NOT NULL, FK → users.id | |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | PENDING, ACCEPTED, DECLINED, BLOCKED |
| created_at | DATETIME | | |
| updated_at | DATETIME | | |

**Unique constraint:** `(requester_id, receiver_id)`

---

### `messages`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | |
| sender_id | BIGINT | NOT NULL, FK → users.id | |
| receiver_id | BIGINT | NOT NULL, FK → users.id | |
| content | TEXT | NOT NULL | |
| is_read | BOOLEAN | NOT NULL, DEFAULT false | Cleared when conversation is fetched |
| created_at | DATETIME | | |

---

### `book_reviews`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | |
| user_id | BIGINT | NOT NULL, FK → users.id | |
| book_id | BIGINT | NOT NULL, FK → books.id | |
| rating | INT | NOT NULL | 1–5 stars |
| review_text | VARCHAR(2000) | NOT NULL | Min 10 chars |
| title | VARCHAR(200) | | Optional review title |
| is_verified_reader | BOOLEAN | NOT NULL, DEFAULT false | True if user completed a loan |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Soft delete / moderation |
| helpful_count | INT | NOT NULL, DEFAULT 0 | |
| created_at | DATETIME | NOT NULL | |
| updated_at | DATETIME | NOT NULL | |

**Unique constraint:** `(user_id, book_id)` — one review per user per book

---

### `wishlists`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | |
| user_id | BIGINT | NOT NULL, FK → users.id | |
| book_id | BIGINT | NOT NULL, FK → books.id | |
| added_at | DATETIME | NOT NULL | |
| notes | VARCHAR(500) | | |

**Unique constraint:** `(user_id, book_id)`

---

## 7. Notification Tables

### `notifications`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | |
| user_id | BIGINT | NOT NULL, FK → users.id | |
| title | VARCHAR(255) | NOT NULL | |
| message | TEXT | | |
| type | VARCHAR(50) | | DUE_DATE_ALERT, RESERVATION_AVAILABLE, FINE_NOTIFICATION, etc. |
| is_read | BOOLEAN | NOT NULL, DEFAULT false | |
| related_entity_id | BIGINT | | FK to related record |
| delivery_method | VARCHAR(50) | DEFAULT 'IN_APP' | IN_APP, EMAIL, PUSH |
| read_at | DATETIME | | |
| created_at | DATETIME | NOT NULL | |

### `notification_settings`

One row per user controlling per-channel preferences.

| Column | Type | Default | Description |
|---|---|---|---|
| email_enabled | BOOLEAN | true | |
| push_enabled | BOOLEAN | false | |
| book_reminders_enabled | BOOLEAN | true | |
| due_date_alerts_enabled | BOOLEAN | true | |
| new_arrivals_enabled | BOOLEAN | true | |
| recommendations_enabled | BOOLEAN | true | |
| marketing_emails_enabled | BOOLEAN | false | |
| reservation_notifications_enabled | BOOLEAN | true | |
| subscription_notifications_enabled | BOOLEAN | true | |

### `push_tokens`

| Column | Type | Description |
|---|---|---|
| token | VARCHAR(255), UNIQUE | Browser/device push token |
| platform | VARCHAR(50) | WEB, ANDROID, IOS |
| is_active | BOOLEAN | |
| last_used_at | DATETIME | |

---

## 8. Authentication Tables

### `password_reset_tokens`

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | |
| token | VARCHAR(255) | NOT NULL, UNIQUE | Secure random token |
| user_id | BIGINT | NOT NULL, FK → users.id | |
| expiry_date | DATETIME | NOT NULL | Token valid for 24h |

---

## 9. Full DBML Schema

Paste the following into [https://dbdiagram.io](https://dbdiagram.io) to generate a visual ERD.

```dbml
Table users {
  id bigint [pk, increment]
  full_name varchar(255) [not null]
  email varchar(255) [not null, unique]
  password varchar(255)
  phone varchar(255)
  auth_provider varchar(50) [not null, default: "LOCAL"]
  google_id varchar(255)
  profile_image text
  role varchar(50) [not null]
  verified boolean [not null, default: false]
  created_at datetime [not null]
  updated_at datetime [not null]
  last_login datetime
}

Table genres {
  id bigint [pk, increment]
  code varchar(50) [not null, unique]
  name varchar(100) [not null]
  parent_genre_id bigint
  active boolean [not null, default: true]
  created_at datetime [not null]
  updated_at datetime [not null]
}
Ref: genres.parent_genre_id > genres.id

Table books {
  id bigint [pk, increment]
  isbn varchar(20) [not null, unique]
  title varchar(255) [not null]
  author varchar(255) [not null]
  genre_id bigint [not null]
  total_copies int [not null]
  available_copies int [not null]
  cover_image_url varchar(500)
  active boolean [not null, default: true]
  created_at datetime [not null]
  updated_at datetime [not null]
}
Ref: books.genre_id > genres.id

Table book_loans {
  id bigint [pk, increment]
  user_id bigint [not null]
  book_id bigint [not null]
  status varchar(20) [not null]
  checkout_date date [not null]
  due_date date [not null]
  return_date date
  is_overdue boolean [not null, default: false]
  created_at datetime [not null]
  updated_at datetime [not null]
}
Ref: book_loans.user_id > users.id
Ref: book_loans.book_id > books.id

Table fines {
  id bigint [pk, increment]
  book_loan_id bigint [not null]
  user_id bigint [not null]
  type varchar(20) [not null]
  amount bigint [not null]
  amount_paid bigint [not null, default: 0]
  status varchar(20) [not null, default: "PENDING"]
  waived_by_user_id bigint
  paid_at datetime
  created_at datetime [not null]
  updated_at datetime [not null]
}
Ref: fines.book_loan_id > book_loans.id
Ref: fines.user_id > users.id
Ref: fines.waived_by_user_id > users.id

Table subscription_plans {
  id bigint [pk, increment]
  plan_code varchar(50) [not null, unique]
  name varchar(100) [not null]
  duration_days int [not null]
  price bigint [not null]
  max_books_allowed int [not null]
  max_days_per_book int [not null]
  is_active boolean [not null, default: true]
  created_at datetime [not null]
  updated_at datetime [not null]
}

Table subscriptions {
  id bigint [pk, increment]
  user_id bigint [not null]
  plan_id bigint [not null]
  plan_name varchar(100)
  start_date date [not null]
  end_date date [not null]
  is_active boolean [not null, default: true]
  max_books_allowed int [not null]
  max_days_per_book int [not null]
  created_at datetime [not null]
  updated_at datetime [not null]
}
Ref: subscriptions.user_id > users.id
Ref: subscriptions.plan_id > subscription_plans.id

Table reservations {
  id bigint [pk, increment]
  user_id bigint [not null]
  book_id bigint [not null]
  status varchar(20) [not null, default: "PENDING"]
  reserved_at datetime [not null]
  available_until datetime
  queue_position int
  notification_sent boolean [not null, default: false]
  created_at datetime [not null]
}
Ref: reservations.user_id > users.id
Ref: reservations.book_id > books.id

Table exchange_books {
  id bigint [pk, increment]
  owner_id bigint [not null]
  title varchar(255) [not null]
  author varchar(255) [not null]
  book_condition varchar(20) [not null]
  cover_image_url text
  status varchar(20) [not null, default: "AVAILABLE"]
  borrow_duration_days int [not null, default: 14]
  created_at datetime [not null]
}
Ref: exchange_books.owner_id > users.id

Table exchange_requests {
  id bigint [pk, increment]
  book_id bigint [not null]
  requester_id bigint [not null]
  message varchar(500)
  status varchar(20) [not null, default: "PENDING"]
  created_at datetime [not null]
}
Ref: exchange_requests.book_id > exchange_books.id
Ref: exchange_requests.requester_id > users.id

Table exchange_borrow_records {
  id bigint [pk, increment]
  exchange_request_id bigint [not null, unique]
  borrower_id bigint [not null]
  lender_id bigint [not null]
  book_id bigint [not null]
  due_date date [not null]
  returned_at datetime
  status varchar(20) [not null, default: "ACTIVE"]
  borrower_rating int
  lender_rating int
  is_overdue boolean [not null, default: false]
  penalty_applied boolean [not null, default: false]
  created_at datetime [not null]
}
Ref: exchange_borrow_records.exchange_request_id - exchange_requests.id
Ref: exchange_borrow_records.borrower_id > users.id
Ref: exchange_borrow_records.lender_id > users.id
Ref: exchange_borrow_records.book_id > exchange_books.id

Table exchange_deposits {
  id bigint [pk, increment]
  borrow_record_id bigint [not null, unique]
  amount bigint [not null]
  status varchar(20) [not null, default: "LOCKED"]
  locked_at datetime [not null]
  resolved_at datetime
}
Ref: exchange_deposits.borrow_record_id - exchange_borrow_records.id

Table user_reputations {
  id bigint [pk, increment]
  user_id bigint [not null, unique]
  reputation_score float [not null, default: 5.0]
  exchange_balance bigint [not null, default: 1000]
  total_exchanges int [not null, default: 0]
  total_borrows int [not null, default: 0]
  penalty_points int [not null, default: 0]
  blocked_from_exchange boolean [not null, default: false]
  created_at datetime [not null]
  updated_at datetime
}
Ref: user_reputations.user_id - users.id

Table exchange_reports {
  id bigint [pk, increment]
  reporter_id bigint [not null]
  reported_user_id bigint [not null]
  borrow_record_id bigint
  reason varchar(30) [not null]
  description text
  status varchar(20) [not null, default: "PENDING"]
  admin_notes text
  created_at datetime [not null]
}
Ref: exchange_reports.reporter_id > users.id
Ref: exchange_reports.reported_user_id > users.id
Ref: exchange_reports.borrow_record_id > exchange_borrow_records.id

Table friendships {
  id bigint [pk, increment]
  requester_id bigint [not null]
  receiver_id bigint [not null]
  status varchar(20) [not null, default: "PENDING"]
  created_at datetime
  updated_at datetime

  indexes {
    (requester_id, receiver_id) [unique]
  }
}
Ref: friendships.requester_id > users.id
Ref: friendships.receiver_id > users.id

Table messages {
  id bigint [pk, increment]
  sender_id bigint [not null]
  receiver_id bigint [not null]
  content text [not null]
  is_read boolean [not null, default: false]
  created_at datetime
}
Ref: messages.sender_id > users.id
Ref: messages.receiver_id > users.id

Table book_reviews {
  id bigint [pk, increment]
  user_id bigint [not null]
  book_id bigint [not null]
  rating int [not null]
  review_text varchar(2000) [not null]
  is_verified_reader boolean [not null, default: false]
  is_active boolean [not null, default: true]
  created_at datetime [not null]
  updated_at datetime [not null]

  indexes {
    (user_id, book_id) [unique]
  }
}
Ref: book_reviews.user_id > users.id
Ref: book_reviews.book_id > books.id

Table wishlists {
  id bigint [pk, increment]
  user_id bigint [not null]
  book_id bigint [not null]
  added_at datetime [not null]

  indexes {
    (user_id, book_id) [unique]
  }
}
Ref: wishlists.user_id > users.id
Ref: wishlists.book_id > books.id

Table notifications {
  id bigint [pk, increment]
  user_id bigint [not null]
  title varchar(255) [not null]
  message text
  type varchar(50)
  is_read boolean [not null, default: false]
  delivery_method varchar(50) [default: "IN_APP"]
  read_at datetime
  created_at datetime [not null]
}
Ref: notifications.user_id > users.id

Table password_reset_tokens {
  id bigint [pk, increment]
  token varchar(255) [not null, unique]
  user_id bigint [not null]
  expiry_date datetime [not null]
}
Ref: password_reset_tokens.user_id > users.id
```
