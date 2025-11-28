
import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../../src/lib/firebase';
import type { UserData, GeneratedPrompt, ProTier } from '../../types';

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

        const manageUserData = async () => {
            try {
                const docSnap = await getDoc(userDocRef);
                let userData;

                if (docSnap.exists()) {
                    userData = { ...getInitialUserData(user.uid), ...docSnap.data() };
                } else {
                    userData = getInitialUserData(user.uid);
                    await setDoc(userDocRef, userData);
                }
                
                const today = new Date().toISOString().split('T')[0];
                if (userData.lastCoinRewardDate !== today) {
                    const dataToUpdate = {
                        coins: (userData.coins || 0) + 1000,
                        lastCoinRewardDate: today,
                        adsWatchedToday: { count: 0, date: today },
                        sharesToday: { count: 0, date: today },
                    };
                    await updateDoc(userDocRef, dataToUpdate);
                    userData = { ...userData, ...dataToUpdate };
                }
                
                setCurrentUserData(userData);

            } catch (error) {
                console.error("Error in useUserData:", error);
                setCurrentUserData(null);
            }
        };

        manageUserData();

    }, [user]);

    const updateUserData = useCallback(async (data: Partial<UserData>) => {
        if (!user) return;
        
        // Optimistic update for UI responsiveness
        setCurrentUserData(prev => {
            const new_data = prev ? { ...prev, ...data } : null;
            if (new_data) {
                const userDocRef = doc(db, 'users', user.uid);
                updateDoc(userDocRef, data).catch(err => console.error("Firestore update failed", err));
            }
            return new_data;
        });

    }, [user]);

    const deletePrompt = useCallback(async (promptId: string, type: 'favorites' | 'history') => {
        if (!user || !currentUserData) return;
        const promptToDelete = currentUserData[type].find(p => p.id === promptId);
        if (promptToDelete) {
             const userDocRef = doc(db, 'users', user.uid);
            try {
                await updateDoc(userDocRef, { [type]: arrayRemove(promptToDelete) });
                setCurrentUserData(prevData => {
                    if (!prevData) return null;
                    return { ...prevData, [type]: prevData[type].filter(p => p.id !== promptId) };
                });
            } catch(e) { console.error(e)}

        }
    }, [user, currentUserData]);

    const handleWatchAd = useCallback(async () => {
        if (!currentUserData || !user) return false;
        const today = new Date().toISOString().split('T')[0];
        const adsData = currentUserData.adsWatchedToday || { count: 0, date: '1970-01-01' };
        if (adsData.date === today && adsData.count >= 10) return false;

        const newCount = adsData.date === today ? adsData.count + 1 : 1;
        await updateUserData({
            coins: (currentUserData.coins || 0) + 10,
            adsWatchedToday: { count: newCount, date: today },
        });
        return true;
    }, [currentUserData, user, updateUserData]);
    
    const handleShareReward = useCallback(async () => {
        if (!currentUserData || !user) return false;
        const today = new Date().toISOString().split('T')[0];
        const sharesData = currentUserData.sharesToday || { count: 0, date: '1970-01-01' };
        if (sharesData.date === today && sharesData.count >= 5) return false;

        const newCount = sharesData.date === today ? sharesData.count + 1 : 1;
        await updateUserData({
            coins: (currentUserData.coins || 0) + 15,
            sharesToday: { count: newCount, date: today },
        });
        return true;
    }, [currentUserData, user, updateUserData]);

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
