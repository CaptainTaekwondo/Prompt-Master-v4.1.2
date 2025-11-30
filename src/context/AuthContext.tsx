

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
import { getSubscriptionForUser, UserSubscription } from '../services/subscriptionService';
import type { InternalPlanId } from '../../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  subscription: UserSubscription | null;
  currentPlan: InternalPlanId | 'free';
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
  const [currentPlan, setCurrentPlan] = useState<InternalPlanId | 'free'>('free');
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

      // Any plan other than 'free' is considered a paid plan
      const isPaidPlan = userSubscription.plan !== 'free';
      setIsPremium(isPaidPlan);
    } else {
      setCurrentPlan('free');
      setIsPremium(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      refreshSubscription();
    }
  }, [user, refreshSubscription]);

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
