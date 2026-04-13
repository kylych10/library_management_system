import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Fab,
  Paper,
  Box,
  Typography,
  IconButton,
  TextField,
  Avatar,
  Divider,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import MinimizeIcon from '@mui/icons-material/Remove';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import {
  sendToGroq,
  buildSystemPrompt,
  searchBooksFromDB,
  fetchMyLoansFromDB,
  fetchMyFinesFromDB,
  fetchMySubscriptionFromDB,
} from '../../utils/groq';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    "Hello! 👋 I'm your Library Assistant powered by Groq AI.\n\nI can search the library database in real time to help you find books, check your loans, fines, and subscription.\n\nHow can I help you today?",
};

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const { user } = useSelector((state) => state.auth);

  // Auto-scroll to latest message
  useEffect(() => {
    if (open && !minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, minimized]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
    setMinimized(false);
    setError(null);
  };

  const handleMinimize = () => setMinimized((prev) => !prev);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError(null);

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Fetch live data from DB in parallel
      const [books, loans, fines, subscription] = await Promise.all([
        searchBooksFromDB(text),
        user ? fetchMyLoansFromDB() : Promise.resolve([]),
        user ? fetchMyFinesFromDB() : Promise.resolve([]),
        user ? fetchMySubscriptionFromDB() : Promise.resolve(null),
      ]);

      const systemPrompt = buildSystemPrompt({ books, loans, fines, subscription });

      const payload = [
        { role: 'system', content: systemPrompt },
        ...updatedMessages.slice(-20),
      ];

      const reply = await sendToGroq(payload);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessageText = (content) => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part.split('\n').map((line, j, arr) => (
        <React.Fragment key={`${i}-${j}`}>
          {line}
          {j < arr.length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

  return (
    <>
      {/* Floating Button */}
      <Tooltip title="Library Assistant" placement="left">
        <Fab
          onClick={handleToggle}
          sx={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            zIndex: 1300,
            bgcolor: '#4F46E5',
            color: 'white',
            width: 60,
            height: 60,
            boxShadow: '0 4px 20px rgba(79,70,229,0.5)',
            '&:hover': { bgcolor: '#4338CA', transform: 'scale(1.08)' },
            transition: 'all 0.2s',
          }}
        >
          {open ? <CloseIcon /> : <SmartToyIcon sx={{ fontSize: 28 }} />}
        </Fab>
      </Tooltip>

      {/* Chat Window */}
      {open && (
        <Paper
          elevation={12}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 28,
            zIndex: 1299,
            width: { xs: 'calc(100vw - 32px)', sm: 380 },
            maxWidth: 420,
            borderRadius: 3,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: minimized ? 'auto' : 520,
            transition: 'height 0.3s ease',
            border: '1px solid rgba(79,70,229,0.15)',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 36, height: 36 }}>
              <AutoStoriesIcon sx={{ fontSize: 20, color: 'white' }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2 }}>
                Library Assistant
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                Powered by Groq AI
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleMinimize} sx={{ color: 'white' }}>
              <MinimizeIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleToggle} sx={{ color: 'white' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {!minimized && (
            <>
              {/* Messages */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  bgcolor: '#F9FAFB',
                  '&::-webkit-scrollbar': { width: 4 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(79,70,229,0.3)', borderRadius: 2 },
                }}
              >
                {messages.map((msg, idx) => {
                  const isAssistant = msg.role === 'assistant';
                  return (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        justifyContent: isAssistant ? 'flex-start' : 'flex-end',
                        alignItems: 'flex-end',
                        gap: 1,
                      }}
                    >
                      {isAssistant && (
                        <Avatar
                          sx={{ width: 28, height: 28, bgcolor: '#4F46E5', flexShrink: 0, mb: 0.5 }}
                        >
                          <SmartToyIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                      )}
                      <Box
                        sx={{
                          maxWidth: '78%',
                          px: 2,
                          py: 1.2,
                          borderRadius: isAssistant ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                          bgcolor: isAssistant ? 'white' : '#4F46E5',
                          color: isAssistant ? '#1F2937' : 'white',
                          fontSize: '0.875rem',
                          lineHeight: 1.6,
                          boxShadow: isAssistant
                            ? '0 1px 4px rgba(0,0,0,0.08)'
                            : '0 2px 8px rgba(79,70,229,0.3)',
                          border: isAssistant ? '1px solid #E5E7EB' : 'none',
                        }}
                      >
                        {renderMessageText(msg.content)}
                      </Box>
                    </Box>
                  );
                })}

                {/* Loading */}
                {loading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#4F46E5', flexShrink: 0 }}>
                      <SmartToyIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box
                      sx={{
                        px: 2,
                        py: 1.2,
                        bgcolor: 'white',
                        borderRadius: '4px 16px 16px 16px',
                        border: '1px solid #E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <CircularProgress size={14} sx={{ color: '#4F46E5' }} />
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>
                        Searching database...
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Error */}
                {error && (
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      bgcolor: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      borderRadius: 2,
                      fontSize: '0.8rem',
                      color: '#DC2626',
                    }}
                  >
                    ⚠️ {error}
                  </Box>
                )}

                <div ref={messagesEndRef} />
              </Box>

              <Divider />

              {/* Input */}
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: 'white',
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 1,
                  flexShrink: 0,
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder="Ask me anything about the library..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '0.875rem',
                      '& fieldset': { borderColor: '#E5E7EB' },
                      '&:hover fieldset': { borderColor: '#4F46E5' },
                      '&.Mui-focused fieldset': { borderColor: '#4F46E5' },
                    },
                  }}
                />
                <IconButton
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  sx={{
                    bgcolor: input.trim() && !loading ? '#4F46E5' : '#E5E7EB',
                    color: input.trim() && !loading ? 'white' : '#9CA3AF',
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    '&:hover': {
                      bgcolor: input.trim() && !loading ? '#4338CA' : '#E5E7EB',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <SendIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </>
          )}
        </Paper>
      )}
    </>
  );
}
