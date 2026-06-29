import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '../lib/api';
import { Profile, UserRole } from '../types';

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  demoLogin: (role: UserRole) => void;
}

interface AuthResponse {
  token: string;
  profile: Profile;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_STUDENT: Profile = {
  id: 'demo-student',
  full_name: 'Alex Johnson',
  email: 'alex@university.edu',
  role: 'student',
  student_id: 'STU-2024-001',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEMO_LIBRARIAN: Profile = {
  id: 'demo-librarian',
  full_name: 'Dr. Sarah Mitchell',
  email: 'librarian@university.edu',
  role: 'librarian',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('library_token');
    const storedProfile = localStorage.getItem('library_profile');

    if (!token) {
      // Clear profile if no token exists
      localStorage.removeItem('library_profile');
      setProfile(null);
      setLoading(false);
      return;
    }

    // Only use stored profile if token exists, with error handling
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        setProfile(parsed);
      } catch (error) {
        console.error('Failed to parse stored profile:', error);
        localStorage.removeItem('library_profile');
      }
    }

    // Verify token validity with backend
    apiFetch<Profile>('/auth/me')
      .then((data) => {
        setProfile(data);
        localStorage.setItem('library_profile', JSON.stringify(data));
      })
      .catch(() => {
        localStorage.removeItem('library_token');
        localStorage.removeItem('library_profile');
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const data = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('library_token', data.token);
      localStorage.setItem('library_profile', JSON.stringify(data.profile));
      setProfile(data.profile);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Login failed' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    try {
      const data = await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: fullName, role }),
      });
      localStorage.setItem('library_token', data.token);
      localStorage.setItem('library_profile', JSON.stringify(data.profile));
      setProfile(data.profile);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Registration failed' };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('library_token');
    localStorage.removeItem('library_profile');
    setProfile(null);
  };

  const demoLogin = (role: UserRole) => {
    const credentials = role === 'student'
      ? { email: DEMO_STUDENT.email, password: 'password123' }
      : { email: DEMO_LIBRARIAN.email, password: 'password123' };
    void signIn(credentials.email, credentials.password);
  };

  return (
    <AuthContext.Provider value={{ profile, loading, signIn, signUp, signOut, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
