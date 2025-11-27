import React, { useState, useEffect } from 'react';
import type { translations } from '../translations';

type Translations = typeof translations['en'];

interface AdPlayerProps {
    onComplete: () => void;
    t: Translations;
}

const AD_DURATION = 15;
const AD_URL = 'https://otieu.com/4/10245609';

export const AdPlayer: React.FC<AdPlayerProps> = ({ onComplete, t }) => {
    const [countdown, setCountdown] = useState(AD_DURATION);

    useEffect(() => {
        window.open(AD_URL, '_blank');

        const countdownTimer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownTimer);
                    onComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(countdownTimer);
        };
    }, [onComplete]);

    return (
        <div className="relative w-full aspect-video bg-gray-800 rounded-lg overflow-hidden flex flex-col items-center justify-center text-white p-4">
            <h3 className="text-xl font-bold mb-2">Ad is playing in a new tab</h3>
            <p className="text-center mb-4">You will be rewarded shortly. Please do not close this window.</p>
            <div className="text-2xl font-bold">
                {t.rewardIn.replace('{seconds}', String(countdown))}
            </div>
        </div>
    );
};
