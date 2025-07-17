import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface UserProfile {
  full_name: string;
  role: 'admin' | 'teacher' | 'student';
}

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock authentication for development
    const mockUser = {
      id: 'mock-user-id',
      email: 'test@example.com'
    };
    
    const mockProfile: UserProfile = {
      full_name: 'Test User',
      role: 'admin'
    };

    setUser(mockUser);
    setProfile(mockProfile);
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock sign in
    setUser({ id: 'mock-user-id', email });
    setProfile({ full_name: 'Test User', role: 'admin' });
    setLoading(false);
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'admin' | 'teacher' | 'student') => {
    // Mock sign up
    setUser({ id: 'mock-user-id', email });
    setProfile({ full_name, role });
    setLoading(false);
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    navigate('/auth');
  };

  return { user, profile, loading, signIn, signUp, signOut };
}
