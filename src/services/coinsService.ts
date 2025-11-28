import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

const DAILY_DEFAULT_COINS = 100;

export async function ensureDailyCoinsForUser(userId: string): Promise<number> {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  if (!snap.exists()) {
    const data = {
      coins: DAILY_DEFAULT_COINS,
      lastCoinRewardDate: today,
    };
    await setDoc(userRef, data, { merge: true });
    return data.coins;
  }

  const data = snap.data() as any;
  let coins = typeof data.coins === 'number' ? data.coins : 0;
  const lastReset = typeof data.lastCoinRewardDate === 'string' ? data.lastCoinRewardDate : null;

  let shouldUpdate = false;

  // Always ensure at least DAILY_DEFAULT_COINS
  if (coins < DAILY_DEFAULT_COINS) {
    coins = DAILY_DEFAULT_COINS;
    shouldUpdate = true;
  }

  // If a new day has started, also bump lastCoinRewardDate
  if (!lastReset || lastReset !== today) {
    shouldUpdate = true;
  }

  if (shouldUpdate) {
    await updateDoc(userRef, {
      coins,
      lastCoinRewardDate: today,
    });
  }

  return coins;
}

export async function incrementUserCoins(userId: string, amount: number): Promise<number> {
  const userRef = doc(db, 'users', userId);
  
  // Use Firestore's atomic increment operation.
  // This avoids race conditions and is more efficient.
  await updateDoc(userRef, {
      coins: increment(amount)
  });

  // After incrementing, we need to get the new value.
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const data = snap.data() as any;
    return typeof data.coins === 'number' ? data.coins : 0;
  } 

  return 0;
}
