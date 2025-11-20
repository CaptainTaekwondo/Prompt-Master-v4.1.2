


import React, { useState, forwardRef } from 'react';
import { Card } from './Card.tsx';
import type { translations } from '../translations.ts';
import type { GenerationMode, ProTier } from '../types.ts';
import { Tooltip } from './Tooltip.tsx';

type Translations = typeof translations['en'];

interface IdeaInputProps {
  userInput: string;
  setUserInput: (value: string) => void;
  t: Translations;
  placeholderText: string;
  isEnhancedText: boolean;
  onTextChange: () => void;
  mode: GenerationMode;
  isCardOnFire: boolean;
  onGetNewIdea: () => void;
  currentUser: any;
  proTier: ProTier | null;
  language: 'en' | 'ar' | 'fr';
}

export const IdeaInput = forwardRef<HTMLTextAreaElement, IdeaInputProps>(({ 
  userInput, 
  setUserInput, 
  t, 
  placeholderText,
  isEnhancedText,
  onTextChange,
  mode,
  isCardOnFire,
  onGetNewIdea,
  currentUser,
  proTier,
  language,
}, ref) => {
  const [copied, setCopied] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
    onTextChange();
  }
  
  const handleCopy = () => {
    navigator.clipboard.writeText(userInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDynamicTranslateURL = () => {
    if (language === 'ar') {
      return 'https://translate.google.com/?sl=ar&tl=en&op=translate';
    } else if (language === 'fr') {
      return 'https://translate.google.com/?sl=fr&tl=en&op=translate';
    }
    // Default case, including 'en'
    return 'https://translate.google.com/?sl=auto&tl=en&op=translate';
  };

  const isPro = proTier === 'gold';

  const cardActions = (
    <div className="flex items-center gap-2">
      <Tooltip text={t.translationAssistantTooltip}>
        <a
          href={getDynamicTranslateURL()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-lg px-3 py-1.5 text-xs font-bold hover:from-blue-600 hover:to-sky-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-px"
          aria-label={t.translationAssistantTooltip}
        >
          <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 0h24v24H0z" fill="none"/>
            <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
          </svg>
          <span>{t.translateButton}</span>
        </a>
      </Tooltip>
      {isEnhancedText && userInput ? (
        <button 
            onClick={handleCopy} 
            title={copied ? t.copiedButton : t.copyButton} 
            className="p-2 bg-slate-200/60 dark:bg-black/30 backdrop-blur-sm rounded-full hover:bg-slate-300/80 dark:hover:bg-black/40 transition-colors"
        >
            {copied ? '✅' : '📋'}
        </button>
      ) : null}
    </div>
  );

  return (
    <Card 
      title={
        <span>
          {t.ideaCardTitle}
          <span className="inline-flex align-middle ms-1">
            <Tooltip text={t.ideaCardTooltip} />
          </span>
        </span>
      }
      icon={<span className={`transition-all duration-300 ${userInput ? 'lit-icon' : ''}`}>💡</span>} 
      actions={cardActions}
    >
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="relative w-full">
            <textarea
              ref={ref}
              value={userInput}
              onChange={handleTextChange}
              placeholder={placeholderText}
              className="relative w-full h-36 md:h-28 p-3 ltr:pr-16 rtl:pl-16 bg-slate-100 dark:bg-black/30 border-2 border-slate-300 dark:border-white/30 rounded-lg text-lg text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400 transition-colors"
            />
            <div className="absolute top-3 ltr:right-3 rtl:left-3 flex items-center space-x-1 rtl:space-x-reverse">
                <button
                    type="button"
                    onClick={onGetNewIdea}
                    className="p-1.5 bg-slate-200/60 dark:bg-black/30 rounded-full hover:bg-slate-300/80 dark:hover:bg-black/40 transition-colors"
                    aria-label={t.addNewIdeaTooltip}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600 dark:text-white/70" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                </button>
                <Tooltip text={t.addNewIdeaTooltip} />
            </div>
            {isCardOnFire && (
                <div className={`fire-overlay ${isCardOnFire ? 'visible' : ''}`} aria-hidden="true">
                  <span className="fire-emoji" style={{ top: '15%', left: '20%', animationDelay: '0s' }}>🔥</span>
                  <span className="fire-emoji" style={{ top: '40%', left: '80%', animationDelay: '0.3s' }}>🔥</span>
                  <span className="fire-emoji" style={{ top: '65%', left: '30%', animationDelay: '0.6s' }}>🔥</span>
                  <span className="fire-emoji" style={{ top: '25%', left: '90%', animationDelay: '0.9s' }}>🔥</span>
                  <span className="fire-emoji" style={{ top: '75%', left: '10%', animationDelay: '1.2s' }}>🔥</span>
                  <span className="fire-emoji" style={{ top: '50%', left: '50%', animationDelay: '0.2s' }}>🔥</span>
                </div>
            )}
        </div>
      </div>
    </Card>
  );
});