import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

type UserProfile = 'medico' | 'estudante' | 'profissional' | 'paciente' | null;

interface AuthContextType {
  userId: string | null;
  userName: string | null;
  profile: UserProfile;
  isPremium: boolean;
  subscriptionPlan: string | null;
  firebaseToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profileCompleted: boolean;
  login: (id: string, userName: string, profileType: UserProfile, token: string) => void;
  logout: () => void;
  updatePremiumStatus: (isPremium: boolean, plan: string) => void;
  markProfileCompleted: (name: string, profileType: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [firebaseToken, setFirebaseToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);

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
            setIsPremium(!!data.premiumActive);
            setSubscriptionPlan(data.subscriptionPlan || null);
            setProfileCompleted(!!data.profileCompleted);
          } else {
            setProfile(storedProfile || 'medico');
            setUserName(storedName || user.email || 'Usuário');
            setIsPremium(false);
            setSubscriptionPlan(null);
            setProfileCompleted(false);
          }
        } catch (e) {
          console.warn('Firestore unavailable, using localStorage fallback', e);
          setProfile(storedProfile || 'medico');
          setUserName(storedName || user.email || 'Usuário');
          setIsPremium(false);
          setSubscriptionPlan(null);
          setProfileCompleted(false);
        }
      } else {
        setFirebaseToken(null);
        setUserId(null);
        setProfile(null);
        setUserName(null);
        setIsPremium(false);
        setSubscriptionPlan(null);
        setProfileCompleted(false);
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
    setIsPremium(false);
    setSubscriptionPlan(null);
    localStorage.removeItem('otto_user_id');
    localStorage.removeItem('otto_user_name');
    localStorage.removeItem('otto_profile');
  };

  const updatePremiumStatus = (status: boolean, plan: string) => {
    setIsPremium(status);
    setSubscriptionPlan(plan);
  };

  const markProfileCompleted = (name: string, profileType: UserProfile) => {
    setProfileCompleted(true);
    setUserName(name);
    setProfile(profileType);
    localStorage.setItem('otto_user_name', name);
    localStorage.setItem('otto_profile', profileType || '');
  };

  return (
    <AuthContext.Provider value={{ userId, userName, profile, isPremium, subscriptionPlan, firebaseToken, isAuthenticated: !!userId, isLoading, profileCompleted, login, logout, updatePremiumStatus, markProfileCompleted }}>
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
