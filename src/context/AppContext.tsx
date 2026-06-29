import { createContext, useContext, useState, ReactNode } from 'react';
import { Page } from '../types';

interface AppContextType {
  currentPage: Page;
  navigate: (page: Page) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const navigate = (page: Page) => setCurrentPage(page);
  const toggleDarkMode = () => setDarkMode((d) => !d);

  return (
    <AppContext.Provider value={{ currentPage, navigate, sidebarOpen, setSidebarOpen, darkMode, toggleDarkMode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
