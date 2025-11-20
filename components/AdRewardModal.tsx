import React from 'react';
import type { translations } from '../translations.ts';

type Translations = typeof translations['en'];

interface AdRewardModalProps {
    onClose: () => void;
    t: Translations;
    userName: string;
}

export const AdRewardModal: React.FC<AdRewardModalProps> = ({ onClose, t, userName }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="w-full max-w-sm bg-gradient-to-br from-green-800 via-gray-900 to-gray-900 rounded-2xl p-8 shadow-2xl border border-green-500/50 text-center" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-2 text-white">{t.adRewardCongrats.replace('{name}', userName)}</h2>
                <p className="text-white/80 mb-6">{t.adRewardMessage}</p>
                <div className="text-5xl mb-4">🎉🪙</div>
                <button
                    onClick={onClose}
                    className="w-full py-3 px-4 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
                >
                    {t.continueButton}
                </button>
            </div>
        </div>
    );
};