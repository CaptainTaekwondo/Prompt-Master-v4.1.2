import { useEffect } from 'react';

const MONETAG_SCRIPT_ID = 'monetag-script';

export function useMonetagLoader() {
  useEffect(() => {
    // إزالة أي سكربت Monetag تم تحميله سابقًا عن طريق هذا المشروع
    const byId = document.getElementById(MONETAG_SCRIPT_ID);
    if (byId) {
      byId.remove();
    }

    // إزالة أي سكربتات تحتوي على quge5 أو monetag من الـ DOM (احتياطيًا)
    const bySrc = document.querySelectorAll(
      'script[src*="quge5.com"], script[src*="monetag.com"], script[src*="otieu.com"]'
    );
    bySrc.forEach((el) => el.parentElement?.removeChild(el));

    // لا نقوم بتحميل أي سكربت إعلاني جديد على الإطلاق
  }, []);
}