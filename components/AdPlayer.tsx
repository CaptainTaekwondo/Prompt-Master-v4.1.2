import React, { useState, useEffect, useRef } from 'react';
import { AD_VIDEOS } from './constants.ts';
import type { translations } from '../translations.ts';

type Translations = typeof translations['en'];

interface AdPlayerProps {
    onComplete: () => void;
    t: Translations;
}

const AD_DURATION = 15;
const SKIP_DELAY = 5;

export const AdPlayer: React.FC<AdPlayerProps> = ({ onComplete, t }) => {
    const [countdown, setCountdown] = useState(SKIP_DELAY);
    const [canSkip, setCanSkip] = useState(false);
    const videoRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    setCanSkip(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const adCompleteTimer = setTimeout(() => {
            onComplete();
        }, AD_DURATION * 1000);

        return () => {
            clearInterval(timer);
            clearTimeout(adCompleteTimer);
        };
    }, [onComplete]);
    
    const randomAdUrl = AD_VIDEOS[Math.floor(Math.random() * AD_VIDEOS.length)];

    return (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
                ref={videoRef}
                src={randomAdUrl}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-full"
            ></iframe>
            <div className="absolute bottom-4 right-4">
                {canSkip ? (
                    <button onClick={onComplete} className="bg-black/70 text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-black">
                        {t.skipAdButton}
                    </button>
                ) : (
                    <div className="bg-black/70 text-white px-4 py-1.5 rounded-full text-sm">
                        {t.skipAdButtonIn.replace('{seconds}', String(countdown))}
                    </div>
                )}
            </div>
        </div>
    );
};
