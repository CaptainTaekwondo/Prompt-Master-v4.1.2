import { useEffect, useRef } from 'react';
import { useIsPremiumUser } from './useIsPremiumUser';

const MONETAG_SCRIPT_SRC = 'https://quge5.com/88/tag.min.js';
const RELOAD_FLAG = 'premium_upgrade_reload';

export function useMonetagLoader() {
    const isPremiumUser = useIsPremiumUser();
    const prevIsPremiumUser = useRef<boolean>();

    useEffect(() => {
        // Check if the page was reloaded due to a premium upgrade.
        const didReload = sessionStorage.getItem(RELOAD_FLAG);
        if (didReload) {
            // Clear the flag to prevent logic loops and stop execution for this render.
            sessionStorage.removeItem(RELOAD_FLAG);
            // Assume the user is premium now and set the ref to prevent false triggers.
            prevIsPremiumUser.current = true;
            return;
        }

        // Reload ONLY on the transition from non-premium to premium.
        if (prevIsPremiumUser.current === false && isPremiumUser === true) {
            // Set a flag in session storage before reloading.
            sessionStorage.setItem(RELOAD_FLAG, 'true');
            window.location.reload();
            return; // Stop the hook here to wait for the reload
        }

        const scriptId = 'monetag-script';
        const scriptElement = document.getElementById(scriptId) || document.querySelector(`script[src="${MONETAG_SCRIPT_SRC}"]`);

        // Standard ad script logic
        if (isPremiumUser) {
            if (scriptElement) {
                scriptElement.remove();
            }
        } else {
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
