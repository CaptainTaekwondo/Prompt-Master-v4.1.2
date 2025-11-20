import React from 'react';
import type { translations } from '../translations.ts';

type Translations = typeof translations['en'];

interface OutOfCoinsModalProps {
  onClose: () => void;
  onSubscribe: () => void;
  onWatchAd: () => void;
  t: Translations;
}

export const OutOfCoinsModal: React.FC<OutOfCoinsModalProps> = ({ onClose, onSubscribe, onWatchAd, t }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-gradient-to-br from-red-900 via-gray-900 to-gray-900 rounded-2xl p-8 shadow-2xl border border-red-500/50 text-center" onClick={e => e.stopPropagation()}>
        <div className="text-5xl mb-4">🪙🚫</div>
        <h2 className="text-2xl font-bold mb-2">{t.outOfCoinsModalTitle}</h2>
        <p className="text-white/70 mb-6">{t.outOfCoinsModalMessage}</p>
        <div className="space-y-3 mt-6">
            <button
              onClick={() => {
                onWatchAd();
                onClose();
              }}
              className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
            >
              {t.watchAdButton}
            </button>
            <button
              onClick={() => {
                onSubscribe();
                onClose();
              }}
              className="w-full py-3 px-4 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
            >
              {t.subscribeButton}
            </button>
        </div>
      </div>
    </div>
  );
};