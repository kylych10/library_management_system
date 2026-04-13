import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Grid } from "@mui/material";
import { History } from "@mui/icons-material";
import { fetchMyBookLoans } from "../../store/features/bookLoans/bookLoanThunk";

const ReadingHistory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { myLoans } = useSelector((state) => state.bookLoans);

  useEffect(() => {
    dispatch(fetchMyBookLoans({ status: "RETURNED", page: 0, size: 20 }));
  }, []);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" fontWeight={700} color="#111827" sx={{ mb: 3 }}>
        Your Reading History
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
          <History sx={{ fontSize: 56, color: "text.disabled", mb: 1.5 }} />
          <Typography variant="body1" color="text.secondary">No reading history yet.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {myLoans.map((history) => (
            <Grid key={history.id} size={{ xs: 6, sm: 4, md: 3 }}>
              <Box
                onClick={() => navigate(`/books/${history.bookId}`)}
                sx={{
                  cursor: "pointer",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid rgba(0,0,0,0.08)",
                  bgcolor: "white",
                  transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  },
                }}
              >
                {history.bookCoverImage ? (
                  <Box
                    component="img"
                    src={history.bookCoverImage}
                    alt={history.bookTitle}
                    sx={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      aspectRatio: "3/4",
                      background: "linear-gradient(135deg, #D1FAE5 0%, #DBEAFE 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <History sx={{ fontSize: 48, color: "#10B981", opacity: 0.3 }} />
                  </Box>
                )}

                <Box sx={{ p: 1.5 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ color: "#111827", mb: 0.25, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {history.bookTitle}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", mb: 0.5 }}>
                    {history.bookAuthor}
                  </Typography>
                  {history.returnDate && (
                    <Typography variant="caption" color="text.disabled">
                      Returned {new Date(history.returnDate).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ReadingHistory;
