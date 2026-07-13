import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { clearAccessToken, setAccessToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setLocalAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.post('/auth/refresh')
      .then(({ data }) => {
        const nextToken = data.data.accessToken;
        setAccessToken(nextToken);
        setLocalAccessToken(nextToken);
        setUser(data.data.user);
      })
      .catch(() => {
        clearAccessToken();
        setLocalAccessToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    accessToken,
    loading,
    async login(credentials) {
      const { data } = await api.post('/auth/login', credentials);
      const nextToken = data.data.accessToken;
      setAccessToken(nextToken);
      setLocalAccessToken(nextToken);
      setUser(data.data.user);
      return data.data.user;
    },
    async logout() {
      await api.post('/auth/logout');
      clearAccessToken();
      setLocalAccessToken(null);
      setUser(null);
    },
    setUser,
  }), [user, accessToken, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}