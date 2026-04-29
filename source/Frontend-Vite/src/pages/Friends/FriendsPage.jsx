import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import UserProfileModal from '../../components/user/UserProfileModal';
import api from '../../utils/api';
import {
  Box, Container, Typography, Tabs, Tab, Avatar, Button, TextField,
  InputAdornment, CircularProgress, Chip, Badge, IconButton, Paper,
  Divider, Alert, Snackbar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import PeopleIcon from '@mui/icons-material/People';
import ChatIcon from '@mui/icons-material/Chat';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

import {
  fetchMyFriends, fetchPendingRequests, fetchSentRequests,
  searchUsers, sendFriendRequest, acceptFriendRequest,
  declineFriendRequest, removeFriend
} from '../../store/features/friends/friendThunk';
import { clearSearchResults } from '../../store/features/friends/friendSlice';
import {
  fetchConversations, fetchConversation, sendMessage
} from '../../store/features/messages/messageThunk';
import { clearActiveConversation } from '../../store/features/messages/messageSlice';

export default function FriendsPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { user } = useSelector(s => s.auth);
  const { friends, pendingRequests, sentRequests, searchResults, searchLoading } = useSelector(s => s.friends);
  const { conversations, activeConversation, unreadCount } = useSelector(s => s.messages);

  const [tab, setTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPartner, setChatPartner] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [profileUserId, setProfileUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    dispatch(fetchMyFriends());
    dispatch(fetchPendingRequests());
    dispatch(fetchSentRequests());
    dispatch(fetchConversations());
  }, [dispatch]);

  // Handle ?userId= from UserProfileModal "Message" button
  useEffect(() => {
    const targetId = searchParams.get('userId');
    if (!targetId) return;
    api.get(`/api/users/${targetId}/public-profile`)
      .then(r => {
        const p = r.data;
        openChat({ id: p.id, fullName: p.fullName, profileImage: p.profileImage, email: '' });
      })
      .catch(console.error);
  }, [searchParams]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation.messages]);

  // Poll for new messages silently (no loading spinner on poll)
  useEffect(() => {
    if (!chatPartner) return;
    const interval = setInterval(() => {
      dispatch(fetchConversation(chatPartner.id));
    }, 3000);
    return () => clearInterval(interval);
  }, [chatPartner, dispatch]);

  // Reset loading when partner changes
  useEffect(() => { setChatLoading(false); }, [chatPartner?.id]);

  const handleSearch = (q) => {
    setSearchQuery(q);
    clearTimeout(searchTimeoutRef.current);
    if (q.trim().length < 2) { dispatch(clearSearchResults()); return; }
    searchTimeoutRef.current = setTimeout(() => dispatch(searchUsers(q.trim())), 400);
  };

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const handleSendRequest = async (userId) => {
    try {
      await dispatch(sendFriendRequest(userId)).unwrap();
      showSnackbar('Friend request sent!');
    } catch (e) { showSnackbar(e || 'Failed to send request', 'error'); }
  };

  const handleAccept = async (friendshipId) => {
    try {
      await dispatch(acceptFriendRequest(friendshipId)).unwrap();
      showSnackbar('Friend request accepted!');
    } catch (e) { showSnackbar('Failed', 'error'); }
  };

  const handleDecline = async (friendshipId) => {
    try {
      await dispatch(declineFriendRequest(friendshipId)).unwrap();
      showSnackbar('Request declined');
    } catch (e) { showSnackbar('Failed', 'error'); }
  };

  const handleRemove = async (friendshipId) => {
    try {
      await dispatch(removeFriend(friendshipId)).unwrap();
      showSnackbar('Friend removed');
    } catch (e) { showSnackbar('Failed', 'error'); }
  };

  const openChat = async (partner) => {
    setChatPartner(partner);
    setChatOpen(true);
    setTab(3);
    setChatLoading(true);
    await dispatch(fetchConversation(partner.id));
    setChatLoading(false);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !chatPartner) return;
    try {
      await dispatch(sendMessage({ receiverId: chatPartner.id, content: messageInput.trim() })).unwrap();
      setMessageInput('');
    } catch (e) { showSnackbar('Failed to send', 'error'); }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const isSentRequest = (userId) => sentRequests.some(r => r.receiver?.id === userId);
  const isFriend = (userId) => friends.some(f => f.requester?.id === userId || f.receiver?.id === userId);

  const getFriendUser = (friendship) => {
    if (friendship.requester?.id === user?.id) return friendship.receiver;
    return friendship.requester;
  };

  // User card for search results
  const UserCard = ({ u }) => {
    const alreadyFriend = isFriend(u.id);
    const alreadySent = isSentRequest(u.id);
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', mb: 1.5 }}>
        <Avatar src={u.profileImage} sx={{ width: 48, height: 48, bgcolor: '#4F46E5', cursor: 'pointer' }}
          onClick={() => setProfileUserId(u.id)}>{getInitials(u.fullName)}</Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ cursor: 'pointer', '&:hover': { color: '#4F46E5' } }}
            onClick={() => setProfileUserId(u.id)}>{u.fullName}</Typography>
          <Typography variant="caption" color="text.secondary">{u.email}</Typography>
        </Box>
        {alreadyFriend ? (
          <Chip label="Friends" size="small" color="success" />
        ) : alreadySent ? (
          <Chip label="Request Sent" size="small" color="default" icon={<HourglassEmptyIcon />} />
        ) : (
          <Button size="small" variant="contained" startIcon={<PersonAddIcon />} onClick={() => handleSendRequest(u.id)}
            sx={{ bgcolor: '#4F46E5', '&:hover': { bgcolor: '#4338CA' }, textTransform: 'none' }}>
            Add Friend
          </Button>
        )}
      </Box>
    );
  };

  // Friend card
  const FriendCard = ({ friendship }) => {
    const friendUser = getFriendUser(friendship);
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', mb: 1.5 }}>
        <Avatar src={friendUser?.profileImage} sx={{ width: 48, height: 48, bgcolor: '#10B981', cursor: 'pointer' }}
          onClick={() => setProfileUserId(friendUser?.id)}>{getInitials(friendUser?.fullName)}</Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ cursor: 'pointer', '&:hover': { color: '#4F46E5' } }}
            onClick={() => setProfileUserId(friendUser?.id)}>{friendUser?.fullName}</Typography>
          <Typography variant="caption" color="text.secondary">{friendUser?.email}</Typography>
        </Box>
        <IconButton size="small" onClick={() => openChat(friendUser)} sx={{ color: '#4F46E5' }}><ChatIcon /></IconButton>
        <IconButton size="small" onClick={() => handleRemove(friendship.id)} sx={{ color: 'error.main' }}><DeleteIcon /></IconButton>
      </Box>
    );
  };

  // Pending request card
  const RequestCard = ({ friendship }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', mb: 1.5 }}>
      <Avatar src={friendship.requester?.profileImage} sx={{ width: 48, height: 48, bgcolor: '#F59E0B', cursor: 'pointer' }}
        onClick={() => setProfileUserId(friendship.requester?.id)}>{getInitials(friendship.requester?.fullName)}</Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ cursor: 'pointer', '&:hover': { color: '#4F46E5' } }}
          onClick={() => setProfileUserId(friendship.requester?.id)}>{friendship.requester?.fullName}</Typography>
        <Typography variant="caption" color="text.secondary">{friendship.requester?.email}</Typography>
      </Box>
      <IconButton size="small" onClick={() => handleAccept(friendship.id)} sx={{ color: 'success.main', bgcolor: 'success.lighter', mr: 0.5 }}><CheckIcon /></IconButton>
      <IconButton size="small" onClick={() => handleDecline(friendship.id)} sx={{ color: 'error.main' }}><CloseIcon /></IconButton>
    </Box>
  );

  // Conversation card
  const ConversationCard = ({ conv }) => (
    <Box onClick={() => openChat(conv.partner)} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: chatPartner?.id === conv.partner?.id ? 'rgba(79,70,229,0.08)' : 'background.paper', border: '1px solid', borderColor: chatPartner?.id === conv.partner?.id ? '#4F46E5' : 'divider', mb: 1.5, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
      <Badge badgeContent={conv.unreadCount} color="error">
        <Avatar src={conv.partner?.profileImage} sx={{ width: 48, height: 48, bgcolor: '#7C3AED' }}>{getInitials(conv.partner?.fullName)}</Avatar>
      </Badge>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" fontWeight={600}>{conv.partner?.fullName}</Typography>
        <Typography variant="caption" color="text.secondary" noWrap>{conv.lastMessage}</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} sx={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Friends & Messages
          </Typography>
          <Typography variant="body1" color="text.secondary">Connect with other library members</Typography>
        </Box>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PeopleIcon fontSize="small" /><span>Friends ({friends.length})</span></Box>} />
          <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Badge badgeContent={pendingRequests.length} color="error"><HourglassEmptyIcon fontSize="small" /></Badge><span style={{ marginLeft: 4 }}>Requests</span></Box>} />
          <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PersonSearchIcon fontSize="small" /><span>Find People</span></Box>} />
          <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Badge badgeContent={conversations.reduce((s, c) => s + (c.unreadCount || 0), 0)} color="error"><ChatIcon fontSize="small" /></Badge><span style={{ marginLeft: 4 }}>Messages</span></Box>} />
        </Tabs>

        {/* Tab 0: My Friends */}
        {tab === 0 && (
          <Box>
            {friends.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <PeopleIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
                <Typography color="text.secondary">No friends yet. Use "Find People" to add some!</Typography>
              </Box>
            ) : (
              friends.map(f => <FriendCard key={f.id} friendship={f} />)
            )}
          </Box>
        )}

        {/* Tab 1: Requests */}
        {tab === 1 && (
          <Box>
            {pendingRequests.length > 0 && (
              <>
                <Typography variant="subtitle1" fontWeight={600} mb={1.5}>Incoming Requests</Typography>
                {pendingRequests.map(r => <RequestCard key={r.id} friendship={r} />)}
              </>
            )}
            {sentRequests.length > 0 && (
              <>
                <Typography variant="subtitle1" fontWeight={600} mb={1.5} mt={3}>Sent Requests</Typography>
                {sentRequests.map(r => (
                  <Box key={r.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', mb: 1.5 }}>
                    <Avatar src={r.receiver?.profileImage} sx={{ width: 48, height: 48 }}>{getInitials(r.receiver?.fullName)}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>{r.receiver?.fullName}</Typography>
                      <Chip label="Pending" size="small" color="warning" sx={{ mt: 0.5 }} />
                    </Box>
                    <IconButton size="small" onClick={() => handleRemove(r.id)} sx={{ color: 'error.main' }}><CloseIcon /></IconButton>
                  </Box>
                ))}
              </>
            )}
            {pendingRequests.length === 0 && sentRequests.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">No pending requests</Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Tab 2: Find People */}
        {tab === 2 && (
          <Box>
            <TextField fullWidth placeholder="Search by name or email..." value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>, endAdornment: searchLoading ? <CircularProgress size={18} /> : null }}
              sx={{ mb: 3 }} />
            {searchResults.map(u => <UserCard key={u.id} u={u} />)}
            {searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
              <Typography color="text.secondary" textAlign="center">No users found for "{searchQuery}"</Typography>
            )}
            {searchQuery.length < 2 && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <PersonSearchIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
                <Typography color="text.secondary">Type at least 2 characters to search</Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Tab 3: Messages */}
        {tab === 3 && (
          <Box sx={{ display: 'flex', gap: 2, height: { xs: 'calc(100dvh - 220px)', md: '65vh' }, minHeight: 400 }}>
            {/* Conversation list */}
            <Box sx={{ width: { xs: chatPartner ? 0 : '100%', sm: 280, md: 320 }, flexShrink: 0, overflowY: 'auto', display: { xs: chatPartner ? 'none' : 'block', sm: 'block' } }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>Conversations</Typography>
              {conversations.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No conversations yet. Message a friend!</Typography>
              ) : (
                conversations.map(c => <ConversationCard key={c.partner?.id} conv={c} />)
              )}
              {/* Friends not in conversations */}
              {friends.filter(f => !conversations.some(c => {
                const fUser = getFriendUser(f);
                return c.partner?.id === fUser?.id;
              })).map(f => {
                const fUser = getFriendUser(f);
                return (
                  <Box key={f.id} onClick={() => openChat(fUser)} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', mb: 1.5, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                    <Avatar src={fUser?.profileImage} sx={{ width: 48, height: 48, bgcolor: '#10B981' }}>{getInitials(fUser?.fullName)}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>{fUser?.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">Start a conversation</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            <Divider orientation="vertical" flexItem />

            {/* Chat window */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {chatPartner ? (
                <>
                  {/* Chat header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    {/* Back button — mobile only */}
                    <IconButton size="small" sx={{ display: { sm: 'none' } }} onClick={() => setChatPartner(null)}>
                      <ChevronLeftIcon />
                    </IconButton>
                    <Avatar src={chatPartner.profileImage}
                      sx={{ bgcolor: '#4F46E5', cursor: 'pointer' }}
                      onClick={() => setProfileUserId(chatPartner.id)}>
                      {getInitials(chatPartner.fullName)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={700} sx={{ cursor: 'pointer', '&:hover': { color: '#4F46E5' } }}
                        onClick={() => setProfileUserId(chatPartner.id)}>
                        {chatPartner.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{chatPartner.email}</Typography>
                    </Box>
                  </Box>

                  {/* Messages */}
                  <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1, bgcolor: '#F9FAFB' }}>
                    {chatLoading ? (
                      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, py: 8 }}>
                        <CircularProgress sx={{ color: '#4F46E5' }} size={36} />
                        <Typography variant="body2" color="text.secondary">Loading messages…</Typography>
                      </Box>
                    ) : activeConversation.messages.length === 0 ? (
                      <Typography color="text.secondary" textAlign="center" mt={4}>No messages yet. Say hello!</Typography>
                    ) : null}
                    {!chatLoading && activeConversation.messages.map(msg => {
                      const isMe = msg.sender?.id === user?.id;
                      return (
                        <Box key={msg.id} sx={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                          <Box sx={{
                            maxWidth: '70%', px: 2, py: 1.2, borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                            bgcolor: isMe ? '#4F46E5' : 'white', color: isMe ? 'white' : '#1F2937',
                            fontSize: '0.875rem', lineHeight: 1.6,
                            boxShadow: isMe ? '0 2px 8px rgba(79,70,229,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
                            border: isMe ? 'none' : '1px solid #E5E7EB',
                          }}>
                            {msg.content}
                            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7, fontSize: '0.7rem' }}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                    {!chatLoading && <div ref={messagesEndRef} />}
                  </Box>

                  {/* Message input */}
                  <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                    <TextField fullWidth size="small" placeholder="Type a message..." value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                    <IconButton onClick={handleSendMessage} disabled={!messageInput.trim()}
                      sx={{ bgcolor: messageInput.trim() ? '#4F46E5' : '#E5E7EB', color: messageInput.trim() ? 'white' : '#9CA3AF', '&:hover': { bgcolor: '#4338CA' } }}>
                      <SendIcon />
                    </IconButton>
                  </Box>
                </>
              ) : (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'text.secondary' }}>
                  <ChatIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                  <Typography>Select a conversation or click Chat on a friend</Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>

      <UserProfileModal
        userId={profileUserId}
        open={!!profileUserId}
        onClose={() => setProfileUserId(null)}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
