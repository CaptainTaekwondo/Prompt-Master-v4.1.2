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
  const snap = await getDoc(userRef);
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  // Determine the user's current plan to get the correct coin allowance.
  const subscription = await getSubscriptionForUser(userId);
  const plan = subscription ? subscription.plan : 'free';
  
  let dailyAllowance: number;
  switch (plan) {
    case 'lite':
      dailyAllowance = LITE_DAILY_COINS;
      break;
    case 'plus':
      dailyAllowance = PLUS_DAILY_COINS;
      break;
    case 'pro':
      dailyAllowance = PRO_DAILY_COINS;
      break;
    default:
      dailyAllowance = FREE_DAILY_COINS;
      break;
  }

  if (!snap.exists()) {
    // New user: create their document with the correct coin allowance for their plan.
    const initialData = {
      coins: dailyAllowance,
      lastCoinRewardDate: today,
    };
    await setDoc(userRef, initialData, { merge: true });
    return initialData.coins;
  }

  const data = snap.data() as UserData;
  const lastReset = data.lastCoinRewardDate;

  // Only perform a reset if it's a new day.
  if (lastReset !== today) {
    let currentCoins = data.coins;

    // If the user's current coins are below their daily allowance, top them up.
    // Otherwise, let them keep their higher balance (e.g., from rewarded ads, if they were free before).
    if (currentCoins < dailyAllowance) {
      currentCoins = dailyAllowance;
    }

    await updateDoc(userRef, {
      coins: currentCoins,
      lastCoinRewardDate: today,
    });
    
    return currentCoins;
  }

  // If it's not a new day, just return the current coin value.
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
