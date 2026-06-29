import { useEffect, useState } from 'react';
import { Search, BookOpen, AlertTriangle, Clock, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { apiFetch } from '../lib/api';
import { Book, BookIssue } from '../types';

const CATEGORIES = ['All', 'Fiction', 'Science', 'History', 'Technology', 'General'];

interface Recommendation {
  book: Book;
  reason: string;
  confidence: number;
}

function getDaysUntilDue(dueDate: string) {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function StudentDashboard() {
  const { profile } = useAuth();
  const { navigate } = useApp();
  const [books, setBooks] = useState<Book[]>([]);
  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    Promise.all([
      apiFetch<Book[]>('/books'),
      apiFetch<BookIssue[]>('/issues/my'),
      apiFetch<Recommendation[]>('/recommendations'),
    ])
      .then(([bookData, issueData, recommendationData]) => {
        setBooks(Array.isArray(bookData) ? bookData : []);
        setIssues(Array.isArray(issueData) ? issueData : []);
        setRecommendations(Array.isArray(recommendationData) ? recommendationData : []);
      })
      .catch((error) => {
        console.error('Failed to load dashboard:', error);
        setBooks([]);
        setIssues([]);
        setRecommendations([]);
      });
  }, []);

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const filteredBooks = books.filter((b) => {
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || b.category === activeCategory;
    return matchSearch && matchCat;
  });

  const overdueIssues = issues.filter((i) => i.status === 'overdue');
  const activeIssues = issues.filter((i) => i.status === 'issued');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <p className="text-blue-100 text-sm font-medium">{greeting},</p>
              <h1 className="text-2xl font-bold mt-0.5">{firstName}!</h1>
              <p className="text-blue-200 text-sm mt-1">
                You have <span className="text-white font-semibold">{activeIssues.length} books</span> currently borrowed
                {overdueIssues.length > 0 && (
                  <> and <span className="text-red-300 font-semibold">{overdueIssues.length} overdue</span></>
                )}.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{books.filter(b => b.available_copies > 0).length}</p>
                <p className="text-blue-200 text-xs">Available</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{issues.length}</p>
                <p className="text-blue-200 text-xs">Borrowed</p>
              </div>
            </div>
          </div>
          {profile?.student_id && (
            <div className="mt-4 inline-flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
              <span className="text-blue-100 text-xs">Student ID:</span>
              <span className="text-white text-xs font-semibold">{profile.student_id}</span>
            </div>
          )}
        </div>
      </div>

      {overdueIssues.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-600" />
            <h2 className="font-semibold text-red-700">Overdue Books — Action Required</h2>
          </div>
          <div className="space-y-2">
            {overdueIssues.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-red-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <BookOpen size={14} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{issue.book?.title}</p>
                    <p className="text-xs text-red-600">Due: {issue.due_date}</p>
                  </div>
                </div>
                <Badge variant="error" dot>Overdue</Badge>
              </div>
            ))}
          </div>
          <Button variant="danger" size="sm" className="mt-3" onClick={() => navigate('issue-return')}>
            Return Books Now
          </Button>
        </div>
      )}

      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Search Books</h2>
        </div>
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredBooks.slice(0, 6).map((book) => (
            <div key={book.id} className="group cursor-pointer" onClick={() => navigate('books')}>
              <div className="aspect-[3/4] rounded-xl overflow-hidden mb-2 bg-slate-100">
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <p className="text-xs font-medium text-slate-900 truncate">{book.title}</p>
              <p className="text-xs text-slate-500 truncate">{book.author}</p>
              <Badge
                variant={book.available_copies > 0 ? 'success' : 'error'}
                size="sm"
              >
                {book.available_copies > 0 ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
          ))}
        </div>
        {filteredBooks.length > 6 && (
          <button
            onClick={() => navigate('books')}
            className="mt-4 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all {filteredBooks.length} books <ChevronRight size={14} />
          </button>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-blue-600" />
              <h2 className="font-semibold text-slate-900">Currently Borrowed</h2>
            </div>
            <Badge variant="blue">{issues.length}</Badge>
          </div>
          <div className="space-y-3">
            {issues.map((issue) => {
              const days = getDaysUntilDue(issue.due_date);
              const isOverdue = days < 0;
              const isDueSoon = days >= 0 && days <= 3;
              return (
                <div key={issue.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-12 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                    <img src={issue.book?.cover_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{issue.book?.title}</p>
                    <p className="text-xs text-slate-500">Due: {issue.due_date}</p>
                  </div>
                  <Badge
                    variant={isOverdue ? 'error' : isDueSoon ? 'warning' : 'success'}
                    dot
                  >
                    {isOverdue ? `${Math.abs(days)}d late` : isDueSoon ? `${days}d left` : 'On time'}
                  </Badge>
                </div>
              );
            })}
          </div>
          <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => navigate('issue-return')}>
            Manage Returns
          </Button>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-blue-600" />
              <h2 className="font-semibold text-slate-900">AI Picks for You</h2>
            </div>
            <button
              onClick={() => navigate('ai-recommendations')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {recommendations.slice(0, 4).map((rec, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="w-10 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  <img src={rec.book.cover_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{rec.book.title}</p>
                  <p className="text-xs text-slate-500 truncate">{rec.reason}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-semibold text-blue-600">{rec.confidence}%</div>
                  <div className="text-xs text-slate-400">match</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card padding="md">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-blue-600" />
          <h2 className="font-semibold text-slate-900">Trending This Week</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...books].sort((a, b) => b.popularity_score - a.popularity_score).slice(0, 3).map((book, i) => (
            <div key={book.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => navigate('books')}>
              <span className="text-2xl font-bold text-slate-200 w-8">#{i + 1}</span>
              <div className="w-10 h-12 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{book.title}</p>
                <p className="text-xs text-slate-500">{book.author}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="h-1 bg-slate-200 rounded-full w-16 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${book.popularity_score}%` }} />
                  </div>
                  <span className="text-xs text-slate-400">{book.popularity_score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
