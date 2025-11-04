import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'PortfolioManager' | 'ProjectManager' | 'Stakeholder';
  department?: string;
  photoUrl?: string;
  language: 'it' | 'en';
}

interface AuthContextType {
  user: User | null;
  sessionId: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(
    localStorage.getItem('sessionId')
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${sessionId}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.id) {
            setUser(data);
          } else {
            localStorage.removeItem('sessionId');
            setSessionId(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('sessionId');
          setSessionId(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await res.json();
    setSessionId(data.sessionId);
    setUser(data.user);
    localStorage.setItem('sessionId', data.sessionId);
  };

  const logout = async () => {
    if (sessionId) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionId}` },
      });
    }
    localStorage.removeItem('sessionId');
    setSessionId(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, sessionId, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}


