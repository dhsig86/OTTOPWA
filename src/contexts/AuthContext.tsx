import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserProfile = 'medico' | 'estudante' | 'paciente' | null;

interface AuthContextType {
  userId: string | null;
  profile: UserProfile;
  isAuthenticated: boolean;
  login: (id: string, profileType: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('otto_user_id');
    const storedProfile = localStorage.getItem('otto_profile') as UserProfile;
    if (storedUser && storedProfile) {
      setUserId(storedUser);
      setProfile(storedProfile);
    }
  }, []);

  const login = (id: string, profileType: UserProfile) => {
    setUserId(id);
    setProfile(profileType);
    localStorage.setItem('otto_user_id', id);
    localStorage.setItem('otto_profile', profileType || '');
  };

  const logout = () => {
    setUserId(null);
    setProfile(null);
    localStorage.removeItem('otto_user_id');
    localStorage.removeItem('otto_profile');
  };

  return (
    <AuthContext.Provider value={{ userId, profile, isAuthenticated: !!userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
