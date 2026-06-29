import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, BookOpen, Star, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { Book } from '../types';

const CATEGORIES = ['All', 'Fiction', 'Science', 'History', 'Technology', 'General'];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'title', label: 'Title A-Z' },
  { value: 'author', label: 'Author A-Z' },
  { value: 'year', label: 'Newest First' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'all', label: 'All Books' },
  { value: 'available', label: 'Available Only' },
  { value: 'unavailable', label: 'Unavailable' },
];

const PAGE_SIZE = 8;

export function BookCatalog() {
  const { profile } = useAuth();
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [availability, setAvailability] = useState('all');
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    apiFetch<Book[]>('/books')
      .then((data) => {
        setAllBooks(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error('Failed to load books:', error);
        setAllBooks([]);
      })
      .finally(() => setLoading(false));
  }, []);

  let books = [...allBooks];
  if (search) books = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()));
  if (category !== 'All') books = books.filter(b => b.category === category);
  if (availability === 'available') books = books.filter(b => b.available_copies > 0);
  if (availability === 'unavailable') books = books.filter(b => b.available_copies === 0);

  books.sort((a, b) => {
    if (sort === 'popular') return b.popularity_score - a.popularity_score;
    if (sort === 'title') return a.title.localeCompare(b.title);
    if (sort === 'author') return a.author.localeCompare(b.author);
    if (sort === 'year') return (b.published_year ?? 0) - (a.published_year ?? 0);
    return 0;
  });

  const totalPages = Math.ceil(books.length / PAGE_SIZE);
  const paginated = books.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  const handleRequestBorrow = async (book: Book) => {
    try {
      await apiFetch('/issues', {
        method: 'POST',
        body: JSON.stringify({ 
          book_id: Number(book.id), 
          issue_date: new Date().toISOString().slice(0, 10) 
        }),
      });
      const updated = await apiFetch<Book[]>('/books');
      if (Array.isArray(updated)) {
        setAllBooks(updated);
      }
      setSelectedBook(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to request book';
      alert(message);
      console.error('Request borrow error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Book Catalog</h1>
          <p className="text-slate-500 text-sm mt-0.5">{books.length} books found</p>
        </div>
        <Button variant="outline" icon={<SlidersHorizontal size={14} />} onClick={() => setFiltersOpen(true)}>
          Filters
        </Button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by title, author, or keyword..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-12 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              category === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[
            ...(category !== 'All' ? [{ key: 'category', label: category }] : []),
            ...(availability !== 'all' ? [{ key: 'availability', label: availability === 'available' ? 'Available' : 'Unavailable' }] : []),
          ].map((filter) => (
            <span key={filter.key} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
              {filter.label}
              <button onClick={() => {
                if (filter.key === 'category') setCategory('All');
                if (filter.key === 'availability') setAvailability('all');
              }}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Sort:</span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={48} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">{loading ? 'Loading books...' : 'No books found'}</p>
          {!loading && <p className="text-slate-400 text-sm">Try adjusting your filters or search term</p>}
          <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setCategory('All'); setAvailability('all'); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {paginated.map((book) => (
            <div
              key={book.id}
              onClick={() => setSelectedBook(book)}
              className="group cursor-pointer bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div className="aspect-[3/4] bg-slate-100 overflow-hidden">
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-slate-900 truncate">{book.title}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{book.author}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant={book.available_copies > 0 ? 'success' : 'error'} size="sm" dot>
                    {book.available_copies > 0 ? `${book.available_copies} left` : 'Out'}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-slate-500">{book.popularity_score}</span>
                  </div>
                </div>
                <Badge variant="blue" size="sm" className="mt-1.5">{book.category}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                page === p ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <Modal
        open={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        size="lg"
      >
        {selectedBook && (
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-full sm:w-40 aspect-[3/4] rounded-xl overflow-hidden bg-slate-100">
                <img src={selectedBook.cover_url} alt={selectedBook.title} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h2 className="text-xl font-bold text-slate-900">{selectedBook.title}</h2>
                <button onClick={() => setSelectedBook(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>
              <p className="text-slate-600 font-medium mb-3">by {selectedBook.author}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="blue">{selectedBook.category}</Badge>
                <Badge variant={selectedBook.available_copies > 0 ? 'success' : 'error'} dot>
                  {selectedBook.available_copies > 0 ? `${selectedBook.available_copies} of ${selectedBook.total_copies} available` : 'Not available'}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">{selectedBook.description}</p>
              <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                {selectedBook.isbn && (
                  <div>
                    <span className="text-slate-400 text-xs uppercase font-medium tracking-wider">ISBN</span>
                    <p className="text-slate-900 font-medium text-xs mt-0.5">{selectedBook.isbn}</p>
                  </div>
                )}
                {selectedBook.publisher && (
                  <div>
                    <span className="text-slate-400 text-xs uppercase font-medium tracking-wider">Publisher</span>
                    <p className="text-slate-900 font-medium text-xs mt-0.5">{selectedBook.publisher}</p>
                  </div>
                )}
                {selectedBook.published_year && (
                  <div>
                    <span className="text-slate-400 text-xs uppercase font-medium tracking-wider">Published</span>
                    <p className="text-slate-900 font-medium text-xs mt-0.5">{selectedBook.published_year}</p>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 text-xs uppercase font-medium tracking-wider">Popularity</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="h-1.5 bg-slate-100 rounded-full w-20 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selectedBook.popularity_score}%` }} />
                    </div>
                    <span className="text-slate-900 font-medium text-xs">{selectedBook.popularity_score}/100</span>
                  </div>
                </div>
              </div>
              {profile?.role === 'student' && selectedBook.available_copies > 0 && (
                <Button className="w-full sm:w-auto" icon={<BookOpen size={16} />} onClick={() => handleRequestBorrow(selectedBook)}>
                  Request to Borrow
                </Button>
              )}
              {profile?.role === 'librarian' && (
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">Edit Book</Button>
                  <Button size="sm" onClick={() => setSelectedBook(null)}>Issue to Student</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter Books"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => { setCategory('All'); setAvailability('all'); setFiltersOpen(false); }}>Reset</Button>
            <Button onClick={() => setFiltersOpen(false)}>Apply</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Category</p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                    category === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Availability</p>
            <div className="space-y-2">
              {AVAILABILITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setAvailability(opt.value)}
                  className={`w-full py-2 px-3 rounded-xl text-sm font-medium border transition-all text-left ${
                    availability === opt.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
