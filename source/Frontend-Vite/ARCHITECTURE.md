# 🏗️ Library - Frontend Architecture

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Zosh Library                          │
│                    Frontend Application                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │  Pages  │          │Components│         │  Store  │
   └─────────┘          └─────────┘          └─────────┘
        │                     │                     │
        │                     │                     │
        └─────────────────────┴─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Backend API    │
                    │ (Spring Boot)    │
                    └──────────────────┘
```

## 🎯 Component Hierarchy

```
App (Router)
│
├── LandingPage
│   ├── Navbar
│   │   └── Mobile Menu
│   ├── Hero
│   │   ├── Badge
│   │   ├── Heading
│   │   ├── CTA Buttons
│   │   └── Trust Indicators
│   ├── Features
│   │   └── Feature Cards (6)
│   │       ├── Icon
│   │       ├── Title
│   │       └── Description
│   ├── Stats
│   │   └── Stat Cards (4)
│   │       ├── Animated Counter
│   │       ├── Icon
│   │       └── Label
│   ├── Testimonials
│   │   └── Testimonial Cards (3)
│   │       ├── Rating Stars
│   │       ├── Quote
│   │       └── Author Info
│   └── Footer
│       ├── Brand Section
│       ├── Link Columns (4)
│       ├── Newsletter
│       └── Social Links
│
└── Future Pages
    ├── Books Browse
    ├── Book Details
    ├── Login
    ├── Signup
    └── User Dashboard
```

## 📦 Technology Stack

### Core Technologies
```
┌──────────────────┐
│      React       │  UI Library
│      19.1.1      │
└──────────────────┘
         │
         ├─── React Router DOM (v7.1.4) → Navigation
         ├─── Framer Motion (v11.x) → Animations
         └─── Lucide React (v0.462) → Icons
```

### Styling
```
┌──────────────────┐
│  Tailwind CSS    │  Utility-first CSS
│     v4.1.14      │
└──────────────────┘
         │
         ├─── Responsive Design
         ├─── Custom Utilities
         └─── Theme Configuration
```

### State Management
```
┌──────────────────┐
│  Redux Toolkit   │  State Management
│      v2.9.0      │
└──────────────────┘
         │
         ├─── Auth State
         ├─── Books State
         ├─── Loans State
         ├─── Subscriptions
         ├─── Genres
         └─── Payments
```

### HTTP Client
```
┌──────────────────┐
│      Axios       │  HTTP Client
│     v1.12.2      │
└──────────────────┘
         │
         └─── Centralized API Configuration
```

## 🔄 Data Flow

```
┌─────────────┐
│   User      │
│  Interaction│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Component  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Action    │ (Redux Thunk)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  API Call   │ (Axios)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Backend   │ (Spring Boot)
│     API     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Store     │ (Redux)
│   Update    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Component   │
│  Re-render  │
└─────────────┘
```

## 🎨 Component Design Patterns

### 1. Container/Presentational Pattern
```
LandingPage (Container)
    │
    └─── Presentational Components
         ├── Navbar
         ├── Hero
         ├── Features
         ├── Stats
         ├── Testimonials
         └── Footer
```

### 2. Composition Pattern
```
Features Component
    │
    └─── Feature Card (Reusable)
         ├── Icon
         ├── Content
         └── Hover Effects
```

### 3. Animation Pattern
```
Component
    │
    └─── Framer Motion Wrapper
         ├── initial (hidden state)
         ├── animate (visible state)
         ├── transition (timing)
         └── whileInView (scroll trigger)
```

## 📁 File Organization

```
src/
│
├── components/               # Reusable UI components
│   └── landing/             # Landing page specific
│       ├── Navbar.jsx
│       ├── Hero.jsx
│       ├── Features.jsx
│       ├── Stats.jsx
│       ├── Testimonials.jsx
│       └── Footer.jsx
│
├── pages/                   # Page-level components
│   └── LandingPage.jsx
│
├── store/                   # Redux store
│   ├── store.js            # Store configuration
│   ├── hooks/              # Custom Redux hooks
│   └── features/           # Feature slices
│       ├── auth/
│       ├── books/
│       ├── bookLoans/
│       ├── subscriptions/
│       ├── genres/
│       └── payments/
│
├── utils/                   # Utility functions
│   ├── api.js              # Axios configuration
│   └── getHeaders.js       # Auth headers
│
├── App.jsx                  # Root component with router
├── App.css                  # Global styles
└── main.jsx                 # Application entry point
```

## 🔐 API Integration Architecture

```
┌────────────────────────────────────────┐
│           Frontend Layer                │
├────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐ │
│  │   React Components               │ │
│  └─────────────┬────────────────────┘ │
│                │                       │
│                ▼                       │
│  ┌──────────────────────────────────┐ │
│  │   Redux Thunks                   │ │
│  │   - authThunk.js                 │ │
│  │   - bookThunk.js                 │ │
│  │   - bookLoanThunk.js             │ │
│  │   - subscriptionThunk.js         │ │
│  │   - genreThunk.js                │ │
│  │   - paymentThunk.js              │ │
│  └─────────────┬────────────────────┘ │
│                │                       │
│                ▼                       │
│  ┌──────────────────────────────────┐ │
│  │   API Layer (Axios)              │ │
│  │   - api.js (base config)         │ │
│  │   - getHeaders.js (auth)         │ │
│  └─────────────┬────────────────────┘ │
│                │                       │
└────────────────┼───────────────────────┘
                 │
                 ▼ HTTP Request
┌────────────────────────────────────────┐
│         Backend Layer                   │
├────────────────────────────────────────┤
│   Spring Boot REST API                 │
│   - localhost:8080/api                 │
│                                         │
│   Endpoints:                            │
│   /auth/*                              │
│   /books/*                             │
│   /book-loans/*                        │
│   /subscriptions/*                     │
│   /genres/*                            │
│   /payments/*                          │
└────────────────────────────────────────┘
```

## 🎭 Animation Strategy

### Scroll Animations
```javascript
// Trigger: Element enters viewport
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
```

### Hover Effects
```javascript
// Trigger: Mouse hover
whileHover={{
  y: -8,
  transition: { duration: 0.3 }
}}
```

### Staggered Children
```javascript
// Trigger: Parent animates, children follow
variants={containerVariants}
staggerChildren: 0.1
```

## 🎯 Routing Structure

```
/                          → Landing Page
  ├── /books              → Books Browse (Future)
  ├── /books/:id          → Book Details (Future)
  ├── /login              → Login Page (Future)
  ├── /signup             → Signup Page (Future)
  ├── /dashboard          → User Dashboard (Future)
  │   ├── /profile
  │   ├── /loans
  │   └── /history
  ├── /about              → About Page (Future)
  └── /contact            → Contact Page (Future)
```

## 🔒 State Management Structure

```
Redux Store
│
├── auth
│   ├── user
│   ├── token
│   ├── isAuthenticated
│   └── loading
│
├── books
│   ├── items
│   ├── selectedBook
│   ├── loading
│   └── error
│
├── bookLoans
│   ├── myLoans
│   ├── unpaidFines
│   └── loading
│
├── subscriptions
│   ├── plans
│   ├── active
│   └── history
│
├── genres
│   ├── list
│   └── hierarchy
│
└── payments
    ├── history
    └── pending
```

## 🚀 Performance Optimization

### 1. Code Splitting
```javascript
// Lazy load routes
const BooksPage = lazy(() => import('./pages/BooksPage'));
```

### 2. Image Optimization
- Use WebP format
- Implement lazy loading
- Responsive images

### 3. Bundle Optimization
- Tree shaking enabled
- Minification in production
- Gzip compression

## 📱 Responsive Design Strategy

```
Mobile First Approach
│
├── Base Styles (< 640px)
│   └── Mobile layout
│
├── sm: (≥ 640px)
│   └── Small tablets
│
├── md: (≥ 768px)
│   └── Tablets
│
├── lg: (≥ 1024px)
│   └── Desktops
│
└── xl: (≥ 1280px)
    └── Large desktops
```

## 🎨 Design System

### Color Palette
```
Primary:   Indigo (#4F46E5)
Secondary: Purple (#9333EA)
Success:   Green (#10B981)
Warning:   Yellow (#F59E0B)
Error:     Red (#EF4444)
Neutral:   Gray scale
```

### Typography Scale
```
text-xs    : 12px
text-sm    : 14px
text-base  : 16px
text-lg    : 18px
text-xl    : 20px
text-2xl   : 24px
text-3xl   : 30px
text-4xl   : 36px
text-5xl   : 48px
```

## 🔮 Future Enhancements

1. **Authentication Flow**
   - Protected routes
   - Token refresh
   - Remember me

2. **Advanced Search**
   - Filters
   - Sorting
   - Pagination

3. **Real-time Features**
   - Live notifications
   - Chat support
   - Book availability updates

4. **PWA Support**
   - Offline mode
   - Install prompt
   - Push notifications

5. **Analytics**
   - User behavior tracking
   - Performance monitoring
   - Error tracking

---
