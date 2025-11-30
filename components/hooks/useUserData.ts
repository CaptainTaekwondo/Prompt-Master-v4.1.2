import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../../src/lib/firebase';
import { ensureDailyCoinsForUser } from '../../src/services/coinsService';
import type { UserData } from '../../types';

export function useUserData(user: User | null | undefined) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // الاستماع الحي لبيانات المستخدم + تهيئة العملات اليومية
  useEffect(() => {
    if (user) {
      ensureDailyCoinsForUser(user.uid);

      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
        if (snapshot.exists()) {
          setUserData(snapshot.data() as UserData);
        } else {
          console.log('User document does not exist yet.');
          setUserData(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setUserData(null);
      setLoading(false);
    }
  }, [user]);

  // دالة عامة لتحديث بيانات المستخدم في Firestore
  const updateUserData = useCallback(
    async (data: Partial<UserData>) => {
      if (!user) return;
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, data);
    },
    [user]
  );

  // مكافأة مشاهدة الإعلان: +10 عملات مع حد يومي
  const handleWatchAd = useCallback(async (): Promise<boolean> => {
    if (!user || !userData) return false;

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    const lastAdWatched = userData.lastAdWatched ?? 0;
    let adsWatchedToday = userData.adsWatchedToday ?? 0;

    // إعادة تعيين عدد الإعلانات لو بدأ يوم جديد
    if (!userData.lastAdWatched || lastAdWatched < todayStart) {
      adsWatchedToday = 0;
    }

    const DAILY_AD_LIMIT = 10;
    if (adsWatchedToday >= DAILY_AD_LIMIT) {
      console.log('Daily ad limit reached.');
      return false;
    }

    const updatedData: Partial<UserData> = {
      coins: (userData.coins ?? 0) + 10,
      adsWatchedToday: adsWatchedToday + 1,
      lastAdWatched: now.getTime(),
    };

    await updateUserData(updatedData);
    return true;
  }, [user, userData, updateUserData]);

  const handleShareReward = useCallback(async (): Promise<boolean> => {
    if (!user || !userData) return false;

    const today = new Date().toISOString().split('T')[0];
    const DAILY_SHARE_LIMIT = 5;

    const prev: any = (userData as any).sharesToday;
    let count = 0;

    if (prev && typeof prev === 'object' && prev.date === today) {
      count = prev.count ?? 0;
    }

    if (count >= DAILY_SHARE_LIMIT) {
      console.log('Daily share limit reached.');
      return false;
    }

    const updatedData: Partial<UserData> = {
      coins: (userData.coins ?? 0) + 15,
      sharesToday: {
        date: today,
        count: count + 1,
      },
    };

    await updateUserData(updatedData);
    return true;
  }, [user, userData, updateUserData]);

  return {
    userData,
    loading,
    updateUserData,
    handleWatchAd,
    handleShareReward,
  };
}