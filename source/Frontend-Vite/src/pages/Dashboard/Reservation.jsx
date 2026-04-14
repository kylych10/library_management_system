import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Stack, Chip, alpha } from "@mui/material";
import { EventAvailable, Visibility } from "@mui/icons-material";
import GetStatusChip from "./GetStatusChip";
import { getMyReservations } from "../../store/features/reservations/reservationThunk";

const Reservation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { reservations } = useSelector((state) => state.reservations);

  useEffect(() => {
    dispatch(getMyReservations({ page: 0, size: 20 }));
  }, []);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" fontWeight={700} color="#111827" sx={{ mb: 3 }}>
        Your Book Reservations
      </Typography>

      {reservations.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: { xs: 6, md: 8 },
            border: "2px dashed rgba(0,0,0,0.1)",
            borderRadius: 3,
          }}
        >
          <EventAvailable sx={{ fontSize: 56, color: "text.disabled", mb: 1.5 }} />
          <Typography variant="body1" color="text.secondary" mb={0.5}>
            You haven't reserved any books yet
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Browse the library and reserve your next read!
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {reservations.map((reservation) => (
            <Box
              key={reservation.id}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: 2,
                p: { xs: 2, sm: 3 },
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 3,
                bgcolor: "white",
                transition: "box-shadow 0.2s",
                "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.1)" },
              }}
            >
              {/* Left: icon + info */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 80,
                    borderRadius: 1.5,
                    background: "linear-gradient(135deg, #F5F3FF 0%, #FCE7F3 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <EventAvailable sx={{ fontSize: 28, color: "#9333EA", opacity: 0.4 }} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#111827", mb: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {reservation.bookTitle}
                  </Typography>
                  {reservation.bookAuthor && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {reservation.bookAuthor}
                    </Typography>
                  )}

                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Reserved: {new Date(reservation.reservedAt).toLocaleDateString()}
                    </Typography>
                    <GetStatusChip status={reservation.status} />
                    {reservation.status === "PENDING" && reservation.queuePosition && (
                      <Chip label={`Queue #${reservation.queuePosition}`} size="small" color="warning" variant="outlined" />
                    )}
                    {reservation.status === "AVAILABLE" && (
                      <Chip label="Ready for pickup" size="small" color="success" variant="outlined" />
                    )}
                  </Box>

                  {reservation.notes && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block", fontStyle: "italic" }}>
                      "{reservation.notes}"
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Right: action */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<Visibility fontSize="small" />}
                onClick={() => navigate(`/books/${reservation.bookId}`)}
                sx={{
                  borderColor: "#9333EA",
                  color: "#9333EA",
                  textTransform: "none",
                  fontWeight: 600,
                  flexShrink: 0,
                  alignSelf: { xs: "stretch", sm: "center" },
                  "&:hover": { bgcolor: "rgba(147,51,234,0.05)" },
                }}
              >
                View
              </Button>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default Reservation;
