
import { useUserData } from './useUserData';

export const useIsPremiumUser = (): boolean => {
  const { currentUserData } = useUserData();
  return currentUserData?.proTier !== null && currentUserData?.proTier !== undefined;
};
