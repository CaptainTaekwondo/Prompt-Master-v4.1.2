import { doc, getDoc, updateDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getSubscriptionForUser } from './subscriptionService';
import type { UserData } from '../../types';

const FREE_DAILY_COINS = 100;
const LITE_DAILY_COINS = 1000;
const PLUS_DAILY_COINS = 5000;
const PRO_DAILY_COINS = 999999; // effectively unlimited

export async function ensureDailyCoinsForUser(userId: string): Promise<number> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // If no user document yet, create one with free daily coins
  if (!userSnap.exists()) {
    const initialCoins = FREE_DAILY_COINS;
    await setDoc(
      userRef,
      {
        uid: userId,
        coins: initialCoins,
        lastCoinRewardDate: today,
      } as Partial<UserData>,
      { merge: true }
    );
    return initialCoins;
  }

  const data = userSnap.data() as UserData;

  // Determine daily allowance from subscription
  const subscription = await getSubscriptionForUser(userId);

  let dailyAllowance = FREE_DAILY_COINS;
  if (subscription) {
    switch (subscription.plan) {
      case 'lite':
        dailyAllowance = LITE_DAILY_COINS;
        break;
      case 'plus':
        dailyAllowance = PLUS_DAILY_COINS;
        break;
      case 'pro':
        dailyAllowance = PRO_DAILY_COINS;
        break;
    }
  }

  // If it's a new day, ensure coins are at least the daily allowance
  if (data.lastCoinRewardDate !== today) {
    let newCoins = data.coins;

    // If coins are below the daily allowance, top them up
    // If coins are higher (e.g. from ad rewards), keep the higher value
    if (newCoins < dailyAllowance) {
      newCoins = dailyAllowance;
    }

    await updateDoc(userRef, {
      coins: newCoins,
      lastCoinRewardDate: today,
    });

    return newCoins;
  }

  // Same day: just return current coins
  return data.coins;
}

export async function incrementUserCoins(userId: string, amount: number): Promise<number> {
  const userRef = doc(db, 'users', userId);
  
  await updateDoc(userRef, {
      coins: increment(amount)
  });

  const updatedSnap = await getDoc(userRef);
  if (updatedSnap.exists()) {
    return (updatedSnap.data() as UserData).coins;
  } 

  return 0;
}
