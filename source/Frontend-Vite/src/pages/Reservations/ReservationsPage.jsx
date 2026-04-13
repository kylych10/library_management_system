import React, { useState, useEffect } from "react";
import {
  AccessAlarm,
  Book,
  BookmarkAdd,
  CheckCircle,
  Close,
  HourglassBottom,
  Notifications,
  Search as SearchIcon,
  X,
} from "@mui/icons-material";
import { CalendarIcon } from "@mui/x-date-pickers";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyReservations,
  createReservation,
  cancelReservation,
} from "../../store/features/reservations/reservationThunk";
import { fetchBooks, searchBooks } from "../../store/features/books/bookThunk";
import ReservationCard from "./ReservationCard";

const ReservationsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookSearchTerm, setBookSearchTerm] = useState("");
  const [bookResults, setBookResults] = useState([]);
  const [bookSearchLoading, setBookSearchLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const dispatch = useDispatch();
  const { reservations, loading } = useSelector((state) => state.reservations);

  useEffect(() => {
    loadReservations();
  }, [activeTab, filterStatus]);

  const loadReservations = () => {
    dispatch(
      getMyReservations({
        status: filterStatus || null,
        activeOnly: activeTab === 1 ? true : null,
        page: 0,
        size: 50,
      })
    );
  };

  // Load books when dialog opens
  useEffect(() => {
    if (!createDialogOpen) return;
    const timer = setTimeout(() => {
      if (bookSearchTerm.trim().length >= 1) {
        doBookSearch(bookSearchTerm.trim());
      } else {
        doBookLoad();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [bookSearchTerm, createDialogOpen]);

  const doBookLoad = async () => {
    setBookSearchLoading(true);
    try {
      const result = await dispatch(fetchBooks({ page: 0, size: 10 })).unwrap();
      setBookResults(result.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setBookSearchLoading(false);
    }
  };

  const doBookSearch = async (term) => {
    setBookSearchLoading(true);
    try {
      const result = await dispatch(searchBooks({ searchTerm: term, page: 0, size: 10 })).unwrap();
      setBookResults(result.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setBookSearchLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedBook(null);
    setBookSearchTerm("");
    setNotes("");
    setBookResults([]);
    setCreateDialogOpen(true);
  };

  const handleCreateReservation = async () => {
    if (!selectedBook) {
      showSnackbar("Please select a book", "warning");
      return;
    }
    try {
      await dispatch(
        createReservation({ bookId: selectedBook.id, notes: notes || null })
      ).unwrap();
      showSnackbar("Reservation created successfully!", "success");
      setCreateDialogOpen(false);
      setSelectedBook(null);
      setNotes("");
      loadReservations();
    } catch (error) {
      showSnackbar(typeof error === "string" ? error : "Failed to create reservation", "error");
    }
  };

  const handleCancelReservation = async () => {
    if (!selectedReservation) return;
    try {
      await dispatch(cancelReservation(selectedReservation.id)).unwrap();
      showSnackbar("Reservation cancelled successfully", "success");
      setCancelDialogOpen(false);
      setSelectedReservation(null);
      loadReservations();
    } catch (error) {
      showSnackbar(typeof error === "string" ? error : "Failed to cancel reservation", "error");
    }
  };

  const openCancelDialog = (reservation) => {
    setSelectedReservation(reservation);
    setCancelDialogOpen(true);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar({ open: false, message: "", severity: "success" }), 4000);
  };

  const tabs = [
    { label: "All", icon: <Book className="w-4 h-4" /> },
    { label: "Active", icon: <AccessAlarm className="w-4 h-4" /> },
    { label: "Completed", icon: <CheckCircle className="w-4 h-4" /> },
  ];

  const stats = {
    total: reservations.length,
    active: reservations.filter((r) => ["PENDING", "AVAILABLE"].includes(r.status)).length,
    available: reservations.filter((r) => r.status === "AVAILABLE").length,
  };

  const filteredReservations = reservations.filter((r) => {
    if (activeTab === 1) return r.status === "PENDING" || r.status === "AVAILABLE";
    if (activeTab === 2) return r.status === "FULFILLED" || r.status === "CANCELLED" || r.status === "EXPIRED";
    return true;
  });

  const EmptyState = () => (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 sm:p-16 text-center border-2 border-dashed border-gray-300 animate-fade-in">
      <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center opacity-20">
        <Book className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">No reservations found</h3>
      <p className="text-gray-500 mb-6 text-base sm:text-lg">
        {activeTab === 0 ? "You haven't made any reservations yet" : `No ${tabs[activeTab].label.toLowerCase()} reservations`}
      </p>
      <button
        onClick={handleOpenCreate}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
      >
        <BookmarkAdd className="w-5 h-5" />
        Create Your First Reservation
      </button>
    </div>
  );

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in-up flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <span className="text-3xl sm:text-4xl">📖</span>
              <span className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent py-1 sm:py-2">
                My Reservations
              </span>
            </div>
            <p className="text-base sm:text-lg text-gray-600">Manage and track your book reservations</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="self-start sm:self-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg inline-flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
          >
            <BookmarkAdd className="w-4 h-4 sm:w-5 sm:h-5" />
            New Reservation
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-2 sm:p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Book className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-yellow-800 uppercase tracking-wide">Active</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-yellow-900 mt-1">{stats.active}</p>
              </div>
              <div className="p-2 sm:p-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl shadow-lg">
                <AccessAlarm className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wide">Ready</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-green-900 mt-1">{stats.available}</p>
              </div>
              <div className="p-2 sm:p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <CalendarIcon className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-5 sm:mb-6 overflow-hidden animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <div className="flex border-b border-gray-200">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base flex items-center justify-center gap-1 sm:gap-2 transition-all ${
                  activeTab === index
                    ? "text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div key={activeTab} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-72 sm:h-96 animate-pulse"></div>
            ))}
          </div>
        ) : filteredReservations.length === 0 ? (
          <EmptyState key={activeTab} />
        ) : (
          <div key={activeTab} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredReservations.map((reservation, index) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                index={index}
                onCancel={() => openCancelDialog(reservation)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== Create Dialog ===== */}
      {createDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-5 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <BookmarkAdd className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">Reserve a Book</h2>
              </div>
              <button onClick={() => setCreateDialogOpen(false)} className="text-white/80 hover:text-white">
                <Close className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="p-5 sm:p-6 overflow-y-auto flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search & Select a Book</label>
              <div className="relative mb-3">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={bookSearchTerm}
                  onChange={(e) => { setBookSearchTerm(e.target.value); setSelectedBook(null); }}
                  placeholder="Search by title, author, ISBN..."
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                  autoFocus
                />
              </div>

              {/* Selected book */}
              {selectedBook && (
                <div className="mb-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedBook.coverImageUrl ? (
                      <img src={selectedBook.coverImageUrl} alt={selectedBook.title} className="w-10 h-14 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-14 bg-indigo-200 rounded flex items-center justify-center">
                        <Book className="w-5 h-5 text-indigo-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{selectedBook.title}</p>
                      <p className="text-xs text-gray-600">
                        {selectedBook.author} •{" "}
                        {selectedBook.availableCopies > 0
                          ? `${selectedBook.availableCopies} available`
                          : "Unavailable — you'll join the queue"}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedBook(null)} className="text-gray-400 hover:text-red-500 ml-2">
                    <Close className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Book results */}
              {!selectedBook && (
                <div className="max-h-48 sm:max-h-60 overflow-y-auto border border-gray-200 rounded-lg mb-3">
                  {bookSearchLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                      Searching...
                    </div>
                  ) : bookResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      {bookSearchTerm ? "No available books found" : "Type to search or books will load automatically"}
                    </div>
                  ) : (
                    bookResults.map((book) => (
                      <button
                        key={book.id}
                        onClick={() => { setSelectedBook(book); setBookSearchTerm(book.title); }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-indigo-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                      >
                        {book.coverImageUrl ? (
                          <img src={book.coverImageUrl} alt={book.title} className="w-9 h-12 object-cover rounded flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                            <Book className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{book.title}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {book.author} •{" "}
                            <span className={`font-medium ${book.availableCopies > 0 ? "text-green-600" : "text-orange-600"}`}>
                              {book.availableCopies > 0 ? `${book.availableCopies} available` : "Join queue"}
                            </span>
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              <label className="block text-sm font-semibold text-gray-700 mb-1 mt-2">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
              />
            </div>
            <div className="px-5 sm:px-6 py-4 flex gap-3 bg-gray-50 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => setCreateDialogOpen(false)}
                className="flex-1 px-4 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-all text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateReservation}
                disabled={!selectedBook || loading}
                className={`flex-1 font-bold py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base ${
                  selectedBook
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 hover:scale-105"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <BookmarkAdd className="w-4 h-4 sm:w-5 sm:h-5" />
                Reserve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Cancel Dialog ===== */}
      {cancelDialogOpen && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="bg-red-50 px-5 sm:px-6 py-4 flex items-center gap-3">
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-red-700">Cancel Reservation</h2>
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-gray-700 text-base sm:text-lg mb-2">
                Are you sure you want to cancel this reservation?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="font-bold text-gray-900">
                  {selectedReservation.bookTitle || `Book #${selectedReservation.bookId}`}
                </p>
                {selectedReservation.bookAuthor && (
                  <p className="text-sm text-gray-600">by {selectedReservation.bookAuthor}</p>
                )}
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex items-center gap-2">
                  <Notifications className="w-5 h-5 text-yellow-600" />
                  <p className="text-sm font-semibold text-yellow-800">This action cannot be undone</p>
                </div>
              </div>
            </div>
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex gap-3 bg-gray-50 pt-4">
              <button
                onClick={() => { setCancelDialogOpen(false); setSelectedReservation(null); }}
                className="flex-1 px-4 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-all text-sm sm:text-base"
              >
                Keep
              </button>
              <button
                onClick={handleCancelReservation}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-2.5 sm:py-3 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Close className="w-4 h-4 sm:w-5 sm:h-5" />
                Cancel It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 animate-fade-in-up">
          <div
            className={`px-5 sm:px-6 py-3 sm:py-4 rounded-lg shadow-2xl flex items-center justify-between gap-3 ${
              snackbar.severity === "success"
                ? "bg-green-500"
                : snackbar.severity === "error"
                ? "bg-red-500"
                : snackbar.severity === "warning"
                ? "bg-yellow-500"
                : "bg-blue-500"
            }`}
          >
            <span className="text-white font-semibold text-sm sm:text-base">{snackbar.message}</span>
            <button onClick={() => setSnackbar({ ...snackbar, open: false })}>
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white hover:text-gray-200" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;
