import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  TextField,
  Button,
  Avatar,
  Chip,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import CakeIcon from '@mui/icons-material/Cake';
import VerifiedIcon from '@mui/icons-material/Verified';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Layout from '../components/layout/Layout';
import { updateProfile, uploadProfileImage } from '../store/features/auth/authThunk';
import { fetchMyBookLoans } from '../store/features/bookLoans/bookLoanThunk';
import { fetchActiveSubscription } from '../store/features/subscriptions/subscriptionThunk';

const PLAN_TIER_MAP = {
  GOLD: 'Gold',
  SILVER: 'Silver',
  PLATINUM: 'Platinum',
  BASIC: 'Basic',
};

const TIER_COLORS = {
  Gold: '#F59E0B',
  Silver: '#9CA3AF',
  Platinum: '#8B5CF6',
  Basic: '#4F46E5',
};

const getMembershipColor = (tier) => TIER_COLORS[tier] || '#4F46E5';

const computeFavoriteGenre = (loans) => {
  const returned = loans.filter((l) => l.status === 'RETURNED' && l.bookGenre);
  if (!returned.length) return null;
  const counts = {};
  returned.forEach((l) => {
    counts[l.bookGenre] = (counts[l.bookGenre] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, profileUpdateLoading } = useSelector((state) => state.auth);
  const { myLoans } = useSelector((state) => state.bookLoans);
  const { activeSubscription } = useSelector((state) => state.subscriptions);

  const [isEditing, setIsEditing] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  });

  // Sync form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  useEffect(() => {
    dispatch(fetchMyBookLoans({ status: null, page: 0, size: 200 }));
    dispatch(fetchActiveSubscription());
  }, [dispatch]);

  // Computed stats
  const booksRead = useMemo(
    () => myLoans.filter((l) => l.status === 'RETURNED').length,
    [myLoans]
  );

  const favoriteGenre = useMemo(() => computeFavoriteGenre(myLoans), [myLoans]);

  const memberTier = useMemo(() => {
    if (!activeSubscription?.planCode) return 'Basic';
    return PLAN_TIER_MAP[activeSubscription.planCode] || 'Basic';
  }, [activeSubscription]);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : '—';

  // Achievements computed from real data
  const achievements = useMemo(() => {
    const earlyReturns = myLoans.filter((l) => l.status === 'RETURNED' && l.remainingDays > 0).length;
    const genres = new Set(myLoans.filter((l) => l.bookGenre).map((l) => l.bookGenre)).size;

    return [
      {
        id: 1,
        title: 'First Book',
        description: 'Borrow your first book',
        earned: myLoans.length >= 1,
      },
      {
        id: 2,
        title: 'Bookworm',
        description: 'Read 10 books',
        earned: booksRead >= 10,
      },
      {
        id: 3,
        title: 'Avid Reader',
        description: 'Read 25 books',
        earned: booksRead >= 25,
      },
      {
        id: 4,
        title: 'Century Club',
        description: 'Read 100 books',
        earned: booksRead >= 100,
      },
      {
        id: 5,
        title: 'Diverse Reader',
        description: 'Read 5 different genres',
        earned: genres >= 5,
      },
      {
        id: 6,
        title: 'Early Bird',
        description: 'Return 5 books before due date',
        earned: earlyReturns >= 5,
      },
    ];
  }, [myLoans, booksRead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
      showSnackbar('Profile updated successfully!', 'success');
    } catch (err) {
      showSnackbar(err || 'Failed to update profile', 'error');
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      await dispatch(uploadProfileImage(file)).unwrap();
      showSnackbar('Profile picture updated!', 'success');
      setAvatarDialogOpen(false);
    } catch (err) {
      showSnackbar(err || 'Failed to upload image', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Layout>
      <div className="overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8 animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              My{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Profile
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600">Manage your account information and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Avatar Card */}
              <Card className="animate-fade-in-up">
                <CardContent className="text-center p-6 sm:p-8">
                  <div className="relative inline-block mb-4">
                    <Avatar
                      src={user?.profileImage || undefined}
                      sx={{
                        width: { xs: 96, sm: 120 },
                        height: { xs: 96, sm: 120 },
                        bgcolor: getMembershipColor(memberTier),
                        fontSize: { xs: '2.5rem', sm: '3rem' },
                        fontWeight: 'bold',
                        margin: '0 auto',
                      }}
                    >
                      {!user?.profileImage && (formData.fullName.charAt(0).toUpperCase() || '?')}
                    </Avatar>
                    <IconButton
                      onClick={() => setAvatarDialogOpen(true)}
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: '#4F46E5',
                        color: 'white',
                        '&:hover': { bgcolor: '#4338CA' },
                      }}
                      size="small"
                    >
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                    {formData.fullName || '—'}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 break-all">{user?.email}</p>

                  <Chip
                    icon={<VerifiedIcon />}
                    label={`${memberTier} Member`}
                    sx={{
                      bgcolor: `${getMembershipColor(memberTier)}20`,
                      color: getMembershipColor(memberTier),
                      fontWeight: 600,
                      mb: 2,
                    }}
                  />

                  {activeSubscription && (
                    <p className="text-xs text-gray-500 mt-1">
                      {activeSubscription.daysRemaining > 0
                        ? `${activeSubscription.daysRemaining} days remaining`
                        : 'Subscription expired'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Reading Stats Card */}
              <Card className="animate-fade-in-up animation-delay-200">
                <CardContent className="p-5 sm:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Reading Stats</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <LocalLibraryIcon sx={{ color: '#4F46E5' }} />
                        <span className="text-gray-700 text-sm sm:text-base">Books Read</span>
                      </div>
                      <span className="font-bold text-indigo-600">{booksRead}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <EmojiEventsIcon sx={{ color: '#F59E0B' }} />
                        <span className="text-gray-700 text-sm sm:text-base">Total Loans</span>
                      </div>
                      <span className="font-bold text-orange-600">{myLoans.length}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BadgeIcon sx={{ color: '#10B981' }} />
                        <span className="text-gray-700 text-sm sm:text-base">Member Since</span>
                      </div>
                      <span className="font-semibold text-gray-900">{memberSince}</span>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Favorite Genre</p>
                      {favoriteGenre ? (
                        <Chip
                          label={favoriteGenre}
                          size="small"
                          sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 600 }}
                        />
                      ) : (
                        <p className="text-xs text-gray-400">No books returned yet</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information Card */}
              <Card className="animate-fade-in-up animation-delay-400">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Profile Information
                    </h3>
                    {!isEditing ? (
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => setIsEditing(true)}
                        sx={{ color: '#4F46E5', fontWeight: 600 }}
                      >
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button onClick={handleCancel} variant="outlined" size="small">
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSave}
                          variant="contained"
                          size="small"
                          disabled={profileUpdateLoading}
                          startIcon={profileUpdateLoading ? <CircularProgress size={16} color="inherit" /> : null}
                          sx={{ bgcolor: '#4F46E5', '&:hover': { bgcolor: '#4338CA' } }}
                        >
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-5">
                    {/* Full Name */}
                    <div>
                      <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                        <BadgeIcon sx={{ fontSize: 20 }} />
                        <span>Full Name</span>
                      </label>
                      <TextField
                        fullWidth
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: '#4F46E5' },
                            '&.Mui-focused fieldset': { borderColor: '#4F46E5' },
                          },
                        }}
                      />
                    </div>

                    {/* Email (read-only) */}
                    <div>
                      <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                        <EmailIcon sx={{ fontSize: 20 }} />
                        <span>Email Address</span>
                      </label>
                      <TextField
                        fullWidth
                        value={user?.email || ''}
                        disabled
                        helperText="Email cannot be changed"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: '#4F46E5' },
                          },
                        }}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                        <PhoneIcon sx={{ fontSize: 20 }} />
                        <span>Phone Number</span>
                      </label>
                      <TextField
                        fullWidth
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: '#4F46E5' },
                            '&.Mui-focused fieldset': { borderColor: '#4F46E5' },
                          },
                        }}
                      />
                    </div>

                    {/* Member Status (read-only) */}
                    <div>
                      <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                        <AutoAwesomeIcon sx={{ fontSize: 20 }} />
                        <span>Member Status</span>
                      </label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Chip
                          icon={<VerifiedIcon />}
                          label={`${memberTier} Member`}
                          sx={{
                            bgcolor: `${getMembershipColor(memberTier)}20`,
                            color: getMembershipColor(memberTier),
                            fontWeight: 600,
                          }}
                        />
                        {activeSubscription?.planName && (
                          <span className="text-sm text-gray-600">{activeSubscription.planName}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements Card */}
              <Card className="animate-fade-in-up animation-delay-600">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                    Achievements
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          achievement.earned
                            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400'
                            : 'bg-gray-50 border-gray-200 opacity-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`p-2 rounded-lg flex-shrink-0 ${
                              achievement.earned ? 'bg-yellow-400' : 'bg-gray-300'
                            }`}
                          >
                            <EmojiEventsIcon
                              sx={{ color: achievement.earned ? '#FFF' : '#6B7280', fontSize: 20 }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 mb-0.5 text-sm sm:text-base">
                              {achievement.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {achievement.description}
                            </p>
                            {achievement.earned && (
                              <Chip
                                label="Earned"
                                size="small"
                                color="success"
                                icon={<VerifiedIcon />}
                                sx={{ mt: 1 }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Upload Dialog */}
      <Dialog
        open={avatarDialogOpen}
        onClose={() => !profileUpdateLoading && setAvatarDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          <div className="text-center py-4">
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-upload"
              type="file"
              onChange={handleAvatarUpload}
            />
            <label htmlFor="avatar-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={profileUpdateLoading ? <CircularProgress size={16} color="inherit" /> : <PhotoCameraIcon />}
                disabled={profileUpdateLoading}
                sx={{ bgcolor: '#4F46E5', '&:hover': { bgcolor: '#4338CA' } }}
              >
                {profileUpdateLoading ? 'Uploading...' : 'Choose Photo'}
              </Button>
            </label>
            <p className="text-sm text-gray-600 mt-4">
              Recommended: Square image, at least 400x400px
            </p>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarDialogOpen(false)} disabled={profileUpdateLoading}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default ProfilePage;
