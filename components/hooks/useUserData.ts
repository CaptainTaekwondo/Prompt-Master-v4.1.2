
import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../../src/lib/firebase';
import { ensureDailyCoinsForUser } from '../../src/services/coinsService';
import type { UserData } from '../../types';

export function useUserData(user: User | null | undefined) {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            ensureDailyCoinsForUser(user.uid); // Ensures the user document and daily coins are set up

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

    const updateUserData = useCallback(async (data: Partial<UserData>) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, data);
        }
    }, [user]);

    return { userData, loading, updateUserData };
}
