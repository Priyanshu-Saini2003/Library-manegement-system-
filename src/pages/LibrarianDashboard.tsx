import { useEffect, useState } from 'react';
import { BookOpen, Users, ArrowLeftRight, TrendingUp, Plus, CreditCard as Edit2, Trash2, Search, ChevronRight, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { apiFetch } from '../lib/api';
import { Book, BookIssue, Profile } from '../types';

const CATEGORIES = ['All', 'Fiction', 'Science', 'History', 'Technology', 'General'];

export function LibrarianDashboard() {
  const { navigate } = useApp();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [deleteBook, setDeleteBook] = useState<Book | null>(null);
  const [issueOpen, setIssueOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [form, setForm] = useState({ title: '', author: '', category: 'Fiction', isbn: '', total_copies: '1', published_year: '', publisher: '' });
  const [issueForm, setIssueForm] = useState({ student_id: '', book_id: '', issue_date: new Date().toISOString().slice(0, 10) });
  const [formError, setFormError] = useState('');

  const loadDashboard = async () => {
    try {
      const [bookData, issueData, studentData] = await Promise.all([
        apiFetch<Book[]>('/books'),
        apiFetch<BookIssue[]>('/issues'),
        apiFetch<Profile[]>('/students'),
      ]);
      setBooks(Array.isArray(bookData) ? bookData : []);
      setIssues(Array.isArray(issueData) ? issueData : []);
      setStudents(Array.isArray(studentData) ? studentData : []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setFormError('Failed to load dashboard data');
      setBooks([]);
      setIssues([]);
      setStudents([]);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const filteredBooks = books.filter(b =>
    !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.title || !form.author) { setFormError('Title and author are required.'); return; }
    const payload = {
      title: form.title,
      author: form.author,
      category: form.category,
      isbn: form.isbn,
      total_copies: parseInt(form.total_copies) || 1,
      available_copies: parseInt(form.total_copies) || 1,
      published_year: form.published_year ? parseInt(form.published_year) : undefined,
      publisher: form.publisher,
      description: editBook?.description ?? '',
      cover_url: editBook?.cover_url,
      popularity_score: editBook?.popularity_score ?? 0,
    };

    if (editBook) {
      await apiFetch<Book>(`/books/${editBook.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setEditBook(null);
    } else {
      await apiFetch<Book>('/books', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setAddOpen(false);
    }
    await loadDashboard();
    setForm({ title: '', author: '', category: 'Fiction', isbn: '', total_copies: '1', published_year: '', publisher: '' });
    setFormError('');
  };

  const handleIssueBook = async () => {
    if (!issueForm.book_id || !issueForm.student_id) return;
    await apiFetch<BookIssue>('/issues', {
      method: 'POST',
      body: JSON.stringify({
        book_id: Number(issueForm.book_id),
        student_id: Number(issueForm.student_id),
        issue_date: issueForm.issue_date,
      }),
    });
    setIssueOpen(false);
    setIssueForm({ student_id: '', book_id: '', issue_date: new Date().toISOString().slice(0, 10) });
    await loadDashboard();
  };

  const statCards = [
    { label: 'Total Books', value: books.length, change: 'In catalog', icon: BookOpen, color: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Issued Books', value: issues.filter(i => i.status !== 'returned').length, change: `${issues.filter(i => i.status === 'overdue').length} overdue`, icon: ArrowLeftRight, color: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600' },
    { label: 'Active Users', value: students.length, change: 'Registered students', icon: Users, color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
    { label: 'Total Copies', value: books.reduce((a, b) => a + b.total_copies, 0), change: `${books.reduce((a, b) => a + b.available_copies, 0)} available`, icon: TrendingUp, color: 'bg-sky-500', light: 'bg-sky-50', text: 'text-sky-600' },
  ];

  const openEdit = (book: Book) => {
    setEditBook(book);
    setForm({
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn ?? '',
      total_copies: book.total_copies.toString(),
      published_year: book.published_year?.toString() ?? '',
      publisher: book.publisher ?? '',
    });
  };

  const BookFormContent = () => (
    <div className="space-y-4">
      {formError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{formError}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Book title" />
        <Input label="Author *" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="Author name" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Category"
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          options={CATEGORIES.filter(c => c !== 'All').map(c => ({ value: c, label: c }))}
        />
        <Input label="ISBN" value={form.isbn} onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))} placeholder="978-..." />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="Total Copies" type="number" min="1" value={form.total_copies} onChange={e => setForm(f => ({ ...f, total_copies: e.target.value }))} />
        <Input label="Published Year" type="number" value={form.published_year} onChange={e => setForm(f => ({ ...f, published_year: e.target.value }))} placeholder="2024" />
        <Input label="Publisher" value={form.publisher} onChange={e => setForm(f => ({ ...f, publisher: e.target.value }))} placeholder="Publisher name" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Librarian Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Overview and management of the library system</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.change}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${stat.light} flex items-center justify-center`}>
                <stat.icon size={20} className={stat.text} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Book Inventory</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button size="sm" icon={<Plus size={14} />} onClick={() => setAddOpen(true)}>
                  Add Book
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Book</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-3 py-3 hidden sm:table-cell">Category</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-3 py-3 hidden md:table-cell">Copies</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-3 py-3">Status</th>
                    <th className="text-right text-xs font-medium text-slate-500 px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredBooks.slice(0, 8).map((book) => (
                    <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-10 rounded overflow-hidden bg-slate-100 flex-shrink-0">
                            <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate max-w-[140px]">{book.title}</p>
                            <p className="text-xs text-slate-500 truncate max-w-[140px]">{book.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <Badge variant="blue" size="sm">{book.category}</Badge>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <span className="text-sm text-slate-700">{book.available_copies}/{book.total_copies}</span>
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          variant={book.available_copies === 0 ? 'error' : book.available_copies < book.total_copies / 2 ? 'warning' : 'success'}
                          dot
                          size="sm"
                        >
                          {book.available_copies === 0 ? 'Out' : 'Available'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(book)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteBook(book)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">Showing {Math.min(8, filteredBooks.length)} of {filteredBooks.length} books</span>
              <button onClick={() => navigate('books')} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View all <ChevronRight size={12} />
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Issue Book</h2>
              <Button size="sm" onClick={() => setIssueOpen(true)} icon={<Plus size={14} />}>Issue</Button>
            </div>
            <div className="space-y-3">
              {issues.slice(0, 4).map((issue) => (
                <div key={issue.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                    <img src={issue.book?.cover_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">{issue.book?.title}</p>
                    <p className="text-xs text-slate-500">Due: {issue.due_date}</p>
                  </div>
                  <Badge variant={issue.status === 'overdue' ? 'error' : 'warning'} size="sm">
                    {issue.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-blue-600" />
              <h2 className="font-semibold text-slate-900">Popular Books</h2>
            </div>
            <div className="space-y-3">
              {[...books].sort((a, b) => b.popularity_score - a.popularity_score).slice(0, 5).map((book, i) => (
                <div key={book.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-300 w-5">#{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-900 truncate">{book.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1.5 bg-slate-100 rounded-full flex-1 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${book.popularity_score}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 w-6">{book.popularity_score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-amber-600" />
              <h2 className="font-semibold text-slate-900">Recent Activity</h2>
            </div>
            <div className="space-y-2.5">
              {[
                { text: 'New student registered', time: '5m ago', color: 'bg-emerald-500' },
                { text: '"1984" returned by student', time: '2h ago', color: 'bg-blue-500' },
                { text: '"Clean Code" overdue alert', time: '4h ago', color: 'bg-red-500' },
                { text: '3 new books added', time: '1d ago', color: 'bg-amber-500' },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-slate-600">
                  <span className={`w-2 h-2 rounded-full ${a.color} flex-shrink-0`} />
                  <span className="flex-1">{a.text}</span>
                  <span className="text-slate-400">{a.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={addOpen}
        onClose={() => { setAddOpen(false); setFormError(''); }}
        title="Add New Book"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => { setAddOpen(false); setFormError(''); }}>Cancel</Button>
            <Button onClick={handleSave}>Add Book</Button>
          </>
        }
      >
        <BookFormContent />
      </Modal>

      <Modal
        open={!!editBook}
        onClose={() => { setEditBook(null); setFormError(''); }}
        title="Edit Book"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => { setEditBook(null); setFormError(''); }}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </>
        }
      >
        <BookFormContent />
      </Modal>

      <Modal
        open={!!deleteBook}
        onClose={() => setDeleteBook(null)}
        title="Delete Book"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteBook(null)}>Cancel</Button>
            <Button variant="danger" onClick={async () => {
              if (deleteBook) await apiFetch<void>(`/books/${deleteBook.id}`, { method: 'DELETE' });
              setDeleteBook(null);
              await loadDashboard();
            }}>Delete</Button>
          </>
        }
      >
        <p className="text-slate-600 text-sm">
          Are you sure you want to delete <span className="font-semibold text-slate-900">"{deleteBook?.title}"</span>? This action cannot be undone.
        </p>
      </Modal>

      <Modal
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        title="Issue Book to Student"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIssueOpen(false)}>Cancel</Button>
            <Button onClick={handleIssueBook}>Issue Book</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Select Student"
            value={issueForm.student_id}
            onChange={e => setIssueForm(f => ({ ...f, student_id: e.target.value }))}
            options={[
              { value: '', label: 'Choose a student...' },
              ...students.map(s => ({ value: s.id, label: `${s.full_name} (${s.id})` }))
            ]}
          />
          <Select
            label="Select Book"
            value={issueForm.book_id}
            onChange={e => setIssueForm(f => ({ ...f, book_id: e.target.value }))}
            options={[
              { value: '', label: 'Choose a book...' },
              ...books.filter(b => b.available_copies > 0).map(b => ({ value: b.id, label: `${b.title} (${b.available_copies} available)` }))
            ]}
          />
          <Input
            label="Issue Date"
            type="date"
            value={issueForm.issue_date}
            onChange={e => setIssueForm(f => ({ ...f, issue_date: e.target.value }))}
          />
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm">
            Return due date will be automatically set to 14 days from issue date.
          </div>
        </div>
      </Modal>
    </div>
  );
}
