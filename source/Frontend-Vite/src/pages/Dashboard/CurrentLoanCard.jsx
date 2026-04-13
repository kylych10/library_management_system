import React from "react";
import { Box, Typography, Chip, Button, alpha } from "@mui/material";
import { AccessTime, LibraryBooks, Visibility } from "@mui/icons-material";
import GetStatusChip from "./getStatusChip";
import { getDaysRemainingColor } from "./utils";
import { useNavigate } from "react-router-dom";

const CurrentLoanCard = ({ loan }) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap: 1.5,
        p: { xs: 1.5, sm: 2.5 },
        border: "1px solid",
        borderColor: loan.status === "OVERDUE" ? "rgba(239,68,68,0.3)" : "rgba(0,0,0,0.1)",
        borderRadius: 2,
        bgcolor: loan.status === "OVERDUE" ? "rgba(239,68,68,0.03)" : "white",
        overflow: "hidden",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.1)" },
      }}
    >
      {/* Left: cover + info */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flex: 1, minWidth: 0 }}>
        {loan?.bookCoverImage ? (
          <Box
            component="img"
            src={loan.bookCoverImage}
            alt={loan.bookTitle}
            sx={{ width: 44, height: 64, borderRadius: 1, objectFit: "cover", flexShrink: 0 }}
          />
        ) : (
          <Box
            sx={{
              width: 44,
              height: 64,
              borderRadius: 1,
              background: "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LibraryBooks sx={{ fontSize: 22, color: "#4F46E5", opacity: 0.4 }} />
          </Box>
        )}

        <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{ color: "#111827", mb: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {loan.bookTitle}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {loan.bookAuthor}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
            <AccessTime sx={{ fontSize: 13, color: "text.disabled", flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary" noWrap>
              Due: {new Date(loan.dueDate).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            <GetStatusChip status={loan.status} />
            <Chip
              label={`${loan.remainingDays > 0 ? loan.remainingDays : loan.overdueDays}d ${loan.remainingDays >= 0 ? "left" : "overdue"}`}
              color={getDaysRemainingColor(loan.remainingDays)}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>
      </Box>

      {/* Right: action */}
      <Button
        variant="outlined"
        size="small"
        startIcon={<Visibility fontSize="small" />}
        onClick={() => navigate(`/books/${loan?.bookId}`)}
        sx={{
          borderColor: "#4F46E5",
          color: "#4F46E5",
          textTransform: "none",
          fontWeight: 600,
          flexShrink: 0,
          alignSelf: { xs: "flex-start", sm: "center" },
          "&:hover": { bgcolor: "rgba(79,70,229,0.05)" },
        }}
      >
        View
      </Button>
    </Box>
  );
};

export default CurrentLoanCard;
