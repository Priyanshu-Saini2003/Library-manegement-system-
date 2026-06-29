import { BookOpen, LayoutDashboard, ArrowLeftRight, Sparkles, BarChart3, X, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Page } from '../../types';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
  roles: ('student' | 'librarian')[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, roles: ['student', 'librarian'] },
  { id: 'books', label: 'Book Catalog', icon: <BookOpen size={18} />, roles: ['student', 'librarian'] },
  { id: 'issue-return', label: 'Issue / Return', icon: <ArrowLeftRight size={18} />, roles: ['student', 'librarian'] },
  { id: 'ai-recommendations', label: 'AI Recommendations', icon: <Sparkles size={18} />, roles: ['student', 'librarian'] },
  { id: 'reports', label: 'Reports', icon: <BarChart3 size={18} />, roles: ['librarian'] },
];

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const { currentPage, navigate, sidebarOpen, setSidebarOpen } = useApp();

  const role = profile?.role ?? 'student';
  const items = NAV_ITEMS.filter((i) => i.roles.includes(role));

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-16'}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 flex-shrink-0">
          <div className={`flex items-center gap-2.5 overflow-hidden transition-all duration-200 ${!sidebarOpen ? 'lg:opacity-0' : ''}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm whitespace-nowrap">LibraryOS</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors lg:hidden"
          >
            <X size={16} />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft size={16} className={`transition-transform duration-200 ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-0.5">
            {items.map((item) => {
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { navigate(item.id); setSidebarOpen(window.innerWidth >= 1024 ? sidebarOpen : false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                    ${active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <span className={`flex-shrink-0 transition-colors ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {item.icon}
                  </span>
                  <span className={`whitespace-nowrap transition-all duration-200 ${!sidebarOpen ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : ''}`}>
                    {item.label}
                  </span>
                  {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </nav>

        <div className={`p-4 border-t border-slate-200 ${!sidebarOpen ? 'lg:px-2' : ''}`}>
          <div className={`flex items-center gap-3 mb-3 ${!sidebarOpen ? 'lg:justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold">
              {profile?.full_name?.charAt(0) ?? 'U'}
            </div>
            <div className={`min-w-0 transition-all duration-200 ${!sidebarOpen ? 'lg:hidden' : ''}`}>
              <p className="text-sm font-medium text-slate-900 truncate">{profile?.full_name}</p>
              <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className={`w-full text-xs text-slate-500 hover:text-red-600 transition-colors py-1 text-left ${!sidebarOpen ? 'lg:text-center' : ''}`}
          >
            {sidebarOpen ? 'Sign out' : <span className="lg:hidden">Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
