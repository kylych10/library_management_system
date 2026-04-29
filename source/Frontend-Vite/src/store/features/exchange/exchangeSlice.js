import { createSlice } from '@reduxjs/toolkit';
import {
  fetchMyBalance,
  fetchMarketplace, fetchMyExchangeBooks, createExchangeBook, updateExchangeBook,
  deleteExchangeBook, toggleExchangeBook,
  sendExchangeRequest, acceptExchangeRequest, rejectExchangeRequest, cancelExchangeRequest,
  fetchMyExchangeRequests, fetchIncomingRequests,
  fetchMyBorrows, fetchMyLends, returnExchangeBook, rateLender, rateBorrower,
  submitExchangeReport,
} from './exchangeThunk';

const initialState = {
  marketplace: { content: [], totalPages: 0, totalElements: 0 },
  myBooks: [],
  myRequests: [],
  incomingRequests: [],
  myBorrows: [],
  myLends: [],
  balance: null,       // { balance, depositRequired, canBorrow }
  loading: false,
  actionLoading: false,
  error: null,
  successMessage: null,
};

const exchangeSlice = createSlice({
  name: 'exchange',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.successMessage = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const failed = (state, action) => { state.loading = false; state.error = action.payload; };
    const actionPending = (state) => { state.actionLoading = true; state.error = null; };
    const actionFailed = (state, action) => { state.actionLoading = false; state.error = action.payload; };

    builder
      .addCase(fetchMyBalance.fulfilled, (state, { payload }) => { state.balance = payload; })

      // Marketplace
      .addCase(fetchMarketplace.pending, pending)
      .addCase(fetchMarketplace.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.marketplace = payload;
      })
      .addCase(fetchMarketplace.rejected, failed)

      // My books
      .addCase(fetchMyExchangeBooks.pending, pending)
      .addCase(fetchMyExchangeBooks.fulfilled, (state, { payload }) => {
        state.loading = false; state.myBooks = payload;
      })
      .addCase(fetchMyExchangeBooks.rejected, failed)

      // Create book
      .addCase(createExchangeBook.pending, actionPending)
      .addCase(createExchangeBook.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        state.myBooks.unshift(payload);
        state.successMessage = 'Book listed for exchange!';
      })
      .addCase(createExchangeBook.rejected, actionFailed)

      // Update book
      .addCase(updateExchangeBook.pending, actionPending)
      .addCase(updateExchangeBook.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        state.myBooks = state.myBooks.map(b => b.id === payload.id ? payload : b);
        state.successMessage = 'Book updated!';
      })
      .addCase(updateExchangeBook.rejected, actionFailed)

      // Toggle
      .addCase(toggleExchangeBook.fulfilled, (state, { payload: id }) => {
        state.myBooks = state.myBooks.map(b =>
          b.id === id
            ? { ...b, status: b.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE' }
            : b
        );
      })

      // Delete
      .addCase(deleteExchangeBook.fulfilled, (state, { payload: id }) => {
        state.myBooks = state.myBooks.filter(b => b.id !== id);
        state.successMessage = 'Book removed.';
      })

      // Send request
      .addCase(sendExchangeRequest.pending, actionPending)
      .addCase(sendExchangeRequest.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        state.myRequests.unshift(payload);
        state.successMessage = 'Request sent!';
      })
      .addCase(sendExchangeRequest.rejected, actionFailed)

      // Accept
      .addCase(acceptExchangeRequest.pending, actionPending)
      .addCase(acceptExchangeRequest.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        state.incomingRequests = state.incomingRequests.map(r => r.id === payload.id ? payload : r);
        state.successMessage = 'Request accepted! Borrow record created.';
      })
      .addCase(acceptExchangeRequest.rejected, actionFailed)

      // Reject
      .addCase(rejectExchangeRequest.pending, actionPending)
      .addCase(rejectExchangeRequest.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        state.incomingRequests = state.incomingRequests.map(r => r.id === payload.id ? payload : r);
      })
      .addCase(rejectExchangeRequest.rejected, actionFailed)

      // Cancel
      .addCase(cancelExchangeRequest.fulfilled, (state, { payload }) => {
        state.myRequests = state.myRequests.map(r => r.id === payload.id ? payload : r);
      })

      // My requests
      .addCase(fetchMyExchangeRequests.pending, pending)
      .addCase(fetchMyExchangeRequests.fulfilled, (state, { payload }) => {
        state.loading = false; state.myRequests = payload;
      })
      .addCase(fetchMyExchangeRequests.rejected, failed)

      // Incoming
      .addCase(fetchIncomingRequests.pending, pending)
      .addCase(fetchIncomingRequests.fulfilled, (state, { payload }) => {
        state.loading = false; state.incomingRequests = payload;
      })
      .addCase(fetchIncomingRequests.rejected, failed)

      // My borrows
      .addCase(fetchMyBorrows.pending, pending)
      .addCase(fetchMyBorrows.fulfilled, (state, { payload }) => {
        state.loading = false; state.myBorrows = payload;
      })
      .addCase(fetchMyBorrows.rejected, failed)

      // My lends
      .addCase(fetchMyLends.pending, pending)
      .addCase(fetchMyLends.fulfilled, (state, { payload }) => {
        state.loading = false; state.myLends = payload;
      })
      .addCase(fetchMyLends.rejected, failed)

      // Return
      .addCase(returnExchangeBook.pending, actionPending)
      .addCase(returnExchangeBook.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        state.myBorrows = state.myBorrows.map(r => r.id === payload.id ? payload : r);
        state.successMessage = 'Book returned successfully!';
      })
      .addCase(returnExchangeBook.rejected, actionFailed)

      // Rate lender
      .addCase(rateLender.fulfilled, (state, { payload }) => {
        state.myBorrows = state.myBorrows.map(r => r.id === payload.id ? payload : r);
        state.successMessage = 'Rating submitted!';
      })

      // Rate borrower
      .addCase(rateBorrower.fulfilled, (state, { payload }) => {
        state.myLends = state.myLends.map(r => r.id === payload.id ? payload : r);
        state.successMessage = 'Rating submitted!';
      })

      // Report
      .addCase(submitExchangeReport.fulfilled, (state) => {
        state.successMessage = 'Report submitted. Admin will review it.';
      });
  },
});

export const { clearError, clearSuccess } = exchangeSlice.actions;
export default exchangeSlice.reducer;
