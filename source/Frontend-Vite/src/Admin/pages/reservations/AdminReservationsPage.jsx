import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper,
  Divider,
  IconButton,
  Stack,
  Chip,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "../../components/DataTable";
import {
  searchReservations,
  fulfillReservation,
  cancelReservation,
} from "../../../store/features/reservations/reservationThunk";
import { columns } from "./ReservationColumn";
import StateSummary from "./StateSummary";
import FilterSection from "./FilterSection";

export default function AdminReservationsPage() {
  const dispatch = useDispatch();
  const { allReservations, loading, totalElements, error } =
    useSelector((state) => state.reservations);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [filterBookId, setFilterBookId] = useState("");
  const [filterActiveOnly, setFilterActiveOnly] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialogs
  const [approveTarget, setApproveTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  // Feedback
  const [feedback, setFeedback] = useState({ open: false, message: "", severity: "success" });
  const showFeedback = (message, severity = "success") => setFeedback({ open: true, message, severity });

  const loadReservations = useCallback(() => {
    dispatch(searchReservations({
      page,
      size: rowsPerPage,
      status: filterStatus || undefined,
      userId: filterUserId || undefined,
      bookId: filterBookId || undefined,
      activeOnly: filterActiveOnly === "" ? undefined : filterActiveOnly === "true",
      sortBy: "reservedAt",
      sortDirection: "DESC",
    }));
  }, [dispatch, page, rowsPerPage, filterStatus, filterUserId, filterBookId, filterActiveOnly]);

  useEffect(() => { loadReservations(); }, [loadReservations]);

  const handleConfirmApprove = async () => {
    try {
      await dispatch(fulfillReservation(approveTarget.id)).unwrap();
      setApproveTarget(null);
      showFeedback(`Reservation #${approveTarget.id} approved and book assigned.`, "success");
      loadReservations();
    } catch (err) {
      setApproveTarget(null);
      showFeedback(err || "Failed to approve reservation.", "error");
    }
  };

  const handleConfirmCancel = async () => {
    try {
      await dispatch(cancelReservation(cancelTarget.id)).unwrap();
      setCancelTarget(null);
      showFeedback(`Reservation #${cancelTarget.id} cancelled.`, "success");
      loadReservations();
    } catch (err) {
      setCancelTarget(null);
      showFeedback(err || "Failed to cancel reservation.", "error");
    }
  };

  const customActions = (row) => (
    <Stack direction="column" spacing={0.5} sx={{ minWidth: 100 }}>
      {row.status === "AVAILABLE" && (
        <>
          <Button fullWidth size="small" variant="contained" color="success"
            startIcon={<CheckCircleIcon />}
            disabled={!row.isBookAvailable}
            onClick={() => setApproveTarget(row)}
            sx={{ textTransform: "none", fontSize: "0.75rem" }}>
            Approve
          </Button>
          <Button fullWidth size="small" variant="outlined" color="error"
            startIcon={<CancelIcon />}
            onClick={() => setCancelTarget(row)}
            sx={{ textTransform: "none", fontSize: "0.75rem" }}>
            Cancel
          </Button>
        </>
      )}
    </Stack>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.3rem', sm: '2.125rem' } }}>Reservations Management</Typography>
        <Typography variant="body2" color="text.secondary">Manage book reservations and fulfill requests</Typography>
      </Box>

      {/* Stats */}
      <StateSummary allReservations={allReservations} totalElements={totalElements} />

      {/* Filters */}
      <FilterSection
        filterStatus={filterStatus} setFilterStatus={setFilterStatus}
        filterUserId={filterUserId} setFilterUserId={setFilterUserId}
        filterBookId={filterBookId} setFilterBookId={setFilterBookId}
        filterActiveOnly={filterActiveOnly} setFilterActiveOnly={setFilterActiveOnly}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Table */}
      <DataTable
        columns={columns}
        data={allReservations || []}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalElements || 0}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        actions={false}
        customActions={customActions}
      />

      {/* ── Approve Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={!!approveTarget} onClose={() => setApproveTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Approve Reservation
          <IconButton size="small" onClick={() => setApproveTarget(null)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Approving will assign the book to the user and mark the reservation as fulfilled.
          </Alert>
          {approveTarget && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Book</Typography>
                  <Typography variant="body2" fontWeight={600}>{approveTarget.bookTitle}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">User</Typography>
                  <Typography variant="body2" fontWeight={600}>{approveTarget.userName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Reserved On</Typography>
                  <Typography variant="body2">{new Date(approveTarget.reservationDate).toLocaleDateString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip label={approveTarget.status} size="small" color="info" sx={{ fontWeight: 600 }} />
                </Box>
              </Box>
            </Paper>
          )}
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action will create a new loan for the user. It cannot be undone.
          </Alert>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setApproveTarget(null)} variant="outlined">Cancel</Button>
          <Button onClick={handleConfirmApprove} variant="contained" color="success" startIcon={<CheckCircleIcon />}>
            Approve & Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Cancel Confirm ─────────────────────────────────────────────────────── */}
      <Dialog open={!!cancelTarget} onClose={() => setCancelTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Cancel Reservation
          <IconButton size="small" onClick={() => setCancelTarget(null)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="error">
            Cancel reservation <strong>#{cancelTarget?.id}</strong> for{" "}
            <strong>"{cancelTarget?.bookTitle}"</strong>? This cannot be undone.
          </Alert>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCancelTarget(null)} variant="outlined">Go Back</Button>
          <Button onClick={handleConfirmCancel} variant="contained" color="error" startIcon={<CancelIcon />}>
            Cancel Reservation
          </Button>
        </DialogActions>
      </Dialog>

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
