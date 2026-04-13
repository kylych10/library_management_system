import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Block as BlockIcon,
  AdminPanelSettings as AdminIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import DataTable from '../../components/DataTable';
import { getUsersList, updateUserRole, toggleUserVerification } from '../../../store/features/auth/authThunk';
import UserDetailsDialog from './UserDetailsDialog';
import UserState from './UserState';

function ConfirmDialog({ open, title, message, confirmLabel, confirmColor = "warning", onConfirm, onCancel }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {title}
        <IconButton size="small" onClick={onCancel}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Alert severity={confirmColor === "error" ? "error" : "warning"}>{message}</Alert>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCancel} variant="outlined">Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor}>{confirmLabel}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AdminUsersPage() {
  const dispatch = useDispatch();
  const { usersList, usersListLoading } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Confirm dialogs
  const [adminTarget, setAdminTarget] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);

  // Feedback
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });
  const showFeedback = (message, severity = 'success') => setFeedback({ open: true, message, severity });

  useEffect(() => { dispatch(getUsersList()); }, []);

  const handleViewDetails = (user) => { setSelectedUser(user); setViewDialogOpen(true); };

  const handleConfirmAdmin = async () => {
    try {
      await dispatch(updateUserRole({ userId: adminTarget.id, role: 'ROLE_ADMIN' })).unwrap();
      setAdminTarget(null);
      showFeedback(`${adminTarget.fullName} upgraded to admin.`, 'success');
      dispatch(getUsersList());
    } catch (err) {
      setAdminTarget(null);
      showFeedback(err || 'Failed to upgrade user.', 'error');
    }
  };

  const handleConfirmToggle = async () => {
    const action = toggleTarget.verified ? 'unverified' : 'verified';
    try {
      await dispatch(toggleUserVerification(toggleTarget.id)).unwrap();
      setToggleTarget(null);
      showFeedback(`${toggleTarget.fullName} marked as ${action}.`, 'success');
      dispatch(getUsersList());
    } catch (err) {
      setToggleTarget(null);
      showFeedback(err || 'Failed to update user.', 'error');
    }
  };

  const filteredUsers = (usersList || []).filter((user) =>
    searchQuery === '' ||
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery)
  );

  const columns = [
    { field: 'id', headerName: 'ID', minWidth: 60 },
    {
      field: 'fullName', headerName: 'User', minWidth: 220,
      renderCell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar src={row.profileImage} sx={{ width: 36, height: 36, fontSize: '0.9rem' }}>
            {row.fullName?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>{row.fullName}</Typography>
            <Typography variant="caption" color="text.secondary">{row.email}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'role', headerName: 'Role',
      renderCell: (row) => (
        <Chip label={row.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
          color={row.role === 'ROLE_ADMIN' ? 'error' : 'default'} size="small"
          icon={row.role === 'ROLE_ADMIN' ? <AdminIcon /> : undefined} sx={{ fontWeight: 600 }} />
      ),
    },
    {
      field: 'phone', headerName: 'Phone', minWidth: 130,
      renderCell: (row) => <Typography variant="body2">{row.phone || '—'}</Typography>,
    },
    {
      field: 'authProvider', headerName: 'Auth',
      renderCell: (row) => (
        <Chip label={row.authProvider || 'LOCAL'} size="small" variant="outlined"
          color={row.authProvider === 'GOOGLE' ? 'info' : 'default'} />
      ),
    },
    {
      field: 'createdAt', headerName: 'Joined',
      renderCell: (row) => (
        <Typography variant="body2">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}</Typography>
      ),
    },
    {
      field: 'verified', headerName: 'Status',
      renderCell: (row) => (
        <Chip label={row.verified ? 'Verified' : 'Unverified'}
          color={row.verified ? 'success' : 'warning'} size="small"
          icon={row.verified ? <CheckCircleIcon /> : <BlockIcon />} sx={{ fontWeight: 600 }} />
      ),
    },
  ];

  const customActions = (row) => (
    <Stack direction="column" spacing={0.5} sx={{ minWidth: 110 }}>
      <Button fullWidth size="small" variant="outlined" startIcon={<ViewIcon />}
        onClick={() => handleViewDetails(row)} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
        View
      </Button>
      {row.role !== 'ROLE_ADMIN' && (
        <Button fullWidth size="small" variant="outlined" color="warning" startIcon={<AdminIcon />}
          onClick={() => setAdminTarget(row)} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
          Make Admin
        </Button>
      )}
      <Button fullWidth size="small" variant="outlined"
        color={row.verified ? 'error' : 'success'}
        startIcon={row.verified ? <BlockIcon /> : <CheckCircleIcon />}
        onClick={() => setToggleTarget(row)}
        sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
        {row.verified ? 'Unverify' : 'Verify'}
      </Button>
    </Stack>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.3rem', sm: '2.125rem' } }}>Users Management</Typography>
        <Typography variant="body2" color="text.secondary">Manage user accounts and permissions</Typography>
      </Box>

      {/* Stats */}
      <UserState usersList={usersList} />

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField fullWidth size="small" placeholder="Search by name, email, or phone..."
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
      </Box>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={usersListLoading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={filteredUsers.length}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        actions={false}
        customActions={customActions}
      />

      {/* User Details Dialog */}
      <UserDetailsDialog viewDialogOpen={viewDialogOpen} setViewDialogOpen={setViewDialogOpen} selectedUser={selectedUser} />

      {/* Make Admin Confirm */}
      <ConfirmDialog
        open={!!adminTarget}
        title="Grant Admin Privileges"
        message={`Upgrade "${adminTarget?.fullName}" to admin? This grants full administrative access.`}
        confirmLabel="Make Admin"
        confirmColor="warning"
        onConfirm={handleConfirmAdmin}
        onCancel={() => setAdminTarget(null)}
      />

      {/* Toggle Verification Confirm */}
      <ConfirmDialog
        open={!!toggleTarget}
        title={toggleTarget?.verified ? 'Unverify User' : 'Verify User'}
        message={`${toggleTarget?.verified ? 'Unverify' : 'Verify'} user "${toggleTarget?.fullName}"?`}
        confirmLabel={toggleTarget?.verified ? 'Unverify' : 'Verify'}
        confirmColor={toggleTarget?.verified ? 'error' : 'success'}
        onConfirm={handleConfirmToggle}
        onCancel={() => setToggleTarget(null)}
      />

      {/* Feedback */}
      <Dialog open={feedback.open} onClose={() => setFeedback({ ...feedback, open: false })} maxWidth="xs" fullWidth>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity={feedback.severity}>{feedback.message}</Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="contained" onClick={() => setFeedback({ ...feedback, open: false })}>OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
