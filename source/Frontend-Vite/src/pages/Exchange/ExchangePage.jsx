import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Tab, Tabs, Typography, Grid, Button, Chip, Avatar,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Select, FormControl, InputLabel, Alert, Snackbar,
  Rating, CircularProgress, IconButton, Tooltip, Badge, Divider,
  Stack, InputAdornment, Pagination,
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  Add as AddIcon,
  Search as SearchIcon,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  AssignmentReturn as ReturnIcon,
  Star as StarIcon,
  Flag as FlagIcon,
  BookmarkBorder as BookIcon,
  HourglassEmpty as PendingIcon,
  WarningAmber as OverdueIcon,
  EditOutlined as EditIcon,
  DeleteOutline as DeleteIcon,
  ToggleOn as ToggleIcon,
  Person as PersonIcon,
  CloudUpload as CloudUploadIcon,
  CalendarToday as CalendarIcon,
  Autorenew as RenewIcon,
  AccountBalanceWallet as WalletIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import {
  fetchMyBalance,
  fetchMarketplace, fetchMyExchangeBooks, createExchangeBook, updateExchangeBook,
  deleteExchangeBook, toggleExchangeBook, sendExchangeRequest, acceptExchangeRequest,
  rejectExchangeRequest, cancelExchangeRequest, fetchMyExchangeRequests,
  fetchIncomingRequests, fetchMyBorrows, fetchMyLends, returnExchangeBook,
  rateLender, rateBorrower, submitExchangeReport,
} from '../../store/features/exchange/exchangeThunk';
import { clearError, clearSuccess } from '../../store/features/exchange/exchangeSlice';
import UserProfileModal from '../../components/user/UserProfileModal';

const CONDITIONS = ['NEW', 'GOOD', 'FAIR', 'POOR'];
const CONDITION_COLORS = { NEW: '#10B981', GOOD: '#4F46E5', FAIR: '#F59E0B', POOR: '#EF4444' };
const STATUS_BG = {
  AVAILABLE: '#10B981', REQUESTED: '#F59E0B', BORROWED: '#4F46E5',
  RETURNED: '#6B7280', UNAVAILABLE: '#6B7280',
  ACTIVE: '#4F46E5', OVERDUE: '#EF4444',
  PENDING: '#F59E0B', ACCEPTED: '#10B981', REJECTED: '#EF4444', CANCELLED: '#6B7280',
};
const REPORT_REASONS = ['LATE_RETURN', 'DAMAGED_BOOK', 'NO_SHOW', 'FRAUDULENT', 'OTHER'];
const emptyBook = {
  title: '', author: '', description: '', condition: 'GOOD',
  coverImageUrl: '', isbn: '', genre: '', borrowDurationDays: 14,
};

export default function ExchangePage() {
  const dispatch = useDispatch();
  const { marketplace, myBooks, myRequests, incomingRequests, myBorrows, myLends,
    balance, loading, actionLoading, error, successMessage } = useSelector(s => s.exchange);
  const { user } = useSelector(s => s.auth);

  const [tab, setTab] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [condition, setCondition] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('DESC');
  const [page, setPage] = useState(1);
  const debounceRef = React.useRef(null);

  const doFetch = (q, cond, sb, sd, p) => {
    dispatch(fetchMarketplace({ q, condition: cond, sortBy: sb, sortDir: sd, page: p - 1 }));
  };

  // dynamic search — fires 400ms after user stops typing
  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchInput(q);
    setPage(1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doFetch(q, condition, sortBy, sortDir, 1);
    }, 400);
  };

  const handleConditionChange = (val) => {
    setCondition(val); setPage(1);
    doFetch(searchInput, val, sortBy, sortDir, 1);
  };

  const handleSortChange = (field, dir) => {
    setSortBy(field); setSortDir(dir); setPage(1);
    doFetch(searchInput, condition, field, dir, 1);
  };

  const [bookDialog, setBookDialog] = useState(false);
  const [bookForm, setBookForm] = useState(emptyBook);
  const [editingBookId, setEditingBookId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [requestDialog, setRequestDialog] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');

  const [ratingDialog, setRatingDialog] = useState(null);
  const [ratingValue, setRatingValue] = useState(3);
  const [ratingComment, setRatingComment] = useState('');

  const [reportDialog, setReportDialog] = useState(null);
  const [reportReason, setReportReason] = useState('LATE_RETURN');
  const [reportDesc, setReportDesc] = useState('');

  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [profileUserId, setProfileUserId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyBalance());
    if (tab === 0) dispatch(fetchMarketplace({ q: searchInput, page: page - 1 }));
    else if (tab === 1) dispatch(fetchMyExchangeBooks());
    else if (tab === 2) dispatch(fetchIncomingRequests());
    else if (tab === 3) dispatch(fetchMyExchangeRequests());
    else if (tab === 4) { dispatch(fetchMyBorrows()); dispatch(fetchMyLends()); }
  }, [tab, dispatch]);

  useEffect(() => {
    if (successMessage) { setSnack({ open: true, msg: successMessage, severity: 'success' }); dispatch(clearSuccess()); }
    if (error) { setSnack({ open: true, msg: error, severity: 'error' }); dispatch(clearError()); }
  }, [successMessage, error, dispatch]);

  const handlePageChange = (_, val) => {
    setPage(val);
    doFetch(searchInput, condition, sortBy, sortDir, val);
  };

  // ── book form ─────────────────────────────────────────────────────────────
  const openAdd = () => { setBookForm(emptyBook); setEditingBookId(null); setImagePreview(null); setBookDialog(true); };
  const openEdit = (b) => {
    setBookForm({ title: b.title, author: b.author, description: b.description || '',
      condition: b.condition, coverImageUrl: b.coverImageUrl || '',
      isbn: b.isbn || '', genre: b.genre || '', borrowDurationDays: b.borrowDurationDays });
    setImagePreview(b.coverImageUrl || null);
    setEditingBookId(b.id);
    setBookDialog(true);
  };
  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setBookForm(p => ({ ...p, coverImageUrl: reader.result })); setImagePreview(reader.result); };
    reader.readAsDataURL(file);
  };
  const submitBook = () => {
    if (editingBookId) dispatch(updateExchangeBook({ id: editingBookId, ...bookForm }));
    else dispatch(createExchangeBook(bookForm));
    setBookDialog(false);
  };

  // ── request ───────────────────────────────────────────────────────────────
  const submitRequest = () => {
    dispatch(sendExchangeRequest({ bookId: requestDialog.id, message: requestMessage }));
    setRequestDialog(null);
  };

  // ── rating ────────────────────────────────────────────────────────────────
  const submitRating = () => {
    if (ratingDialog.role === 'lender')
      dispatch(rateLender({ recordId: ratingDialog.recordId, rating: ratingValue, comment: ratingComment }));
    else
      dispatch(rateBorrower({ recordId: ratingDialog.recordId, rating: ratingValue, comment: ratingComment }));
    setRatingDialog(null);
  };

  // ── report ────────────────────────────────────────────────────────────────
  const submitReport = () => {
    dispatch(submitExchangeReport({
      borrowRecordId: reportDialog.recordId, reportedUserId: reportDialog.reportedUserId,
      reason: reportReason, description: reportDesc,
    }));
    setReportDialog(null);
  };

  const pendingIncoming = incomingRequests.filter(r => r.status === 'PENDING').length;

  // ══════════════════════════════════════════════════════════════════════════
  // MARKETPLACE CARD — same style as BookCard
  // ══════════════════════════════════════════════════════════════════════════
  const MarketplaceCard = ({ book }) => (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1 flex flex-col">
      {/* Cover */}
      <div className="relative h-56 bg-linear-to-br from-indigo-100 to-purple-100 overflow-hidden">
        {book.coverImageUrl ? (
          <img src={book.coverImageUrl} alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookIcon sx={{ fontSize: 72, color: '#4F46E5', opacity: 0.25 }} />
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className="text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg"
            style={{ backgroundColor: STATUS_BG[book.status] }}>
            {book.status}
          </span>
        </div>
        {/* Condition badge */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-xs font-medium px-3 py-1 rounded-full shadow-md"
            style={{ color: CONDITION_COLORS[book.condition] }}>
            {book.condition}
          </span>
        </div>
        {/* Genre badge */}
        {book.genre && (
          <div className="absolute bottom-3 right-3">
            <span className="bg-white/90 backdrop-blur-sm text-indigo-600 text-xs font-medium px-3 py-1 rounded-full shadow-md">
              {book.genre}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {book.title}
        </h3>
        <div className="flex items-center gap-1 text-gray-500 mb-3">
          <PersonIcon sx={{ fontSize: 14 }} />
          <span className="text-sm line-clamp-1">{book.author}</span>
        </div>

        {/* Owner row — clickable */}
        <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-indigo-50 transition-colors"
          onClick={e => { e.stopPropagation(); setProfileUserId(book.ownerId); }}>
          <Avatar src={book.ownerProfileImage} sx={{ width: 28, height: 28, fontSize: 12 }}>
            {book.ownerName?.[0]}
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate hover:text-indigo-600">{book.ownerName}</p>
            <div className="flex items-center gap-0.5">
              <StarIcon sx={{ fontSize: 11, color: '#F59E0B' }} />
              <span className="text-xs text-gray-500">{book.ownerReputationScore?.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <CalendarIcon sx={{ fontSize: 12 }} />
            <span>{book.borrowDurationDays}d</span>
          </div>
        </div>

        {book.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{book.description}</p>
        )}

        <div className="mt-auto">
          <Tooltip title={balance && !balance.canBorrow ? `Insufficient balance. Need ${balance?.depositRequired} soms.` : ''}>
            <span>
              <Button fullWidth variant="contained" size="small"
                disabled={balance && !balance.canBorrow}
                onClick={() => { setRequestMessage(''); setRequestDialog(book); }}
                sx={{
                  bgcolor: '#4F46E5', textTransform: 'none', fontWeight: 600, borderRadius: 1.5,
                  '&:hover': { bgcolor: '#4338CA' },
                  '&.Mui-disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
                }}>
                {balance && !balance.canBorrow ? 'Insufficient Balance' : 'Request Book'}
              </Button>
            </span>
          </Tooltip>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // MY BOOK CARD
  // ══════════════════════════════════════════════════════════════════════════
  const MyBookCard = ({ book }) => (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1 flex flex-col">
      <div className="relative h-44 bg-linear-to-br from-indigo-100 to-purple-100 overflow-hidden">
        {book.coverImageUrl ? (
          <img src={book.coverImageUrl} alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookIcon sx={{ fontSize: 60, color: '#4F46E5', opacity: 0.25 }} />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="text-white text-xs font-semibold px-3 py-1 rounded-full shadow"
            style={{ backgroundColor: STATUS_BG[book.status] || '#6B7280' }}>
            {book.status}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="bg-white/90 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ color: CONDITION_COLORS[book.condition] }}>
            {book.condition}
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors mb-1">
          {book.title}
        </h3>
        <p className="text-sm text-gray-500 mb-1 line-clamp-1">{book.author}</p>
        {book.genre && <p className="text-xs text-indigo-500 mb-3">{book.genre}</p>}
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
          <CalendarIcon sx={{ fontSize: 12 }} />
          <span>{book.borrowDurationDays}-day loan</span>
        </div>
        <div className="mt-auto flex gap-2">
          <Tooltip title="Edit">
            <span>
              <IconButton size="small" onClick={() => openEdit(book)}
                disabled={book.status === 'BORROWED' || book.status === 'REQUESTED'}
                sx={{ border: '1px solid #E5E7EB', borderRadius: 1 }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={book.status === 'AVAILABLE' ? 'Mark Unavailable' : 'Mark Available'}>
            <span>
              <IconButton size="small" onClick={() => dispatch(toggleExchangeBook(book.id))}
                disabled={book.status === 'BORROWED' || book.status === 'REQUESTED'}
                sx={{ border: '1px solid #E5E7EB', borderRadius: 1,
                      color: book.status === 'AVAILABLE' ? '#F59E0B' : '#10B981' }}>
                <ToggleIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Delete">
            <span>
              <IconButton size="small" color="error" onClick={() => dispatch(deleteExchangeBook(book.id))}
                disabled={book.status === 'BORROWED' || book.status === 'REQUESTED'}
                sx={{ border: '1px solid #FEE2E2', borderRadius: 1 }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // BORROW RECORD CARD
  // ══════════════════════════════════════════════════════════════════════════
  const BorrowCard = ({ record, isLender }) => {
    const isOverdue = record.isOverdue || record.status === 'OVERDUE';
    const isReturned = record.status === 'RETURNED';
    const canRate = isReturned && (isLender ? !record.lenderRating : !record.borrowerRating);
    const other = isLender
      ? { name: record.borrowerName, img: record.borrowerProfileImage, id: record.borrowerId }
      : { name: record.lenderName, img: record.lenderProfileImage, id: record.lenderId };

    return (
      <div className={`bg-white rounded-xl shadow-md overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${isOverdue ? 'border-red-300' : 'border-gray-100'}`}>
        <div className={`h-1.5 w-full ${isOverdue ? 'bg-red-500' : isReturned ? 'bg-green-500' : 'bg-indigo-500'}`} />
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-gray-900 line-clamp-1">{record.bookTitle}</h3>
              <p className="text-sm text-gray-500">{record.bookAuthor}</p>
            </div>
            <span className="text-white text-xs font-semibold px-2.5 py-1 rounded-full ml-2 shrink-0"
              style={{ backgroundColor: STATUS_BG[record.status] || '#6B7280' }}>
              {record.status}
            </span>
          </div>

          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-3 cursor-pointer hover:bg-indigo-50 transition-colors"
            onClick={() => setProfileUserId(other.id)}>
            <Avatar src={other.img} sx={{ width: 28, height: 28, fontSize: 12 }}>{other.name?.[0]}</Avatar>
            <div>
              <p className="text-xs text-gray-500">{isLender ? 'Borrowed by' : 'Lent by'}</p>
              <p className="text-sm font-medium text-gray-800 hover:text-indigo-600">{other.name}</p>
            </div>
          </div>

          <div className="flex gap-4 text-sm mb-3">
            <div>
              <p className="text-xs text-gray-400">Due Date</p>
              <p className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                {record.dueDate} {isOverdue && '⚠'}
              </p>
            </div>
            {isReturned && (
              <div>
                <p className="text-xs text-gray-400">Returned</p>
                <p className="font-semibold text-gray-700">
                  {new Date(record.returnedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Deposit status badge */}
          {!isLender && (
            <div className={`flex items-center gap-1.5 mb-2 px-2 py-1 rounded-lg w-fit text-xs font-semibold ${
              isReturned ? 'bg-green-50 text-green-700' : isOverdue ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
            }`}>
              <LockIcon sx={{ fontSize: 12 }} />
              {isReturned ? 'Deposit released ✓' : isOverdue ? 'Deposit forfeited ✗' : 'Deposit locked (500 coins)'}
            </div>
          )}

          {isReturned && (
            <div className="mb-3">
              {!isLender && record.borrowerRating && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">Your rating:</span>
                  <Rating value={record.borrowerRating} readOnly size="small" />
                </div>
              )}
              {isLender && record.lenderRating && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">Your rating:</span>
                  <Rating value={record.lenderRating} readOnly size="small" />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {!isLender && (record.status === 'ACTIVE' || record.status === 'OVERDUE') && (
              <Button size="small" variant="contained" startIcon={<ReturnIcon />}
                onClick={() => dispatch(returnExchangeBook(record.id))} disabled={actionLoading}
                sx={{ bgcolor: '#4F46E5', textTransform: 'none', '&:hover': { bgcolor: '#4338CA' } }}>
                Return
              </Button>
            )}
            {canRate && (
              <Button size="small" variant="outlined" startIcon={<StarIcon />}
                onClick={() => { setRatingDialog({ recordId: record.id, role: isLender ? 'borrower' : 'lender' }); setRatingValue(3); setRatingComment(''); }}
                sx={{ color: '#F59E0B', borderColor: '#F59E0B', textTransform: 'none' }}>
                Rate
              </Button>
            )}
            {isReturned && (
              <Tooltip title="Report issue">
                <IconButton size="small" color="error"
                  onClick={() => { setReportDialog({ recordId: record.id, reportedUserId: other.id }); setReportReason('LATE_RETURN'); setReportDesc(''); }}>
                  <FlagIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // REQUEST CARD (incoming / my requests)
  // ══════════════════════════════════════════════════════════════════════════
  const RequestCard = ({ req, incoming }) => (
    <div className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border ${req.status === 'PENDING' && incoming ? 'border-indigo-300' : 'border-gray-100'}`}>
      <div className={`h-1.5 ${req.status === 'PENDING' ? 'bg-indigo-500' : req.status === 'ACCEPTED' ? 'bg-green-500' : req.status === 'REJECTED' ? 'bg-red-400' : 'bg-gray-300'}`} />
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0 mr-2">
            <h3 className="font-bold text-gray-900 line-clamp-1">{req.bookTitle}</h3>
            <p className="text-sm text-gray-500">{req.bookAuthor}</p>
          </div>
          <span className="text-white text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
            style={{ backgroundColor: STATUS_BG[req.status] || '#6B7280' }}>
            {req.status}
          </span>
        </div>

        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-3 cursor-pointer hover:bg-indigo-50 transition-colors"
          onClick={() => setProfileUserId(req.requesterId)}>
          <Avatar src={req.requesterProfileImage} sx={{ width: 28, height: 28, fontSize: 12 }}>
            {req.requesterName?.[0]}
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">{incoming ? 'Requested by' : 'Your request'}</p>
            <p className="text-sm font-medium text-gray-800 truncate hover:text-indigo-600">{req.requesterName}</p>
          </div>
          <div className="flex items-center gap-0.5">
            <StarIcon sx={{ fontSize: 13, color: '#F59E0B' }} />
            <span className="text-xs text-gray-500">{req.requesterReputationScore?.toFixed(1)}</span>
          </div>
        </div>

        {req.message && (
          <div className="p-2.5 bg-indigo-50 rounded-lg mb-3 border-l-2 border-indigo-300">
            <p className="text-sm text-gray-600 italic">"{req.message}"</p>
          </div>
        )}

        <p className="text-xs text-gray-400 mb-3">{new Date(req.createdAt).toLocaleDateString()}</p>

        {incoming && req.status === 'PENDING' && (
          <div className="flex gap-2">
            <Button fullWidth size="small" variant="contained" startIcon={<AcceptIcon />}
              onClick={() => dispatch(acceptExchangeRequest(req.id))} disabled={actionLoading}
              sx={{ bgcolor: '#10B981', textTransform: 'none', '&:hover': { bgcolor: '#059669' } }}>
              Accept
            </Button>
            <Button fullWidth size="small" variant="outlined" color="error" startIcon={<RejectIcon />}
              onClick={() => dispatch(rejectExchangeRequest(req.id))} disabled={actionLoading}
              sx={{ textTransform: 'none' }}>
              Reject
            </Button>
          </div>
        )}
        {!incoming && req.status === 'PENDING' && (
          <Button size="small" variant="outlined" color="error" fullWidth
            onClick={() => dispatch(cancelExchangeRequest(req.id))}
            sx={{ textTransform: 'none' }}>
            Cancel Request
          </Button>
        )}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // EMPTY STATE
  // ══════════════════════════════════════════════════════════════════════════
  const Empty = ({ icon: Icon, text, action }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
        <Icon sx={{ fontSize: 40, color: '#4F46E5', opacity: 0.5 }} />
      </div>
      <p className="text-gray-500 text-lg mb-4">{text}</p>
      {action}
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl">
              <SwapIcon sx={{ fontSize: 28, color: 'white' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Book Exchange</h1>
              <p className="text-gray-500 text-sm">Share books with your community</p>
            </div>
          </div>

          {/* Balance widget */}
          {balance !== null && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${
              balance.canBorrow ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                balance.canBorrow ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <WalletIcon sx={{ fontSize: 22, color: balance.canBorrow ? '#10B981' : '#EF4444' }} />
              </div>
              <div>
                <p className="text-xs text-gray-500 leading-none mb-0.5">Your Balance</p>
                <p className={`text-lg font-bold leading-none ${
                  balance.canBorrow ? 'text-green-700' : 'text-red-600'
                }`}>
                  {balance.balance} <span className="text-sm font-normal">coins</span>
                </p>
              </div>
              <div className="border-l border-gray-200 pl-3 ml-1">
                <p className="text-xs text-gray-400 leading-none mb-0.5">Deposit</p>
                <div className="flex items-center gap-1">
                  <LockIcon sx={{ fontSize: 12, color: '#6B7280' }} />
                  <p className="text-sm font-semibold text-gray-600">{balance.depositRequired}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <Tabs value={tab} onChange={(_, v) => { setTab(v); setPage(1); }}
            variant="scrollable" scrollButtons="auto"
            sx={{
              px: 2,
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 56, fontSize: '0.9rem' },
              '& .Mui-selected': { color: '#4F46E5' },
              '& .MuiTabs-indicator': { bgcolor: '#4F46E5', height: 3, borderRadius: 2 },
            }}>
            <Tab label="Marketplace" />
            <Tab label="My Books" />
            <Tab label={
              <Badge badgeContent={pendingIncoming} color="error" max={9}>
                <Box sx={{ pr: pendingIncoming > 0 ? 1.5 : 0 }}>Incoming</Box>
              </Badge>
            } />
            <Tab label="My Requests" />
            <Tab label="Borrowed" />
          </Tabs>
        </div>

        {/* ── TAB 0: MARKETPLACE ─────────────────────────────────────────── */}
        {tab === 0 && (
          <div>
            {/* Search + filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
              {/* Search input */}
              <TextField fullWidth size="small" placeholder="Search by title, author, genre…"
                value={searchInput} onChange={handleSearchChange}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                  sx: { borderRadius: 2, bgcolor: '#F9FAFB' },
                }} />

              <div className="flex flex-wrap gap-4 items-center">
                {/* Condition filter */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">Condition</p>
                  <div className="flex gap-2 flex-wrap">
                    {['', 'NEW', 'GOOD', 'FAIR', 'POOR'].map(c => (
                      <button key={c} onClick={() => handleConditionChange(c)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                          condition === c
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'
                        }`}>
                        {c || 'All'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div className="ml-auto flex gap-2">
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>Sort by</InputLabel>
                    <Select value={sortBy} label="Sort by"
                      onChange={e => handleSortChange(e.target.value, sortDir)}
                      sx={{ borderRadius: 2 }}>
                      <MenuItem value="createdAt">Date Added</MenuItem>
                      <MenuItem value="title">Title</MenuItem>
                      <MenuItem value="author">Author</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 110 }}>
                    <InputLabel>Order</InputLabel>
                    <Select value={sortDir} label="Order"
                      onChange={e => handleSortChange(sortBy, e.target.value)}
                      sx={{ borderRadius: 2 }}>
                      <MenuItem value="DESC">Newest</MenuItem>
                      <MenuItem value="ASC">Oldest</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>

              {/* Active filter chips */}
              {(searchInput || condition) && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {searchInput && (
                    <Chip size="small" label={`"${searchInput}"`}
                      onDelete={() => { setSearchInput(''); doFetch('', condition, sortBy, sortDir, 1); }}
                      sx={{ bgcolor: '#EEF2FF', color: '#4F46E5' }} />
                  )}
                  {condition && (
                    <Chip size="small" label={condition}
                      onDelete={() => handleConditionChange('')}
                      sx={{ bgcolor: '#EEF2FF', color: '#4F46E5' }} />
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><CircularProgress sx={{ color: '#4F46E5' }} /></div>
            ) : marketplace.content?.length === 0 ? (
              <Empty icon={SwapIcon} text="No books available for exchange right now." />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                  {marketplace.content.map(b => <MarketplaceCard key={b.id} book={b} />)}
                </div>
                {marketplace.totalPages > 1 && (
                  <div className="flex justify-center">
                    <Pagination count={marketplace.totalPages} page={page} onChange={handlePageChange}
                      sx={{ '& .MuiPaginationItem-root.Mui-selected': { bgcolor: '#4F46E5', color: 'white' } }} />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── TAB 1: MY BOOKS ────────────────────────────────────────────── */}
        {tab === 1 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-500">{myBooks.length} book{myBooks.length !== 1 ? 's' : ''} listed</p>
              <Button startIcon={<AddIcon />} variant="contained" onClick={openAdd}
                sx={{ borderRadius: 2, bgcolor: '#4F46E5', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#4338CA' } }}>
                List a Book
              </Button>
            </div>
            {loading ? (
              <div className="flex justify-center py-20"><CircularProgress sx={{ color: '#4F46E5' }} /></div>
            ) : myBooks.length === 0 ? (
              <Empty icon={BookIcon} text="You haven't listed any books yet."
                action={
                  <Button variant="outlined" onClick={openAdd}
                    sx={{ color: '#4F46E5', borderColor: '#4F46E5', textTransform: 'none', fontWeight: 600 }}>
                    List Your First Book
                  </Button>
                } />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {myBooks.map(b => <MyBookCard key={b.id} book={b} />)}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: INCOMING REQUESTS ───────────────────────────────────── */}
        {tab === 2 && (
          <div>
            <p className="text-gray-500 mb-6">{incomingRequests.length} request{incomingRequests.length !== 1 ? 's' : ''} for your books</p>
            {loading ? (
              <div className="flex justify-center py-20"><CircularProgress sx={{ color: '#4F46E5' }} /></div>
            ) : incomingRequests.length === 0 ? (
              <Empty icon={PendingIcon} text="No incoming requests yet." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {incomingRequests.map(r => <RequestCard key={r.id} req={r} incoming={true} />)}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: MY REQUESTS ─────────────────────────────────────────── */}
        {tab === 3 && (
          <div>
            <p className="text-gray-500 mb-6">{myRequests.length} request{myRequests.length !== 1 ? 's' : ''} sent</p>
            {loading ? (
              <div className="flex justify-center py-20"><CircularProgress sx={{ color: '#4F46E5' }} /></div>
            ) : myRequests.length === 0 ? (
              <Empty icon={PendingIcon} text="You haven't requested any books yet."
                action={
                  <Button variant="outlined" onClick={() => setTab(0)}
                    sx={{ color: '#4F46E5', borderColor: '#4F46E5', textTransform: 'none', fontWeight: 600 }}>
                    Browse Marketplace
                  </Button>
                } />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myRequests.map(r => <RequestCard key={r.id} req={r} incoming={false} />)}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: BORROWED ────────────────────────────────────────────── */}
        {tab === 4 && (
          <div>
            {loading ? (
              <div className="flex justify-center py-20"><CircularProgress sx={{ color: '#4F46E5' }} /></div>
            ) : myBorrows.length === 0 && myLends.length === 0 ? (
              <Empty icon={ReturnIcon} text="No borrow activity yet." />
            ) : (
              <>
                {myBorrows.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <RenewIcon sx={{ color: '#4F46E5' }} /> Books I'm Borrowing
                      <span className="text-sm font-normal text-gray-400">({myBorrows.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myBorrows.map(r => <BorrowCard key={r.id} record={r} isLender={false} />)}
                    </div>
                  </div>
                )}
                {myLends.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <BookIcon sx={{ color: '#4F46E5' }} /> Books I've Lent
                      <span className="text-sm font-normal text-gray-400">({myLends.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myLends.map(r => <BorrowCard key={r.id} record={r} isLender={true} />)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          DIALOGS
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Add / Edit Book */}
      <Dialog open={bookDialog} onClose={() => setBookDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingBookId ? 'Edit Book' : 'List a Book for Exchange'}
        </DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <Stack spacing={2}>
            {/* Image upload */}
            <Box>
              <input id="ex-img" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFile} />
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{
                  width: 80, height: 110, borderRadius: 2, overflow: 'hidden', flexShrink: 0,
                  background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px dashed #C7D2FE',
                }}>
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <BookIcon sx={{ fontSize: 32, color: '#A5B4FC' }} />}
                </Box>
                <Box flex={1}>
                  <label htmlFor="ex-img">
                    <Button component="span" variant="outlined" startIcon={<CloudUploadIcon />} fullWidth size="small"
                      sx={{ mb: 1, borderColor: '#4F46E5', color: '#4F46E5', textTransform: 'none', borderRadius: 1.5 }}>
                      {imagePreview ? 'Change Image' : 'Upload Cover'}
                    </Button>
                  </label>
                  <TextField label="Or paste image URL" size="small" fullWidth
                    value={bookForm.coverImageUrl?.startsWith('data:') ? '' : bookForm.coverImageUrl}
                    onChange={e => { setBookForm(p => ({ ...p, coverImageUrl: e.target.value })); setImagePreview(e.target.value || null); }}
                    placeholder="https://..." />
                </Box>
              </Stack>
            </Box>

            <TextField label="Title *" value={bookForm.title} fullWidth
              onChange={e => setBookForm(p => ({ ...p, title: e.target.value }))} />
            <TextField label="Author *" value={bookForm.author} fullWidth
              onChange={e => setBookForm(p => ({ ...p, author: e.target.value }))} />
            <Stack direction="row" spacing={2}>
              <TextField label="Genre" value={bookForm.genre} fullWidth
                onChange={e => setBookForm(p => ({ ...p, genre: e.target.value }))} />
              <TextField label="ISBN" value={bookForm.isbn} fullWidth
                onChange={e => setBookForm(p => ({ ...p, isbn: e.target.value }))} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Condition *</InputLabel>
                <Select value={bookForm.condition} label="Condition *"
                  onChange={e => setBookForm(p => ({ ...p, condition: e.target.value }))}>
                  {CONDITIONS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Loan Duration (days)" type="number" value={bookForm.borrowDurationDays} fullWidth
                onChange={e => setBookForm(p => ({ ...p, borrowDurationDays: parseInt(e.target.value) || 14 }))}
                inputProps={{ min: 1, max: 90 }} />
            </Stack>
            <TextField label="Description" value={bookForm.description} multiline rows={3} fullWidth
              onChange={e => setBookForm(p => ({ ...p, description: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setBookDialog(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={submitBook} disabled={!bookForm.title || !bookForm.author || actionLoading}
            sx={{ bgcolor: '#4F46E5', textTransform: 'none', fontWeight: 600, px: 3, '&:hover': { bgcolor: '#4338CA' } }}>
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : editingBookId ? 'Save Changes' : 'List Book'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Request Book */}
      <Dialog open={!!requestDialog} onClose={() => setRequestDialog(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Request "{requestDialog?.title}"</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          {/* Deposit notice */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
              bgcolor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 2, mb: 2 }}>
            <LockIcon sx={{ fontSize: 18, color: '#F59E0B', flexShrink: 0 }} />
            <Box>
              <Typography variant="body2" fontWeight={600} color="#92400E">
                Deposit required: {balance?.depositRequired ?? 500} coins
              </Typography>
              <Typography variant="caption" color="#B45309">
                Returned automatically when you give the book back on time.
                Forfeited if overdue.
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Your current balance: <strong>{balance?.balance ?? '—'} coins</strong>
          </Typography>
          <TextField label="Message (optional)" multiline rows={3} fullWidth
            value={requestMessage} onChange={e => setRequestMessage(e.target.value)}
            placeholder="Hi! I'd love to read this book because…" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setRequestDialog(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={submitRequest} disabled={actionLoading}
            sx={{ bgcolor: '#4F46E5', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#4338CA' } }}>
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Send Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rating */}
      <Dialog open={!!ratingDialog} onClose={() => setRatingDialog(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Rate {ratingDialog?.role === 'lender' ? 'Lender' : 'Borrower'}
        </DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <Box display="flex" justifyContent="center" mb={2}>
            <Rating value={ratingValue} onChange={(_, v) => setRatingValue(v)} size="large" />
          </Box>
          <TextField label="Comment (optional)" multiline rows={2} fullWidth
            value={ratingComment} onChange={e => setRatingComment(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setRatingDialog(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={submitRating}
            sx={{ bgcolor: '#4F46E5', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#4338CA' } }}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report */}
      <Dialog open={!!reportDialog} onClose={() => setReportDialog(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Report an Issue</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Reason</InputLabel>
              <Select value={reportReason} label="Reason" onChange={e => setReportReason(e.target.value)}>
                {REPORT_REASONS.map(r => <MenuItem key={r} value={r}>{r.replace(/_/g, ' ')}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Description *" multiline rows={3} fullWidth
              value={reportDesc} onChange={e => setReportDesc(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setReportDialog(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={submitReport} disabled={!reportDesc}
            sx={{ textTransform: 'none', fontWeight: 600 }}>
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Profile Modal */}
      <UserProfileModal
        userId={profileUserId}
        open={!!profileUserId}
        onClose={() => setProfileUserId(null)}
      />

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}
          sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </div>
  );
}
