import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, BookOpen, Users, ArrowLeftRight, Download } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { apiFetch } from '../lib/api';
import { Book } from '../types';

interface ReportsResponse {
  summary: {
    total_books: number;
    available_books: number;
    issued_count: number;
    overdue_count: number;
    active_students: number;
    popularity_score: number;
  };
  monthly_issues: { month: string; count: number }[];
  category_stats: { category: string; issued: number; percentage: number }[];
}

export function ReportsPage() {
  const [reports, setReports] = useState<ReportsResponse | null>(null);
  const [topBooks, setTopBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<ReportsResponse>('/reports'),
      apiFetch<Book[]>('/books/trending'),
    ])
      .then(([reportData, bookData]) => {
        setReports(reportData);
        setTopBooks(Array.isArray(bookData) ? bookData : []);
      })
      .catch((error) => {
        console.error('Failed to load reports:', error);
        setReports(null);
        setTopBooks([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const summary = reports?.summary;
  const monthlyIssues = reports?.monthly_issues ?? [];
  const categoryStats = reports?.category_stats ?? [];
  const maxIssues = Math.max(1, ...monthlyIssues.map(m => m.count));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Library performance insights — May 2026</p>
        </div>
        <Button variant="outline" icon={<Download size={14} />}>
          Export Report
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500">Loading reports...</p>
          </div>
        </div>
      )}

      {!loading && (
        <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Books', value: summary?.total_books ?? 0, sub: `${summary?.available_books ?? 0} available`, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Issued This Month', value: summary?.issued_count ?? 0, sub: `${summary?.overdue_count ?? 0} overdue`, icon: ArrowLeftRight, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Active Students', value: summary?.active_students ?? 0, sub: 'Registered users', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Popularity Score', value: summary?.popularity_score ?? 0, sub: 'Avg across all books', icon: TrendingUp, color: 'text-sky-600', bg: 'bg-sky-50' },
        ].map((stat) => (
          <Card key={stat.label} padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={18} className={stat.color} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card padding="md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-slate-900">Monthly Issue Trend</h2>
                <p className="text-xs text-slate-500 mt-0.5">Books issued per month in 2025-26</p>
              </div>
              <Badge variant="success" dot>+18% vs last year</Badge>
            </div>
            <div className="flex items-end gap-1 h-48">
              {monthlyIssues.map((item) => (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                    {item.count}
                  </span>
                  <div
                    className="w-full bg-blue-100 rounded-t-lg overflow-hidden transition-all duration-300 group-hover:bg-blue-200 relative"
                    style={{ height: `${(item.count / maxIssues) * 100}%` }}
                  >
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-blue-600 rounded-t-lg transition-all duration-500"
                      style={{ height: `${(item.count / maxIssues) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{item.month}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card padding="md">
          <h2 className="font-semibold text-slate-900 mb-4">Issues by Category</h2>
          <div className="space-y-4">
            {categoryStats.map((cat) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-700">{cat.category}</span>
                  <span className="text-xs text-slate-500">{cat.issued} issued</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <div className="text-right mt-0.5">
                  <span className="text-xs text-slate-400">{cat.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="none">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Top Performing Books</h2>
            <p className="text-xs text-slate-500 mt-0.5">Ranked by issue count this month</p>
          </div>
          <div className="divide-y divide-slate-50">
            {topBooks.map((book, i) => (
              <div key={book.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                <span className="text-sm font-bold text-slate-300 w-5">#{i + 1}</span>
                <div className="w-8 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{book.title}</p>
                  <p className="text-xs text-slate-500 truncate">{book.author}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="h-1.5 bg-slate-100 rounded-full w-16 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${book.popularity_score}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 w-6">{book.popularity_score}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <h2 className="font-semibold text-slate-900 mb-4">Student Activity</h2>
          <div className="space-y-3 mb-5">
            {topBooks.slice(0, 4).map((book) => (
              <div key={book.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {book.title.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{book.title}</p>
                  <p className="text-xs text-slate-500">{book.author}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{book.popularity_score}</p>
                  <p className="text-xs text-slate-400">score</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={16} className="text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">Monthly Summary</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xl font-bold text-blue-900">129</p>
                <p className="text-xs text-blue-600">Total Issues</p>
              </div>
              <div>
                <p className="text-xl font-bold text-blue-900">112</p>
                <p className="text-xs text-blue-600">Returned</p>
              </div>
              <div>
                <p className="text-xl font-bold text-blue-900">{summary?.overdue_count ?? 0}</p>
                <p className="text-xs text-blue-600">Overdue</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
        </>
      )}
    </div>
  );
}
