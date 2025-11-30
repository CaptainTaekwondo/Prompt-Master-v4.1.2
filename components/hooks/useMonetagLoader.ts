import { useEffect } from 'react';
import { useIsPremiumUser } from './useIsPremiumUser';

const MONETAG_SCRIPT_SRC = 'https://quge5.com/88/tag.min.js';

export function useMonetagLoader() {
    const isPremiumUser = useIsPremiumUser();

    useEffect(() => {
        const scriptId = 'monetag-script';
        const scriptElement = document.getElementById(scriptId);

        if (isPremiumUser) {
            // If the user is premium, remove the script if it exists.
            if (scriptElement) {
                scriptElement.remove();
            }
        } else {
            // If the user is not premium, add the script if it doesn't exist.
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
    }, [isPremiumUser]);
}
