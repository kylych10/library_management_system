import { createSlice } from '@reduxjs/toolkit';
import { fetchConversations, fetchConversation, sendMessage, fetchUnreadMessageCount } from './messageThunk';

const messageSlice = createSlice({
  name: 'messages',
  initialState: {
    conversations: [],
    activeConversation: { userId: null, messages: [] },
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearActiveConversation: (state) => { state.activeConversation = { userId: null, messages: [] }; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => { state.conversations = action.payload; })
      .addCase(fetchConversation.fulfilled, (state, action) => { state.activeConversation = action.payload; })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.activeConversation.messages.push(action.payload);
      })
      .addCase(fetchUnreadMessageCount.fulfilled, (state, action) => { state.unreadCount = action.payload; });
  },
});

export const { clearActiveConversation } = messageSlice.actions;
export default messageSlice.reducer;
