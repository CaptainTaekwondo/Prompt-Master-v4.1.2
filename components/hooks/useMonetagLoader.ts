import { useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';

const MONETAG_SCRIPT_ID = 'monetag-script';
const MONETAG_SCRIPT_SRC = 'https://quge5.com/88/tag.min.js';
const MONETAG_ZONE_ID = '188606';

export function useMonetagLoader() {
  const { isPremium, loading } = useAuth();

  useEffect(() => {
    console.log('[MonetagLoader] loading =', loading, 'isPremium =', isPremium);

    // لو ما زال الـ Auth في حالة تحميل، لا تقرر أي شيء ولا تحمّل السكربت
    if (loading) return;

    let script =
      (document.getElementById(MONETAG_SCRIPT_ID) as HTMLScriptElement | null) ||
      (document.querySelector(`script[src="${MONETAG_SCRIPT_SRC}"]`) as HTMLScriptElement | null);

    if (isPremium) {
      // لو المستخدم مشترك في أي باقة → احذف سكربت Monetag إن وُجد
      if (script) {
        script.remove();
      }
      return;
    }

    // لو المستخدم Free (isPremium = false) → حمّل سكربت Monetag MultiTag لو مش موجود
    if (!script) {
      script = document.createElement('script');
      script.id = MONETAG_SCRIPT_ID;
      script.src = MONETAG_SCRIPT_SRC;
      script.async = true;
      script.dataset.zone = MONETAG_ZONE_ID;
      script.dataset.cfasync = 'false';
      document.body.appendChild(script);
    }
  }, [isPremium, loading]);
}
