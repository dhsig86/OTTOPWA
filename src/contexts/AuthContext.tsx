import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onIdTokenChanged, signOut as firebaseSignOut } from 'firebase/auth';
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
  onboardingCompleted: boolean;
  login: (id: string, userName: string, profileType: UserProfile, token: string) => Promise<void>;
  logout: () => void;
  updatePremiumStatus: (isPremium: boolean, plan: string) => void;
  markProfileCompleted: (name: string, profileType: UserProfile) => void;
  markOnboardingCompleted: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId]                     = useState<string | null>(null);
  const [userName, setUserName]                 = useState<string | null>(null);
  const [profile, setProfile]                   = useState<UserProfile>(null);
  const [isPremium, setIsPremium]               = useState<boolean>(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [firebaseToken, setFirebaseToken]       = useState<string | null>(null);
  const [isLoading, setIsLoading]               = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const isAuthenticated = !!userId;

  // ─── Bootstrap: onAuthStateChanged ──────────────────────────────────────────
  useEffect(() => {
    const storedName    = localStorage.getItem('otto_user_name');
    const storedProfile = localStorage.getItem('otto_profile') as UserProfile;

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setFirebaseToken(token);

        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) {
            const d = snap.data();
            setUserName(d.displayName || user.email || 'Usuário');
            setProfile(d.profile || storedProfile || 'medico');
            setIsPremium(!!d.premiumActive);
            setSubscriptionPlan(d.subscriptionPlan || null);
            // Trust Firestore OR localStorage — handles case where Firestore write
            // succeeded but previous session cleared localStorage on logout
            const pc = !!d.profileCompleted || localStorage.getItem('otto_profile_completed') === 'true';
            const oc = !!d.onboardingCompleted || localStorage.getItem('otto_onboarding_completed') === 'true';
            setProfileCompleted(pc);
            setOnboardingCompleted(oc);
            if (pc) localStorage.setItem('otto_profile_completed', 'true');
            if (oc) localStorage.setItem('otto_onboarding_completed', 'true');
          } else {
            setUserName(storedName || user.email || 'Usuário');
            setProfile(storedProfile || 'medico');
            setIsPremium(false);
            setSubscriptionPlan(null);
            setProfileCompleted(false);
            setOnboardingCompleted(false);
          }
        } catch (e) {
          console.warn('Firestore unavailable, falling back to localStorage', e);
          setUserName(storedName || user.email || 'Usuário');
          setProfile(storedProfile || 'medico');
          setIsPremium(false);
          setSubscriptionPlan(null);
          setProfileCompleted(localStorage.getItem('otto_profile_completed') === 'true');
          setOnboardingCompleted(localStorage.getItem('otto_onboarding_completed') === 'true');
        }

        setUserId(user.uid);
      } else {
        setFirebaseToken(null);
        setUserId(null);
        setUserName(null);
        setProfile(null);
        setIsPremium(false);
        setSubscriptionPlan(null);
        setProfileCompleted(false);
        setOnboardingCompleted(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ─── login() ────────────────────────────────────────────────────────────────
  const login = async (id: string, name: string, profileType: UserProfile, token: string) => {
    setUserId(id);
    setUserName(name);
    setProfile(profileType);
    setFirebaseToken(token);
    localStorage.setItem('otto_user_id', id);
    localStorage.setItem('otto_user_name', name);
    localStorage.setItem('otto_profile', profileType || '');

    try {
      const snap = await getDoc(doc(db, 'users', id));
      if (snap.exists()) {
        const d = snap.data();
        setProfileCompleted(!!d.profileCompleted);
        setOnboardingCompleted(!!d.onboardingCompleted);
        setIsPremium(!!d.premiumActive);
        if (d.profileCompleted) localStorage.setItem('otto_profile_completed', 'true');
        if (d.onboardingCompleted) localStorage.setItem('otto_onboarding_completed', 'true');
      } else {
        setProfileCompleted(false);
        setOnboardingCompleted(false);
      }
    } catch (e) {
      setProfileCompleted(localStorage.getItem('otto_profile_completed') === 'true');
      setOnboardingCompleted(localStorage.getItem('otto_onboarding_completed') === 'true');
    }
  };

  // ─── logout() ───────────────────────────────────────────────────────────────
  const logout = async () => {
    await firebaseSignOut(auth);
    setUserId(null);
    setUserName(null);
    setProfile(null);
    setFirebaseToken(null);
    setIsPremium(false);
    setSubscriptionPlan(null);
    setProfileCompleted(false);
    setOnboardingCompleted(false);
    localStorage.removeItem('otto_user_id');
    localStorage.removeItem('otto_user_name');
    localStorage.removeItem('otto_profile');
    // NOTE: intentionally keep otto_profile_completed and otto_onboarding_completed
    // so re-login with the same Google account skips these steps immediately
  };

  // ─── markProfileCompleted() ─────────────────────────────────────────────────
  const markProfileCompleted = (name: string, profileType: UserProfile) => {
    setProfileCompleted(true);
    setUserName(name);
    setProfile(profileType);
    localStorage.setItem('otto_user_name', name);
    localStorage.setItem('otto_profile', profileType || '');
    localStorage.setItem('otto_profile_completed', 'true');
  };

  // ─── updatePremiumStatus() ──────────────────────────────────────────────────
  const updatePremiumStatus = (premium: boolean, plan: string) => {
    setIsPremium(premium);
    setSubscriptionPlan(plan);
  };

  // ─── markOnboardingCompleted() ──────────────────────────────────────────────
  const markOnboardingCompleted = async () => {
    setOnboardingCompleted(true);
    localStorage.setItem('otto_onboarding_completed', 'true');
    if (userId) {
      try {
        await setDoc(doc(db, 'users', userId), {
          onboardingCompleted: true,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (e) {
        console.error('markOnboardingCompleted Firestore error:', e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      userId,
      userName,
      profile,
      firebaseToken,
      isPremium,
      subscriptionPlan,
      profileCompleted,
      onboardingCompleted,
      login,
      logout,
      updatePremiumStatus,
      markProfileCompleted,
      markOnboardingCompleted,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
