import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import Layout from "../../components/layout/Layout";
import { getMyFines, payFineDirect } from "../../store/features/fines/fineThunk";
import MyFineState from "./MyFineState";
import MyFineCard from "./MyFineCard";
import FinePaymentDialog from "./FinePaymentDialog";

const MyFinesPage = () => {
  const dispatch = useDispatch();
  const { myFines, loading } = useSelector((state) => state.fines);

  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [filteredFines, setFilteredFines] = useState([]);
  const [paymentDialog, setPaymentDialog] = useState({ open: false, fine: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => { dispatch(getMyFines({})); }, []);
  useEffect(() => { applyFilters(); }, [myFines, statusFilter, typeFilter]);

  const applyFilters = () => {
    let filtered = [...(myFines || [])];
    if (statusFilter) filtered = filtered.filter((f) => f.status === statusFilter);
    if (typeFilter) filtered = filtered.filter((f) => f.type === typeFilter);
    setFilteredFines(filtered);
  };

  const handlePayFine = (fine) => setPaymentDialog({ open: true, fine });

  const confirmPayment = async () => {
    try {
      await dispatch(payFineDirect(paymentDialog.fine.id)).unwrap();
      showSnackbar(`Fine of $${parseFloat(paymentDialog.fine.amountOutstanding || 0).toFixed(2)} paid successfully!`, "success");
      setPaymentDialog({ open: false, fine: null });
      dispatch(getMyFines({}));
    } catch (err) {
      showSnackbar(err || "Failed to process payment", "error");
    }
  };

  const showSnackbar = (message, severity = "success") => setSnackbar({ open: true, message, severity });

  const totalOutstanding = filteredFines.reduce((sum, f) => sum + (f.amountOutstanding || 0), 0);
  const totalPaid = filteredFines.reduce((sum, f) => sum + (f.amountPaid || 0), 0);
  const hasFilters = statusFilter || typeFilter;

  if (loading && (!myFines || myFines.length === 0)) {
    return (
      <Layout>
        <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #fff5f5 0%, #ffffff 50%, #fff8f0 100%)", py: 4 }}>
          <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, sm: 3, lg: 4 } }}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ height: 40, bgcolor: "grey.200", borderRadius: 1, width: "33%", mb: 1, animation: "pulse 1.5s infinite" }} />
              <Box sx={{ height: 24, bgcolor: "grey.200", borderRadius: 1, width: "50%", animation: "pulse 1.5s infinite" }} />
            </Box>
            <Stack spacing={2}>
              {[1, 2, 3].map((i) => (
                <Box key={i} sx={{ bgcolor: "white", borderRadius: 3, p: 3, boxShadow: 1 }}>
                  <Box sx={{ height: 24, bgcolor: "grey.200", borderRadius: 1, width: "75%", mb: 1.5, animation: "pulse 1.5s infinite" }} />
                  <Box sx={{ height: 16, bgcolor: "grey.200", borderRadius: 1, width: "50%", animation: "pulse 1.5s infinite" }} />
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #fff5f5 0%, #ffffff 50%, #fff8f0 100%)", py: { xs: 3, md: 5 } }}>
        <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, sm: 3, lg: 4 } }}>

          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <ReceiptIcon sx={{ fontSize: { xs: 28, sm: 36 }, color: "#DC2626" }} />
              <Typography variant="h4" sx={{
                fontWeight: 800,
                fontSize: { xs: "1.75rem", sm: "2.25rem" },
                background: "linear-gradient(135deg, #DC2626 0%, #F97316 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                My Fines
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ ml: { xs: 0, sm: 0 } }}>
              Track and manage your library fines
            </Typography>
          </Box>

          {/* Stats */}
          <MyFineState filteredFines={filteredFines} totalOutstanding={totalOutstanding} totalPaid={totalPaid} />

          {/* Filters */}
          <Box sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
            mb: 3,
            p: 2,
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1 }}>
              <FilterIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={700} color="primary">Filters</Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: 140, flex: "1 1 140px" }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="PARTIALLY_PAID">Partially Paid</MenuItem>
                <MenuItem value="PAID">Paid</MenuItem>
                <MenuItem value="WAIVED">Waived</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140, flex: "1 1 140px" }}>
              <InputLabel>Type</InputLabel>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Type">
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="OVERDUE">Overdue</MenuItem>
                <MenuItem value="DAMAGE">Damage</MenuItem>
                <MenuItem value="LOSS">Loss</MenuItem>
                <MenuItem value="PROCESSING">Processing</MenuItem>
              </Select>
            </FormControl>
            {hasFilters && (
              <Button size="small" variant="outlined" onClick={() => { setStatusFilter(""); setTypeFilter(""); }}>
                Clear
              </Button>
            )}
            {hasFilters && (
              <Chip label={`${filteredFines.length} result${filteredFines.length !== 1 ? "s" : ""}`}
                size="small" color="primary" variant="outlined" />
            )}
          </Box>

          {/* Fines List */}
          {filteredFines.length === 0 ? (
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <CardContent>
                <Box sx={{ textAlign: "center", py: { xs: 5, md: 8 } }}>
                  <CheckCircleIcon sx={{ fontSize: { xs: 60, md: 80 }, color: "#16A34A", mb: 2 }} />
                  <Typography variant="h5" fontWeight={700} mb={1}>No Fines Found</Typography>
                  <Typography variant="body1" color="text.secondary">
                    {hasFilters
                      ? "No fines match your current filters."
                      : "You have no library fines. Keep up the good work!"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={2}>
              {filteredFines.map((fine) => (
                <MyFineCard key={fine.id} fine={fine} handlePayFine={handlePayFine} />
              ))}
            </Stack>
          )}
        </Box>
      </Box>

      <FinePaymentDialog
        paymentDialog={paymentDialog}
        setPaymentDialog={setPaymentDialog}
        confirmPayment={confirmPayment}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity} sx={{ width: "100%", boxShadow: 3 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default MyFinesPage;
