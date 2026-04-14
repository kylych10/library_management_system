# Library Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-kylychlibrary.netlify.app-brightgreen?style=for-the-badge&logo=netlify)](https://kylychlibrary.netlify.app)
[![Backend API](https://img.shields.io/badge/Backend%20API-Railway-blueviolet?style=for-the-badge&logo=railway)](https://librarymanagementsystem-production-fc6e.up.railway.app)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-green?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev)
[![MySQL](https://img.shields.io/badge/MySQL-8-orange?style=for-the-badge&logo=mysql)](https://www.mysql.com)

---

## Overview

Library Management System is a full-stack web application that modernises the way libraries operate and how patrons interact with library resources. Built with a React/Vite frontend and a Spring Boot backend, it provides a complete digital library experience — from browsing and borrowing books to managing subscriptions, paying fines, connecting with fellow readers, and getting instant answers from an AI chat assistant. The platform supports both regular users and administrators, each with role-specific dashboards, and is fully deployed in the cloud via Netlify (frontend) and Railway (backend + database).

---

## Features

### 📚 Books & Catalog
- Browse the full library catalog with cover images, descriptions, and metadata
- Search books by title, author, or ISBN
- Filter by genre and availability
- Hierarchical genre system with sub-genre support
- Book detail pages with ratings and community reviews
- Admin: add, edit, bulk-import, and soft-delete books

### 🔄 Loans & Borrowing
- Checkout books (subject to active subscription)
- Return books (check-in)
- Renew loans up to 2 times while not overdue
- Automatic overdue detection and tracking
- Full personal loan history with status filtering

### 📅 Reservations
- Place a hold/reservation on unavailable books
- Queue position tracking
- Automatic notification when a reserved book becomes available
- Cancel reservations at any time

### 💳 Subscriptions & Plans
- Multiple subscription tiers (Monthly, Quarterly, Yearly)
- Each plan defines max concurrent books and max loan duration
- Free-subscribe demo mode (no real payment required in production)
- Subscription history and renewal management
- Admin: create and manage subscription plans

### 💰 Fines & Payments
- Automatic fine generation for overdue books
- Partial payment and full payment support
- Fine waiver by admin with audit trail
- Payment history tracking
- Admin fine management dashboard

### ❤️ Wishlist
- Save books to a personal wishlist
- Optional notes per wishlist item
- One-click remove from wishlist

### 👥 Social — Friends & Messaging
- Search for other users by name or email
- Send, accept, or decline friend requests
- Remove friends / cancel pending requests
- Private 1-to-1 messaging between friends
- Real-time-style message polling and unread count badge

### ⭐ Reviews & Ratings
- Leave a 1–5 star rating with a written review
- Verified Reader badge for users who have completed a loan
- Helpful vote count per review
- Admin moderation of reviews

### 🔔 Notifications
- In-app notification centre
- Email notifications via Gmail SMTP
- Due-date reminder emails (configurable days in advance)
- Notifications for: loan updates, reservation availability, subscription events

### 🤖 AI Assistant
- Integrated AI chat assistant powered by Groq
- Ask questions about the library, books, or how to use the system
- Context-aware answers about your account status

### 🛡️ Admin Panel
- Dedicated admin dashboard with statistics
- Manage users, books, genres, loans, reservations, fines, subscriptions, reviews, payments
- Trigger overdue updates and subscription expiry checks manually

---

## Tech Stack

| Layer | Technology | Version / Notes |
|---|---|---|
| **Frontend Framework** | React | 19.1 |
| **Frontend Build Tool** | Vite | 7.x |
| **UI Components** | Material UI (MUI) | 7.x |
| **Styling** | Tailwind CSS | 4.x |
| **State Management** | Redux Toolkit | 2.x |
| **Routing** | React Router DOM | 7.x |
| **HTTP Client** | Axios | 1.x |
| **Backend Framework** | Spring Boot | 3.5.6 |
| **Language (Backend)** | Java | 17 |
| **Security** | Spring Security + JWT (jjwt 0.12.6) | — |
| **Authentication** | Local (email/password) + Google OAuth2 | — |
| **ORM** | Spring Data JPA / Hibernate | — |
| **Database** | MySQL | 8.x on Railway |
| **Email** | Spring Mail via Gmail SMTP | — |
| **AI Integration** | Groq API | — |
| **Frontend Deployment** | Netlify | — |
| **Backend Deployment** | Railway | — |
| **Database Hosting** | Railway (MySQL plugin) | — |

---

## System Architecture

```
                        ┌─────────────────────────────────────┐
                        │           User's Browser             │
                        │   (React 19 + Redux + MUI + Tailwind)│
                        └────────────────┬────────────────────┘
                                         │ HTTPS
                        ┌────────────────▼────────────────────┐
                        │            Netlify CDN               │
                        │   Static hosting for React/Vite app  │
                        │   https://kylychlibrary.netlify.app  │
                        └────────────────┬────────────────────┘
                                         │ REST API (HTTPS / JSON)
                        ┌────────────────▼────────────────────┐
                        │        Railway — Spring Boot          │
                        │  Java 17 · Spring Boot 3.5.6         │
                        │  Spring Security · JWT · OAuth2       │
                        │  Spring Mail · Scheduled Tasks        │
                        │  https://...railway.app              │
                        └───────┬─────────────────────────────┘
                                │ JDBC (MySQL Connector/J)
                        ┌───────▼─────────────────────────────┐
                        │       Railway — MySQL 8               │
                        │  Managed relational database          │
                        │  Auto-created schema (DDL update)     │
                        └─────────────────────────────────────┘

                        External Services:
                        ┌──────────────┐  ┌──────────────────┐
                        │ Google OAuth2│  │   Groq AI API    │
                        │  (Login)     │  │ (AI Chat Assist) │
                        └──────────────┘  └──────────────────┘
                        ┌──────────────┐
                        │  Gmail SMTP  │
                        │   (Email)    │
                        └──────────────┘
```

---

## Quick Start (Local Development)

### Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- npm 9+
- MySQL 8 (local instance or Docker)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Library Management System"
```

### 2. Configure Backend

Copy or create `source/Backend-springboot/src/main/resources/application.properties` and set the required environment variables (or export them in your shell):

```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=library_db
export DB_USERNAME=root
export DB_PASSWORD=yourpassword
export MAIL_USERNAME=your@gmail.com
export MAIL_PASSWORD=your-app-password
export GOOGLE_CLIENT_ID=your-google-client-id
export GOOGLE_CLIENT_SECRET=your-google-client-secret
export BASE_URL=http://localhost:8080
export FRONTEND_URL=http://localhost:5173
```

### 3. Run the Backend

```bash
cd source/Backend-springboot
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

### 4. Configure Frontend

```bash
cd source/Frontend-Vite
cp .env.example .env
# Edit .env and set VITE_API_URL=http://localhost:8080
```

### 5. Install Frontend Dependencies and Run

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Documentation

| Document | Description |
|---|---|
| [USER_GUIDE.md](./USER_GUIDE.md) | End-user guide: registration, borrowing, subscriptions, social features, AI assistant |
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | Developer reference: architecture, API endpoints, Redux store, deployment |
| [DATABASE.md](./DATABASE.md) | Database schema: all tables, columns, relationships, indexes |

---

## Project Structure (Top Level)

```
Library Management System/
├── docs/                          # Project documentation
│   ├── README.md                  # This file
│   ├── USER_GUIDE.md
│   ├── DEVELOPER_GUIDE.md
│   └── DATABASE.md
└── source/
    ├── Backend-springboot/        # Spring Boot REST API
    └── Frontend-Vite/             # React + Vite SPA
```

---

## License

This project is provided for educational and demonstration purposes.

---

*Built by **kkylych** — Last updated April 2026*
