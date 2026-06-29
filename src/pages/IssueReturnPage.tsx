import { useEffect, useState } from 'react';
import { BookOpen, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { apiFetch } from '../lib/api';
import { Book, BookIssue, Profile } from '../types';

type Tab = 'issue' | 'return';

interface FormState {
  student_id: string;
  book_id: string;
  issue_date: string;
  notes: string;
}

interface ReturnFormState {
  return_issue_id: string;
  return_date: string;
  notes: string;
}

export function IssueReturnPage() {
  const [tab, setTab] = useState<Tab>('issue');
  const [books, setBooks] = useState<Book[]>([]);
  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);

  const [issueForm, setIssueForm] = useState<FormState>({
    student_id: '',
    book_id: '',
    issue_date: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [issueErrors, setIssueErrors] = useState<Partial<FormState>>({});
  const [issueSuccess, setIssueSuccess] = useState(false);
  const [issueLoading, setIssueLoading] = useState(false);

  const [returnForm, setReturnForm] = useState<ReturnFormState>({
    return_issue_id: '',
    return_date: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [returnSuccess, setReturnSuccess] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);

  const loadData = async () => {
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
      console.error('Failed to load data:', error);
      setBooks([]);
      setIssues([]);
      setStudents([]);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const validateIssue = () => {
    const errors: Partial<FormState> = {};
    if (!issueForm.student_id) errors.student_id = 'Please select a student';
    if (!issueForm.book_id) errors.book_id = 'Please select a book';
    if (!issueForm.issue_date) {
      errors.issue_date = 'Issue date is required';
    } else {
      // Validate issue date is today or in the past
      const issueDate = new Date(issueForm.issue_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (issueDate > today) {
        errors.issue_date = 'Issue date cannot be in the future';
      }
    }
    setIssueErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateIssue()) return;
    setIssueLoading(true);
    try {
      await apiFetch<BookIssue>('/issues', {
        method: 'POST',
        body: JSON.stringify({
          student_id: Number(issueForm.student_id),
          book_id: Number(issueForm.book_id),
          issue_date: issueForm.issue_date,
          notes: issueForm.notes,
        }),
      });
      setIssueSuccess(true);
      setIssueForm({ student_id: '', book_id: '', issue_date: new Date().toISOString().slice(0, 10), notes: '' });
      setIssueErrors({});
      await loadData();
      setTimeout(() => setIssueSuccess(false), 4000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to issue book';
      setIssueErrors({ student_id: message });
    } finally {
      setIssueLoading(false);
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnForm.return_issue_id) return;
    setReturnLoading(true);
    try {
      await apiFetch<BookIssue>(`/issues/${returnForm.return_issue_id}/return`, {
        method: 'PUT',
        body: JSON.stringify({
          return_date: returnForm.return_date,
          notes: returnForm.notes,
        }),
      });
      setReturnSuccess(true);
      setReturnForm({ return_issue_id: '', return_date: new Date().toISOString().slice(0, 10), notes: '' });
      await loadData();
      setTimeout(() => setReturnSuccess(false), 4000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to return book';
      console.error('Return book error:', error);
      alert(message);
    } finally {
      setReturnLoading(false);
    }
  };

  const selectedBook = books.find(b => b.id === issueForm.book_id);
  const selectedStudent = students.find(s => s.id === issueForm.student_id);
  const dueDate = issueForm.issue_date
    ? new Date(new Date(issueForm.issue_date).getTime() + 14 * 86400000).toISOString().slice(0, 10)
    : '';

  const selectedIssue = issues.find(i => i.id === returnForm.return_issue_id);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Issue & Return</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage book borrowing and returns</p>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setTab('issue')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            tab === 'issue' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen size={16} />
          Issue Book
        </button>
        <button
          onClick={() => setTab('return')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            tab === 'return' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <RotateCcw size={16} />
          Return Book
        </button>
      </div>

      {tab === 'issue' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-slate-900 mb-5">Issue Book Form</h2>

              {issueSuccess && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 mb-5">
                  <CheckCircle size={18} />
                  <div>
                    <p className="font-semibold text-sm">Book issued successfully!</p>
                    <p className="text-xs mt-0.5">The student has been notified.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleIssue} className="space-y-4">
                <Select
                  label="Student"
                  value={issueForm.student_id}
                  onChange={e => { setIssueForm(f => ({ ...f, student_id: e.target.value })); setIssueErrors(err => ({ ...err, student_id: '' })); }}
                  options={[
                    { value: '', label: 'Select a student...' },
                    ...students.map(s => ({ value: s.id, label: `${s.full_name} - ${s.id}` }))
                  ]}
                  error={issueErrors.student_id}
                />

                <Select
                  label="Book"
                  value={issueForm.book_id}
                  onChange={e => { setIssueForm(f => ({ ...f, book_id: e.target.value })); setIssueErrors(err => ({ ...err, book_id: '' })); }}
                  options={[
                    { value: '', label: 'Select a book...' },
                    ...books.filter(b => b.available_copies > 0).map(b => ({
                      value: b.id,
                      label: `${b.title} (${b.available_copies} available)`
                    }))
                  ]}
                  error={issueErrors.book_id}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Issue Date"
                    type="date"
                    value={issueForm.issue_date}
                    onChange={e => { setIssueForm(f => ({ ...f, issue_date: e.target.value })); setIssueErrors(err => ({ ...err, issue_date: '' })); }}
                    error={issueErrors.issue_date}
                  />
                  <Input
                    label="Due Date (auto)"
                    type="date"
                    value={dueDate}
                    readOnly
                    className="bg-slate-50 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Notes (optional)</label>
                  <textarea
                    value={issueForm.notes}
                    onChange={e => setIssueForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Any special notes..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all px-4 py-2.5 resize-none"
                  />
                </div>

                <Button type="submit" size="lg" loading={issueLoading} className="w-full" icon={<BookOpen size={16} />}>
                  Issue Book
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {(selectedBook || selectedStudent) && (
              <Card padding="md">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Preview</h3>
                {selectedStudent && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {selectedStudent.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{selectedStudent.full_name}</p>
                      <p className="text-xs text-slate-500">{selectedStudent.email}</p>
                    </div>
                  </div>
                )}
                {selectedBook && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <div className="w-10 h-12 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                      <img src={selectedBook.cover_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{selectedBook.title}</p>
                      <p className="text-xs text-slate-500">{selectedBook.author}</p>
                      <Badge variant="success" size="sm" className="mt-1">{selectedBook.available_copies} available</Badge>
                    </div>
                  </div>
                )}
                {dueDate && (
                  <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-xs text-blue-600 font-medium">Return due date</p>
                    <p className="text-sm font-bold text-blue-800 mt-0.5">{dueDate}</p>
                  </div>
                )}
              </Card>
            )}

            <Card padding="md">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Currently Issued</h3>
              <div className="space-y-2.5">
                {issues.slice(0, 4).map((issue) => (
                  <div key={issue.id} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={issue.book?.cover_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">{issue.book?.title}</p>
                      <p className="text-xs text-slate-400">Due: {issue.due_date}</p>
                    </div>
                    <Badge variant={issue.status === 'overdue' ? 'error' : 'warning'} size="sm">
                      {issue.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'return' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-slate-900 mb-5">Return Book Form</h2>

              {returnSuccess && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 mb-5">
                  <CheckCircle size={18} />
                  <div>
                    <p className="font-semibold text-sm">Book returned successfully!</p>
                    <p className="text-xs mt-0.5">Inventory has been updated.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleReturn} className="space-y-4">
                <Select
                  label="Select Issue Record"
                  value={returnForm.return_issue_id}
                  onChange={e => setReturnForm(f => ({ ...f, return_issue_id: e.target.value }))}
                  options={[
                    { value: '', label: 'Select an issue record...' },
                    ...issues.filter(i => i.status !== 'returned').map(i => ({
                      value: i.id,
                      label: `${i.book?.title} - Due: ${i.due_date}`
                    }))
                  ]}
                />

                <Input
                  label="Return Date"
                  type="date"
                  value={returnForm.return_date}
                  onChange={e => setReturnForm(f => ({ ...f, return_date: e.target.value }))}
                />

                {selectedIssue && (
                  <div className={`p-3 rounded-xl border text-sm ${
                    selectedIssue.status === 'overdue'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      {selectedIssue.status === 'overdue'
                        ? <AlertCircle size={16} />
                        : <CheckCircle size={16} />
                      }
                      <span className="font-medium">
                        {selectedIssue.status === 'overdue'
                          ? 'This book is overdue. Fine may be applicable.'
                          : 'Book is being returned on time.'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Notes (optional)</label>
                  <textarea
                    value={returnForm.notes}
                    onChange={e => setReturnForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Book condition, damage notes..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all px-4 py-2.5 resize-none"
                  />
                </div>

                <Button type="submit" size="lg" loading={returnLoading} className="w-full" icon={<RotateCcw size={16} />}>
                  Process Return
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card padding="md">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">All Active Issues</h3>
              <div className="space-y-2.5">
                {issues.map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => setReturnForm(f => ({ ...f, return_issue_id: issue.id }))}
                    className={`w-full flex items-center gap-2.5 p-3 rounded-xl text-left transition-all ${
                      returnForm.return_issue_id === issue.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-slate-50 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <div className="w-9 h-11 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                      <img src={issue.book?.cover_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">{issue.book?.title}</p>
                      <p className="text-xs text-slate-500">Issued: {issue.issue_date}</p>
                      <p className="text-xs text-slate-500">Due: {issue.due_date}</p>
                    </div>
                    <Badge
                      variant={issue.status === 'overdue' ? 'error' : 'warning'}
                      size="sm"
                      dot
                    >
                      {issue.status}
                    </Badge>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
