import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Grid,
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
} from "@mui/material";
import {
  FilterList as FilterIcon,
  Payment as PaymentIcon,
  Block as WaiveIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "../../components/DataTable";
import {
  getAllFines,
  getTotalCollected,
  getTotalOutstanding,
  payFineDirect,
  waiveFine,
  deleteFine,
} from "../../../store/features/fines/fineThunk";

// ── Shared confirm dialog ─────────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, confirmLabel, confirmColor = "primary", onConfirm, onCancel, children }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {title}
        <IconButton size="small" onClick={onCancel}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        {message && <Alert severity="warning" sx={{ mb: children ? 2 : 0 }}>{message}</Alert>}
        {children}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCancel} variant="outlined">Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor}>{confirmLabel}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AdminFinesPage() {
  const dispatch = useDispatch();
  const { allFines, loading, totalElements, totalCollected, totalOutstanding } =
    useSelector((state) => state.fines);

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // ── Pay confirm ──────────────────────────────────────────────────────────────
  const [payTarget, setPayTarget] = useState(null);

  // ── Waive dialog ─────────────────────────────────────────────────────────────
  const [waiveDialogOpen, setWaiveDialogOpen] = useState(false);
  const [waiveTarget, setWaiveTarget] = useState(null);
  const [waiveReason, setWaiveReason] = useState("");
  const [waiveError, setWaiveError] = useState("");

  // ── Delete confirm ────────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Feedback dialog ───────────────────────────────────────────────────────────
  const [feedback, setFeedback] = useState({ open: false, message: "", severity: "success" });
  const showFeedback = (message, severity = "success") => setFeedback({ open: true, message, severity });

  useEffect(() => { loadFines(); loadStats(); }, [page, rowsPerPage, filterStatus, filterType, filterUserId]);

  const loadFines = () => {
    const params = { page, size: rowsPerPage };
    if (filterStatus) params.status = filterStatus;
    if (filterType) params.type = filterType;
    if (filterUserId) params.userId = parseInt(filterUserId);
    dispatch(getAllFines(params));
  };

  const loadStats = () => {
    dispatch(getTotalCollected());
    dispatch(getTotalOutstanding());
  };

  const refreshAll = () => { loadFines(); loadStats(); };

  // ── Pay ───────────────────────────────────────────────────────────────────────
  const handleConfirmPay = async () => {
    try {
      await dispatch(payFineDirect(payTarget.id)).unwrap();
      setPayTarget(null);
      showFeedback(`Fine #${payTarget.id} marked as paid.`, "success");
      refreshAll();
    } catch (err) {
      setPayTarget(null);
      showFeedback(err || "Failed to pay fine.", "error");
    }
  };

  // ── Waive ─────────────────────────────────────────────────────────────────────
  const handleOpenWaive = (fine) => { setWaiveTarget(fine); setWaiveReason(""); setWaiveError(""); setWaiveDialogOpen(true); };
  const handleConfirmWaive = async () => {
    if (!waiveReason.trim()) { setWaiveError("Please provide a reason for waiving."); return; }
    try {
      await dispatch(waiveFine({ fineId: waiveTarget.id, reason: waiveReason })).unwrap();
      setWaiveDialogOpen(false);
      showFeedback(`Fine #${waiveTarget.id} waived successfully.`, "success");
      refreshAll();
    } catch (err) {
      showFeedback(err || "Failed to waive fine.", "error");
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteFine(deleteTarget.id)).unwrap();
      setDeleteTarget(null);
      showFeedback(`Fine #${deleteTarget.id} deleted.`, "success");
      refreshAll();
    } catch (err) {
      setDeleteTarget(null);
      showFeedback(err || "Failed to delete fine.", "error");
    }
  };

  // ── Chips ─────────────────────────────────────────────────────────────────────
  const getStatusChip = (status) => {
    const map = {
      PENDING:       { color: "warning", label: "Pending" },
      PARTIALLY_PAID:{ color: "info",    label: "Partial" },
      PAID:          { color: "success", label: "Paid" },
      WAIVED:        { color: "default", label: "Waived" },
    };
    const cfg = map[status] || { color: "default", label: status };
    return <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 600 }} />;
  };

  const getTypeChip = (type) => {
    const map = {
      OVERDUE:    { color: "error",   label: "Overdue" },
      DAMAGE:     { color: "warning", label: "Damage" },
      LOSS:       { color: "error",   label: "Loss" },
      PROCESSING: { color: "info",    label: "Processing" },
    };
    const cfg = map[type] || { color: "default", label: type };
    return <Chip label={cfg.label} color={cfg.color} size="small" variant="outlined" />;
  };

  // ── Table columns ─────────────────────────────────────────────────────────────
  const columns = [
    { field: "id", headerName: "ID", minWidth: 60 },
    {
      field: "userName", headerName: "User", minWidth: 150,
      renderCell: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{row.userName}</Typography>
          {row.userEmail && <Typography variant="caption" color="text.secondary">{row.userEmail}</Typography>}
        </Box>
      ),
    },
    {
      field: "bookTitle", headerName: "Book", minWidth: 180,
      renderCell: (row) => (
        <Box>
          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{row.bookTitle || "—"}</Typography>
          {row.bookIsbn && <Typography variant="caption" color="text.secondary">ISBN: {row.bookIsbn}</Typography>}
        </Box>
      ),
    },
    { field: "type",   headerName: "Type",   renderCell: (row) => getTypeChip(row.type) },
    {
      field: "amount", headerName: "Amount",
      renderCell: (row) => (
        <Typography variant="body2" fontWeight={700}>${parseFloat(row.amount || 0).toFixed(2)}</Typography>
      ),
    },
    {
      field: "amountPaid", headerName: "Paid",
      renderCell: (row) => (
        <Typography variant="body2" color="success.main">${parseFloat(row.amountPaid || 0).toFixed(2)}</Typography>
      ),
    },
    { field: "status", headerName: "Status", renderCell: (row) => getStatusChip(row.status) },
    {
      field: "reason", headerName: "Reason", minWidth: 180,
      renderCell: (row) => (
        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>{row.reason || "—"}</Typography>
      ),
    },
    {
      field: "createdAt", headerName: "Created",
      renderCell: (row) => (
        <Typography variant="body2">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}</Typography>
      ),
    },
  ];

  // ── Row actions ───────────────────────────────────────────────────────────────
  const customActions = (row) => (
    <Stack direction="column" spacing={0.5} sx={{ minWidth: 100 }}>
      {(row.status === "PENDING" || row.status === "PARTIALLY_PAID") && (
        <>
          <Button fullWidth size="small" variant="contained" color="success"
            startIcon={<PaymentIcon />} onClick={() => setPayTarget(row)}
            sx={{ textTransform: "none", fontSize: "0.75rem" }}>
            Pay
          </Button>
          <Button fullWidth size="small" variant="outlined" color="warning"
            startIcon={<WaiveIcon />} onClick={() => handleOpenWaive(row)}
            sx={{ textTransform: "none", fontSize: "0.75rem" }}>
            Waive
          </Button>
        </>
      )}
      <Button fullWidth size="small" variant="outlined" color="error"
        startIcon={<DeleteIcon />} onClick={() => setDeleteTarget(row)}
        sx={{ textTransform: "none", fontSize: "0.75rem" }}>
        Delete
      </Button>
    </Stack>
  );

  const statCards = [
    { label: "Pending Fines",    value: allFines?.filter((f) => f.status === "PENDING").length ?? 0, color: "warning" },
    { label: "Paid Fines",       value: allFines?.filter((f) => f.status === "PAID").length ?? 0,    color: "success" },
    { label: "Total Collected",  value: `$${parseFloat(totalCollected ?? 0).toFixed(2)}`,            color: "info" },
    { label: "Total Outstanding",value: `$${parseFloat(totalOutstanding ?? 0).toFixed(2)}`,          color: "error" },
  ];

  const colorMap = {
    warning: { bg: "warning.lighter", text: "warning.main" },
    success: { bg: "success.lighter", text: "success.main" },
    info:    { bg: "info.lighter",    text: "info.main" },
    error:   { bg: "error.lighter",   text: "error.main" },
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.3rem', sm: '2.125rem' } }}>Fines Management</Typography>
        <Typography variant="body2" color="text.secondary">Monitor and manage all library fines</Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((s) => (
          <Grid key={s.label} size={{ xs: 6, sm: 6, md: 3 }}>
            <Paper sx={{ p: { xs: 1.5, sm: 2 }, textAlign: "center", bgcolor: colorMap[s.color].bg, borderRadius: 2,
              transition: "box-shadow 0.2s", "&:hover": { boxShadow: 4 } }}>
              <Typography fontWeight={700} color={colorMap[s.color].text} sx={{ fontSize: { xs: '1.3rem', sm: '2.125rem' } }}>{s.value}</Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{s.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Toolbar */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button variant="outlined" startIcon={<FilterIcon />} onClick={() => setFilterModalOpen(true)}>
          Filters
        </Button>
      </Box>

      {/* Table */}
      <DataTable
        columns={columns}
        data={allFines || []}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalElements || 0}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        customActions={customActions}
      />

      {/* ── Filter Modal ───────────────────────────────────────────────────────── */}
      <Dialog open={filterModalOpen} onClose={() => setFilterModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Filter Fines
          <IconButton size="small" onClick={() => setFilterModalOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="PARTIALLY_PAID">Partially Paid</MenuItem>
                  <MenuItem value="PAID">Paid</MenuItem>
                  <MenuItem value="WAIVED">Waived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Type">
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="OVERDUE">Overdue</MenuItem>
                  <MenuItem value="DAMAGE">Damage</MenuItem>
                  <MenuItem value="LOSS">Loss</MenuItem>
                  <MenuItem value="PROCESSING">Processing</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="User ID" value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)} type="number" placeholder="Filter by user ID" />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setFilterStatus(""); setFilterType(""); setFilterUserId(""); setPage(0); }}>
            Clear All
          </Button>
          <Button onClick={() => setFilterModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { setPage(0); loadFines(); setFilterModalOpen(false); }}>Apply</Button>
        </DialogActions>
      </Dialog>

      {/* ── Pay Confirm ────────────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!payTarget}
        title="Pay Fine"
        message={`Mark fine #${payTarget?.id} as paid? Amount: $${parseFloat(payTarget?.amountOutstanding ?? payTarget?.amount ?? 0).toFixed(2)}`}
        confirmLabel="Pay Fine"
        confirmColor="success"
        onConfirm={handleConfirmPay}
        onCancel={() => setPayTarget(null)}
      />

      {/* ── Waive Dialog ───────────────────────────────────────────────────────── */}
      <Dialog open={waiveDialogOpen} onClose={() => setWaiveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Waive Fine
          <IconButton size="small" onClick={() => setWaiveDialogOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Waiving fine <strong>#{waiveTarget?.id}</strong> for <strong>{waiveTarget?.userName}</strong>
            {" "}— Amount: <strong>${parseFloat(waiveTarget?.amount ?? 0).toFixed(2)}</strong>
          </Alert>
          {waiveError && <Alert severity="error" sx={{ mb: 2 }}>{waiveError}</Alert>}
          <TextField
            fullWidth required multiline rows={3}
            label="Reason for Waiver"
            value={waiveReason}
            onChange={(e) => { setWaiveReason(e.target.value); setWaiveError(""); }}
            placeholder="Provide a reason for waiving this fine..."
          />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setWaiveDialogOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleConfirmWaive} variant="contained" color="warning" startIcon={<WaiveIcon />}>
            Waive Fine
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm ─────────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Fine"
        message={`Permanently delete fine #${deleteTarget?.id}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Feedback ───────────────────────────────────────────────────────────── */}
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
