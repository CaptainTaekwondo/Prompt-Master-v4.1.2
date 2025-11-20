

import React, { useState, useRef, useEffect } from 'react';
import type { UserData, ProTier } from '../types.ts';

type Theme = 'light' | 'dark';
type Page = 'main' | 'favorites' | 'history' | 'subscription' | 'report' | 'image_report' | 'video_report';

interface HeaderProps {
  language: 'en' | 'ar' | 'fr';
  toggleLanguage: () => void;
  slogan: string;
  slogan2: string;
  t: any;
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  currentUser: any;
  currentUserData: UserData | null;
  handleLogout: () => void;
  openLoginModal: () => void;
  openEarnCoinsModal: () => void;
  setPage: (page: Page) => void;
}

export const Header: React.FC<HeaderProps> = ({ language, toggleLanguage, slogan, slogan2, t, theme, setTheme, currentUser, currentUserData, handleLogout, openLoginModal, openEarnCoinsModal, setPage }) => {
  const [isShaking, setIsShaking] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleThemeToggle = () => {
    if (isShaking) return;
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTierBadge = (tier: ProTier | null) => {
    if (!tier) return null;
    const tierMap = {
      bronze: { className: 'tier-badge-bronze', text: 'Lite' },
      silver: { className: 'tier-badge-silver', text: 'Plus' },
      gold: { className: 'tier-badge-gold', text: 'Pro' },
    };
    // Smaller badge for use inside dropdown
    return <span className={`tier-badge ${tierMap[tier].className} !py-0.5 !px-2.5 !text-xs mt-1`}>{tierMap[tier].text}</span>
  }

  return (
    <header className="text-center mb-10">
      <div className="flex justify-between items-center p-4">
        <div className="flex flex-row items-center gap-4">
          {currentUser ? (
             <div className="flex items-center gap-2">
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setIsDropdownOpen(prev => !prev)} className="flex items-center bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/20 rounded-full p-1 text-white hover:bg-white/30 dark:hover:bg-black/40 transition-colors">
                      <img src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName}&background=random`} alt="User" className="w-9 h-9 rounded-full border-2 border-white/50" />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute top-full mt-2 ltr:left-0 rtl:right-0 w-60 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 text-start">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="font-bold text-slate-800 dark:text-white truncate">{t.welcomeUser} {currentUser.displayName}</p>
                         {currentUserData && getTierBadge(currentUserData.proTier)}
                      </div>
                      <div className="p-2 space-y-1">
                        <a href="#" onClick={(e) => { e.preventDefault(); setPage('favorites'); setIsDropdownOpen(false); }} className="block px-3 py-2 text-slate-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">{t.myFavoritesLink}</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); setPage('history'); setIsDropdownOpen(false); }} className="block px-3 py-2 text-slate-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">{t.recentHistoryLink}</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); openEarnCoinsModal(); setIsDropdownOpen(false); }} className="block px-3 py-2 text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-md font-semibold text-center">🪙 {t.earnCoinsLink}</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); setPage('subscription'); setIsDropdownOpen(false); }} className="block px-3 py-2 text-white bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 rounded-md font-semibold text-center">
                          💎 {t.subscribeProLink}
                        </a>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); setIsDropdownOpen(false); }} className="block px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg">{t.logoutButton}</a>
                    </div>
                  )}
                </div>
                {currentUserData && (
                    <div className="h-11 flex items-center gap-2 bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/20 rounded-full text-white ltr:pl-3 rtl:pr-3">
                        <span className="text-xl">🪙</span>
                        <span className="font-bold text-lg">{currentUserData.coins}</span>
                        <button 
                          onClick={openEarnCoinsModal}
                          className="ltr:ml-1 rtl:mr-1 w-5 h-5 flex items-center justify-center bg-green-500 text-white rounded-full font-bold text-base hover:bg-green-600 transition-colors"
                          title={t.earnCoinsLink}
                        >
                          +
                        </button>
                    </div>
                )}
              </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="bg-white/90 dark:bg-black/30 backdrop-blur-md border border-transparent dark:border-white/20 rounded-full px-6 py-2 text-md font-semibold text-slate-800 dark:text-white hover:bg-white dark:hover:bg-black/50 transition-colors"
            >
              {t.loginButton}
            </button>
          )}
        </div>
        
        <button
          onClick={toggleLanguage}
          className="bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/20 rounded-full p-2.5 text-xl font-semibold hover:bg-white/30 dark:hover:bg-white/20 transition-colors"
          title={t.changeLanguage}
        >
          {language === 'en' ? '🇺🇸' : language === 'ar' ? '🇵🇸' : '🇫🇷'}
        </button>
      </div>
      
      <div className="flex flex-col items-center mt-2">
          <div 
            className={`text-7xl mb-2 cursor-pointer transition-transform hover:scale-110 ${isShaking ? 'shake' : ''}`} 
            style={{ textShadow: '0 0 15px rgba(253, 224, 71, 0.7), 0 0 25px rgba(253, 224, 71, 0.5)' }}
            onClick={handleThemeToggle}
            title="Toggle Theme"
          >
            👑
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mt-4">
            PROMPT MASTER v4.1
          </h1>
      </div>

      <div className="text-lg md:text-xl text-white/80 mt-4 font-semibold">
        <p>{slogan}</p>
        <p>{slogan2}</p>
      </div>
    </header>
  );
};