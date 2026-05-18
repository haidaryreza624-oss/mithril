import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { loginRequest, logoutRequest } from '../api/hemisApi';   // <-- correct import

type AuthContextValue = {
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const TOKEN_KEY = 'hemis_token';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (stored) setToken(stored);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loginHandler = async (email: string, password: string) => {
    const res = await loginRequest(email, password);
    setToken(res.token);
    await SecureStore.setItemAsync(TOKEN_KEY, res.token);
  };

  const logoutHandler = async () => {
    await logoutRequest();
    setToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ token, loading, login: loginHandler, logout: logoutHandler }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}