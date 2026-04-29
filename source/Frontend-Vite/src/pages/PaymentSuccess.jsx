import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box, Typography, Button, Container, Paper, CircularProgress, Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HomeIcon from "@mui/icons-material/Home";
import ReceiptIcon from "@mui/icons-material/Receipt";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { subscriptionId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  // Stripe redirects back with ?payment_intent=...&redirect_status=succeeded
  const stripeStatus = searchParams.get("redirect_status");
  const paymentIntent = searchParams.get("payment_intent");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const isSuccess = stripeStatus === "succeeded" || stripeStatus == null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <CircularProgress size={60} sx={{ color: "#4F46E5" }} />
          <Typography variant="h6" sx={{ mt: 2, color: "text.secondary" }}>
            Processing your payment…
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ borderRadius: 4, overflow: "hidden" }}>
          <Box
            sx={{
              bgcolor: isSuccess ? "#10B981" : "#EF4444",
              color: "white", py: 4, px: 3, textAlign: "center",
            }}
          >
            {isSuccess
              ? <CheckCircleIcon sx={{ fontSize: 80, mb: 2 }} />
              : <ErrorIcon sx={{ fontSize: 80, mb: 2 }} />}
            <Typography variant="h4" fontWeight="bold">
              {isSuccess ? "Payment Successful!" : "Payment Failed"}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
              {isSuccess
                ? "Your subscription has been activated successfully"
                : "There was an issue processing your payment"}
            </Typography>
          </Box>

          <Box sx={{ p: 4 }}>
            {isSuccess ? (
              <>
                <Alert severity="success" sx={{ mb: 3 }}>
                  Thank you! Your subscription is now active.
                </Alert>
                <Box className="space-y-3">
                  {paymentIntent && (
                    <Box className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <Typography variant="body2" color="text.secondary">Payment Intent</Typography>
                      <Typography variant="body1" fontWeight="500" className="font-mono">
                        {paymentIntent}
                      </Typography>
                    </Box>
                  )}
                  {subscriptionId && (
                    <Box className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <Typography variant="body2" color="text.secondary">Subscription ID</Typography>
                      <Typography variant="body1" fontWeight="500">{subscriptionId}</Typography>
                    </Box>
                  )}
                  {user && (
                    <Box className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <Typography variant="body2" color="text.secondary">Account</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {user.email || user.fullName}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box sx={{ mt: 4, p: 3, bgcolor: "#EEF2FF", borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    What's Next?
                  </Typography>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• You can now borrow books according to your plan</li>
                    <li>• Manage your subscription from your account</li>
                    <li>• A receipt has been sent to your email</li>
                  </ul>
                </Box>
              </>
            ) : (
              <>
                <Alert severity="error" sx={{ mb: 3 }}>
                  Your payment could not be processed. Please try again or contact support.
                </Alert>
                <Box sx={{ mt: 4, p: 3, bgcolor: "#FEF2F2", borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Need Help?
                  </Typography>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• Check your card details and try again</li>
                    <li>• Contact your bank for transaction status</li>
                    <li>• Reach out to our support team</li>
                  </ul>
                </Box>
              </>
            )}

            <Box sx={{ mt: 4, display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
              <Button
                fullWidth variant="contained" startIcon={<HomeIcon />}
                onClick={() => navigate("/")}
                sx={{
                  bgcolor: "#4F46E5", color: "white", py: 1.5, fontWeight: 600,
                  textTransform: "none", borderRadius: "0.75rem",
                  "&:hover": { bgcolor: "#4338CA" },
                }}
              >
                Go to Dashboard
              </Button>
              {isSuccess && (
                <Button
                  fullWidth variant="outlined" startIcon={<ReceiptIcon />}
                  onClick={() => navigate("/subscriptions")}
                  sx={{
                    borderColor: "#4F46E5", color: "#4F46E5", py: 1.5, fontWeight: 600,
                    textTransform: "none", borderRadius: "0.75rem",
                    "&:hover": { borderColor: "#4338CA", bgcolor: "#EEF2FF" },
                  }}
                >
                  View Subscriptions
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default PaymentSuccess;
