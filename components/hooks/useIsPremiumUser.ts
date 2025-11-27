
import { useUserData } from './useUserData';

export function useIsPremiumUser() {
    const { currentUserData } = useUserData();
    return currentUserData?.proTier !== null;
}
