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
  onboardingCompleted: boolean;
  login: (id: string, userName: string, profileType: UserProfile, token: string) => Promise<void>;
  logout: () => void;
  updatePremiumStatus: (isPremium: boolean, plan: string) => void;
  markProfileCompleted: (name: string, profileType: UserProfile) => void;
  markOnboardingCompleted: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  // ─── Bootstrap: onAuthStateChanged is the single source of truth ───────────
  useEffect(() => {
    const storedName    = localStorage.getItem('otto_user_name');
    const storedProfile = localStorage.getItem('otto_profile') as UserProfile;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
            setProfileCompleted(!!d.profileCompleted);
            setOnboardingCompleted(!!d.onboardingCompleted);
            // Sync to localStorage so offline / cross-browser flows work too
            if (d.profileCompleted) localStorage.setItem('otto_profile_completed', 'true');
            if (d.onboardingCompleted) localStorage.setItem('otto_onboarding_completed', 'true');
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
          // Fallback: trust localStorage flags set when user first completed profile/onboarding
          setProfileCompleted(localStorage.getItem('otto_profile_completed') === 'true');
          setOnboardingCompleted(localStorage.getItem('otto_onboarding_completed') === 'true');
        }

        setUserId(user.uid);  // set userId LAST so PrivateRoute sees correct state
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

    const updatePremiumStatus = (premium: boolean, plan: string) => {
    setIsPremium(premium);
    setSubscriptionPlan(plan);
  };

    return () => unsubscribe();
  }, []);

  // ─── login() ────────────────────────────────────────────────────────────────
  // Called explicitly from Login.tsx after signInWithPopup / signInWithEmailAndPassword.
  // onAuthStateChanged also fires, but login() runs first so we need the same
  // Firestore-read-before-setUserId pattern to avoid PrivateRoute races.
  const login = async (id: string, name: string, profileType: UserProfile, token: string) => {
    setFirebaseToken(token);
    localStorage.setItem('otto_user_id', id);
    localStorage.setItem('otto_user_name', name);
    localStorage.setItem('otto_profile', profileType || '');

    try {
      const userRef = doc(db, 'users', id);
      const existing = await getDoc(userRef);

      if (existing.exists() && existing.data().profileCompleted) {
        // ── Returning user: restore everything from Firestore (never overwrite) ──
        const d = existing.data();
        setUserName(d.displayName || name);
        setProfile((d.profile as UserProfile) || profileType);
        setIsPremium(!!d.premiumActive);
        setSubscriptionPlan(d.subscriptionPlan || null);
        setProfileCompleted(true);
        setOnboardingCompleted(!!d.onboardingCompleted);
        localStorage.setItem('otto_profile_completed', 'true');
        if (d.onboardingCompleted) localStorage.setItem('otto_onboarding_completed', 'true');
        // Do NOT write back to Firestore — avoid overwriting stored profile/name
      } else {
        // ── New user (or incomplete profile): write their selection ──
        setUserName(name);
        setProfile(profileType);
        setIsPremium(false);
        setSubscriptionPlan(null);
        setProfileCompleted(false);
        setOnboardingCompleted(false);
        await setDoc(userRef, {
          displayName: name,
          profile: profileType,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }

      // ⚠️ setUserId LAST: triggers PrivateRoute re-render only after all state
      //    above is already committed (React 18 batches the synchronous setters).
      setUserId(id);
    } catch (e) {
      console.warn('Firestore read failed in login()', e);
      setUserName(name);
      setProfile(profileType);
      // Fallback: trust localStorage so returning users aren't sent to complete-profile
      setProfileCompleted(localStorage.getItem('otto_profile_completed') === 'true');
      setOnboardingCompleted(localStorage.getItem('otto_onboarding_completed') === 'true');
      setUserId(id);  // still authenticate even on error
    }
  };

  // ─── logout() ───────────────────────────────────────────────────────────────
  const logout = async () => {
    try { await firebaseSignOut(auth); } catch (e) { console.error('Logout error', e); }
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
    localStorage.removeItem('otto_profile_completed');
    localStorage.removeItem('otto_onboarding_completed');
  };

  // ─── markProfileCompleted() ─────────────────────────────────────────────────
  // Called from CompleteProfile AFTER setDoc already wrote profileCompleted:true
  // to Firestore, so we only need to update React state here.
  const markProfileCompleted = (name: string, profileType: UserProfile) => {
    setProfileCompleted(true);
    setUserName(name);
    setProfile(profileType);
    localStorage.setItem('otto_user_name', name);
    localStorage.setItem('otto_profile', profileType || '');
    localStorage.setItem('otto_profile_completed', 'true');
  };

  // ─── markOnboardingCompleted() ──────────────────────────────────────────────
  // Persists onboardingCompleted to Firestore so it survives new browsers.
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


  const updatePremiumStatus = (premium: boolean, plan: string) => {
    setIsPremium(premium);
    setSubscriptionPlan(plan);
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
      markProfileCompleted,
      markOnboardingCompleted,
      updatePremiumStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
