import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { LibrarianDashboard } from './pages/LibrarianDashboard';
import { BookCatalog } from './pages/BookCatalog';
import { IssueReturnPage } from './pages/IssueReturnPage';
import { AIRecommendations } from './pages/AIRecommendations';
import { ReportsPage } from './pages/ReportsPage';

function AppContent() {
  const { profile, loading } = useAuth();
  const { currentPage } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading LibraryOS...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return profile.role === 'librarian' ? <LibrarianDashboard /> : <StudentDashboard />;
      case 'books':
        return <BookCatalog />;
      case 'issue-return':
        return <IssueReturnPage />;
      case 'ai-recommendations':
        return <AIRecommendations />;
      case 'reports':
        return profile.role === 'librarian' ? <ReportsPage /> : <StudentDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
