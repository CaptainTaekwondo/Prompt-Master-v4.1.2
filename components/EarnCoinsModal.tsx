import React, { useState } from 'react';
import type { UserData } from '../types.ts';
import type { translations } from '../translations.ts';
import { AdPlayer } from './AdPlayer.tsx';

type Translations = typeof translations['en'];

interface EarnCoinsModalProps {
    onClose: () => void;
    onAdComplete: () => void;
    onShareForCoins: () => void;
    t: Translations;
    userData: UserData | null;
    onSubscribe: () => void;
}

const DAILY_AD_LIMIT = 10;
const DAILY_SHARE_LIMIT = 5;

export const EarnCoinsModal: React.FC<EarnCoinsModalProps> = ({ onClose, onAdComplete, onShareForCoins, t, userData, onSubscribe }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    
    const today = new Date().toISOString().split('T')[0];
    const adsWatched = (userData?.adsWatchedToday?.date === today) ? userData.adsWatchedToday.count : 0;
    const sharesDone = (userData?.sharesToday?.date === today) ? userData.sharesToday.count : 0;
    
    const adLimitReached = adsWatched >= DAILY_AD_LIMIT;
    const shareLimitReached = sharesDone >= DAILY_SHARE_LIMIT;
    const allLimitsReached = adLimitReached && shareLimitReached;


    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="w-full max-w-lg bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-white/20 relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 end-3 text-white/50 hover:text-white transition-colors text-2xl">&times;</button>
                
                {isPlaying ? (
                    <AdPlayer onComplete={onAdComplete} t={t} />
                ) : (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">{allLimitsReached ? t.dailyLimitReachedTitle : t.earnCoinsModalTitle}</h2>
                        <p className="text-white/70 mb-6">{allLimitsReached ? t.dailyLimitReachedMessage : t.earnCoinsModalMessage}</p>
                        
                        {allLimitsReached ? (
                             <button
                                onClick={onSubscribe}
                                className="w-full py-3 px-4 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                {t.subscribeButton}
                            </button>
                        ) : (
                            <div className="space-y-3">
                                {!adLimitReached && (
                                    <button
                                        onClick={() => setIsPlaying(true)}
                                        className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        {t.watchAdButton} ({DAILY_AD_LIMIT - adsWatched} {t.adsRemaining})
                                    </button>
                                )}
                                {!shareLimitReached && (
                                     <button
                                        onClick={onShareForCoins}
                                        className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        {t.shareLinkButton} ({DAILY_SHARE_LIMIT - sharesDone} {t.sharesRemaining})
                                    </button>
                                )}
                             </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};