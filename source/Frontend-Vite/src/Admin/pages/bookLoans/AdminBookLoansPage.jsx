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
  Checkbox,
  FormControlLabel,
  Divider,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Warning as DamageIcon,
  RemoveCircle as LossIcon,
  Close as CloseIcon,
  AssignmentReturn as ReturnIcon,
  Schedule as ExtendIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import DataTable from "../../components/DataTable";
import {
  checkinBook,
  getAllBookLoans,
  renewCheckout,
  updateBookLoan,
  getCheckoutStatistics,
} from "../../../store/features/bookLoans/bookLoanThunk";
import { createFine } from "../../../store/features/fines/fineThunk";

// ── Reusable confirm dialog ───────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, onConfirm, onCancel, severity = "warning" }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {title}
        <IconButton size="small" onClick={onCancel}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Alert severity={severity} sx={{ mt: 1 }}>{message}</Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} variant="outlined">Cancel</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={severity === "error" ? "error" : severity === "success" ? "success" : "warning"}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AdminBookLoansPage() {
  const dispatch = useDispatch();
  const { allLoans, loading, totalElements, statistics } =
    useSelector((state) => state.bookLoans);

  // ── Filter state ────────────────────────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [bookId, setBookId] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("DESC");

  // ── Extend dialog ───────────────────────────────────────────────────────────
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [extensionDays, setExtensionDays] = useState(7);

  // ── Return confirm dialog ───────────────────────────────────────────────────
  const [returnConfirmOpen, setReturnConfirmOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState(null);

  // ── Edit dialog ─────────────────────────────────────────────────────────────
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    status: "",
    dueDate: null,
    returnDate: null,
    maxRenewals: "",
    fineAmount: "",
    finePaid: false,
    notes: "",
  });

  // ── Create fine dialog ──────────────────────────────────────────────────────
  const [createFineDialogOpen, setCreateFineDialogOpen] = useState(false);
  const [fineType, setFineType] = useState("");
  const [createFineFormData, setCreateFineFormData] = useState({
    amount: "",
    reason: "",
    notes: "",
  });

  // ── Action feedback dialog ──────────────────────────────────────────────────
  const [feedbackDialog, setFeedbackDialog] = useState({ open: false, message: "", severity: "success" });
  const showFeedback = (message, severity = "success") => setFeedbackDialog({ open: true, message, severity });

  // ── Load on mount & filter change ──────────────────────────────────────────
  useEffect(() => { dispatch(getCheckoutStatistics()); }, []);
  useEffect(() => { loadLoans(); }, [page, rowsPerPage, filterStatus, overdueOnly, sortBy, sortDirection]);

  const loadLoans = () => {
    const req = { page, size: rowsPerPage, sortBy, sortDirection };
    if (userId) req.userId = parseInt(userId);
    if (bookId) req.bookId = parseInt(bookId);
    if (filterStatus) req.status = filterStatus;
    if (overdueOnly) req.overdueOnly = true;
    if (startDate) req.startDate = dayjs(startDate).format("YYYY-MM-DD");
    if (endDate) req.endDate = dayjs(endDate).format("YYYY-MM-DD");
    dispatch(getAllBookLoans(req));
  };

  const refreshAll = () => { loadLoans(); dispatch(getCheckoutStatistics()); };

  // ── Return ──────────────────────────────────────────────────────────────────
  const handleOpenReturn = (loan) => { setReturnTarget(loan); setReturnConfirmOpen(true); };
  const handleConfirmReturn = async () => {
    setReturnConfirmOpen(false);
    try {
      await dispatch(checkinBook({ bookLoanId: returnTarget.id })).unwrap();
      showFeedback(`Loan #${returnTarget.id} marked as returned.`, "success");
      refreshAll();
    } catch (err) {
      showFeedback(err || "Failed to return book.", "error");
    }
    setReturnTarget(null);
  };

  // ── Extend ──────────────────────────────────────────────────────────────────
  const handleOpenExtend = (loan) => { setSelectedLoan(loan); setExtensionDays(7); setExtendDialogOpen(true); };
  const handleExtend = async () => {
    try {
      await dispatch(renewCheckout({ bookLoanId: selectedLoan.id, extensionDays })).unwrap();
      setExtendDialogOpen(false);
      showFeedback(`Loan #${selectedLoan.id} extended by ${extensionDays} days.`, "success");
      refreshAll();
    } catch (err) {
      showFeedback(err || "Failed to extend loan.", "error");
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────────
  const handleOpenEdit = (loan) => {
    setSelectedLoan(loan);
    setEditFormData({
      status: loan.status || "",
      dueDate: loan.dueDate ? dayjs(loan.dueDate) : null,
      returnDate: loan.returnDate ? dayjs(loan.returnDate) : null,
      maxRenewals: loan.maxRenewals != null ? String(loan.maxRenewals) : "",
      fineAmount: loan.fineAmount != null ? String(loan.fineAmount) : "",
      finePaid: loan.finePaid === true,
      notes: "",
    });
    setEditDialogOpen(true);
  };

  const handleUpdateLoan = async () => {
    try {
      const req = {};
      if (editFormData.status) req.status = editFormData.status;
      if (editFormData.dueDate) req.dueDate = dayjs(editFormData.dueDate).format("YYYY-MM-DD");
      if (editFormData.returnDate) req.returnDate = dayjs(editFormData.returnDate).format("YYYY-MM-DD");
      if (editFormData.maxRenewals) req.maxRenewals = parseInt(editFormData.maxRenewals);
      if (editFormData.fineAmount) req.fineAmount = parseFloat(editFormData.fineAmount);
      req.finePaid = editFormData.finePaid;
      if (editFormData.notes) req.notes = editFormData.notes;
      await dispatch(updateBookLoan({ bookLoanId: selectedLoan.id, updateRequest: req })).unwrap();
      setEditDialogOpen(false);
      showFeedback(`Loan #${selectedLoan.id} updated successfully.`, "success");
      refreshAll();
    } catch (err) {
      showFeedback(err || "Failed to update loan.", "error");
    }
  };

  // ── Create fine ─────────────────────────────────────────────────────────────
  const handleOpenCreateFine = (loan, type) => {
    setSelectedLoan(loan);
    setFineType(type);
    setCreateFineFormData({
      amount: "",
      reason: type === "DAMAGE" ? "Book damaged during loan period" : "Book lost by borrower",
      notes: "",
    });
    setCreateFineDialogOpen(true);
  };

  const handleCreateFine = async () => {
    if (!createFineFormData.amount) { showFeedback("Please enter a fine amount.", "error"); return; }
    try {
      await dispatch(createFine({
        bookLoanId: selectedLoan.id,
        type: fineType,
        amount: Math.round(parseFloat(createFineFormData.amount)),
        reason: createFineFormData.reason,
        notes: createFineFormData.notes,
      })).unwrap();
      await dispatch(updateBookLoan({
        bookLoanId: selectedLoan.id,
        updateRequest: { status: fineType === "DAMAGE" ? "DAMAGED" : "LOST" },
      })).unwrap();
      setCreateFineDialogOpen(false);
      showFeedback(`${fineType === "DAMAGE" ? "Damage" : "Loss"} fine created for Loan #${selectedLoan.id}.`, "success");
      refreshAll();
    } catch (err) {
      showFeedback(err || "Failed to create fine.", "error");
    }
  };

  // ── Status chip ─────────────────────────────────────────────────────────────
  const getStatusChip = (status) => {
    const map = {
      CHECKED_OUT: { color: "success", label: "Checked Out" },
      OVERDUE:     { color: "error",   label: "Overdue" },
      RETURNED:    { color: "default", label: "Returned" },
      LOST:        { color: "secondary", label: "Lost" },
      DAMAGED:     { color: "warning", label: "Damaged" },
    };
    const cfg = map[status] || { color: "default", label: status };
    return <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 600 }} />;
  };

  // ── Table columns ───────────────────────────────────────────────────────────
  const columns = [
    { field: "id", headerName: "ID", minWidth: 60 },
    {
      field: "bookTitle", headerName: "Book", minWidth: 180,
      renderCell: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>{row.bookTitle}</Typography>
          {row.bookAuthor && <Typography variant="caption" color="text.secondary">by {row.bookAuthor}</Typography>}
        </Box>
      ),
    },
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
      field: "checkoutDate", headerName: "Checkout",
      renderCell: (row) => (
        <Typography variant="body2">
          {row.checkoutDate ? new Date(row.checkoutDate).toLocaleDateString() : "—"}
        </Typography>
      ),
    },
    {
      field: "dueDate", headerName: "Due Date",
      renderCell: (row) => (
        <Box>
          <Typography variant="body2" color={row.status === "OVERDUE" ? "error.main" : "text.primary"}>
            {row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "—"}
          </Typography>
          {row.status === "OVERDUE" && row.overdueDays > 0 && (
            <Typography variant="caption" color="error">{row.overdueDays}d overdue</Typography>
          )}
        </Box>
      ),
    },
    {
      field: "returnDate", headerName: "Returned",
      renderCell: (row) => (
        <Typography variant="body2">
          {row.returnDate ? new Date(row.returnDate).toLocaleDateString() : "—"}
        </Typography>
      ),
    },
    { field: "status", headerName: "Status", renderCell: (row) => getStatusChip(row.status) },
    {
      field: "fineAmount", headerName: "Fine",
      renderCell: (row) => row.fineAmount > 0 ? (
        <Box>
          <Typography variant="body2" fontWeight={600} color={row.finePaid ? "success.main" : "error.main"}>
            ${parseFloat(row.fineAmount).toFixed(2)}
          </Typography>
          <Typography variant="caption" color={row.finePaid ? "success.main" : "error.main"}>
            {row.finePaid ? "Paid" : "Unpaid"}
          </Typography>
        </Box>
      ) : <Typography variant="body2" color="text.disabled">—</Typography>,
    },
  ];

  // ── Row actions ─────────────────────────────────────────────────────────────
  const customActions = (row) => (
    <Stack direction="column" spacing={0.5} sx={{ minWidth: 110 }}>
      {(row.status === "CHECKED_OUT" || row.status === "OVERDUE") && (
        <>
          <Button fullWidth size="small" variant="contained" color="success"
            startIcon={<ReturnIcon />} onClick={() => handleOpenReturn(row)}
            sx={{ textTransform: "none", fontSize: "0.75rem" }}>
            Return
          </Button>
          <Button fullWidth size="small" variant="outlined" color="warning"
            startIcon={<DamageIcon />} onClick={() => handleOpenCreateFine(row, "DAMAGE")}
            sx={{ textTransform: "none", fontSize: "0.75rem" }}>
            Damage
          </Button>
          <Button fullWidth size="small" variant="outlined" color="error"
            startIcon={<LossIcon />} onClick={() => handleOpenCreateFine(row, "LOSS")}
            sx={{ textTransform: "none", fontSize: "0.75rem" }}>
            Loss
          </Button>
        </>
      )}
      {row.status === "CHECKED_OUT" && (
        <Button fullWidth size="small" variant="outlined" color="info"
          startIcon={<ExtendIcon />} onClick={() => handleOpenExtend(row)}
          sx={{ textTransform: "none", fontSize: "0.75rem" }}>
          Extend
        </Button>
      )}
      <Button fullWidth size="small" variant="outlined"
        startIcon={<EditIcon />} onClick={() => handleOpenEdit(row)}
        sx={{ textTransform: "none", fontSize: "0.75rem" }}>
        Edit
      </Button>
    </Stack>
  );

  const statCards = [
    { label: "Active Loans",    value: statistics?.activeCheckouts ?? 0, color: "success" },
    { label: "Overdue",         value: statistics?.overdueCheckouts ?? 0, color: "error" },
    { label: "Returned",        value: statistics?.totalReturns ?? 0,    color: "info" },
    { label: "Unpaid Fines",    value: `$${parseFloat(statistics?.totalUnpaidFines ?? 0).toFixed(2)}`, color: "warning" },
  ];

  const colorMap = {
    success: { bg: "success.lighter", text: "success.main" },
    error:   { bg: "error.lighter",   text: "error.main" },
    info:    { bg: "info.lighter",    text: "info.main" },
    warning: { bg: "warning.lighter", text: "warning.main" },
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.3rem', sm: '2.125rem' } }}>Book Loans Management</Typography>
        <Typography variant="body2" color="text.secondary">Monitor and manage all book loans</Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3 }}>
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
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3, alignItems: "center", justifyContent: "flex-end" }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sort By">
            <MenuItem value="createdAt">Created Date</MenuItem>
            <MenuItem value="dueDate">Due Date</MenuItem>
            <MenuItem value="returnDate">Return Date</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Direction</InputLabel>
          <Select value={sortDirection} onChange={(e) => setSortDirection(e.target.value)} label="Direction">
            <MenuItem value="ASC">Ascending</MenuItem>
            <MenuItem value="DESC">Descending</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" startIcon={<FilterIcon />} onClick={() => setFilterModalOpen(true)}>
          Filters
        </Button>
      </Box>

      {/* Table */}
      <DataTable
        columns={columns}
        data={allLoans || []}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalElements || 0}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        customActions={customActions}
      />

      {/* ── Filter Modal ─────────────────────────────────────────────────────── */}
      <Dialog open={filterModalOpen} onClose={() => setFilterModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Filter Book Loans
          <IconButton size="small" onClick={() => setFilterModalOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="CHECKED_OUT">Checked Out</MenuItem>
                  <MenuItem value="OVERDUE">Overdue</MenuItem>
                  <MenuItem value="RETURNED">Returned</MenuItem>
                  <MenuItem value="LOST">Lost</MenuItem>
                  <MenuItem value="DAMAGED">Damaged</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="User ID" value={userId}
                onChange={(e) => setUserId(e.target.value)} type="number" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="Book ID" value={bookId}
                onChange={(e) => setBookId(e.target.value)} type="number" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel control={<Checkbox checked={overdueOnly} onChange={(e) => setOverdueOnly(e.target.checked)} />}
                label="Overdue Only" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker label="Start Date" value={startDate} onChange={setStartDate}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }} />
              </LocalizationProvider>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker label="End Date" value={endDate} onChange={setEndDate}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }} />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setFilterStatus(""); setUserId(""); setBookId(""); setOverdueOnly(false); setStartDate(null); setEndDate(null); }}>
            Clear All
          </Button>
          <Button onClick={() => setFilterModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { setPage(0); loadLoans(); setFilterModalOpen(false); }}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Return Confirm Modal ─────────────────────────────────────────────── */}
      <ConfirmDialog
        open={returnConfirmOpen}
        title="Confirm Return"
        message={`Mark loan #${returnTarget?.id} (${returnTarget?.bookTitle}) as returned?`}
        onConfirm={handleConfirmReturn}
        onCancel={() => { setReturnConfirmOpen(false); setReturnTarget(null); }}
        severity="info"
      />

      {/* ── Extend Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={extendDialogOpen} onClose={() => setExtendDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Extend Loan
          <IconButton size="small" onClick={() => setExtendDialogOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
            Extending loan for <strong>{selectedLoan?.bookTitle}</strong>
          </Alert>
          <FormControl fullWidth size="small">
            <InputLabel>Extension Period</InputLabel>
            <Select value={extensionDays} onChange={(e) => setExtensionDays(e.target.value)} label="Extension Period">
              <MenuItem value={3}>3 Days</MenuItem>
              <MenuItem value={7}>7 Days</MenuItem>
              <MenuItem value={14}>14 Days</MenuItem>
              <MenuItem value={30}>30 Days</MenuItem>
            </Select>
          </FormControl>
          {selectedLoan && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Current due: <strong>{new Date(selectedLoan.dueDate).toLocaleDateString()}</strong>
              </Typography>
              <Typography variant="body2" color="primary.main">
                New due: <strong>{new Date(new Date(selectedLoan.dueDate).getTime() + extensionDays * 86400000).toLocaleDateString()}</strong>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setExtendDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleExtend} variant="contained" startIcon={<ExtendIcon />}>Extend Loan</Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit Loan Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Edit Loan #{selectedLoan?.id}
          <IconButton size="small" onClick={() => setEditDialogOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2, mt: 1 }}>
            Editing <strong>{selectedLoan?.bookTitle}</strong> — borrowed by <strong>{selectedLoan?.userName}</strong>
          </Alert>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={editFormData.status} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })} label="Status">
                  <MenuItem value="CHECKED_OUT">Checked Out</MenuItem>
                  <MenuItem value="OVERDUE">Overdue</MenuItem>
                  <MenuItem value="RETURNED">Returned</MenuItem>
                  <MenuItem value="LOST">Lost</MenuItem>
                  <MenuItem value="DAMAGED">Damaged</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="Max Renewals" type="number"
                value={editFormData.maxRenewals}
                onChange={(e) => setEditFormData({ ...editFormData, maxRenewals: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker label="Due Date" value={editFormData.dueDate}
                  onChange={(v) => setEditFormData({ ...editFormData, dueDate: v })}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }} />
              </LocalizationProvider>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker label="Return Date" value={editFormData.returnDate}
                  onChange={(v) => setEditFormData({ ...editFormData, returnDate: v })}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }} />
              </LocalizationProvider>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="Fine Amount" type="number"
                value={editFormData.fineAmount}
                onChange={(e) => setEditFormData({ ...editFormData, fineAmount: e.target.value })}
                InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: "text.secondary" }}>$</Typography> }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center" }}>
              <FormControlLabel
                control={<Checkbox checked={editFormData.finePaid}
                  onChange={(e) => setEditFormData({ ...editFormData, finePaid: e.target.checked })} />}
                label="Fine Paid" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth size="small" multiline rows={2} label="Admin Notes"
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                placeholder="Notes about this update..." />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateLoan} variant="contained" startIcon={<EditIcon />}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* ── Create Fine Dialog ───────────────────────────────────────────────── */}
      <Dialog open={createFineDialogOpen} onClose={() => setCreateFineDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Create {fineType === "DAMAGE" ? "Damage" : "Loss"} Fine
          <IconButton size="small" onClick={() => setCreateFineDialogOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
            Creating <strong>{fineType === "DAMAGE" ? "damage" : "loss"}</strong> fine for{" "}
            <strong>{selectedLoan?.bookTitle}</strong> borrowed by <strong>{selectedLoan?.userName}</strong>.
            <br />
            <Typography variant="caption">Loan status will change to {fineType === "DAMAGE" ? "DAMAGED" : "LOST"}.</Typography>
          </Alert>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth required size="small" label="Fine Amount" type="number"
                value={createFineFormData.amount}
                onChange={(e) => setCreateFineFormData({ ...createFineFormData, amount: e.target.value })}
                InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: "text.secondary" }}>$</Typography> }}
                helperText={fineType === "DAMAGE" ? "Repair / replacement cost" : "Book replacement cost"} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="Reason" multiline rows={2}
                value={createFineFormData.reason}
                onChange={(e) => setCreateFineFormData({ ...createFineFormData, reason: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="Admin Notes (optional)" multiline rows={2}
                value={createFineFormData.notes}
                onChange={(e) => setCreateFineFormData({ ...createFineFormData, notes: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCreateFineDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateFine} variant="contained"
            color={fineType === "DAMAGE" ? "warning" : "error"}
            startIcon={fineType === "DAMAGE" ? <DamageIcon /> : <LossIcon />}>
            Create Fine
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Feedback Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={feedbackDialog.open} onClose={() => setFeedbackDialog({ ...feedbackDialog, open: false })} maxWidth="xs" fullWidth>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity={feedbackDialog.severity}>{feedbackDialog.message}</Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="contained" onClick={() => setFeedbackDialog({ ...feedbackDialog, open: false })}>OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
