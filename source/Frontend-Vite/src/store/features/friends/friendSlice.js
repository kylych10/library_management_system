import { createSlice } from '@reduxjs/toolkit';
import { fetchMyFriends, fetchPendingRequests, fetchSentRequests, searchUsers, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend } from './friendThunk';

const friendSlice = createSlice({
  name: 'friends',
  initialState: {
    friends: [],
    pendingRequests: [],
    sentRequests: [],
    searchResults: [],
    loading: false,
    searchLoading: false,
    error: null,
  },
  reducers: {
    clearSearchResults: (state) => { state.searchResults = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyFriends.fulfilled, (state, action) => { state.friends = action.payload; })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => { state.pendingRequests = action.payload; })
      .addCase(fetchSentRequests.fulfilled, (state, action) => { state.sentRequests = action.payload; })
      .addCase(searchUsers.pending, (state) => { state.searchLoading = true; })
      .addCase(searchUsers.fulfilled, (state, action) => { state.searchLoading = false; state.searchResults = action.payload; })
      .addCase(searchUsers.rejected, (state) => { state.searchLoading = false; })
      .addCase(sendFriendRequest.fulfilled, (state, action) => { state.sentRequests.push(action.payload); })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.pendingRequests = state.pendingRequests.filter(r => r.id !== action.payload.id);
        state.friends.push(action.payload);
      })
      .addCase(declineFriendRequest.fulfilled, (state, action) => {
        state.pendingRequests = state.pendingRequests.filter(r => r.id !== action.payload.id);
      })
      .addCase(removeFriend.fulfilled, (state, action) => {
        state.friends = state.friends.filter(f => f.id !== action.payload);
        state.sentRequests = state.sentRequests.filter(f => f.id !== action.payload);
      });
  },
});

export const { clearSearchResults } = friendSlice.actions;
export default friendSlice.reducer;
