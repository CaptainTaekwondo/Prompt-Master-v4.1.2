

import React, { useState, useRef, useEffect } from 'react';
import type { translations } from '../translations.ts';
import type { GeneratedPrompt } from '../types.ts';

type Translations = typeof translations['en'];

interface ResultsDisplayProps {
  result: GeneratedPrompt | null;
  t: Translations;
  currentUser: any;
  isFavorite: (promptId: string) => boolean;
  onToggleFavorite: (prompt: GeneratedPrompt) => void;
}

const ResultCard: React.FC<{ 
  promptData: GeneratedPrompt; 
  t: Translations;
  currentUser: any;
  isFavorite: boolean;
  onToggleFavorite: (prompt: GeneratedPrompt) => void;
}> = ({ promptData, t, currentUser, isFavorite, onToggleFavorite }) => {
  const [copied, setCopied] = useState(false);
  const { prompt, platformName, platformIcon, platformUrl } = promptData;

  const [animationState, setAnimationState] = useState<'in' | 'out' | 'idle'>('idle');
  const prevIsFavorite = useRef(isFavorite);

  useEffect(() => {
    if (prevIsFavorite.current !== isFavorite) {
      setAnimationState(isFavorite ? 'in' : 'out');
    }
    prevIsFavorite.current = isFavorite;
  }, [isFavorite]);


  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleShare = async () => {
    const siteUrl = window.location.origin;
    const shareText = `${prompt}\n\n---\n${t.sharePromptCredit}\n${siteUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PROMPT MASTER Prompt',
          text: shareText,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Share feature not available. Prompt content copied to clipboard.');
    }
  };

  const handleAnimationEnd = () => {
    if (animationState !== 'idle') {
      setAnimationState('idle');
    }
  };

  const starCharacter = isFavorite || animationState === 'out' ? '🌟' : '⭐️';
  const animationClass = animationState === 'in' ? 'animate-star-in' : animationState === 'out' ? 'animate-star-out' : '';


  return (
    <div className="bg-white/90 dark:bg-black/20 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-transparent dark:border-white/20 flex flex-col w-full mx-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold flex items-center text-slate-800 dark:text-white">
          <span className="text-2xl me-2">{platformIcon}</span>
          {platformName}
        </h3>
        <div className="flex items-center gap-2">
            {currentUser && (
              <button
                onClick={() => onToggleFavorite(promptData)}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                className="p-2 text-2xl transition-transform transform hover:scale-125"
              >
                <span className={animationClass} onAnimationEnd={handleAnimationEnd}>
                  {starCharacter}
                </span>
              </button>
            )}
            <button
                onClick={handleCopy}
                title={copied ? t.copiedButton : t.copyButton}
                className={`p-2 bg-black/10 dark:bg-black/30 rounded-md hover:bg-black/20 dark:hover:bg-white/20 transition-colors text-xl ${copied ? 'text-green-500' : 'text-slate-600 dark:text-white'}`}
                >
                {copied ? '✅' : '📋'}
            </button>
        </div>
      </div>
      <div className="relative">
          <div
              className="flex-grow text-slate-700 dark:text-white/90 bg-slate-100 dark:bg-black/20 p-3 rounded-md text-sm break-words max-h-96 overflow-y-auto"
              style={{ whiteSpace: 'pre-wrap' }}
          >
              {prompt}
          </div>
      </div>

      <div className={`grid ${platformUrl === '#' ? 'grid-cols-1' : 'grid-cols-2'} gap-2 mt-3`}>
         <button
          onClick={handleShare}
          className="w-full text-center py-2 px-3 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center justify-center"
        >
          {t.shareButton} <span className="ltr:ml-2 rtl:mr-2">🔗</span>
        </button>
        {platformUrl !== '#' && (
            <a
                href={platformUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2 px-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center"
            >
                {t.goToWebsiteButton} <span className="ltr:ml-2 rtl:mr-2">🚀</span>
            </a>
        )}
      </div>
    </div>
  );
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, t, currentUser, isFavorite, onToggleFavorite }) => {
  if (!result) {
    return (
      <div className="bg-white/10 dark:bg-black/20 backdrop-blur-lg rounded-xl p-6 shadow-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center h-full min-h-[200px] text-center">
        <span className="text-4xl mb-4 opacity-50">✨</span>
        <h3 className="text-lg font-semibold text-white/80">{t.resultsTitle}</h3>
        <p className="text-white/60">{t.resultsPlaceholder}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-6 text-white dark:text-white">{t.resultsTitle}</h2>
      <ResultCard
        promptData={result}
        t={t}
        currentUser={currentUser}
        isFavorite={isFavorite(result.id)}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
};