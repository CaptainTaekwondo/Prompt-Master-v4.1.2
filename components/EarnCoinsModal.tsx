import React, { useState, useEffect } from 'react';
import type { UserData } from '../types.ts';
import type { translations } from '../translations.ts';

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
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [countdown, setCountdown] = useState(15);

    const today = new Date().toISOString().split('T')[0];
    const adsWatched = (userData?.adsWatchedToday?.date === today) ? userData.adsWatchedToday.count : 0;
    const sharesDone = (userData?.sharesToday?.date === today) ? userData.sharesToday.count : 0;
    
    const adLimitReached = adsWatched >= DAILY_AD_LIMIT;
    const shareLimitReached = sharesDone >= DAILY_SHARE_LIMIT;
    const allLimitsReached = adLimitReached && shareLimitReached;

    const handleWatchAd = () => {
        window.open('https://otieu.com/4/10245609', '_blank');
        setIsCountingDown(true);
    };

    useEffect(() => {
        if (isCountingDown) {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                onAdComplete();
                setIsCountingDown(false);
                setCountdown(15);
            }
        }
    }, [isCountingDown, countdown, onAdComplete]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="w-full max-w-lg bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-white/20 relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 end-3 text-white/50 hover:text-white transition-colors text-2xl">&times;</button>
                
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
                                    onClick={handleWatchAd}
                                    disabled={isCountingDown}
                                    className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-500"
                                >
                                    {isCountingDown ? `${t.watchingAd}... ${countdown}` : `${t.watchAdButton} (${DAILY_AD_LIMIT - adsWatched} ${t.adsRemaining})`}
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
            </div>
        </div>
    );
};
