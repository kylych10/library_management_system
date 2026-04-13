import React from "react";
import { useSelector } from "react-redux";
import { Box, Typography, Stack, alpha } from "@mui/material";
import { LibraryBooks } from "@mui/icons-material";
import CurrentLoanCard from "./CurrentLoanCard";

const CurrentLoans = () => {
  const { myLoans } = useSelector((state) => state.bookLoans);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, overflow: "hidden" }}>
      <Typography variant="h6" fontWeight={700} color="#111827" sx={{ mb: 3 }}>
        Books You're Currently Reading
      </Typography>

      {myLoans.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: { xs: 6, md: 8 },
            border: "2px dashed rgba(0,0,0,0.1)",
            borderRadius: 3,
          }}
        >
          <LibraryBooks sx={{ fontSize: 56, color: "text.disabled", mb: 1.5 }} />
          <Typography variant="body1" color="text.secondary">No active loans at the moment.</Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {myLoans.map((loan) => (
            <CurrentLoanCard key={loan.id} loan={loan} />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default CurrentLoans;
