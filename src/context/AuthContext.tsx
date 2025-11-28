
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getSubscriptionForUser, UserSubscription, PlanId } from '../services/subscriptionService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  subscription: UserSubscription | null;
  currentPlan: PlanId | 'free';
  isPremium: boolean;
  refreshSubscription: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<User | null>;
  signInWithEmail: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanId | 'free'>('free');
  const [isPremium, setIsPremium] = useState(false);

  const refreshSubscription = useCallback(async () => {
    if (!auth.currentUser) {
        setSubscription(null);
        setCurrentPlan('free');
        setIsPremium(false);
        return;
    }

    const userSubscription = await getSubscriptionForUser(auth.currentUser.uid);
    setSubscription(userSubscription);

    if (userSubscription) {
      setCurrentPlan(userSubscription.plan);
      setIsPremium(userSubscription.plan === 'plus' || userSubscription.plan === 'pro');
    } else {
      setCurrentPlan('free');
      setIsPremium(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await refreshSubscription();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [refreshSubscription]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signUpWithEmail = async (email: string, password: string): Promise<User | null> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };
  
  const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  const logout = async () => {
    await signOut(auth);
    setSubscription(null);
    setCurrentPlan('free');
    setIsPremium(false);
  };

  const value = {
    user,
    loading,
    subscription,
    currentPlan,
    isPremium,
    refreshSubscription,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
