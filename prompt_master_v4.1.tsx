
import React, { useState, useRef } from 'react';
import { Header } from './components/Header.tsx';
import { IdeaInput } from './components/IdeaInput.tsx';
import { SettingsPanel } from './components/SettingsPanel.tsx';
import { ResultsDisplay } from './components/ResultsDisplay.tsx';
import { Login } from './components/Login.tsx';
import { SavePromptModal } from './components/SavePromptModal.tsx';
import { OutOfCoinsModal } from './components/OutOfCoinsModal.tsx';
import { PromptsPage } from './components/PromptsPage.tsx';
import { SubscriptionPage } from './components/SubscriptionPage.tsx';
import { EarnCoinsModal } from './components/EarnCoinsModal.tsx';
import { AdRewardModal } from './components/AdRewardModal.tsx';
import { PerformanceReport } from './components/PerformanceReport.tsx';
import { RocketAnimation } from './components/RocketAnimation.tsx';


import { useUserSettings } from './components/hooks/useUserSettings.ts';
import { useUserData } from './components/hooks/useUserData.ts';
import { useModals } from './components/hooks/useModals.ts';
import { usePromptGeneration } from './components/hooks/usePromptGeneration.ts';
import { translations } from './translations.ts';
import type { GeneratedPrompt, ProTier } from './types.ts';

type TranslationKeys = keyof typeof translations['en'];
type Page = 'main' | 'favorites' | 'history' | 'subscription' | 'report' | 'image_report' | 'video_report';

export default function PromptV4_1() {
  const { language, theme, setTheme, toggleLanguage } = useUserSettings();
  // Add a robust fallback to ensure `t` is always defined, preventing crashes from invalid language settings.
  const t = translations[language as keyof typeof translations] || translations.en;

  const { currentUser, currentUserData, updateUserData, handleLogin, handleLogout, handlePurchase, deletePrompt, handleWatchAd, handleShareReward } = useUserData();
  
  const {
      isLoginModalOpen, openLoginModal, closeLoginModal,
      isSaveModalOpen, openSaveModal, closeSaveModal, promptToSave,
      isOutOfCoinsModalOpen, openOutOfCoinsModal, closeOutOfCoinsModal,
      isEarnCoinsModalOpen, openEarnCoinsModal, closeEarnCoinsModal,
      isAdRewardModalOpen, openAdRewardModal, closeAdRewardModal,
  } = useModals();

  const [errorKey, setErrorKey] = useState<TranslationKeys | null>(null);
  
  const {
    userInput, setUserInput,
    mode, setMode,
    settings, setSettings,
    proTextSettings, setProTextSettings,
    selectedPlatformName, setSelectedPlatformName,
    generatedResult, setGeneratedResult,
    isProcessing,
    processingLabelKey,
    isEnhancedText, setIsEnhancedText,
    placeholderText,
    handleGenerate,
    handleGetNewIdea,
  } = usePromptGeneration({
    setErrorKey,
    t,
    language,
    currentUser,
    currentUserData,
    updateUserData,
    openOutOfCoinsModal,
  });

  const [page, setPage] = useState<Page>('main');
  const [isLaunching, setIsLaunching] = useState(false);
  const [isCardOnFire, setIsCardOnFire] = useState(false);
  const generateButtonRef = useRef<HTMLButtonElement>(null);
  const ideaCardWrapperRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const handlePurchaseSuccess = (tier: ProTier, durationDays: number) => {
      handlePurchase(tier, durationDays);
      setPage('main');
  };

  const handleToggleFavorite = (prompt: GeneratedPrompt) => {
      if (!currentUser) { openLoginModal(); return; }
      if (!currentUserData) return;
      
      const isFav = currentUserData.favorites.some(f => f.id === prompt.id);
      if (isFav) {
          const updatedFavs = currentUserData.favorites.filter(f => f.id !== prompt.id);
          updateUserData({ favorites: updatedFavs });
      } else {
          openSaveModal(prompt);
      }
  };

  const handleSavePrompt = (prompt: GeneratedPrompt, name: string) => {
      if (!currentUserData) return;
      const namedPrompt = { ...prompt, name };
      const updatedFavs = [namedPrompt, ...currentUserData.favorites];
      updateUserData({ favorites: updatedFavs });
  };
  
  const handleUsePrompt = (prompt: GeneratedPrompt) => {
    setUserInput(prompt.baseIdea);
    setMode(prompt.mode);
    if(prompt.settings) setSettings(prompt.settings);
    if(prompt.proTextSettings) setProTextSettings(prompt.proTextSettings);
    setGeneratedResult(prompt);
    setPage('main');
    setTimeout(() => {
        ideaCardWrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

    const onWatchAd = () => {
        closeOutOfCoinsModal();
        openEarnCoinsModal();
    };

    const onAdComplete = () => {
        const success = handleWatchAd();
        if (success) {
            closeEarnCoinsModal();
            openAdRewardModal();
        } else {
            closeEarnCoinsModal();
        }
    };
    
    const handleShareForCoins = async () => {
        const shareData = {
            title: 'PROMPT MASTER v4.1',
            text: t.sharePageText,
            url: window.location.origin,
        };
        try {
            await navigator.share(shareData);
            const rewarded = handleShareReward();
            if (rewarded) {
                closeEarnCoinsModal();
            }
        } catch (err) {
            console.error('Share failed:', err);
        }
    };
  
  const handleGenerateClick = () => {
    if (!currentUser) { openLoginModal(); return; }
    if (isProcessing || isLaunching || !userInput) return;
    setIsLaunching(true);
  };

  const handleAnimationComplete = async () => {
    setIsCardOnFire(true);
    await handleGenerate();
    
    setTimeout(() => {
      setIsCardOnFire(false);
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsLaunching(false);
    }, 2000);
  };
  
  const renderPage = () => {
    switch(page) {
      case 'favorites':
        return <PromptsPage type="favorites" prompts={currentUserData?.favorites || []} onUse={handleUsePrompt} onDelete={deletePrompt} onBack={() => setPage('main')} t={t} />;
      case 'history':
        return <PromptsPage type="history" prompts={currentUserData?.history || []} onUse={handleUsePrompt} onDelete={deletePrompt} onBack={() => setPage('main')} t={t} />;
      case 'subscription':
        return <SubscriptionPage onBack={() => setPage('main')} onPurchase={handlePurchaseSuccess} t={t} />;
      case 'report':
        return <PerformanceReport onBack={() => setPage('main')} t={t} mode="text" />;
      case 'image_report':
        return <PerformanceReport onBack={() => setPage('main')} t={t} mode="image" />;
      case 'video_report':
        return <PerformanceReport onBack={() => setPage('main')} t={t} mode="video" />;
      case 'main':
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div ref={ideaCardWrapperRef}><IdeaInput ref={textAreaRef} userInput={userInput} setUserInput={setUserInput} t={t} placeholderText={placeholderText} isEnhancedText={isEnhancedText} onTextChange={() => setIsEnhancedText(false)} mode={mode} isCardOnFire={isCardOnFire} onGetNewIdea={handleGetNewIdea} currentUser={currentUser} proTier={currentUserData?.proTier || null} language={language} /></div>
              <SettingsPanel settings={settings} setSettings={setSettings} proTextSettings={proTextSettings} setProTextSettings={setProTextSettings} mode={mode} setMode={setMode} selectedPlatformName={selectedPlatformName} setSelectedPlatformName={setSelectedPlatformName} t={t} setPage={(p: string) => setPage(p as Page)} />
              <div className="text-center">
                <button ref={generateButtonRef} onClick={handleGenerateClick} disabled={isProcessing || isLaunching || !userInput} className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 px-10 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center text-lg">
                  {isProcessing || isLaunching ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white ltr:mr-3 rtl:ml-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t[processingLabelKey as TranslationKeys] || t.generatingButton}
                    </>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="relative"><span className="absolute top-1/2 -translate-y-1/2 ltr:right-full rtl:left-full ltr:mr-2 rtl:ml-2 text-xl rocket-icon">🚀</span><span>{t.generateButton}</span></span>
                      {currentUser && currentUserData?.proTier !== 'gold' && <span className="text-xs opacity-80 mt-1">{t.costGenerate} 🪙</span>}
                    </div>
                  )}
                </button>
                {errorKey && <p className="text-red-400 mt-4 animate-pulse">{t[errorKey] as string}</p>}
              </div>
            </div>
            <div ref={resultsRef} className="lg:col-span-1 space-y-8">
              <ResultsDisplay result={generatedResult} t={t} currentUser={currentUser} isFavorite={(id) => currentUserData?.favorites.some(f => f.id === id) || false} onToggleFavorite={handleToggleFavorite} />
            </div>
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen text-slate-800 dark:text-white selection:bg-purple-500 selection:text-white transition-colors duration-300">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <Header language={language} toggleLanguage={toggleLanguage} slogan={t.headerSlogan} slogan2={t.headerSlogan2} t={t} theme={theme} setTheme={setTheme} currentUser={currentUser} currentUserData={currentUserData} handleLogout={handleLogout} openLoginModal={openLoginModal} openEarnCoinsModal={openEarnCoinsModal} setPage={setPage} />
        <main>{renderPage()}</main>
        <footer className="text-center text-sm text-white/60 dark:text-white/40 mt-12 pb-4">
          <p>{t.footerDevelopedBy}</p>
          <p>{t.footerSlogan}</p>
        </footer>
      </div>
      {isLaunching && (
        <RocketAnimation 
            startRef={generateButtonRef}
            endRef={textAreaRef}
            onAnimationComplete={handleAnimationComplete}
        />
      )}
      {isLoginModalOpen && <Login onClose={closeLoginModal} handleLogin={(method) => { handleLogin(method); closeLoginModal(); }} t={t} />}
      {isSaveModalOpen && promptToSave && <SavePromptModal onClose={closeSaveModal} onSave={(name) => handleSavePrompt(promptToSave, name)} t={t} />}
      {isOutOfCoinsModalOpen && <OutOfCoinsModal onClose={closeOutOfCoinsModal} onSubscribe={() => setPage('subscription')} onWatchAd={onWatchAd} t={t} />}
      {isEarnCoinsModalOpen && <EarnCoinsModal onClose={closeEarnCoinsModal} onAdComplete={onAdComplete} onShareForCoins={handleShareForCoins} t={t} userData={currentUserData} onSubscribe={() => { closeEarnCoinsModal(); setPage('subscription'); }} />}
      {isAdRewardModalOpen && <AdRewardModal onClose={closeAdRewardModal} t={t} userName={currentUser?.displayName || 'Guest'} />}
    </div>
  );
}
