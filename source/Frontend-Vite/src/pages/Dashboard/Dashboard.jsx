import React, { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Tab,
  Tabs,
  Box,
  Avatar,
} from "@mui/material";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HistoryIcon from "@mui/icons-material/History";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import { useDispatch } from "react-redux";

import { fetchMyBookLoans } from "../../store/features/bookLoans/bookLoanThunk";
import { getMyReservations } from "../../store/features/reservations/reservationThunk";
import CurrentLoans from "./CurrentLoans";
import { useSelector } from "react-redux";
import Reservation from "./Reservation";
import ReadingHistory from "./ReadingHistory";
import Recommandation from "./Recommandation";
import { statsConfig } from "./StateConfig";
import StatsCard from "./StateCard";

/**
 * Dashboard Component
 * User dashboard showing borrowed books, reservations, reading stats, and recommendations
 */
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();
  const { auth } = useSelector((store) => store);
  const { myLoans } = useSelector((store) => store.bookLoans);
  const { reservations } = useSelector((store) => store.reservations);

  const READING_GOAL = 30;
  const currentYear = new Date().getFullYear();

  // Derive active loans from already-fetched myLoans — no extra API call
  const activeLoans = myLoans.filter(l =>
    l.status === 'CHECKED_OUT' || l.status === 'OVERDUE'
  );

  const booksRead = myLoans.filter((loan) => {
    if (!loan.returnDate) return false;
    return new Date(loan.returnDate).getFullYear() === currentYear;
  }).length;

  useEffect(() => {
    dispatch(fetchMyBookLoans({ status: null, page: 0, size: 100 }));
    dispatch(getMyReservations({ page: 0, size: 100 }));
  }, [auth.user]);

  const readingProgress = Math.min((booksRead / READING_GOAL) * 100, 100);
  const statsData = statsConfig({ myLoans: activeLoans, reservations, booksRead, readingStreak: 0 });
  return (
  
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-500 py-6 sm:py-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8 animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              My{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              Track your reading journey and manage your library
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8 animate-fade-in-up animation-delay-200">
            {statsData.map((item) => (
              <StatsCard
                key={item.id}
                icon={item.icon}
                value={item.value}
                title={item.title}
                subtitle={item.subtitle}
                bgColor={item.bgColor}
                textColor={item.textColor}
              />
            ))}
          </div>

          {/* Reading Progress */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 animate-fade-in-up animation-delay-400">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                  {currentYear} Reading Goal
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {booksRead} of {READING_GOAL} books read
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full">
                <AutoAwesomeIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: "#4F46E5" }} />
              </div>
            </div>
            <LinearProgress
              variant="determinate"
              value={readingProgress}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: "#E0E7FF",
                "& .MuiLinearProgress-bar": {
                  background:
                    "linear-gradient(90deg, #4F46E5 0%, #9333EA 100%)",
                  borderRadius: 6,
                },
              }}
            />
            <p className="text-sm text-gray-600 mt-2">
              {Math.round(readingProgress)}% complete
            </p>
          </div>

          {/* Tabs Section */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up animation-delay-600">
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    fontWeight: 600,
                    minWidth: { xs: 100, sm: 140 },
                  },
                  "& .Mui-selected": {
                    color: "#4F46E5",
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#4F46E5",
                  },
                }}
              >
                <Tab label="Current Loans" />
                <Tab label="Reservations" />
                <Tab label="Reading History" />
                <Tab label="Recommendations" />
              </Tabs>
            </Box>

            {/* Current Loans Tab */}
            {activeTab === 0 && <CurrentLoans />}

            {/* Reservations Tab */}
            {activeTab === 1 && <Reservation />}

            {/* Reading History Tab */}
            {activeTab === 2 && <ReadingHistory />}

            {/* Recommendations Tab */}
            {activeTab === 3 && <Recommandation />}
          </div>
        </div>
      </div>
  
  );
};

export default Dashboard;
