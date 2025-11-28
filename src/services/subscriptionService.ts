
import { db } from '../lib/firebase';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

export type PlanId = 'lite' | 'plus' | 'pro';

export interface UserSubscription {
  plan: PlanId;
  startAt: Timestamp;
  endAt: Timestamp;
  orderId?: string;
}

/**
 * Activates a new subscription for a user and stores it in Firestore.
 * @param userId The ID of the user.
 * @param plan The ID of the selected plan.
 * @param orderId The optional PayPal order ID.
 */
export async function activateSubscriptionForUser(
  userId: string,
  plan: PlanId,
  orderId?: string
): Promise<void> {
  const startAt = new Date();
  const endAt = new Date();

  switch (plan) {
    case 'lite':
      endAt.setDate(startAt.getDate() + 7);
      break;
    case 'plus':
      endAt.setDate(startAt.getDate() + 30);
      break;
    case 'pro':
      endAt.setDate(startAt.getDate() + 90);
      break;
  }

  const subscription: UserSubscription = {
    plan,
    startAt: Timestamp.fromDate(startAt),
    endAt: Timestamp.fromDate(endAt),
    orderId,
  };

  const subscriptionRef = doc(db, 'subscriptions', userId);
  await setDoc(subscriptionRef, subscription);
}

/**
 * Retrieves a user's subscription from Firestore and checks if it's still valid.
 * @param userId The ID of the user.
 * @returns The user's subscription if it exists and is not expired, otherwise null.
 */
export async function getSubscriptionForUser(userId: string): Promise<UserSubscription | null> {
  const subscriptionRef = doc(db, 'subscriptions', userId);
  const docSnap = await getDoc(subscriptionRef);

  if (!docSnap.exists()) {
    return null;
  }

  const subscription = docSnap.data() as UserSubscription;

  // Check if the subscription has expired
  if (subscription.endAt.toDate() < new Date()) {
    return null; // Subscription is expired
  }

  return subscription;
}
