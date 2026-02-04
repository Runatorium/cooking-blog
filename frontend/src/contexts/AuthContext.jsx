import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Verify token is still valid
        authAPI.getCurrentUser()
          .then((userData) => {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          })
          .catch(() => {
            // Token invalid, clear storage
            logout();
          })
          .finally(() => setLoading(false));
      } catch (error) {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Accesso fallito. Riprova.',
        };
    }
  };

  const register = async (email, name, password, password2) => {
    try {
      const data = await authAPI.register(email, name, password, password2);
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData) {
        // Handle validation errors (e.g. 400 with field errors)
        const messages = Object.values(errorData).flat().filter(Boolean);
        return {
          success: false,
          error: messages.length ? messages.join(', ') : 'Registrazione fallita. Riprova.',
        };
      }
      // No response = request never reached server (network error, CORS, wrong URL)
      if (!error.response) {
        const msg = error.code === 'ERR_NETWORK'
          ? 'Impossibile contattare il server. Verifica la connessione e che il backend sia raggiungibile.'
          : (error.message || 'Errore di connessione. Riprova.');
        return { success: false, error: msg };
      }
      return {
        success: false,
        error: error.response?.data?.error || 'Registrazione fallita. Riprova.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};