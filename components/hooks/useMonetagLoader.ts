
import { useEffect } from 'react';
import { useIsPremiumUser } from './useIsPremiumUser';

const MONETAG_SCRIPT_URL = 'https://quge5.com/88/tag.min.js';
const MONETAG_ZONE = '188606';

export const useMonetagLoader = () => {
  const isPremium = useIsPremiumUser();

  useEffect(() => {
    const scriptId = 'monetag-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (isPremium) {
      if (script) {
        script.remove();
      }
      return;
    }

    if (script) {
      return;
    }

    script = document.createElement('script');
    script.id = scriptId;
    script.src = MONETAG_SCRIPT_URL;
    script.dataset.zone = MONETAG_ZONE;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');

    document.body.appendChild(script);

    return () => {
      // Clean up the script when the component unmounts or the user becomes premium
      if (script && script.parentElement) {
        script.parentElement.removeChild(script);
      }
    };
  }, [isPremium]);
};
