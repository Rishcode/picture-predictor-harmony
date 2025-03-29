
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextProps {
  authState: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
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
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (session && session.user) {
          const user: User = {
            id: session.user.id,
            username: session.user.email?.split('@')[0] || 'user',
            email: session.user.email || '',
          };
          
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          localStorage.removeItem('user');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    );

    // Then check for initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log("Initial session check:", session?.user?.id);
        
        if (session && session.user) {
          const user: User = {
            id: session.user.id,
            username: session.user.email?.split('@')[0] || 'user',
            email: session.user.email || '',
          };
          
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Error getting session:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };
    
    initAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!email || !password) {
        toast({
          title: "Login Failed",
          description: "Email and password are required",
          variant: "destructive",
        });
        return false;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      if (data.user) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.email?.split('@')[0]}!`,
        });
        return true;
      }
      
      return false;
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
    try {
      if (!username || !email || !password) {
        toast({
          title: "Registration Failed",
          description: "All fields are required",
          variant: "destructive",
        });
        return false;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      
      if (error) {
        console.error('Registration error:', error);
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      if (data.user) {
        toast({
          title: "Registration Successful",
          description: `Welcome, ${username}!`,
        });
        return true;
      }
      
      return false;
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

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    
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
