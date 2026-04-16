import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserProfile = 'medico' | 'estudante' | 'paciente' | null;

interface AuthContextType {
  userId: string | null;
  userName: string | null;
  profile: UserProfile;
  isAuthenticated: boolean;
  login: (id: string, userName: string, profileType: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('otto_user_id');
    const storedName = localStorage.getItem('otto_user_name');
    const storedProfile = localStorage.getItem('otto_profile') as UserProfile;
    if (storedUser && storedProfile) {
      setUserId(storedUser);
      setUserName(storedName || 'Usuário');
      setProfile(storedProfile);
    }
  }, []);

  const login = (id: string, name: string, profileType: UserProfile) => {
    setUserId(id);
    setUserName(name);
    setProfile(profileType);
    localStorage.setItem('otto_user_id', id);
    localStorage.setItem('otto_user_name', name);
    localStorage.setItem('otto_profile', profileType || '');
  };

  const logout = () => {
    setUserId(null);
    setUserName(null);
    setProfile(null);
    localStorage.removeItem('otto_user_id');
    localStorage.removeItem('otto_user_name');
    localStorage.removeItem('otto_profile');
  };

  return (
    <AuthContext.Provider value={{ userId, userName, profile, isAuthenticated: !!userId, login, logout }}>
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
