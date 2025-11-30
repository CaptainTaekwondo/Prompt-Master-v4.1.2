import { useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';

const MONETAG_SCRIPT_ID = 'monetag-sdk';
const MONETAG_SCRIPT_SRC = '//monetag.com/d/p/243/2764197.js';

export function useMonetagLoader() {
  const { isPremium } = useAuth();

  useEffect(() => {
    console.log('[MonetagLoader] isPremium =', isPremium);
    const existingScript = document.getElementById(MONETAG_SCRIPT_ID);

    if (isPremium) {
      // لو المستخدم مشترك في أي باقة، احذف سكربت Monetag إن وُجد ولا تحمّله مرة أخرى
      if (existingScript) {
        existingScript.remove();
      }
      return;
    }

    // لو المستخدم غير مشترك، حمّل سكربت Monetag لو مش موجود
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = MONETAG_SCRIPT_ID;
      script.src = MONETAG_SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  }, [isPremium]);
}