
import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { doc, setDoc, updateDoc, arrayRemove, onSnapshot, increment } from 'firebase/firestore';
import { db } from '../../src/lib/firebase';
import type { UserData, GeneratedPrompt, ProTier } from '../../types';
import { ensureDailyCoinsForUser } from '../../src/services/coinsService';

const getInitialUserData = (userId: string): UserData => ({
    uid: userId,
    coins: 100,
    favorites: [],
    history: [],
    lastCoinRewardDate: '1970-01-01',
    adsWatchedToday: { count: 0, date: '1970-01-01' },
    sharesToday: { count: 0, date: '1970-01-01' },
    proTier: null,
    proTierExpiry: null,
});

export function useUserData(user: User | null) {
    const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);

    useEffect(() => {
        if (!user) {
            setCurrentUserData(null);
            return;
        }

        const userDocRef = doc(db, 'users', user.uid);

        // First, ensure the user has daily coins. This also creates the user doc if it doesn't exist.
        ensureDailyCoinsForUser(user.uid).catch(error => {
            console.error("Error ensuring daily coins on initial load:", error);
        });

        // Then, set up a real-time listener for the user data document.
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = { ...getInitialUserData(user.uid), ...docSnap.data() };
                setCurrentUserData(userData);
            } else {
                console.log("User document doesn't exist yet, waiting for creation by ensureDailyCoinsForUser...");
            }
        }, (error) => {
            console.error("Error in user data onSnapshot listener:", error);
            setCurrentUserData(null);
        });

        return () => unsubscribe();

    }, [user]);

    const updateUserData = useCallback(async (data: Partial<UserData>) => {
        if (!user) return;
        const userDocRef = doc(db, 'users', user.uid);
        try {
            await updateDoc(userDocRef, data);
        } catch (err) {
            console.error("Firestore update failed", err);
        }
    }, [user]);

    const deletePrompt = useCallback(async (promptId: string, type: 'favorites' | 'history') => {
        if (!user || !currentUserData) return;
        const promptToDelete = currentUserData[type].find(p => p.id === promptId);
        if (promptToDelete) {
            const userDocRef = doc(db, 'users', user.uid);
            try {
                await updateDoc(userDocRef, { [type]: arrayRemove(promptToDelete) });
            } catch(e) { console.error(e); }
        }
    }, [user, currentUserData]);

    const handleWatchAd = useCallback(async () => {
        if (!currentUserData || !user) return false;
        const today = new Date().toISOString().split('T')[0];
        const adsData = currentUserData.adsWatchedToday || { count: 0, date: '1970-01-01' };

        if (adsData.date === today && adsData.count >= 10) {
            console.log("Ad watch limit reached for today.");
            return false;
        }

        const newCount = adsData.date === today ? adsData.count + 1 : 1;
        const userDocRef = doc(db, 'users', user.uid);

        try {
            await updateDoc(userDocRef, {
                coins: increment(10),
                adsWatchedToday: { count: newCount, date: today },
            });
            return true;
        } catch (error) {
            console.error("Failed to update coins for ad reward:", error);
            return false;
        }
    }, [user, currentUserData]);
    
    const handleShareReward = useCallback(async () => {
        if (!currentUserData || !user) return false;
        const today = new Date().toISOString().split('T')[0];
        const sharesData = currentUserData.sharesToday || { count: 0, date: '1970-01-01' };
        if (sharesData.date === today && sharesData.count >= 5) return false;

        const newCount = sharesData.date === today ? sharesData.count + 1 : 1;
        const userDocRef = doc(db, 'users', user.uid);
        try {
            await updateDoc(userDocRef, {
                coins: increment(15),
                sharesToday: { count: newCount, date: today },
            });
            return true;
        } catch (error) {
            console.error("Failed to update coins for share reward:", error);
            return false;
        }
    }, [user, currentUserData]);

    const handlePurchase = useCallback(async (tier: ProTier, durationDays: number) => {
        if (!user) return;
        const now = new Date();
        const expiryDate = new Date(now.setDate(now.getDate() + durationDays));
        await updateUserData({
            proTier: tier,
            proTierExpiry: expiryDate.toISOString(),
        });
    }, [user, updateUserData]);

    return { currentUserData, updateUserData, deletePrompt, handleWatchAd, handleShareReward, handlePurchase };
}
