import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import type { UserData } from '../../types';

const DAILY_DEFAULT_COINS = 100;

export async function ensureDailyCoinsForUser(userId: string): Promise<number> {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  if (!snap.exists()) {
    // New user: create their document with default coins.
    const initialData = {
      coins: DAILY_DEFAULT_COINS,
      lastCoinRewardDate: today,
    };
    await setDoc(userRef, initialData, { merge: true });
    return initialData.coins;
  }

  const data = snap.data() as UserData;
  const lastReset = data.lastCoinRewardDate;

  // Only perform a check if it's a new day.
  if (lastReset !== today) {
    let currentCoins = data.coins;

    // If coins are below the daily default, top them up.
    // If they are higher (e.g., from ad rewards), keep the higher value.
    if (currentCoins < DAILY_DEFAULT_COINS) {
      currentCoins = DAILY_DEFAULT_COINS;
    }

    // Update the document with the new coin value and the new date.
    await updateDoc(userRef, {
      coins: currentCoins,
      lastCoinRewardDate: today,
    });
    
    return currentCoins;
  }

  // If it's not a new day, just return the current coin value from the database.
  return data.coins;
}

export async function incrementUserCoins(userId: string, amount: number): Promise<number> {
  const userRef = doc(db, 'users', userId);
  
  // Use Firestore's atomic increment operation.
  await updateDoc(userRef, {
      coins: increment(amount)
  });

  // After incrementing, get the new value to return it.
  const updatedSnap = await getDoc(userRef);
  if (updatedSnap.exists()) {
    return (updatedSnap.data() as UserData).coins;
  } 

  return 0;
}
