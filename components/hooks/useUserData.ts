
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import type { UserData, GeneratedPrompt, ProTier } from '../../types.ts';
import { doc, getDoc, setDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../../src/lib/firebase';

const getInitialUserData = (userId: string): UserData => ({
    uid: userId,
    coins: 100, // Default coins
    favorites: [],
    history: [],
    lastCoinRewardDate: new Date().toISOString().split('T')[0],
    adsWatchedToday: { count: 0, date: new Date().toISOString().split('T')[0] },
    sharesToday: { count: 0, date: new Date().toISOString().split('T')[0] },
    proTier: null,
    proTierExpiry: null,
});

export function useUserData() {
    const { user } = useAuth(); 
    const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);

    const getUserData = useCallback(async (userId: string): Promise<UserData | null> => {
        const userDocRef = doc(db, 'users', userId);
        const initialData = getInitialUserData(userId);
        try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                const firestoreData = docSnap.data() as Partial<UserData>;
                return { ...initialData, ...firestoreData };
            } else {
                await setDoc(userDocRef, initialData);
                return initialData;
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            return null;
        }
    }, []);

    useEffect(() => {
        if (user) {
            getUserData(user.uid).then(userData => {
                if (!userData) {
                    setCurrentUserData(null);
                    return;
                }

                const today = new Date().toISOString().split('T')[0];
                let dataToUpdate: Partial<UserData> = {};
                let needsUpdate = false;

                const getTierPlan = (tier: ProTier | null) => {
                    if (tier === 'gold') return 'pro';
                    if (tier === 'silver') return 'plus';
                    if (tier === 'bronze') return 'lite';
                    return 'free';
                }
                const plan = getTierPlan(userData.proTier);

                if (userData.lastCoinRewardDate !== today) {
                    const dailyCoins = plan === 'pro' ? 999999 : plan === 'plus' ? 5000 : 1000;
                    dataToUpdate = {
                        ...dataToUpdate,
                        coins: (userData.coins || 0) + dailyCoins,
                        lastCoinRewardDate: today,
                        adsWatchedToday: { count: 0, date: today },
                        sharesToday: { count: 0, date: today },
                    };
                    needsUpdate = true;
                }

                if (userData.proTier && userData.proTierExpiry && new Date(userData.proTierExpiry) < new Date()) {
                    dataToUpdate = { ...dataToUpdate, proTier: null, proTierExpiry: null };
                    needsUpdate = true;
                }

                const finalUserData = { ...userData, ...dataToUpdate };

                if (needsUpdate) {
                    const userDocRef = doc(db, 'users', user.uid);
                    updateDoc(userDocRef, dataToUpdate)
                        .then(() => setCurrentUserData(finalUserData))
                        .catch(err => {
                            console.error("Failed to update user data:", err);
                            setCurrentUserData(userData);
                        });
                } else {
                    setCurrentUserData(userData);
                }
            });
        } else {
            setCurrentUserData(null);
        }
    }, [user, getUserData]);

    const updateUserData = useCallback(async (data: Partial<UserData>) => {
        if (!user) return;
        setCurrentUserData(prevData => (prevData ? { ...prevData, ...data } : null));
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, data);
        } catch (error) {
            console.error("Failed to update user data:", error);
        }
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
