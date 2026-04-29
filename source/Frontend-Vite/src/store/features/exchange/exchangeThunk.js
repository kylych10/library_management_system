import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../utils/api';

export const fetchMyBalance = createAsyncThunk(
  'exchange/fetchMyBalance',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/exchange/books/balance');
      return data;
    } catch (e) { return rejectWithValue('Failed to load balance'); }
  }
);

export const fetchMarketplace = createAsyncThunk(
  'exchange/fetchMarketplace',
  async ({ q = '', condition = '', sortBy = 'createdAt', sortDir = 'DESC', page = 0, size = 12 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, size, sortBy, sortDir });
      if (q)         params.append('q', q);
      if (condition) params.append('condition', condition);
      const { data } = await api.get(`/api/exchange/books?${params}`);
      return data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to load marketplace'); }
  }
);

export const fetchMyExchangeBooks = createAsyncThunk(
  'exchange/fetchMyExchangeBooks',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/exchange/books/my');
      return data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to load your books'); }
  }
);

export const createExchangeBook = createAsyncThunk(
  'exchange/createExchangeBook',
  async (bookData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/exchange/books', bookData);
      return data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to create book'); }
  }
);

export const updateExchangeBook = createAsyncThunk(
  'exchange/updateExchangeBook',
  async ({ id, ...bookData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/exchange/books/${id}`, bookData);
      return data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to update book'); }
  }
);

export const toggleExchangeBook = createAsyncThunk(
  'exchange/toggleExchangeBook',
  async (id, { rejectWithValue }) => {
    try {
      await api.patch(`/api/exchange/books/${id}/toggle`);
      return id;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to toggle book'); }
  }
);

export const deleteExchangeBook = createAsyncThunk(
  'exchange/deleteExchangeBook',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/exchange/books/${id}`);
      return id;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to delete book'); }
  }
);

export const sendExchangeRequest = createAsyncThunk(
  'exchange/sendExchangeRequest',
  async ({ bookId, message }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/api/exchange/requests/${bookId}`, { message });
      return data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to send request'); }
  }
);

export const acceptExchangeRequest = createAsyncThunk(
  'exchange/acceptExchangeRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/exchange/requests/${requestId}/accept`);
      return data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to accept request'); }
  }
);

export const rejectExchangeRequest = createAsyncThunk(
  'exchange/rejectExchangeRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/exchange/requests/${requestId}/reject`);
      return data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to reject request'); }
  }
);

export const cancelExchangeRequest = createAsyncThunk(
  'exchange/cancelExchangeRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/exchange/requests/${requestId}/cancel`);
      return data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to cancel request'); }
  }
);

export const fetchMyExchangeRequests = createAsyncThunk(
  'exchange/fetchMyExchangeRequests',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/exchange/requests/my');
      return data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to load requests'); }
  }
);

export const fetchIncomingRequests = createAsyncThunk(
  'exchange/fetchIncomingRequests',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/exchange/requests/incoming');
      return data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to load incoming requests'); }
  }
);

export const fetchMyBorrows = createAsyncThunk(
  'exchange/fetchMyBorrows',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/exchange/borrows/my');
      return data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to load borrows'); }
  }
);

export const fetchMyLends = createAsyncThunk(
  'exchange/fetchMyLends',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/exchange/borrows/my-lends');
      return data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to load lends'); }
  }
);

export const returnExchangeBook = createAsyncThunk(
  'exchange/returnExchangeBook',
  async (recordId, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/exchange/borrows/${recordId}/return`);
      return data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to return book'); }
  }
);

export const rateLender = createAsyncThunk(
  'exchange/rateLender',
  async ({ recordId, rating, comment }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/api/exchange/borrows/${recordId}/rate-lender`, { rating, comment });
      return data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to rate lender'); }
  }
);

export const rateBorrower = createAsyncThunk(
  'exchange/rateBorrower',
  async ({ recordId, rating, comment }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/api/exchange/borrows/${recordId}/rate-borrower`, { rating, comment });
      return data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to rate borrower'); }
  }
);

export const submitExchangeReport = createAsyncThunk(
  'exchange/submitExchangeReport',
  async (reportData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/exchange/reports', reportData);
      return data;
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to submit report'); }
  }
);
