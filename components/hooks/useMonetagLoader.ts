import { useEffect, useRef } from 'react';
import { useIsPremiumUser } from './useIsPremiumUser';

const MONETAG_SCRIPT_SRC = 'https://quge5.com/88/tag.min.js';

export function useMonetagLoader() {
    const isPremiumUser = useIsPremiumUser();
    const prevIsPremiumUser = useRef<boolean>();

    useEffect(() => {
        const scriptId = 'monetag-script';
        const scriptElement = document.getElementById(scriptId) || document.querySelector(`script[src="${MONETAG_SCRIPT_SRC}"]`);

        // Reload ONLY on the transition from non-premium to premium
        if (prevIsPremiumUser.current === false && isPremiumUser === true) {
            window.location.reload();
            return; // Stop the hook here to wait for the reload
        }

        if (isPremiumUser) {
            // For premium users, ensure the ad script is removed.
            // This will run after the one-time reload.
            if (scriptElement) {
                scriptElement.remove();
            }
        } else {
            // For non-premium users, add the script if it's missing.
            if (!scriptElement) {
                const script = document.createElement('script');
                script.id = scriptId;
                script.src = MONETAG_SCRIPT_SRC;
                script.dataset.zone = '188606';
                script.async = true;
                script.dataset.cfasync = 'false';
                document.body.appendChild(script);
            }
        }

        // Update the previous value for the next render
        prevIsPremiumUser.current = isPremiumUser;
    }, [isPremiumUser]);
}
