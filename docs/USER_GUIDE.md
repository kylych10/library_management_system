# User Guide — Library Management System

Welcome to the Library Management System. This guide walks you through every feature available to registered users, from signing up to chatting with the AI assistant.

**Live Application:** https://kylychlibrary.netlify.app

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Dashboard Overview](#2-dashboard-overview)
3. [Browsing & Searching Books](#3-browsing--searching-books)
4. [Book Details & Reviews](#4-book-details--reviews)
5. [Borrowing Books (Loans)](#5-borrowing-books-loans)
6. [Returning & Renewing Books](#6-returning--renewing-books)
7. [Reservations (Holds)](#7-reservations-holds)
8. [Fines & Penalties](#8-fines--penalties)
9. [Subscriptions](#9-subscriptions)
10. [Wishlist](#10-wishlist)
11. [Friends & Messaging](#11-friends--messaging)
12. [Profile & Settings](#12-profile--settings)
13. [Notifications](#13-notifications)
14. [AI Chat Assistant](#14-ai-chat-assistant)
15. [Frequently Asked Questions](#15-frequently-asked-questions)

---

## 1. Getting Started

### 1.1 Creating an Account (Registration)

1. Navigate to https://kylychlibrary.netlify.app.
2. Click **Register** on the landing page or the top navigation bar.
3. Fill in the registration form:
   - **Full Name** — your display name across the platform.
   - **Email Address** — must be a valid, unique email.
   - **Password** — choose a strong password.
4. Click **Create Account**.
5. You will be logged in immediately and redirected to your Dashboard.

> **Note:** New accounts are assigned the **USER** role by default. Admin accounts are configured separately.

---

### 1.2 Logging In

1. Navigate to the login page at `/login`.
2. Enter your registered **Email Address** and **Password**.
3. Click **Sign In**.
4. On success, you are redirected to your personal Dashboard.
5. Your session is maintained via a JWT token stored in your browser's local storage.

---

### 1.3 Signing In with Google OAuth2

1. On the Login page, click **Continue with Google**.
2. You will be redirected to Google's login screen.
3. Select or enter your Google account credentials.
4. Google redirects you back to the application (via the OAuth2 callback).
5. If this is your first Google login, a new account is automatically created using your Google profile name and email.
6. You are redirected to your Dashboard.

---

### 1.4 Forgot Password

1. On the Login page, click **Forgot Password?**.
2. Enter your registered email address and click **Send Reset Link**.
3. Check your inbox for a password reset email from the library system.
4. Click the link in the email — it will open the **Reset Password** page.
5. Enter and confirm your new password.
6. Click **Reset Password**.
7. Log in with your new credentials.

> Reset links expire after a short time for security. Request a new one if yours has expired.

---

## 2. Dashboard Overview

After logging in, you land on your **Dashboard** — your personal command centre.

The dashboard displays:

- **Active Loans** — books you currently have checked out, with due dates.
- **Upcoming Due Dates** — items nearing their return deadline (highlighted when within 3 days).
- **Active Reservations** — books on hold / in the queue for you.
- **Outstanding Fines** — any unpaid fine balance.
- **Subscription Status** — your current plan, expiry date, and books-remaining allowance.
- **Quick Links** — shortcuts to Browse Books, My Loans, Wishlist, and Friends.

The **left sidebar** (on desktop) or hamburger menu (on mobile) gives you access to all main sections:

| Menu Item | Description |
|---|---|
| Dashboard | Home overview |
| Books | Browse and search the catalog |
| My Loans | Your borrowing history |
| My Reservations | Books you have placed on hold |
| My Fines | Outstanding and paid fines |
| Subscriptions | Manage your subscription plan |
| Wishlist | Saved books |
| Friends | Social connections and chat |
| Notifications | Notification centre |
| Profile | Edit your profile |
| Settings | Account settings |

---

## 3. Browsing & Searching Books

### 3.1 Opening the Book Catalog

1. Click **Books** in the sidebar.
2. The books page loads with a paginated grid/list of all active library books.

---

### 3.2 Searching by Title, Author, or ISBN

1. Locate the **search bar** at the top of the Books page.
2. Type any part of a book title, author name, or full ISBN.
3. Results update as you type (or press Enter to confirm).
4. Click any book card to open its detail page.

---

### 3.3 Filtering by Genre

1. On the Books page, find the **Genre** filter panel (left side or dropdown).
2. Select one genre from the list.
3. The book grid refreshes to show only books in that genre.
4. To clear the filter, select **All Genres** or deselect the current choice.

---

### 3.4 Filtering by Availability

1. Toggle the **Available Only** switch or checkbox on the Books page.
2. When enabled, only books with at least one available copy are shown.
3. This is useful when you want to borrow a book immediately without placing a reservation.

---

### 3.5 Sorting Results

1. Use the **Sort By** dropdown (options: newest first, title A–Z, author A–Z).
2. The book list reorders instantly.

---

### 3.6 Pagination

- Books are displayed 20 per page by default.
- Use the **Next / Previous** pagination controls at the bottom to navigate pages.

---

## 4. Book Details & Reviews

### 4.1 Viewing a Book

1. Click on any book card from the catalog.
2. The Book Details page shows:
   - Cover image
   - Title, author, ISBN, genre, publisher, publication date, language, pages
   - Description
   - Availability (X of Y copies available)
   - Price (if set)
   - Community ratings and written reviews

### 4.2 Writing a Review

1. Open a book's detail page.
2. Scroll to the **Reviews** section.
3. Click **Write a Review**.
4. Select a star rating (1–5).
5. Optionally add a review title.
6. Write your review (minimum 10 characters, maximum 2000).
7. Click **Submit Review**.

> Only users who have completed a loan for that book receive the **Verified Reader** badge on their review.

### 4.3 Marking a Review as Helpful

1. On any review card, click the **Helpful** (thumbs up) button.
2. The helpful count increments by 1.

---

## 5. Borrowing Books (Loans)

### 5.1 Prerequisites

Before borrowing, you must have:
- An active, valid subscription (see [Section 9](#9-subscriptions)).
- Not reached your plan's concurrent-book limit.
- No account blocks (severe unpaid fines may restrict borrowing — contact an admin).

### 5.2 Checking Out a Book

1. Open the Book Details page for the book you want.
2. Confirm the book shows **Available** (green indicator).
3. Click the **Borrow / Checkout** button.
4. A confirmation dialog appears showing:
   - Book title and author
   - Checkout date (today)
   - Due date (calculated from your subscription's max days per book)
5. Click **Confirm Checkout**.
6. The loan is recorded. The book's available copy count decreases by 1.
7. You are redirected to or can navigate to **My Loans** to see the active loan.

---

### 5.3 Viewing Your Loans

1. Click **My Loans** in the sidebar.
2. You see a list of all your loans — both active and historical.
3. Use the **Status** filter tab to view:
   - **All** — full history
   - **Checked Out** — currently with you
   - **Overdue** — past due date, not yet returned
   - **Returned** — completed loans

Each loan card shows: book title, checkout date, due date, status, renewal count.

---

## 6. Returning & Renewing Books

### 6.1 Returning a Book (Check-In)

1. Go to **My Loans**.
2. Find the active loan you want to return.
3. Click **Return Book** on the loan card.
4. Confirm in the dialog.
5. The loan status changes to **RETURNED**.
6. The book's available copy count is restored.
7. If the book was overdue, any applicable fine is calculated automatically.

---

### 6.2 Renewing a Loan

Renewal extends your due date without requiring you to physically return the book.

1. Go to **My Loans**.
2. Find an active, non-overdue loan.
3. Click **Renew**.
4. The due date is extended by the number of days defined in your subscription plan.
5. The renewal count increments (maximum 2 renewals per loan).

> **Renewal Rules:**
> - Cannot renew if the loan is overdue.
> - Cannot renew if maximum renewals (2) have been reached.
> - Cannot renew if your subscription has expired.

---

## 7. Reservations (Holds)

### 7.1 Placing a Reservation

When a book you want has 0 available copies, you can place a reservation (hold).

1. Open the Book Details page.
2. The book shows **Unavailable**.
3. Click **Reserve / Place Hold**.
4. Your reservation is created with status **PENDING**.
5. You are added to the reservation queue. Your position in the queue is shown.

---

### 7.2 When Your Book Becomes Available

1. When a borrower returns the book and you are next in queue, your reservation status changes to **AVAILABLE**.
2. You receive a notification (in-app and/or email) that the book is ready for pickup.
3. The book is held for you for a limited window (typically 48–72 hours, shown as "available until" date/time).

---

### 7.3 Viewing Your Reservations

1. Click **My Reservations** in the sidebar.
2. All your active and past reservations are listed with status and queue position.

---

### 7.4 Cancelling a Reservation

1. Go to **My Reservations**.
2. Find the reservation you wish to cancel (must be in PENDING or AVAILABLE status).
3. Click **Cancel Reservation**.
4. Confirm in the dialog.
5. Your place in the queue is released. Later users move up.

---

## 8. Fines & Penalties

Fines are generated automatically when books are returned after their due date.

### 8.1 Viewing Your Fines

1. Click **My Fines** in the sidebar.
2. All fines are listed with:
   - Associated book and loan
   - Fine type (e.g., OVERDUE)
   - Total amount and amount paid
   - Status: PENDING, PARTIALLY_PAID, PAID, WAIVED

---

### 8.2 Fine Calculation

- Fines accrue per overdue day.
- The daily rate is set by the administrator.
- The total fine for a loan = daily rate × number of overdue days.

---

### 8.3 Paying a Fine

> **Note:** The live system operates in demo mode. Payment processing uses a simulated flow — no real card charges are made.

1. Go to **My Fines**.
2. Find the outstanding fine.
3. Click **Pay Fine**.
4. Follow the payment flow.
5. Once processed, the fine status updates to **PAID** or **PARTIALLY_PAID**.

---

### 8.4 Fine Waivers

Admins can waive fines partially or fully. If an admin waives your fine:
- Status changes to **WAIVED**.
- A waiver reason is recorded.
- You receive a notification.

---

## 9. Subscriptions

A valid subscription is required to borrow books. Each plan defines how many books you can borrow at once and how long each loan period lasts.

### 9.1 Viewing Available Plans

1. Click **Subscriptions** in the sidebar.
2. All available subscription plans are displayed as cards, showing:
   - Plan name and badge (e.g., "Best Value")
   - Price and currency
   - Duration (days)
   - Maximum concurrent books
   - Maximum loan days per book
   - Description

---

### 9.2 Subscribing to a Plan

1. On the Subscriptions page, find the plan you want.
2. Click **Subscribe**.
3. In demo mode, click **Subscribe Free** to activate the plan instantly without payment.
4. Your subscription is activated immediately.
5. Start date = today; end date = today + plan duration in days.

---

### 9.3 Checking Your Active Subscription

1. Your active subscription summary is shown on the Dashboard.
2. Full details (plan name, dates, max books, days remaining) are on the Subscriptions page under **My Subscription**.

---

### 9.4 Renewing a Subscription

1. Go to **Subscriptions**.
2. If your subscription is active or expired, click **Renew**.
3. Choose the same or a different plan.
4. In demo mode, use **Renew Free** for instant renewal.
5. The new subscription's start date is today (cancels the old one and creates a fresh record).

---

### 9.5 Cancelling a Subscription

1. Go to **Subscriptions**.
2. Click **Cancel Subscription** on your active plan.
3. Optionally provide a cancellation reason.
4. The subscription is marked as inactive.
5. Existing loans are not affected immediately, but you cannot borrow new books after cancellation.

---

## 10. Wishlist

### 10.1 Adding a Book to Your Wishlist

1. Open any Book Details page.
2. Click the **Add to Wishlist** (heart icon) button.
3. Optionally add a personal note.
4. The book is saved to your wishlist.

---

### 10.2 Viewing Your Wishlist

1. Click **Wishlist** in the sidebar.
2. All saved books are displayed with the date added and any personal notes.

---

### 10.3 Removing a Book from Your Wishlist

1. Go to **Wishlist**.
2. Find the book you want to remove.
3. Click the **Remove** (trash/heart-off) icon.
4. The item is instantly removed.

---

## 11. Friends & Messaging

### 11.1 Searching for Other Users

1. Click **Friends** in the sidebar.
2. Use the **Search Users** bar to search by name or email.
3. A list of matching users appears. Each shows their name and avatar.

---

### 11.2 Sending a Friend Request

1. In the search results on the Friends page, find the user you want to add.
2. Click **Add Friend** (or the person+ icon).
3. A friend request is sent. The request status shows as **PENDING** for you (sent).
4. The recipient sees it as a pending incoming request.

---

### 11.3 Accepting or Declining a Friend Request

1. Go to **Friends**.
2. Click the **Pending Requests** tab to see incoming requests.
3. For each request:
   - Click **Accept** to become friends. Status changes to **ACCEPTED**.
   - Click **Decline** to reject the request. The request is removed.

---

### 11.4 Removing a Friend

1. Go to **Friends** and view your friends list (the **My Friends** tab).
2. Find the friend you want to remove.
3. Click **Remove Friend**.
4. The friendship record is deleted. Neither party appears in the other's friend list.

---

### 11.5 Sending a Message

You can only message users who are your accepted friends.

1. Go to **Friends** and click on a friend's name or the **Message** button.
2. The chat window for that friend opens.
3. Type your message in the input box at the bottom.
4. Click **Send** or press Enter.
5. The message is delivered and appears in the conversation.

---

### 11.6 Viewing Conversations

1. Click **Friends** in the sidebar.
2. Switch to the **Messages** tab to see a summary of all your conversations (like an inbox).
3. Each conversation shows the friend's name, the last message preview, and the timestamp.
4. Click a conversation to open the full chat.

---

### 11.7 Unread Message Indicator

- A badge count on the **Friends** menu item shows how many unread messages you have.
- Messages are marked as read automatically when you open the conversation.

---

## 12. Profile & Settings

### 12.1 Editing Your Profile

1. Click **Profile** in the sidebar.
2. You can update:
   - Full name
   - Phone number
   - Profile picture (image URL)
3. Click **Save Changes** to apply.

---

### 12.2 Account Settings

1. Click **Settings** in the sidebar.
2. Settings available include:
   - Notification preferences (enable/disable specific notification types)
   - Email notification toggles

---

## 13. Notifications

### 13.1 Accessing the Notification Centre

1. Click the **bell icon** in the top navigation bar, or click **Notifications** in the sidebar.
2. A list of all your notifications is displayed in reverse chronological order.

---

### 13.2 Notification Types

| Type | Trigger |
|---|---|
| Loan Overdue | Your book is past its due date |
| Due Soon Reminder | Book is due within 3 days |
| Reservation Available | A book you reserved is ready for pickup |
| Subscription Expiring | Your subscription is close to expiry |
| Fine Generated | A new fine has been created |
| Fine Waived | An admin has waived your fine |
| Friend Request | Someone sent you a friend request |
| Message Received | You have a new message |

---

### 13.3 Marking Notifications as Read

1. Open the Notifications page.
2. Click on any notification to mark it as read (the read timestamp is recorded).
3. Unread notifications appear with a highlighted/bold style.

---

## 14. AI Chat Assistant

The Library Management System includes an AI-powered chat assistant to help you get answers quickly.

### 14.1 Opening the AI Assistant

1. Look for the **AI Chat** button — typically a floating chat bubble icon on the bottom-right corner of the screen, or accessible from the Dashboard.
2. Click it to open the chat panel.

---

### 14.2 What the AI Assistant Can Do

The assistant is powered by the Groq AI API and can help you with:

- **Library questions** — "How do I borrow a book?", "How do I renew my loan?"
- **Book recommendations** — "Can you recommend a mystery novel?"
- **Policy information** — "What happens if I return a book late?", "How many books can I borrow?"
- **Feature explanations** — "What is a reservation?", "How do subscriptions work?"
- **General knowledge** — questions about authors, books, and reading

---

### 14.3 Using the AI Assistant

1. Open the chat panel.
2. Type your question in the text input at the bottom.
3. Press **Send** or hit Enter.
4. The assistant responds within a few seconds.
5. Conversation history is maintained within the session so you can ask follow-up questions.

---

### 14.4 Tips for Best Results

- Be specific: "What is the fine rate per day for overdue books?" gives better results than "fines".
- For account-specific queries (e.g., "How many loans do I have?"), use the dedicated dashboard sections — the AI provides general guidance rather than live account data.

---

## 15. Frequently Asked Questions

**Q: Do I need a subscription to browse books?**
A: No. You can browse the catalog without a subscription. A subscription is only required to borrow (checkout) books.

**Q: Can I borrow a book that someone else has?**
A: If all copies are checked out, you can place a **Reservation (Hold)**. You will be notified when a copy becomes available.

**Q: How many books can I borrow at once?**
A: This depends on your subscription plan. Check your active subscription for the "Max Books Allowed" value.

**Q: What happens if I don't return a book on time?**
A: Your loan status changes to **OVERDUE**. A fine is generated based on the number of days overdue. Return the book as soon as possible to minimise the fine.

**Q: Can I renew a book that is already overdue?**
A: No. Renewals are only available for loans that are not yet overdue and have not reached the renewal limit (2 renewals maximum).

**Q: How do I know if my reservation is ready?**
A: You will receive an **in-app notification** and (if enabled) an **email notification** when your reserved book becomes available. You then have a limited window to pick it up before the hold expires.

**Q: Is real payment required for subscriptions?**
A: The live application uses a demo/free subscription mode. Click **Subscribe Free** to activate any plan instantly without entering payment details.

**Q: Can I message any user on the platform?**
A: No. You can only message users who are your **accepted friends**. Add them as friends first.

**Q: How do I report a problem or contact an admin?**
A: Use the AI assistant for guidance, or contact the library administrator directly through your institution's channels.

---

*For developer and API documentation, see [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md).*
*For database schema documentation, see [DATABASE.md](./DATABASE.md).*
