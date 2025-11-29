import { useEffect } from 'react';
import { useIsPremiumUser } from './useIsPremiumUser';

const MONETAG_SCRIPT_SRC = 'https://quge5.com/88/tag.min.js';

export function useMonetagLoader() {
    const isPremiumUser = useIsPremiumUser();

    useEffect(() => {
        const scriptId = 'monetag-script';
        
        if (!isPremiumUser) {
            // For non-premium users, add the script if it doesn't exist.
            if (!document.getElementById(scriptId)) {
                const script = document.createElement('script');
                script.id = scriptId;
                script.src = MONETAG_SCRIPT_SRC;
                script.dataset.zone = '188606';
                script.async = true;
                script.dataset.cfasync = 'false';
                document.body.appendChild(script);
            }
        } else {
            // For premium users, find and remove the script.
            // We'll try to find it by ID and by SRC for robustness.
            const scriptElement = document.getElementById(scriptId) || document.querySelector(`script[src="${MONETAG_SCRIPT_SRC}"]`);
            
            if (scriptElement) {
                scriptElement.remove();
            }
        }
    }, [isPremiumUser]);
}
