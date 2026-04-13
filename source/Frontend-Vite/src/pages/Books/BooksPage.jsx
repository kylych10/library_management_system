import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  IconButton,
  Pagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ClearIcon from '@mui/icons-material/Clear';
import BookCard from '../../components/books/BookCard';
import GenreFilter from '../../components/books/GenreFilter';
import { BookSkeletonGrid } from '../../components/books/BookSkeleton';
import { fetchActiveGenresWithHierarchy } from '../../store/features/genres/genreThunk';
import { fetchBooks, searchBooks } from '../../store/features/books/bookThunk';

const PAGE_SIZE = 12;

const BooksPage = () => {
  const dispatch = useDispatch();
  const { books, loading, error, totalElements, totalPages } = useSelector((s) => s.books);
  const { genreHierarchy, loading: genresLoading } = useSelector((s) => s.genres);

  const [searchTerm,         setSearchTerm]         = useState('');
  const [selectedGenreId,    setSelectedGenreId]    = useState(null);
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');
  const [sortBy,             setSortBy]             = useState('createdAt');
  const [sortDirection,      setSortDirection]      = useState('DESC');
  const [currentPage,        setCurrentPage]        = useState(1);
  const [showMobileFilters,  setShowMobileFilters]  = useState(false);

  const debounceRef = useRef(null);

  useEffect(() => {
    dispatch(fetchActiveGenresWithHierarchy());
  }, [dispatch]);

  // Convert UI filter value → backend param
  // 'ALL' → null, 'AVAILABLE' → true, 'CHECKED_OUT' → false
  const toAvailableOnly = (filter) => {
    if (filter === 'AVAILABLE')   return true;
    if (filter === 'CHECKED_OUT') return false;
    return null;
  };

  // Central dispatch — called with all current values explicitly (no stale closures)
  const doFetch = (page, search, genreId, avFilter, sb, sd) => {
    const availableOnly = toAvailableOnly(avFilter);
    const base = {
      genreId,
      availableOnly,
      page: page - 1, // backend is 0-based
      size: PAGE_SIZE,
      sortBy: sb,
      sortDirection: sd,
    };
    if (search.trim()) {
      dispatch(searchBooks({ ...base, searchTerm: search.trim() }));
    } else {
      dispatch(fetchBooks(base));
    }
  };

  // Non-search filter changes → immediate fetch, reset to page 1
  useEffect(() => {
    setCurrentPage(1);
    doFetch(1, searchTerm, selectedGenreId, availabilityFilter, sortBy, sortDirection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenreId, availabilityFilter, sortBy, sortDirection]);

  // Search term → debounced fetch, reset to page 1
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      doFetch(1, searchTerm, selectedGenreId, availabilityFilter, sortBy, sortDirection);
    }, 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handlePageChange = (_, page) => {
    setCurrentPage(page);
    doFetch(page, searchTerm, selectedGenreId, availabilityFilter, sortBy, sortDirection);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (value) => {
    const [field, dir] = value.split('-');
    setSortBy(field);
    setSortDirection(dir.toUpperCase());
  };

  const handleClearAll = () => {
    setSearchTerm('');
    setSelectedGenreId(null);
    setAvailabilityFilter('ALL');
    setSortBy('createdAt');
    setSortDirection('DESC');
    setCurrentPage(1);
  };

  const findGenreName = (genres, id) => {
    for (const g of (genres || [])) {
      if (g.id === id) return g.name;
      const found = findGenreName(g.children, id);
      if (found) return found;
    }
    return null;
  };

  const hasFilters = searchTerm || selectedGenreId || availabilityFilter !== 'ALL';
  const currentSortValue = `${sortBy}-${sortDirection.toLowerCase()}`;

  const availabilityOptions = [
    { value: 'ALL',         label: 'All Books',    dot: 'bg-gray-400'  },
    { value: 'AVAILABLE',   label: 'Available',    dot: 'bg-green-500' },
    { value: 'CHECKED_OUT', label: 'Checked Out',  dot: 'bg-red-500'   },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Browse Our{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Collection
            </span>
          </h1>
          <p className="text-lg text-gray-600">Discover thousands of books across all genres</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar ─────────────────────────────────────────── */}
          <aside className="lg:w-72 flex-shrink-0 space-y-4">
            <div className="lg:hidden">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl shadow-md border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <FilterListIcon />
                {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            <div className={`space-y-4 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
              {/* Genre filter */}
              {genresLoading ? (
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 animate-pulse space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                  {[1,2,3].map(i => <div key={i} className="h-4 bg-gray-200 rounded" />)}
                </div>
              ) : (
                <GenreFilter
                  genres={genreHierarchy}
                  selectedGenreId={selectedGenreId}
                  onGenreSelect={setSelectedGenreId}
                />
              )}

              {/* Availability filter */}
              <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  Availability
                </h3>
                <div className="space-y-2">
                  {availabilityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAvailabilityFilter(opt.value)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                        availabilityFilter === opt.value
                          ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-300'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${opt.dot}`} />
                      {opt.label}
                      {availabilityFilter === opt.value && (
                        <span className="ml-auto text-indigo-500 text-xs font-bold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear all */}
              {hasFilters && (
                <button
                  onClick={handleClearAll}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  <ClearIcon sx={{ fontSize: 16 }} />
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* ── Main ────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0 space-y-5">
            {/* Search + Sort */}
            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <TextField
                    fullWidth
                    placeholder="Search by title, author, or ISBN…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon className="text-gray-400" />
                        </InputAdornment>
                      ),
                      endAdornment: searchTerm ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setSearchTerm('')}>
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#4F46E5' },
                        '&.Mui-focused fieldset': { borderColor: '#4F46E5' },
                      },
                    }}
                  />
                </div>
                <div className="md:w-56">
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={currentSortValue}
                      onChange={(e) => handleSortChange(e.target.value)}
                      label="Sort By"
                      startAdornment={
                        <InputAdornment position="start">
                          <SortIcon className="text-gray-400" />
                        </InputAdornment>
                      }
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4F46E5' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4F46E5' },
                      }}
                    >
                      <MenuItem value="title-asc">Title (A–Z)</MenuItem>
                      <MenuItem value="title-desc">Title (Z–A)</MenuItem>
                      <MenuItem value="author-asc">Author (A–Z)</MenuItem>
                      <MenuItem value="author-desc">Author (Z–A)</MenuItem>
                      <MenuItem value="createdAt-desc">Newest First</MenuItem>
                      <MenuItem value="createdAt-asc">Oldest First</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>

              {/* Active filter chips */}
              {hasFilters && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                  {searchTerm && (
                    <Chip
                      label={`Search: "${searchTerm}"`}
                      size="small"
                      onDelete={() => setSearchTerm('')}
                      sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', '& .MuiChip-deleteIcon': { color: '#4F46E5' } }}
                    />
                  )}
                  {selectedGenreId && (
                    <Chip
                      label={`Genre: ${findGenreName(genreHierarchy, selectedGenreId) || 'Selected'}`}
                      size="small"
                      onDelete={() => setSelectedGenreId(null)}
                      sx={{ bgcolor: '#F3E8FF', color: '#7C3AED', '& .MuiChip-deleteIcon': { color: '#7C3AED' } }}
                    />
                  )}
                  {availabilityFilter !== 'ALL' && (
                    <Chip
                      label={availabilityFilter === 'AVAILABLE' ? 'Available Only' : 'Checked Out Only'}
                      size="small"
                      onDelete={() => setAvailabilityFilter('ALL')}
                      sx={{
                        bgcolor: availabilityFilter === 'AVAILABLE' ? '#DCFCE7' : '#FEE2E2',
                        color:   availabilityFilter === 'AVAILABLE' ? '#15803D' : '#DC2626',
                        '& .MuiChip-deleteIcon': {
                          color: availabilityFilter === 'AVAILABLE' ? '#15803D' : '#DC2626',
                        },
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Results count */}
            {!loading && (
              <div className="flex items-center justify-between text-sm text-gray-500 px-1">
                <span>
                  {totalElements > 0
                    ? `Showing ${books.length} of ${totalElements} book${totalElements !== 1 ? 's' : ''}`
                    : 'No books found'}
                </span>
                {totalPages > 1 && <span>Page {currentPage} of {totalPages}</span>}
              </div>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <BookSkeletonGrid count={PAGE_SIZE} />
              </div>
            ) : books.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {books.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center pt-4">
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      shape="rounded"
                      size="large"
                      sx={{
                        '& .MuiPaginationItem-root': { fontWeight: 600 },
                        '& .Mui-selected': { bgcolor: '#4F46E5 !important', color: 'white' },
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl shadow-md border border-gray-100">
                <SearchIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Books Found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filters.</p>
                {hasFilters && (
                  <button
                    onClick={handleClearAll}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default BooksPage;
