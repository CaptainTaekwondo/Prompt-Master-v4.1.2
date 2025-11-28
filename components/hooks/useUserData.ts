
import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { UserData, GeneratedPrompt, ProTier } from '../../types.ts';

const USER_DATA_KEY = 'promptMasterUserData';

const getInitialUserData = (): UserData => ({
    coins: 100,
    favorites: [],
    history: [],
    proTier: null,
    subscriptionEndDate: null,
    lastCoinRewardDate: new Date().toISOString().split('T')[0],
    adsWatchedToday: {
        count: 0,
        date: new Date().toISOString().split('T')[0],
    },
    sharesToday: {
        count: 0,
        date: new Date().toISOString().split('T')[0],
    },
});

export function useUserData(currentUser: User | null) {
    const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);

    useEffect(() => {
        if (currentUser) {
            const storedData = localStorage.getItem(`${USER_DATA_KEY}_${currentUser.uid}`);
            let userData: UserData;

            if (storedData) {
                try {
                    userData = JSON.parse(storedData) as UserData;
                } catch (e) {
                    console.error("Failed to parse user data from localStorage, resetting.", e);
                    userData = getInitialUserData();
                }
            } else {
                userData = getInitialUserData();
            }

            const today = new Date().toISOString().split('T')[0];
            if (userData.lastCoinRewardDate !== today) {
                const dailyCoins = userData.proTier === 'gold' ? 10000 : (userData.proTier === 'silver' ? 5000 : (userData.proTier === 'bronze' ? 1000 : 100));
                
                const updatedData = {
                    ...userData,
                    coins: (userData.coins || 0) + dailyCoins,
                    lastCoinRewardDate: today,
                    adsWatchedToday: { count: 0, date: today },
                    sharesToday: { count: 0, date: today },
                };
                localStorage.setItem(`${USER_DATA_KEY}_${currentUser.uid}`, JSON.stringify(updatedData));
                setCurrentUserData(updatedData);
            } else {
                setCurrentUserData(userData);
            }
        } else {
            setCurrentUserData(null);
        }
    }, [currentUser]);

    const updateUserData = useCallback((data: Partial<UserData>) => {
        if (!currentUser) return;

        setCurrentUserData(prevData => {
            const newData = { ...(prevData || getInitialUserData()), ...data };
            localStorage.setItem(`${USER_DATA_KEY}_${currentUser.uid}`, JSON.stringify(newData));
            return newData;
        });
    }, [currentUser]);

    const handlePurchase = (tier: ProTier, durationDays: number, paymentMethod: 'vodafone' | 'paypal') => {
        if (!currentUserData) return;
        
        console.log(`Processing purchase for tier: ${tier} via ${paymentMethod}`);

        let newCoins = currentUserData.coins;
        switch (tier) {
            case 'bronze': newCoins += 7000; break;
            case 'silver': newCoins += 35000; break;
            case 'gold': newCoins += 999999; break;
        }

        updateUserData({
            proTier: tier,
            subscriptionEndDate: Date.now() + durationDays * 24 * 60 * 60 * 1000,
            coins: newCoins,
        });
    };

    const deletePrompt = (promptId: string, type: 'favorites' | 'history') => {
        if (!currentUserData) return;
        const updatedList = currentUserData[type].filter(p => p.id !== promptId);
        updateUserData({ [type]: updatedList });
    };

    const handleWatchAd = useCallback(() => {
        if (!currentUserData) return false;

        const today = new Date().toISOString().split('T')[0];
        const adsData = currentUserData.adsWatchedToday || { count: 0, date: '1970-01-01' };

        if (adsData.date === today && adsData.count >= 10) {
            return false; 
        }
        
        const newCount = adsData.date === today ? adsData.count + 1 : 1;
        updateUserData({
            coins: currentUserData.coins + 10,
            adsWatchedToday: { count: newCount, date: today },
        });

        return true;
    }, [currentUserData, updateUserData]);
    
    const handleShareReward = useCallback(() => {
        if (!currentUserData) return false;

        const today = new Date().toISOString().split('T')[0];
        const sharesData = currentUserData.sharesToday || { count: 0, date: '1970-01-01' };
        const SHARE_LIMIT = 5;

        if (sharesData.date === today && sharesData.count >= SHARE_LIMIT) {
            return false;
        }
        
        const newCount = sharesData.date === today ? sharesData.count + 1 : 1;
        updateUserData({
            coins: currentUserData.coins + 15,
            sharesToday: { count: newCount, date: today },
        });

        return true;
    }, [currentUserData, updateUserData]);

    return {
        currentUserData,
        updateUserData,
        handlePurchase,
        deletePrompt,
        handleWatchAd,
        handleShareReward,
    };
}
