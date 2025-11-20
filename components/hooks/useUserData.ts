import { useState, useEffect, useCallback } from 'react';
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

type LoginMethod = 'google' | 'email' | 'phone' | 'guest';

export function useUserData() {
    const [currentUser, setCurrentUser] = useState<any | null>(null);
    const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);

    useEffect(() => {
        // Check if a user is "logged in" from a previous session
        const storedUser = localStorage.getItem('promptMasterCurrentUser');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setCurrentUser(user);
                
                const storedData = localStorage.getItem(`${USER_DATA_KEY}_${user.uid}`);
                let userData;

                if (storedData) {
                    try {
                        userData = JSON.parse(storedData);
                    } catch (e) {
                        console.error("Failed to parse user data from localStorage, resetting.", e);
                        localStorage.removeItem(`${USER_DATA_KEY}_${user.uid}`);
                        userData = getInitialUserData();
                    }
                } else {
                    userData = getInitialUserData();
                }

                // Daily coin reward logic
                const today = new Date().toISOString().split('T')[0];
                if (userData.lastCoinRewardDate !== today) {
                    const updatedData = {
                        ...userData,
                        coins: userData.coins + 100,
                        lastCoinRewardDate: today,
                        adsWatchedToday: { count: 0, date: today },
                        sharesToday: { count: 0, date: today },
                    };
                    localStorage.setItem(`${USER_DATA_KEY}_${user.uid}`, JSON.stringify(updatedData));
                    setCurrentUserData(updatedData);
                } else {
                     setCurrentUserData(userData);
                }
            } catch (e) {
                console.error("Failed to parse user from localStorage, clearing.", e);
                localStorage.removeItem('promptMasterCurrentUser');
            }
        }
    }, []);

    const updateUserData = useCallback((data: Partial<UserData>) => {
        if (!currentUser) return;

        setCurrentUserData(prevData => {
            const newData = { ...(prevData || getInitialUserData()), ...data };
            localStorage.setItem(`${USER_DATA_KEY}_${currentUser.uid}`, JSON.stringify(newData));
            return newData;
        });
    }, [currentUser]);

    const handleLogin = (method: LoginMethod = 'guest') => {
        // Simulate a guest login based on method
        let displayName = 'Guest';
        let uid = 'local_guest';

        switch (method) {
            case 'google':
                displayName = 'Google User';
                uid = 'google_guest';
                break;
            case 'email':
                displayName = 'Email User';
                uid = 'email_guest';
                break;
            case 'phone':
                displayName = 'Phone User';
                uid = 'phone_guest';
                break;
        }

        const user = {
            uid: uid,
            displayName: displayName,
            photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`,
        };
        setCurrentUser(user);
        localStorage.setItem('promptMasterCurrentUser', JSON.stringify(user));
        
        // Load or initialize data for this guest user
        const storedData = localStorage.getItem(`${USER_DATA_KEY}_${user.uid}`);
        let userData = storedData ? JSON.parse(storedData) : getInitialUserData();

        // Re-check daily reward in case they log in on a new day without reloading
        const today = new Date().toISOString().split('T')[0];
        if (userData.lastCoinRewardDate !== today) {
            userData.coins += 100;
            userData.lastCoinRewardDate = today;
            userData.adsWatchedToday = { count: 0, date: today };
            userData.sharesToday = { count: 0, date: today };
            localStorage.setItem(`${USER_DATA_KEY}_${user.uid}`, JSON.stringify(userData));
        }

        setCurrentUserData(userData);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentUserData(null);
        localStorage.removeItem('promptMasterCurrentUser');
    };

    const handlePurchase = (tier: ProTier, durationDays: number) => {
        if (!currentUserData) return;
        
        let newCoins = currentUserData.coins;
        switch (tier) {
            case 'bronze': newCoins += 7000; break;
            case 'silver': newCoins += 35000; break;
            case 'gold': newCoins += 999999; break; // Simulate "unlimited"
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
            return false; // Daily limit reached
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
            return false; // Daily limit reached
        }
        
        const newCount = sharesData.date === today ? sharesData.count + 1 : 1;
        updateUserData({
            coins: currentUserData.coins + 15,
            sharesToday: { count: newCount, date: today },
        });

        return true;
    }, [currentUserData, updateUserData]);

    return {
        currentUser,
        currentUserData,
        updateUserData,
        handleLogin,
        handleLogout,
        handlePurchase,
        deletePrompt,
        handleWatchAd,
        handleShareReward,
    };
}