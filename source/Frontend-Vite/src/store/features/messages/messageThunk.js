import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../utils/api';

export const fetchConversations = createAsyncThunk('messages/fetchConversations', async (_, { rejectWithValue }) => {
  try { return (await api.get('/api/messages/conversations')).data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchConversation = createAsyncThunk('messages/fetchConversation', async (otherUserId, { rejectWithValue }) => {
  try { return { userId: otherUserId, messages: (await api.get(`/api/messages/conversation/${otherUserId}`)).data }; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const sendMessage = createAsyncThunk('messages/sendMessage', async ({ receiverId, content }, { rejectWithValue }) => {
  try { return (await api.post(`/api/messages/send/${receiverId}`, { content })).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchUnreadMessageCount = createAsyncThunk('messages/fetchUnreadCount', async (_, { rejectWithValue }) => {
  try { return (await api.get('/api/messages/unread-count')).data.count; } catch (e) { return rejectWithValue(0); }
});
