import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  alpha,
} from "@mui/material";
import {
  Shield as ShieldIcon,
  PhotoCamera as PhotoCameraIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  EmojiEvents as TrophyIcon,
  MenuBook as BookIcon,
  CheckCircle as CheckCircleIcon,
  Gavel as FineIcon,
  BookmarkAdded as ReservationIcon,
  AdminPanelSettings as AdminIcon,
  Verified as VerifiedIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { updateProfile, uploadProfileImage } from "../../store/features/auth/authThunk";
import { getUsersList } from "../../store/features/auth/authThunk";

const STAT_CARD_STYLE = (color) => ({
  p: { xs: 1.5, sm: 2 },
  borderRadius: 2,
  border: `1px solid ${alpha(color, 0.25)}`,
  background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.04)} 100%)`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 0.5,
});

export default function AdminProfilePage() {
  const dispatch = useDispatch();
  const { user, profileUpdateLoading } = useSelector((s) => s.auth);
  const { usersList } = useSelector((s) => s.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [formData, setFormData] = useState({ fullName: "", phone: "" });

  useEffect(() => {
    if (user) {
      setFormData({ fullName: user.fullName || "", phone: user.phone || "" });
    }
  }, [user]);

  useEffect(() => {
    dispatch(getUsersList());
  }, [dispatch]);

  const totalUsers = usersList?.length || 0;

  const handleSave = async () => {
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
      showSnackbar("Profile updated successfully!", "success");
    } catch (err) {
      showSnackbar(err || "Failed to update profile", "error");
    }
  };

  const handleCancel = () => {
    setFormData({ fullName: user?.fullName || "", phone: user?.phone || "" });
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await dispatch(uploadProfileImage(file)).unwrap();
      showSnackbar("Profile picture updated!", "success");
      setAvatarDialogOpen(false);
    } catch (err) {
      showSnackbar(err || "Failed to upload image", "error");
    }
  };

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : "—";

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      color: "rgba(255,255,255,0.9)",
      "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
      "&:hover fieldset": { borderColor: "rgba(220,38,38,0.6)" },
      "&.Mui-focused fieldset": { borderColor: "#dc2626" },
      "&.Mui-disabled": {
        "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
      },
    },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#fca5a5" },
    "& .MuiInputBase-input.Mui-disabled": {
      WebkitTextFillColor: "rgba(255,255,255,0.4)",
    },
    "& .MuiFormHelperText-root": { color: "rgba(255,255,255,0.35)" },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0f172a 0%, #1e1b2e 100%)",
        p: { xs: 2, sm: 3, md: 4 },
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0, left: 0, right: 0,
          height: "400px",
          background: "radial-gradient(circle at 50% 0%, rgba(220,38,38,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1, maxWidth: 960, mx: "auto" }}>

        {/* ── Page Title ─────────────────────────────────── */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <ShieldIcon sx={{ color: "#dc2626", fontSize: { xs: 24, sm: 28 } }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.4rem", sm: "2rem" },
                background: "linear-gradient(135deg, #ffffff 0%, #fecaca 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Admin Profile
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.45)", pl: 0.5 }}>
            Manage your administrator account
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "300px 1fr" },
            gap: { xs: 2.5, sm: 3 },
          }}
        >
          {/* ── Left Column ─────────────────────────────── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

            {/* Avatar Card */}
            <Box
              sx={{
                borderRadius: 3,
                border: "1px solid rgba(220,38,38,0.2)",
                background: "linear-gradient(135deg, rgba(30,27,46,0.95) 0%, rgba(15,23,42,0.98) 100%)",
                backdropFilter: "blur(20px)",
                overflow: "hidden",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0, left: 0, right: 0,
                  height: "140px",
                  background: "linear-gradient(135deg, rgba(220,38,38,0.18) 0%, rgba(153,27,27,0.12) 100%)",
                  pointerEvents: "none",
                },
              }}
            >
              <Box sx={{ p: { xs: 2.5, sm: 3 }, textAlign: "center", position: "relative" }}>
                {/* Avatar */}
                <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
                  <Avatar
                    src={user?.profileImage || undefined}
                    sx={{
                      width: { xs: 96, sm: 112 },
                      height: { xs: 96, sm: 112 },
                      mx: "auto",
                      background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                      fontSize: { xs: "2.2rem", sm: "2.8rem" },
                      fontWeight: 700,
                      border: "3px solid rgba(220,38,38,0.4)",
                      boxShadow: "0 8px 32px rgba(220,38,38,0.3)",
                    }}
                  >
                    {!user?.profileImage && (formData.fullName?.charAt(0)?.toUpperCase() || "A")}
                  </Avatar>
                  {/* Online dot */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 4, right: 4,
                      width: 18, height: 18,
                      borderRadius: "50%",
                      bgcolor: "#22c55e",
                      border: "3px solid #0f172a",
                      boxShadow: "0 0 8px rgba(34,197,94,0.6)",
                    }}
                  />
                  <IconButton
                    onClick={() => setAvatarDialogOpen(true)}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 0, right: 0,
                      bgcolor: "#dc2626",
                      color: "white",
                      width: 28, height: 28,
                      "&:hover": { bgcolor: "#b91c1c" },
                    }}
                  >
                    <PhotoCameraIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "white",
                    mb: 0.5,
                    fontSize: { xs: "1.05rem", sm: "1.2rem" },
                  }}
                >
                  {formData.fullName || "Admin"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.45)", display: "block", mb: 2, fontSize: "0.78rem", wordBreak: "break-all" }}
                >
                  {user?.email}
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "center" }}>
                  <Chip
                    icon={<ShieldIcon sx={{ fontSize: 14, color: "#fca5a5 !important" }} />}
                    label="Administrator"
                    size="small"
                    sx={{
                      bgcolor: "rgba(220,38,38,0.15)",
                      color: "#fca5a5",
                      border: "1px solid rgba(220,38,38,0.3)",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                    }}
                  />
                  {user?.verified && (
                    <Chip
                      icon={<VerifiedIcon sx={{ fontSize: 14, color: "#86efac !important" }} />}
                      label="Verified"
                      size="small"
                      sx={{
                        bgcolor: "rgba(34,197,94,0.1)",
                        color: "#86efac",
                        border: "1px solid rgba(34,197,94,0.25)",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    />
                  )}
                </Box>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 2 }} />

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                  <CalendarIcon sx={{ fontSize: 15, color: "rgba(255,255,255,0.35)" }} />
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)" }}>
                    Admin since {memberSince}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Quick Stats */}
            <Box
              sx={{
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(30,27,46,0.8)",
                p: { xs: 2, sm: 2.5 },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  fontSize: "0.7rem",
                  mb: 1.5,
                }}
              >
                System Overview
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.5,
                }}
              >
                <Box sx={STAT_CARD_STYLE("#3b82f6")}>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", color: "#93c5fd" }}>
                    {totalUsers}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.7rem", textAlign: "center" }}>
                    Total Users
                  </Typography>
                </Box>
                <Box sx={STAT_CARD_STYLE("#dc2626")}>
                  <AdminIcon sx={{ fontSize: 28, color: "#fca5a5" }} />
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.7rem", textAlign: "center" }}>
                    Full Access
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* ── Right Column ────────────────────────────── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

            {/* Profile Form */}
            <Box
              sx={{
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(30,27,46,0.85)",
                backdropFilter: "blur(20px)",
                overflow: "hidden",
              }}
            >
              {/* Card Header */}
              <Box
                sx={{
                  px: { xs: 2.5, sm: 3 },
                  py: 2,
                  background: "linear-gradient(90deg, rgba(220,38,38,0.12) 0%, transparent 100%)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36, height: 36,
                      borderRadius: 2,
                      bgcolor: "rgba(220,38,38,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <PersonIcon sx={{ color: "#fca5a5", fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: "white", fontWeight: 700, lineHeight: 1.2 }}>
                      Personal Information
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
                      Update your admin account details
                    </Typography>
                  </Box>
                </Box>

                {!isEditing ? (
                  <Button
                    startIcon={<EditIcon fontSize="small" />}
                    onClick={() => setIsEditing(true)}
                    size="small"
                    sx={{
                      color: "#fca5a5",
                      borderColor: "rgba(220,38,38,0.3)",
                      border: "1px solid",
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": { bgcolor: "rgba(220,38,38,0.1)", borderColor: "rgba(220,38,38,0.5)" },
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      onClick={handleCancel}
                      sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none" }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={
                        profileUpdateLoading
                          ? <CircularProgress size={14} color="inherit" />
                          : <SaveIcon fontSize="small" />
                      }
                      onClick={handleSave}
                      disabled={profileUpdateLoading}
                      sx={{
                        background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                        textTransform: "none",
                        fontWeight: 700,
                        "&:hover": {
                          background: "linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)",
                        },
                      }}
                    >
                      Save Changes
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Form Fields */}
              <Box sx={{ p: { xs: 2.5, sm: 3 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Full Name */}
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <PersonIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.35)" }} />
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, fontSize: "0.68rem" }}>
                      Full Name
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    name="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                    disabled={!isEditing}
                    sx={fieldSx}
                  />
                </Box>

                {/* Email (read-only) */}
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <EmailIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.35)" }} />
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, fontSize: "0.68rem" }}>
                      Email Address
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    value={user?.email || ""}
                    disabled
                    helperText="Email cannot be changed"
                    sx={fieldSx}
                  />
                </Box>

                {/* Phone */}
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <PhoneIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.35)" }} />
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, fontSize: "0.68rem" }}>
                      Phone Number
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                    sx={fieldSx}
                  />
                </Box>

                {/* Role (read-only display) */}
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <ShieldIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.35)" }} />
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, fontSize: "0.68rem" }}>
                      Role & Permissions
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      px: 2, py: 1.5,
                      borderRadius: 1.5,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.03)",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      flexWrap: "wrap",
                    }}
                  >
                    <Chip
                      icon={<ShieldIcon sx={{ fontSize: 14, color: "#fca5a5 !important" }} />}
                      label="Administrator"
                      size="small"
                      sx={{
                        bgcolor: "rgba(220,38,38,0.15)",
                        color: "#fca5a5",
                        border: "1px solid rgba(220,38,38,0.3)",
                        fontWeight: 700,
                      }}
                    />
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)" }}>
                      Full system access · Cannot be changed
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Security / Account Info */}
            <Box
              sx={{
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(30,27,46,0.85)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: { xs: 2.5, sm: 3 },
                  py: 2,
                  background: "linear-gradient(90deg, rgba(59,130,246,0.1) 0%, transparent 100%)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 36, height: 36,
                    borderRadius: 2,
                    bgcolor: "rgba(59,130,246,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <AdminIcon sx={{ color: "#93c5fd", fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: "white", fontWeight: 700, lineHeight: 1.2 }}>
                    Account Information
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
                    Your account details and status
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                {[
                  {
                    label: "Account Status",
                    value: user?.verified ? "Verified" : "Unverified",
                    color: user?.verified ? "#86efac" : "#fbbf24",
                    bg: user?.verified ? "rgba(34,197,94,0.08)" : "rgba(251,191,36,0.08)",
                    border: user?.verified ? "rgba(34,197,94,0.2)" : "rgba(251,191,36,0.2)",
                  },
                  {
                    label: "Auth Provider",
                    value: user?.authProvider || "LOCAL",
                    color: "#93c5fd",
                    bg: "rgba(59,130,246,0.08)",
                    border: "rgba(59,130,246,0.2)",
                  },
                  {
                    label: "Member Since",
                    value: memberSince,
                    color: "rgba(255,255,255,0.7)",
                    bg: "rgba(255,255,255,0.04)",
                    border: "rgba(255,255,255,0.1)",
                  },
                  {
                    label: "Last Login",
                    value: user?.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : "—",
                    color: "rgba(255,255,255,0.7)",
                    bg: "rgba(255,255,255,0.04)",
                    border: "rgba(255,255,255,0.1)",
                  },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: `1px solid ${item.border}`,
                      background: item.bg,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.35)",
                        fontSize: "0.68rem",
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography sx={{ color: item.color, fontWeight: 700, fontSize: "0.9rem" }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Avatar Upload Dialog ──────────────────────── */}
      <Dialog
        open={avatarDialogOpen}
        onClose={() => !profileUpdateLoading && setAvatarDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: "#1e1b2e",
            border: "1px solid rgba(220,38,38,0.2)",
            borderRadius: 3,
            color: "white",
          },
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PhotoCameraIcon sx={{ color: "#fca5a5" }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>
              Update Profile Picture
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setAvatarDialogOpen(false)}
            disabled={profileUpdateLoading}
            sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "white" } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
        <DialogContent sx={{ pt: 3, textAlign: "center" }}>
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="admin-avatar-upload"
            type="file"
            onChange={handleAvatarUpload}
          />
          <label htmlFor="admin-avatar-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={
                profileUpdateLoading
                  ? <CircularProgress size={16} color="inherit" />
                  : <PhotoCameraIcon />
              }
              disabled={profileUpdateLoading}
              sx={{
                background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                fontWeight: 700,
                textTransform: "none",
                px: 3,
                "&:hover": {
                  background: "linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)",
                },
              }}
            >
              {profileUpdateLoading ? "Uploading..." : "Choose Photo"}
            </Button>
          </label>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)", mt: 2, display: "block" }}>
            Recommended: Square image, at least 400×400px
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setAvatarDialogOpen(false)}
            disabled={profileUpdateLoading}
            sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none" }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ─────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
