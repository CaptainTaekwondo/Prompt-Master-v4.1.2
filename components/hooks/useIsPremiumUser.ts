
import { useAuth } from '../../src/context/AuthContext';

export function useIsPremiumUser() {
    const { isPremium } = useAuth();
    return isPremium;
}
