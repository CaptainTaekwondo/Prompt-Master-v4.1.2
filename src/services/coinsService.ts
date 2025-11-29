
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

  // Determine daily allowance from subscription
  const subscription = await getSubscriptionForUser(userId);
  let dailyAllowance = FREE_DAILY_COINS;
  let currentPlan: string = 'free';

  if (subscription) {
    currentPlan = subscription.plan;
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

  // If no user document yet, create one with the correct daily coins
  if (!userSnap.exists()) {
    const initialCoins = dailyAllowance;
    await setDoc(
      userRef,
      {
        uid: userId,
        coins: initialCoins,
        lastCoinRewardDate: today,
        lastRewardedPlan: currentPlan,
      } as Partial<UserData>,
      { merge: true }
    );
    return initialCoins;
  }

  const data = userSnap.data() as UserData;
  const lastRewardedPlan = data.lastRewardedPlan || 'free';

  // If it's a new day OR the user has upgraded their plan, reset the coins.
  if (data.lastCoinRewardDate !== today || lastRewardedPlan !== currentPlan) {
    await updateDoc(userRef, {
      coins: dailyAllowance, // Reset coins to the new daily allowance
      lastCoinRewardDate: today,
      lastRewardedPlan: currentPlan,
    });
    return dailyAllowance;
  }

  // Same day, same plan: just return current coins
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
