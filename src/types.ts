export type UserRole = 'student' | 'librarian';

export type Page =
  | 'dashboard'
  | 'books'
  | 'issue-return'
  | 'ai-recommendations'
  | 'reports';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  student_id?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  category: string;
  description?: string;
  cover_url?: string;
  total_copies: number;
  available_copies: number;
  published_year?: number;
  publisher?: string;
  popularity_score: number;
  created_at: string;
  updated_at: string;
}

export interface BookIssue {
  id: string;
  book_id: string;
  student_id: string;
  issued_by?: string | null;
  issue_date: string;
  due_date: string;
  return_date?: string | null;
  status: 'issued' | 'returned' | 'overdue';
  notes?: string | null;
  created_at: string;
  updated_at: string;
  book?: Book;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  read: boolean;
  created_at: string;
}
