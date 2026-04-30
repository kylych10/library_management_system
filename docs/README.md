# Kitep Space — Library Management System

> **Live:** [https://kitep.space](https://kitep.space)  
> **Backend API:** [https://librarymanagementsystem-production-fc6e.up.railway.app](https://librarymanagementsystem-production-fc6e.up.railway.app)

Kitep Space is a full-stack, production-deployed Library Management System with an integrated administrative dashboard, P2P book exchange, AI assistant, and social features — built as a diploma thesis at Ala-Too International University, Bishkek, 2026.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Documentation](#documentation)

---

## Features

### For Library Members

| Feature | Description |
|---|---|
| 📚 Book Catalog | Browse, search, and filter books by title, author, or genre |
| 🔐 Authentication | Email/password login + Google OAuth2 social login |
| 📖 Book Borrowing | Borrow, renew, and return books within subscription limits |
| 📅 Reservations | Queue for unavailable books; email notification when ready |
| 💰 Fine Management | View and track automated overdue fines |
| 🏷️ Subscriptions | Monthly, quarterly, or yearly plans with different borrowing limits |
| ⭐ Reviews & Ratings | Write reviews and rate books (1–5 stars) |
| ❤️ Wishlist | Save books to a personal wishlist |
| 🔄 P2P Book Exchange | List personal books, request borrows, with virtual deposit protection |
| 👤 Public Profiles | View any user's profile, reputation, stats, and contact info |
| 👥 Friends & Messaging | Add friends, send messages, view public user profiles |
| 🤖 AI Assistant | Chat with an AI powered by Groq / LLaMA 3.3 70B using live DB data |
| 🌍 Public Browse | Browse books without an account at `/books` |
| 📄 About & Contact | Public About and Contact pages |

### For Administrators

| Feature | Description |
|---|---|
| 📊 Dashboard | Real-time stats: total users, books, active loans, revenue |
| 📚 Book Management | Full CRUD — add, edit, activate/deactivate books and genres |
| 👤 User Management | View users, edit roles, verify/toggle accounts |
| 📋 Loan Management | Process checkouts, returns, and renewals |
| 💸 Fine Management | Issue, pay, and waive fines with documented reason |
| 🏷️ Subscription Plans | Create, edit, activate, and deactivate membership tiers |
| 📌 Reservations | Monitor and manage the book reservation queue |
| 🔄 Exchange Management | Moderate reports, view user reputations, grant coin balances, block/unblock users |
| 💳 Payments | View all payment transaction history |

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool |
| Redux Toolkit | 2.x | State management |
| Material UI | 6.x | Component library |
| Tailwind CSS | 3.x | Utility styling |
| Axios | 1.x | HTTP client with JWT interceptor |
| React Router | 6.x | Client-side routing |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Spring Boot | 3.5 | REST API framework |
| Spring Security | 6.x | Authentication & authorization |
| Hibernate / JPA | 6.x | ORM layer |
| MySQL | 8.x | Relational database (17 tables) |
| JWT (JJWT) | — | Stateless authentication tokens |
| Google OAuth2 | — | Social login |
| Groq API (LLaMA 3.3 70B) | — | AI assistant inference |
| Gmail SMTP | — | Email notifications |

### Infrastructure

| Service | Purpose |
|---|---|
| Netlify | Frontend hosting + global CDN |
| Railway | Backend hosting + managed MySQL |

---

## Architecture

```
[User Browser]
      │
      │ HTTPS
      ▼
[Netlify CDN] ──── serves static React SPA ────► https://kitep.space
      │
      │ REST API calls (HTTPS + JWT)        │ Groq API (from browser)
      ▼                                      ▼
[Railway: Spring Boot]              [Groq Cloud / LLaMA 3.3]
      │
      │ JPA / JDBC
      ▼
[Railway: MySQL 8]
```

- All routes on the frontend return `index.html` (SPA routing via `_redirects`)
- JWT tokens are stored in `localStorage` and sent as `Authorization: Bearer` headers
- The AI assistant fetches live data from the backend, then calls Groq directly from the browser
- Google OAuth2: `browser → /oauth2/authorization/google → Google → backend callback → JWT → frontend`
- CORS: a highest-precedence filter ensures headers are present even on error responses

---

## Quick Start

### Prerequisites

- Java 21 (Amazon Corretto recommended)
- Node.js 20 LTS
- MySQL 8 (or connect to Railway)
- Maven

### Backend

```bash
cd source/Backend-springboot

# Set environment variables (or rely on application.properties defaults for local dev)
# DB connects to Railway by default — see application.properties

mvn spring-boot:run
# API available at http://localhost:8080
```

### Frontend

```bash
cd source/Frontend-Vite

npm install

# Create .env for local development
echo "VITE_API_BASE_URL=http://localhost:8080" > .env
echo "VITE_GROQ_API_KEY=your_groq_key" >> .env

npm run dev
# App available at http://localhost:5173
```

---

## Environment Variables

### Backend

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | `monorail.proxy.rlwy.net` | MySQL TCP proxy host |
| `DB_PORT` | `47188` | MySQL TCP proxy port |
| `DB_NAME` | `railway` | Database name |
| `DB_USERNAME` | `root` | MySQL username |
| `DB_PASSWORD` | *(required)* | MySQL password |
| `MAIL_USERNAME` | *(empty)* | Gmail address for notifications |
| `MAIL_PASSWORD` | *(empty)* | Gmail app password |
| `GOOGLE_CLIENT_ID` | `dummy` | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | `dummy` | Google OAuth2 client secret |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend base URL |
| `BASE_URL` | `http://localhost:8080` | Backend base URL |
| `PORT` | `8080` | Server listening port |

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend URL (production: Railway URL) |
| `VITE_GROQ_API_KEY` | Groq API key for the AI assistant |

---

## Deployment

### Frontend → Netlify

```
Build command:   npm run build
Publish dir:     dist
```

- Set `VITE_API_BASE_URL` and `VITE_GROQ_API_KEY` in Netlify dashboard → Environment variables
- The `public/_redirects` file handles SPA routing: `/* /index.html 200`
- Custom domain: `kitep.space` (configure in Netlify → Domain management)

### Backend → Railway

- Railway auto-detects Maven and builds with Nixpacks (no Dockerfile needed)
- Provision MySQL as a separate service in the same Railway project
- Use `${{MySQL.RAILWAY_TCP_PROXY_DOMAIN}}` and `${{MySQL.RAILWAY_TCP_PROXY_PORT}}` for DB connection
- Set all environment variables in Railway → Variables tab
- `ddl-auto=update` — Hibernate creates/updates tables automatically on startup

---

## Documentation

| Document | Description |
|---|---|
| [USER_GUIDE.md](USER_GUIDE.md) | End-user guide for all features |
| [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) | Architecture, API reference, and developer setup |
| [DATABASE.md](DATABASE.md) | Full database schema (17 tables) with DBML |

---

**Author:** Kylychbek Parpiev  
**Supervisor:** Talgat Mendekov  
**University:** Ala-Too International University, Bishkek, Kyrgyz Republic, 2026
