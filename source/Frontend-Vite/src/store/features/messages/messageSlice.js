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
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.activeConversation = action.payload;
        // Backend marks messages as read when conversation is fetched — mirror that in the store
        state.conversations = state.conversations.map(c =>
          c.partner?.id === action.payload.userId ? { ...c, unreadCount: 0 } : c
        );
        state.unreadCount = state.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.activeConversation.messages.push(action.payload);
      })
      .addCase(fetchUnreadMessageCount.fulfilled, (state, action) => { state.unreadCount = action.payload; });
  },
});

export const { clearActiveConversation } = messageSlice.actions;
export default messageSlice.reducer;
