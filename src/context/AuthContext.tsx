
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextProps {
  authState: AuthState;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // This is a mock login function
    // In a real app, you would make an API call to your Django backend

    try {
      // For demo purposes, we simulate a successful login for any non-empty username/password
      if (!username || !password) {
        toast({
          title: "Login Failed",
          description: "Username and password are required",
          variant: "destructive",
        });
        return false;
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock user
      const mockUser: User = {
        id: crypto.randomUUID(),
        username,
        email: `${username}@example.com`,
      };
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // Update auth state
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${username}!`,
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An error occurred during login",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    // This is a mock register function
    try {
      if (!username || !email || !password) {
        toast({
          title: "Registration Failed",
          description: "All fields are required",
          variant: "destructive",
        });
        return false;
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock user
      const mockUser: User = {
        id: crypto.randomUUID(),
        username,
        email,
      };
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // Update auth state
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast({
        title: "Registration Successful",
        description: `Welcome, ${username}!`,
      });
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "An error occurred during registration",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
