import axios from 'axios';
import api from './api';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Sends a conversation to Groq and returns the assistant reply.
 */
export async function sendToGroq(messages, model = 'llama-3.3-70b-versatile') {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('Groq API key is not configured. Please set VITE_GROQ_API_KEY in your .env file.');
  }

  const response = await axios.post(
    GROQ_API_URL,
    {
      model,
      messages,
      temperature: 0.7,
      max_tokens: 800,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  return response.data.choices[0].message.content;
}

/**
 * Searches books in the database using the existing /api/books endpoint.
 * Extracts meaningful search terms from the user message.
 */
export async function searchBooksFromDB(userMessage) {
  try {
    // Extract a clean search term (remove common stop words)
    const stopWords = new Set(['a', 'an', 'the', 'is', 'are', 'do', 'does', 'can', 'i', 'me',
      'find', 'search', 'show', 'get', 'want', 'need', 'looking', 'for', 'about',
      'book', 'books', 'any', 'some', 'there', 'have', 'has', 'please', 'help']);

    const words = userMessage.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    if (words.length === 0) return [];

    const searchTerm = words.slice(0, 3).join(' ');

    const response = await api.get('/api/books', {
      params: {
        search: searchTerm,
        page: 0,
        size: 10,
      },
    });

    const data = response.data;
    // Handle both paginated and plain array responses
    return Array.isArray(data) ? data : (data.content || data.books || []);
  } catch {
    return [];
  }
}

/**
 * Fetches the current user's active loans from the DB.
 */
export async function fetchMyLoansFromDB() {
  try {
    const response = await api.get('/api/book-loans/my', {
      params: { page: 0, size: 20 },
    });
    const data = response.data;
    return Array.isArray(data) ? data : (data.content || []);
  } catch {
    return [];
  }
}

/**
 * Fetches the current user's unpaid fines from the DB.
 */
export async function fetchMyFinesFromDB() {
  try {
    const response = await api.get('/api/fines/my', {
      params: { status: 'PENDING' },
    });
    const data = response.data;
    return Array.isArray(data) ? data : (data.content || []);
  } catch {
    return [];
  }
}

/**
 * Fetches the current user's active subscription from the DB.
 */
export async function fetchMySubscriptionFromDB() {
  try {
    const response = await api.get('/api/subscriptions/user/active');
    return response.data || null;
  } catch {
    return null;
  }
}

/**
 * Builds the system prompt injecting live DB data as context.
 */
export function buildSystemPrompt({ books = [], loans = [], fines = [], subscription = null } = {}) {
  // Books context
  const bookContext =
    books.length > 0
      ? `\n\n📚 BOOKS FOUND IN DATABASE:\n${books
          .map(
            (b) =>
              `- "${b.title}" by ${b.author || 'Unknown'} | ` +
              `${b.availableCopies > 0 ? `✅ Available (${b.availableCopies} copies)` : '❌ Checked out'}` +
              `${b.genreName ? ` | Genre: ${b.genreName}` : ''}` +
              `${b.isbn ? ` | ISBN: ${b.isbn}` : ''}`
          )
          .join('\n')}`
      : '\n\nNo books found matching the search term.';

  // Active loans context
  const loansContext =
    loans.length > 0
      ? `\n\n📋 USER'S ACTIVE LOANS:\n${loans
          .map(
            (l) =>
              `- "${l.bookTitle || l.book?.title || 'Unknown'}" | ` +
              `Due: ${l.dueDate ? new Date(l.dueDate).toLocaleDateString() : 'N/A'} | ` +
              `Status: ${l.status || 'ACTIVE'}` +
              `${l.renewalCount != null ? ` | Renewals used: ${l.renewalCount}` : ''}`
          )
          .join('\n')}`
      : '';

  // Fines context
  const finesContext =
    fines.length > 0
      ? `\n\n💰 USER'S UNPAID FINES:\n${fines
          .map(
            (f) =>
              `- Book: "${f.bookTitle || f.loan?.bookTitle || 'Unknown'}" | ` +
              `Amount: $${((f.amount || 0) / 100).toFixed(2)} | ` +
              `Type: ${f.type || 'OVERDUE'}`
          )
          .join('\n')}`
      : '';

  // Subscription context
  const subContext = subscription
    ? `\n\n🎫 USER'S ACTIVE SUBSCRIPTION:\n- Plan: ${subscription.planName || 'Unknown'} | ` +
      `Expires: ${subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'} | ` +
      `Books allowed: ${subscription.maxBooksAllowed || 'N/A'} | ` +
      `Days per book: ${subscription.maxDaysPerBook || 'N/A'}`
    : '';

  return `You are an AI assistant integrated into a Library Management System website.

Your role is to help users find books, understand library rules, check their loans and fines, and navigate the system.

Users can:
- Search for books by title, author, or genre
- View book availability
- Borrow and return books
- Reserve books that are not available
- Check their borrowing history
- View and pay fines/penalties
- Manage their wishlist
- Manage their subscription plan

RULES:
- Answer clearly and concisely
- Be friendly and professional
- Use light emojis where appropriate
- Only reference books from the database data provided below — do NOT invent book data
- If no books are found for a search, say "No books found 😕 Try a different title or author."
- For "how to" questions, give step-by-step instructions
- For questions outside library scope, politely say: "I'm here to help with the library system 😊"
- For fine questions: late returns accrue a daily fine. All fines must be paid before new checkouts are allowed.

When showing books, use this format:
📚 **Title** — Author (✅ available / ❌ not available)

HOW TO USE FEATURES:
- To borrow: Go to Books → find a book → click "Checkout This Book"
- To return: Go to My Loans → find active loan → click Return
- To renew a loan: Go to My Loans → click Renew (if renewals remain)
- To reserve: On a book page with no copies, click "Reserve This Book"
- To pay a fine: Go to My Fines → click Pay
- To manage subscription: Go to Subscriptions in the menu
${bookContext}${loansContext}${finesContext}${subContext}`;
}
