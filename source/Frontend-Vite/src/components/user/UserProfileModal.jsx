import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog, DialogContent, Avatar, Typography, Box, Button, Divider,
  CircularProgress, IconButton, Tooltip, Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Chat as ChatIcon,
  PersonAdd as AddFriendIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  AccessTime as TimeIcon,
  Verified as VerifiedIcon,
  SwapHoriz as SwapIcon,
  AutoStories as BorrowIcon,
  HowToReg as PersonCheckIcon,
} from '@mui/icons-material';
import api from '../../utils/api';
import { sendFriendRequest } from '../../store/features/friends/friendThunk';

export default function UserProfileModal({ userId, open, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: me } = useSelector(s => s.auth);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [friendSent, setFriendSent] = useState(false);

  useEffect(() => {
    if (!open || !userId || isNaN(Number(userId))) return;
    setProfile(null);
    setFriendSent(false);
    setLoading(true);
    api.get(`/api/users/${userId}/public-profile`)
      .then(r => setProfile(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, userId]);

  const handleMessage = () => {
    onClose();
    navigate(`/friends?userId=${userId}`);
  };

  const handleAddFriend = () => {
    dispatch(sendFriendRequest(userId));
    setFriendSent(true);
  };

  const isMe = me?.id === userId;

  const scoreColor = (s) => s >= 4 ? '#10B981' : s >= 2.5 ? '#F59E0B' : '#EF4444';

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  }) : null;

  const formatPhone = (p) => {
    if (!p) return null;
    // Add + prefix if not present
    return p.startsWith('+') ? p : `+${p}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        py: 1.5, px: 2,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        minHeight: 52,
      }}>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 0, pb: 3, px: 3 }}>
        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" py={5} gap={2}>
            <CircularProgress sx={{ color: '#4F46E5' }} />
            <Typography variant="body2" color="text.secondary">Loading profile…</Typography>
          </Box>
        ) : profile ? (
          <>
            {/* Avatar — overlapping the gradient header */}
            <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: '15px', mb: 2 }}>
              <Avatar
                src={profile.profileImage}
                sx={{
                  width: 88, height: 88,
                  border: '4px solid white',
                  boxShadow: '0 8px 24px rgba(79,70,229,0.25)',
                  fontSize: 32, fontWeight: 700,
                  bgcolor: '#4F46E5',
                }}
              >
                {profile.fullName?.[0]}
              </Avatar>

              <Box display="flex" alignItems="center" gap={0.5} mt={1.5}>
                <Typography variant="h6" fontWeight={700} textAlign="center">
                  {profile.fullName}
                </Typography>
                {profile.verified && (
                  <Tooltip title="Verified member">
                    <VerifiedIcon sx={{ fontSize: 18, color: '#4F46E5' }} />
                  </Tooltip>
                )}
              </Box>

              <Typography variant="caption" color="text.secondary">
                Member since {new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Typography>
            </Box>

            {/* Stats row */}
            <Box sx={{
              display: 'flex',
              bgcolor: '#F8FAFF',
              borderRadius: 3,
              border: '1px solid #E8EAFF',
              mb: 2.5, overflow: 'hidden',
            }}>
              {[
                {
                  icon: <StarIcon sx={{ fontSize: 16, color: scoreColor(profile.reputationScore) }} />,
                  value: profile.reputationScore?.toFixed(1),
                  label: 'Reputation',
                  color: scoreColor(profile.reputationScore),
                },
                {
                  icon: <SwapIcon sx={{ fontSize: 16, color: '#4F46E5' }} />,
                  value: profile.totalExchanges,
                  label: 'Shared',
                  color: '#4F46E5',
                },
                {
                  icon: <BorrowIcon sx={{ fontSize: 16, color: '#7C3AED' }} />,
                  value: profile.totalBorrows,
                  label: 'Borrowed',
                  color: '#7C3AED',
                },
              ].map((stat, i) => (
                <Box key={i} flex={1} textAlign="center" py={1.5}
                  sx={{ borderRight: i < 2 ? '1px solid #E8EAFF' : 'none' }}>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                    {stat.icon}
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: stat.color }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                </Box>
              ))}
            </Box>

            {/* Info rows */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              {formatPhone(profile.phone) && (
                <Box display="flex" alignItems="center" gap={1.5} px={1.5} py={1}
                  sx={{ bgcolor: '#F9FAFB', borderRadius: 2 }}>
                  <Box sx={{
                    width: 32, height: 32, borderRadius: 1.5,
                    bgcolor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <PhoneIcon sx={{ fontSize: 15, color: '#4F46E5' }} />
                  </Box>
                  <Typography variant="body2" fontWeight={500}>{formatPhone(profile.phone)}</Typography>
                </Box>
              )}

              {profile.lastLogin && (
                <Box display="flex" alignItems="center" gap={1.5} px={1.5} py={1}
                  sx={{ bgcolor: '#F9FAFB', borderRadius: 2 }}>
                  <Box sx={{
                    width: 32, height: 32, borderRadius: 1.5,
                    bgcolor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <TimeIcon sx={{ fontSize: 15, color: '#4F46E5' }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.2}>
                      Last seen
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatDate(profile.lastLogin)}
                    </Typography>
                  </Box>
                </Box>
              )}

              {profile.blockedFromExchange && (
                <Chip label="Blocked from exchange" color="error" size="small" sx={{ alignSelf: 'flex-start' }} />
              )}
            </Box>

            {/* Action buttons */}
            {!isMe && (
              <Box display="flex" gap={1.5}>
                <Button
                  fullWidth variant="contained" startIcon={<ChatIcon />}
                  onClick={handleMessage}
                  sx={{
                    bgcolor: '#4F46E5', textTransform: 'none', fontWeight: 600,
                    borderRadius: 2.5, py: 1.2,
                    '&:hover': { bgcolor: '#4338CA' },
                    boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
                  }}
                >
                  Message
                </Button>
                <Button
                  fullWidth variant="outlined"
                  startIcon={friendSent ? <PersonCheckIcon /> : <AddFriendIcon />}
                  onClick={handleAddFriend}
                  disabled={friendSent}
                  sx={{
                    textTransform: 'none', fontWeight: 600, borderRadius: 2.5, py: 1.2,
                    color: friendSent ? '#10B981' : '#4F46E5',
                    borderColor: friendSent ? '#10B981' : '#4F46E5',
                    '&:hover': { bgcolor: friendSent ? '#F0FDF4' : '#EEF2FF' },
                  }}
                >
                  {friendSent ? 'Sent!' : 'Add Friend'}
                </Button>
              </Box>
            )}
          </>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">Could not load profile.</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
