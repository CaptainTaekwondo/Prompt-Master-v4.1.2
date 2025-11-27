import { useEffect } from 'react';
import { useIsPremiumUser } from './useIsPremiumUser';

const MONETAG_SCRIPT_SRC = 'https://quge5.com/88/tag.min.js';

export function useMonetagLoader() {
    const isPremiumUser = useIsPremiumUser();

    useEffect(() => {
        const scriptId = 'monetag-script';
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;

        if (!isPremiumUser) {
            if (!script) {
                script = document.createElement('script');
                script.id = scriptId;
                script.src = MONETAG_SCRIPT_SRC;
                script.dataset.zone = '188606';
                script.async = true;
                script.dataset.cfasync = 'false';
                document.body.appendChild(script);
            }
        } else {
            if (script) {
                script.remove();
            }
        }

        // No cleanup needed on unmount, as we want the script to stay if the user is not premium
    }, [isPremiumUser]);
}
