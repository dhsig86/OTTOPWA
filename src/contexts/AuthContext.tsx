import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

type UserProfile = 'medico' | 'estudante' | 'paciente' | null;

interface AuthContextType {
  userId: string | null;
  userName: string | null;
  profile: UserProfile;
  firebaseToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (id: string, userName: string, profileType: UserProfile, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>(null);
  const [firebaseToken, setFirebaseToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedName = localStorage.getItem('otto_user_name');
    const storedProfile = localStorage.getItem('otto_profile') as UserProfile;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setFirebaseToken(token);
        setUserId(user.uid);
        
        try {
          const userRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            setProfile(data.profile || storedProfile || 'medico');
            setUserName(data.displayName || user.email || 'Usuário');
          } else {
            setProfile(storedProfile || 'medico');
            setUserName(storedName || user.email || 'Usuário');
          }
        } catch (e) {
          console.warn('Firestore unavailable, using localStorage fallback', e);
          setProfile(storedProfile || 'medico');
          setUserName(storedName || user.email || 'Usuário');
        }
      } else {
        setFirebaseToken(null);
        setUserId(null);
        setProfile(null);
        setUserName(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (id: string, name: string, profileType: UserProfile, token: string) => {
    setUserId(id);
    setUserName(name);
    setProfile(profileType);
    setFirebaseToken(token);
    localStorage.setItem('otto_user_id', id);
    localStorage.setItem('otto_user_name', name);
    localStorage.setItem('otto_profile', profileType || '');
    
    try {
      const userRef = doc(db, 'users', id);
      await setDoc(userRef, {
        displayName: name,
        profile: profileType,
        email: name,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch(e) {
      console.warn("Failed to save to Firestore", e);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error('Logout failed', e);
    }
    setUserId(null);
    setUserName(null);
    setProfile(null);
    setFirebaseToken(null);
    localStorage.removeItem('otto_user_id');
    localStorage.removeItem('otto_user_name');
    localStorage.removeItem('otto_profile');
  };

  return (
    <AuthContext.Provider value={{ userId, userName, profile, firebaseToken, isAuthenticated: !!userId, isLoading, login, logout }}>
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
