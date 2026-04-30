# Kitep Space — User Guide

**Live:** [https://kitep.space](https://kitep.space)

This guide covers all features available to library members on the Kitep Space platform.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Browsing Books](#2-browsing-books)
3. [Borrowing Books](#3-borrowing-books)
4. [Reservations](#4-reservations)
5. [Fines](#5-fines)
6. [Subscriptions](#6-subscriptions)
7. [Wishlist and Reviews](#7-wishlist-and-reviews)
8. [P2P Book Exchange](#8-p2p-book-exchange)
9. [Friends and Messaging](#9-friends-and-messaging)
10. [User Profiles](#10-user-profiles)
11. [AI Assistant](#11-ai-assistant)
12. [Settings and Profile](#12-settings-and-profile)

---

## 1. Getting Started

### Creating an Account

1. Go to [https://kitep.space](https://kitep.space)
2. Click **Sign Up** in the navigation bar
3. Enter your full name, email, and a password (minimum 6 characters)
4. Click **Create Account**

### Signing In

- **Email/Password:** Go to `/login`, enter credentials, click **Sign In**
- **Google:** Click **Continue with Google** on the login page — no password required
- Use **Forgot Password?** to receive a password reset link by email

### Public Browse (No Account Required)

You can browse the full book catalog without signing in at **https://kitep.space/books**. To borrow books, create a free account.

---

## 2. Browsing Books

Navigate to **Browse Books** from the sidebar.

- **Search:** Type in the search bar — results update automatically as you type (400ms debounce)
- **Genre Filter:** Click genre chips below the search bar to filter by category
- **Sort:** Use Sort By (Date Added / Title / Author) and direction (Newest / Oldest)
- **Availability:** Green badge = Available, Red badge = Checked Out
- **Pagination:** Navigate pages with controls at the bottom

Click any book card to view full details including description, reviews, and available copies.

---

## 3. Borrowing Books

**Requirements:** active subscription and not at your plan borrowing limit.

1. Find an available book (green badge)
2. Click **Borrow** on the book detail page
3. The book appears in **My Loans** with a due date

**Renewing:** My Loans → Renew (allowed up to 2 times, if not overdue)

**Returning:** My Loans → Return (book becomes available immediately)

---

## 4. Reservations

When a book is Checked Out:

1. Open the book detail page and click **Reserve**
2. You join the queue — position shown in **My Reservations**
3. When the book is returned, you receive an **email notification**
4. The book is held for you for **72 hours** — borrow it before the hold expires

---

## 5. Fines

Fines are automatically calculated daily for overdue loans.

- Go to **My Fines** to see all pending and paid fines
- Click **Pay Fine** to mark a fine as paid
- Unpaid fines may restrict borrowing depending on your plan

---

## 6. Subscriptions

Subscriptions define how many books you can borrow at once and for how long per book.

| Plan | Duration | Books at Once | Days per Book |
|---|---|---|---|
| Free | 30 days | 1 | 7 |
| Monthly | 30 days | 3 | 14 |
| Quarterly | 90 days | 5 | 21 |
| Yearly | 365 days | 10 | 30 |

To subscribe: **Subscriptions** in the sidebar → compare plans → click **Subscribe**.

---

## 7. Wishlist and Reviews

### Wishlist

- On any book detail page, click the heart icon or **Add to Wishlist**
- View all saved books at **Wishlist** in the sidebar
- Remove books from the wishlist at any time

### Writing a Review

- Open a book you have previously borrowed
- Click **Write a Review**
- Select 1–5 stars and write your review text (minimum 10 characters)
- A **Verified Reader** badge appears if you have completed a loan for that book

---

## 8. P2P Book Exchange

The Book Exchange lets you share your personal books with community members and borrow theirs.

### Listing Your Book

1. Go to **Book Exchange** → **My Books** tab → **List a Book**
2. Fill in: title, author, condition (New / Good / Fair / Poor), loan duration, cover image (upload file or paste URL), optional description
3. Click **List Book** — it appears in the Marketplace immediately

### Requesting a Book

1. Browse the **Marketplace** tab → find a book → click **Request Book**
2. Optionally write a message to the owner explaining why you want to borrow it
3. When the owner accepts, **500 coins are locked** from your balance as a deposit

### The Deposit System

| Event | Coins |
|---|---|
| New account created | +1,000 coins starting balance |
| Owner accepts your request | −500 coins locked |
| You return the book on time | +500 coins released back |
| Book becomes overdue | −500 coins forfeited |

Your balance and the required deposit are shown in the widget at the top of the Exchange page. If your balance is below 500 coins, the Request button is disabled. Admins can grant additional coins.

### Accepting or Rejecting Requests (as Owner)

1. Go to the **Incoming Requests** tab
2. Review the requester's name and reputation score
3. Click **Accept** (deposit is locked automatically) or **Reject**
4. Accepting one request auto-rejects all other pending requests for the same book

### Returning a Borrowed Book

1. Go to the **Borrowed Books** tab → click **Return**
2. Your deposit is released instantly and the book relists in the Marketplace
3. Both parties can then rate each other (1–5 stars)

### Reputation Score

- Score range: 1.0 – 5.0 (all users start at 5.0)
- Ratings from exchanges update the score using a weighted rolling average
- Overdue borrows apply **penalty points** — reaching 10 penalty points results in a block from the exchange system

---

## 9. Friends and Messaging

### Adding Friends

1. Go to **Friends** → **Find People** tab
2. Search by name or email (type at least 2 characters)
3. Click **Add Friend** — the other user receives a request in their Requests tab
4. They can accept or decline from **Friends** → **Requests**

### Messaging

1. Go to **Friends** → **Messages** tab
2. Select a conversation from the left panel, or click **Chat** on any friend card
3. Type your message and press **Enter** or the send button
4. On mobile: tap the back arrow to return to the conversation list
5. Unread message badges clear automatically when you open a conversation

---

## 10. User Profiles

Click on any user's **avatar or name** anywhere in the app — in the Exchange marketplace, request cards, borrow records, or the Friends page — to view their public profile:

- Profile photo, full name, and verified badge
- Reputation score, total books shared, and total books borrowed
- Phone number and last seen date (if provided)
- **Message** button — opens a direct chat with that user
- **Add Friend** button — sends a friend request

---

## 11. AI Assistant

The AI chat bubble (bottom-right corner) is powered by Groq and the LLaMA 3.3 70B language model. It fetches your live account data before every response, so answers are always up to date.

**What it knows:**
- Your active loans and due dates
- Your pending fines and total amount owed
- Your current subscription plan and expiry
- Books available in the catalog (searched by keywords in your question)

**Example questions:**
- *"What books do I currently have borrowed?"*
- *"Do I have any overdue books?"*
- *"Show me available books about Python programming"*
- *"When does my subscription expire?"*
- *"How much do I owe in fines?"*

---

## 12. Settings and Profile

### Updating Your Profile

1. Go to **Profile** from the sidebar or the account menu (top-right avatar)
2. Edit your full name, phone number, or profile picture (upload a file or paste an image URL)
3. Click **Save Changes**

> If you sign in with Google, your name and photo are taken from Google on the **first login only**. After that, you can change them freely and Google logins will not overwrite them.

### Changing Your Password

1. Go to **Settings**
2. Enter your current password and your new password
3. Click **Update Password**

### Notification Preferences

1. Go to **Settings** → Notifications tab
2. Toggle on or off:
   - Email notifications
   - Due date reminders
   - Reservation availability alerts
   - New arrival announcements
   - Subscription expiry warnings

---

## Need Help?

- **Contact form:** [https://kitep.space/contact](https://kitep.space/contact)
- **About the platform:** [https://kitep.space/about](https://kitep.space/about)
