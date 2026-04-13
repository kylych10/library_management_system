import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../utils/api';

export const fetchMyFriends = createAsyncThunk('friends/fetchMyFriends', async (_, { rejectWithValue }) => {
  try { return (await api.get('/api/friends/my')).data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchPendingRequests = createAsyncThunk('friends/fetchPendingRequests', async (_, { rejectWithValue }) => {
  try { return (await api.get('/api/friends/requests/pending')).data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchSentRequests = createAsyncThunk('friends/fetchSentRequests', async (_, { rejectWithValue }) => {
  try { return (await api.get('/api/friends/requests/sent')).data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const searchUsers = createAsyncThunk('friends/searchUsers', async (query, { rejectWithValue }) => {
  try { return (await api.get('/api/friends/search', { params: { q: query } })).data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const sendFriendRequest = createAsyncThunk('friends/sendRequest', async (receiverId, { rejectWithValue }) => {
  try { return (await api.post(`/api/friends/request/${receiverId}`)).data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const acceptFriendRequest = createAsyncThunk('friends/acceptRequest', async (friendshipId, { rejectWithValue }) => {
  try { return (await api.put(`/api/friends/accept/${friendshipId}`)).data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const declineFriendRequest = createAsyncThunk('friends/declineRequest', async (friendshipId, { rejectWithValue }) => {
  try { return (await api.put(`/api/friends/decline/${friendshipId}`)).data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const removeFriend = createAsyncThunk('friends/removeFriend', async (friendshipId, { rejectWithValue }) => {
  try { await api.delete(`/api/friends/${friendshipId}`); return friendshipId; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchFriendshipStatus = createAsyncThunk('friends/fetchStatus', async (otherUserId, { rejectWithValue }) => {
  try { return (await api.get(`/api/friends/status/${otherUserId}`)).data; } catch (e) { return rejectWithValue(null); }
});
