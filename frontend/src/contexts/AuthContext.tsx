import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, TokenData } from '../utils/api';

interface AuthContextType {
  isAuthenticated: boolean;
  email: string | null;
  studentNumber: string | null;
  login: (email: string, password: string) => Promise<TokenData>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [studentNumber, setStudentNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const isAuth = api.isAuthenticated();
      const storedEmail = localStorage.getItem('email');
      const storedStudentNumber = localStorage.getItem('studentNumber');
      
      setIsAuthenticated(isAuth);
      setEmail(storedEmail);
      setStudentNumber(storedStudentNumber);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      
      // response now has success, StudentNumber, etc.
      if (response.success) {
        setStudentNumber(response.StudentNumber || '');
        setIsAuthenticated(true);
        return response; // Return so component can navigate
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    api.logout();
    setIsAuthenticated(false);
    setEmail(null);
    localStorage.removeItem('email');
    localStorage.removeItem('studentNumber');
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const value = {
    isAuthenticated,
    email,
    studentNumber,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

