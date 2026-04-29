import React, { useEffect, useState } from 'react';
import {
  Box, Tab, Tabs, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControlLabel, Checkbox,
  MenuItem, Select, FormControl, InputLabel, Avatar, CircularProgress,
} from '@mui/material';
import {
  Flag as FlagIcon, Block as BlockIcon, CheckCircle as UnblockIcon,
  Gavel as GavelIcon, SwapHoriz as SwapIcon,
} from '@mui/icons-material';
import api from '../../../utils/api';

const STATUS_COLORS = {
  PENDING: 'warning', REVIEWED: 'info', RESOLVED: 'success', DISMISSED: 'default',
  AVAILABLE: 'success', REQUESTED: 'warning', BORROWED: 'primary',
  ACTIVE: 'primary', RETURNED: 'default', OVERDUE: 'error',
};

export default function AdminExchangePage() {
  const [tab, setTab] = useState(0);
  const [reports, setReports] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [reputations, setReputations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [resolveDialog, setResolveDialog] = useState(null);
  const [resolveStatus, setResolveStatus] = useState('RESOLVED');
  const [resolveNotes, setResolveNotes] = useState('');
  const [penalize, setPenalize] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 0) {
        const { data } = await api.get('/api/super-admin/exchange/reports?page=0&size=50');
        setReports(data.content || []);
      } else if (tab === 1) {
        const { data } = await api.get('/api/super-admin/exchange/borrows');
        setBorrows(data);
      } else if (tab === 2) {
        const { data } = await api.get('/api/super-admin/exchange/reputations');
        setReputations(data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [tab]);

  const handleResolve = async () => {
    try {
      await api.put(`/api/super-admin/exchange/reports/${resolveDialog.id}/resolve`, {
        status: resolveStatus, adminNotes: resolveNotes, penalizeReported: penalize,
      });
      setResolveDialog(null);
      load();
    } catch (e) { console.error(e); }
  };

  const handleBlock = async (userId) => {
    if (!window.confirm('Block this user from the exchange system?')) return;
    await api.put(`/api/super-admin/exchange/users/${userId}/block`);
    load();
  };

  const handleUnblock = async (userId) => {
    await api.put(`/api/super-admin/exchange/users/${userId}/unblock`);
    load();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <SwapIcon sx={{ color: '#4F46E5', fontSize: 28 }} />
        <Typography variant="h5" fontWeight={700}>Exchange Management</Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Reports" icon={<FlagIcon />} iconPosition="start" />
          <Tab label="Borrow Activity" icon={<SwapIcon />} iconPosition="start" />
          <Tab label="User Reputations" icon={<GavelIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {loading && <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>}

      {/* REPORTS */}
      {!loading && tab === 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell>Reporter</TableCell>
                <TableCell>Reported User</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map(r => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.reporterName}</TableCell>
                  <TableCell>{r.reportedUserName}</TableCell>
                  <TableCell>
                    <Chip label={r.reason?.replace(/_/g, ' ')} size="small" />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.description}
                  </TableCell>
                  <TableCell>
                    <Chip label={r.status} size="small" color={STATUS_COLORS[r.status] || 'default'} />
                  </TableCell>
                  <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {r.status === 'PENDING' && (
                      <Button size="small" variant="outlined" startIcon={<GavelIcon />}
                              onClick={() => { setResolveDialog(r); setResolveNotes(''); setPenalize(false); }}>
                        Review
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center">No reports found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* BORROW ACTIVITY */}
      {!loading && tab === 1 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell>Book</TableCell>
                <TableCell>Borrower</TableCell>
                <TableCell>Lender</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Penalty</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {borrows.map(b => (
                <TableRow key={b.id} hover sx={{ bgcolor: b.isOverdue ? '#FEF2F2' : undefined }}>
                  <TableCell>{b.bookTitle}</TableCell>
                  <TableCell>{b.borrowerName}</TableCell>
                  <TableCell>{b.lenderName}</TableCell>
                  <TableCell>{b.dueDate}</TableCell>
                  <TableCell>
                    <Chip label={b.status} size="small" color={STATUS_COLORS[b.status] || 'default'} />
                  </TableCell>
                  <TableCell>
                    {b.penaltyApplied ? <Chip label="Applied" size="small" color="error" /> : '—'}
                  </TableCell>
                </TableRow>
              ))}
              {borrows.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center">No borrow records.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* REPUTATIONS */}
      {!loading && tab === 2 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Reputation Score</TableCell>
                <TableCell>Total Exchanges</TableCell>
                <TableCell>Total Borrows</TableCell>
                <TableCell>Penalty Points</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reputations.map(r => (
                <TableRow key={r.userId} hover>
                  <TableCell>{r.userName}</TableCell>
                  <TableCell>
                    <Chip label={r.reputationScore?.toFixed(1)}
                          color={r.reputationScore >= 4 ? 'success' : r.reputationScore >= 2.5 ? 'warning' : 'error'}
                          size="small" />
                  </TableCell>
                  <TableCell>{r.totalExchanges}</TableCell>
                  <TableCell>{r.totalBorrows}</TableCell>
                  <TableCell>{r.penaltyPoints}</TableCell>
                  <TableCell>
                    {r.blockedFromExchange
                      ? <Chip label="BLOCKED" size="small" color="error" />
                      : <Chip label="Active" size="small" color="success" />}
                  </TableCell>
                  <TableCell>
                    {r.blockedFromExchange ? (
                      <Button size="small" startIcon={<UnblockIcon />} color="success"
                              onClick={() => handleUnblock(r.userId)}>
                        Unblock
                      </Button>
                    ) : (
                      <Button size="small" startIcon={<BlockIcon />} color="error"
                              onClick={() => handleBlock(r.userId)}>
                        Block
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {reputations.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center">No reputation data yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Resolve Dialog */}
      <Dialog open={!!resolveDialog} onClose={() => setResolveDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Review Report</DialogTitle>
        <DialogContent sx={{ pt: '12px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Reporter:</strong> {resolveDialog?.reporterName}<br />
            <strong>Reported:</strong> {resolveDialog?.reportedUserName}<br />
            <strong>Reason:</strong> {resolveDialog?.reason?.replace(/_/g, ' ')}<br />
            <strong>Description:</strong> {resolveDialog?.description}
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Resolution</InputLabel>
            <Select value={resolveStatus} label="Resolution" onChange={e => setResolveStatus(e.target.value)}>
              <MenuItem value="RESOLVED">Resolved — Valid complaint</MenuItem>
              <MenuItem value="DISMISSED">Dismissed — No action</MenuItem>
              <MenuItem value="REVIEWED">Mark as Reviewed</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Admin Notes" multiline rows={3} fullWidth
                     value={resolveNotes} onChange={e => setResolveNotes(e.target.value)} />
          <FormControlLabel
            control={<Checkbox checked={penalize} onChange={e => setPenalize(e.target.checked)} />}
            label="Apply penalty to reported user (+3 penalty points, reduced reputation)"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setResolveDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleResolve}
                  sx={{ bgcolor: '#4F46E5', '&:hover': { bgcolor: '#4338CA' } }}>
            Submit Decision
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
