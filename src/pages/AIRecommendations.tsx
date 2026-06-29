import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Brain, BookOpen, ChevronRight, Star, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { apiFetch } from '../lib/api';
import { Book } from '../types';

const READING_HISTORY = [
  { category: 'Technology', count: 8, percentage: 40 },
  { category: 'Science', count: 5, percentage: 25 },
  { category: 'Fiction', count: 4, percentage: 20 },
  { category: 'History', count: 3, percentage: 15 },
];

interface Recommendation {
  book: Book;
  reason: string;
  confidence: number;
}

export function AIRecommendations() {
  const { navigate } = useApp();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [trending, setTrending] = useState<Book[]>([]);

  useEffect(() => {
    Promise.all([
      apiFetch<Recommendation[]>('/recommendations'),
      apiFetch<Book[]>('/books/trending'),
    ]).then(([recommendationData, trendingData]) => {
      setRecommendations(Array.isArray(recommendationData) ? recommendationData : []);
      setTrending(Array.isArray(trendingData) ? trendingData : []);
    }).catch((error) => {
      console.error('Failed to load recommendations:', error);
      setRecommendations([]);
      setTrending([]);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0ibTM2IDM0djZoLTEydi02ek0zNiAyNHY2aC0xMnYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
                <Sparkles size={18} className="text-blue-300" />
              </div>
              <Badge variant="blue" size="sm">AI-Powered</Badge>
            </div>
            <h1 className="text-2xl font-bold">Personalized Recommendations</h1>
            <p className="text-blue-200/80 text-sm mt-1">
              Based on your reading history and preferences, our AI has curated these books just for you.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">98%</p>
              <p className="text-blue-300 text-xs">Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">20</p>
              <p className="text-blue-300 text-xs">Total reads</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Recommended For You</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                onClick={() => navigate('books')}
              >
                <div className="flex gap-4 p-4">
                  <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={rec.book.cover_url}
                      alt={rec.book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 leading-tight">{rec.book.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{rec.book.author}</p>
                      </div>
                      <Badge variant="blue" size="sm">{rec.confidence}%</Badge>
                    </div>
                    <Badge variant="default" size="sm" className="mt-2">{rec.book.category}</Badge>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <Brain size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700 leading-relaxed">{rec.reason}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs text-slate-500">{rec.book.popularity_score}/100 popularity</span>
                    </div>
                    <Badge
                      variant={rec.book.available_copies > 0 ? 'success' : 'error'}
                      size="sm"
                      dot
                    >
                      {rec.book.available_copies > 0 ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card padding="md">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={16} className="text-blue-600" />
              <h2 className="font-semibold text-slate-900">How It Works</h2>
            </div>
            <div className="space-y-3">
              {[
                { step: '01', title: 'Reading History', desc: 'We analyze the books you have borrowed and read.' },
                { step: '02', title: 'Pattern Matching', desc: 'Our AI identifies your preferred genres and authors.' },
                { step: '03', title: 'Collaborative Filter', desc: 'Students with similar tastes help expand your list.' },
                { step: '04', title: 'Smart Ranking', desc: 'Books are ranked by relevance score and availability.' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} className="text-blue-600" />
              <h2 className="font-semibold text-slate-900">Your Reading Profile</h2>
            </div>
            <div className="space-y-3">
              {READING_HISTORY.map((item) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">{item.category}</span>
                    <span className="text-xs text-slate-500">{item.count} books</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-amber-500" />
                <p className="text-xs font-semibold text-slate-700">Top Interest</p>
              </div>
              <p className="text-sm font-bold text-slate-900">Technology & Science</p>
              <p className="text-xs text-slate-500 mt-0.5">65% of your reading history</p>
            </div>
          </Card>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Trending This Week</h2>
          </div>
          <button
            onClick={() => navigate('books')}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View catalog <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {trending.map((book, i) => (
            <div
              key={book.id}
              className="group cursor-pointer"
              onClick={() => navigate('books')}
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 mb-2">
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute top-2 left-2 w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{i + 1}</span>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <div className="flex items-center gap-1">
                    <div className="h-1 bg-white/30 rounded-full flex-1">
                      <div className="h-full bg-white rounded-full" style={{ width: `${book.popularity_score}%` }} />
                    </div>
                    <span className="text-white text-xs font-semibold">{book.popularity_score}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-900 truncate">{book.title}</p>
              <p className="text-xs text-slate-500 truncate">{book.author}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
