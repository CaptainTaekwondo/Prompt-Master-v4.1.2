
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import type { UserData, GeneratedPrompt, ProTier } from '../../types.ts';
import { doc, getDoc, setDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../../src/lib/firebase';

const getInitialUserData = (userId: string): UserData => ({
    uid: userId,
    coins: 100,
    favorites: [],
    history: [],
    lastCoinRewardDate: new Date().toISOString().split('T')[0],
    adsWatchedToday: {
        count: 0,
        date: new Date().toISOString().split('T')[0],
    },
    sharesToday: {
        count: 0,
        date: new Date().toISOString().split('T')[0],
    },
    proTier: null,
    proTierExpiry: null,
});

export function useUserData() {
    const { user, currentPlan } = useAuth();
    const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);

    const getUserData = useCallback(async (userId: string) => {
        const userDocRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserData;
        } else {
            const initialData = getInitialUserData(userId);
            await setDoc(userDocRef, initialData);
            return initialData;
        }
    }, []);

    useEffect(() => {
        if (user) {
            getUserData(user.uid).then(userData => {
                const today = new Date().toISOString().split('T')[0];
                let dataToUpdate: Partial<UserData> = {};
                let needsUpdate = false;

                // 1. Check for daily coin reward
                if (userData.lastCoinRewardDate !== today) {
                    const dailyCoins = 
                        currentPlan === 'pro' ? 999999 : 
                        currentPlan === 'plus' ? 5000 : 
                        1000; // lite or free

                    dataToUpdate = {
                        ...dataToUpdate,
                        coins: (userData.coins || 0) + dailyCoins,
                        lastCoinRewardDate: today,
                        adsWatchedToday: { count: 0, date: today },
                        sharesToday: { count: 0, date: today },
                    };
                    needsUpdate = true;
                }

                // 2. Check if pro tier expired
                if (userData.proTier && userData.proTierExpiry) {
                    if (new Date(userData.proTierExpiry) < new Date()) {
                        dataToUpdate = {
                            ...dataToUpdate,
                            proTier: null,
                            proTierExpiry: null,
                        };
                        needsUpdate = true;
                    }
                }
                
                const finalUserData = { ...userData, ...dataToUpdate };

                if (needsUpdate) {
                    const userDocRef = doc(db, 'users', user.uid);
                    updateDoc(userDocRef, dataToUpdate).then(() => {
                        setCurrentUserData(finalUserData);
                    });
                } else {
                    setCurrentUserData(userData);
                }
            });
        } else {
            setCurrentUserData(null);
        }
    }, [user, currentPlan, getUserData]);

    const updateUserData = useCallback(async (data: Partial<UserData>) => {
        if (!user) return;
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, data);
        setCurrentUserData(prevData => (prevData ? { ...prevData, ...data } : null));
    }, [user]);

    const deletePrompt = useCallback(async (promptId: string, type: 'favorites' | 'history') => {
        if (!user || !currentUserData) return;
        const promptToDelete = currentUserData?.[type].find(p => p.id === promptId);

        if (promptToDelete) {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                [type]: arrayRemove(promptToDelete)
            });
            setCurrentUserData(prevData => {
                if (!prevData) return null;
                return {
                    ...prevData,
                    [type]: prevData[type].filter(p => p.id !== promptId),
                };
            });
        }
    }, [user, currentUserData]);

    const handleWatchAd = useCallback(async () => {
        if (!currentUserData || !user) return false;

        const today = new Date().toISOString().split('T')[0];
        const adsData = currentUserData.adsWatchedToday || { count: 0, date: '1970-01-01' };

        if (adsData.date === today && adsData.count >= 10) {
            return false; 
        }
        
        const newCount = adsData.date === today ? adsData.count + 1 : 1;
        const updatedAdsData = { count: newCount, date: today };
        
        await updateUserData({
            coins: (currentUserData.coins || 0) + 10,
            adsWatchedToday: updatedAdsData,
        });

        return true;
    }, [currentUserData, user, updateUserData]);
    
    const handleShareReward = useCallback(async () => {
        if (!currentUserData || !user) return false;

        const today = new Date().toISOString().split('T')[0];
        const sharesData = currentUserData.sharesToday || { count: 0, date: '1970-01-01' };
        const SHARE_LIMIT = 5;

        if (sharesData.date === today && sharesData.count >= SHARE_LIMIT) {
            return false;
        }
        
        const newCount = sharesData.date === today ? sharesData.count + 1 : 1;
        const updatedSharesData = { count: newCount, date: today };
        
        await updateUserData({
            coins: (currentUserData.coins || 0) + 15,
            sharesToday: updatedSharesData,
        });

        return true;
    }, [currentUserData, user, updateUserData]);

    const handlePurchase = useCallback(async (tier: ProTier, durationDays: number, paymentMethod: 'vodafone' | 'paypal') => {
        if (!user) return;

        const now = new Date();
        const expiryDate = new Date(now.setDate(now.getDate() + durationDays));

        // This is a client-side simulation.
        const updatedData: Partial<UserData> = {
            proTier: tier,
            proTierExpiry: expiryDate.toISOString(),
        };

        await updateUserData(updatedData);

    }, [user, updateUserData]);

    return {
        currentUserData,
        updateUserData,
        deletePrompt,
        handleWatchAd,
        handleShareReward,
        handlePurchase,
    };
}
