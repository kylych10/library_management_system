import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FilterListIcon from '@mui/icons-material/FilterList';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const API = import.meta.env.VITE_API_BASE_URL || 'https://librarymanagementsystem-production-fc6e.up.railway.app';

const PublicBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const debounceRef = useRef(null);
  const PAGE_SIZE = 12;

  const fetchBooks = async (search = '', genreId = null, p = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, size: PAGE_SIZE, sortBy: 'createdAt', sortDirection: 'DESC' });
      if (search) params.append('search', search);
      if (genreId) params.append('genreId', genreId);
      const { data } = await axios.get(`${API}/api/books?${params}`);
      setBooks(data.content || data.books || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const { data } = await axios.get(`${API}/api/genres/active`);
      setGenres(Array.isArray(data) ? data : (data.content || []));
    } catch (e) {}
  };

  useEffect(() => { fetchGenres(); fetchBooks(); }, []);

  const handleSearch = (val) => {
    setSearchTerm(val);
    setPage(0);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchBooks(val, selectedGenre, 0), 400);
  };

  const handleGenre = (id) => {
    const next = id === selectedGenre ? null : id;
    setSelectedGenre(next);
    setPage(0);
    fetchBooks(searchTerm, next, 0);
  };

  const handlePage = (p) => {
    setPage(p);
    fetchBooks(searchTerm, selectedGenre, p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const BookCard = ({ book }) => (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1 flex flex-col">
      <div className="relative h-56 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
        {book.coverImageUrl ? (
          <img src={book.coverImageUrl} alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MenuBookIcon sx={{ fontSize: 72, color: '#4F46E5', opacity: 0.25 }} />
          </div>
        )}
        <div className="absolute top-3 right-3">
          {book.availableCopies > 0 ? (
            <span className="flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
              <CheckCircleIcon sx={{ fontSize: 13 }} /> Available
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
              <CancelIcon sx={{ fontSize: 13 }} /> Checked Out
            </span>
          )}
        </div>
        {book.genreName && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-indigo-600 text-xs font-medium px-3 py-1 rounded-full shadow">
              {book.genreName}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
          {book.title}
        </h3>
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
          <PersonIcon sx={{ fontSize: 14 }} />
          <span className="line-clamp-1">{book.author}</span>
        </div>
        <div className="text-xs text-gray-400 mb-3">
          {book.availableCopies}/{book.totalCopies} copies available
        </div>
        {book.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">{book.description}</p>
        )}
        <div className="mt-auto">
          <Link to="/register"
            className="block w-full text-center py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
            <span className='text-white'>Sign up to Borrow</span>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Banner */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <MenuBookIcon sx={{ fontSize: 16 }} />
            <span>{totalElements.toLocaleString()} books available</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Browse Our{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Collection
            </span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Explore thousands of books across all genres.{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Sign up for free</Link>{' '}
            to start borrowing today.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, author, or ISBN…"
              value={searchTerm}
              onChange={e => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>
      </section>

      {/* Genres */}
      {genres.length > 0 && (
        <section className="bg-white border-b border-gray-100 sticky top-16 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => handleGenre(null)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                !selectedGenre ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Genres
            </button>
            {genres.map(g => (
              <button
                key={g.id}
                onClick={() => handleGenre(g.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedGenre === g.id ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Books Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <MenuBookIcon sx={{ fontSize: 64, color: '#D1D5DB' }} />
            <p className="text-gray-500 mt-4 text-lg">No books found.</p>
            <button onClick={() => { setSearchTerm(''); setSelectedGenre(null); fetchBooks(); }}
              className="mt-4 text-indigo-600 font-medium hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              Showing {books.length} of {totalElements} books
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map(b => <BookCard key={b.id} book={b} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button disabled={page === 0} onClick={() => handlePage(page - 1)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  Previous
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                  return (
                    <button key={p} onClick={() => handlePage(p)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                        page === p ? 'bg-indigo-600 text-white shadow' : 'border border-gray-200 hover:bg-gray-50'
                      }`}>
                      {p + 1}
                    </button>
                  );
                })}
                <button disabled={page === totalPages - 1} onClick={() => handlePage(page + 1)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to start reading?</h2>
          <p className="text-indigo-100 mb-8 text-lg">
            Create a free account and borrow books from our collection today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-indigo-600">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white  font-semibold rounded-xl hover:bg-indigo-50 transition-all shadow-lg">
              Get Started Free <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-white  font-semibold rounded-xl hover:bg-white/10 transition-all">
              <span className='text-white'>Sign In</span>
              
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PublicBooksPage;
