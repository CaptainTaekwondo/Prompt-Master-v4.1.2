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
import { PaymentModal } from './components/PaymentModal.tsx';
import { PaymentOptionsModal } from './components/PaymentOptionsModal.tsx';
import PrivacyPolicy from './src/pages/PrivacyPolicy.tsx';
import TermsOfUse from './src/pages/TermsOfUse.tsx';
import { useAuth } from './src/context/AuthContext.tsx';


import { useUserSettings } from './components/hooks/useUserSettings.ts';
import { useUserData } from './components/hooks/useUserData.ts';
import { useModals } from './components/hooks/useModals.ts';
import { usePromptGeneration } from './components/hooks/usePromptGeneration.ts';
import { useMonetagLoader } from './components/hooks/useMonetagLoader.ts';
import { translations } from './translations.ts';
import type { GeneratedPrompt, ProTier } from './types.ts';

type TranslationKeys = keyof typeof translations['en'];
type Page =
  | 'main'
  | 'favorites'
  | 'history'
  | 'subscription'
  | 'report'
  | 'image_report'
  | 'video_report'
  | 'privacy'
  | 'terms'
  | 'about'
  | 'contact';

export default function PromptV4_1() {
  const { language, theme, setTheme, toggleLanguage } = useUserSettings();
  const footerLabels =
    language === 'ar'
      ? {
          about: 'من نحن',
          terms: 'شروط الاستخدام',
          privacy: 'سياسة الخصوصية',
          contact: 'اتصل بنا',
        }
      : {
          about: 'About Us',
          terms: 'Terms of Use',
          privacy: 'Privacy Policy',
          contact: 'Contact Us',
        };
  const t = translations[language as keyof typeof translations] || translations.en;
  const { user: currentUser, logout, isPremium, currentPlan } = useAuth();

  const { userData: currentUserData, updateUserData, deletePrompt, handleWatchAd, handleShareReward, handlePurchase } = useUserData(currentUser);
  
  const {
      isLoginModalOpen, openLoginModal, closeLoginModal,
      isSaveModalOpen, openSaveModal, closeSaveModal, promptToSave,
      isOutOfCoinsModalOpen, openOutOfCoinsModal, closeOutOfCoinsModal,
      isEarnCoinsModalOpen, openEarnCoinsModal, closeEarnCoinsModal,
      isAdRewardModalOpen, openAdRewardModal, closeAdRewardModal,
      isPaymentModalOpen, paymentContext, openPaymentModal, closePaymentModal,
      isPaymentOptionsModalOpen, subscriptionContext, openPaymentOptionsModal, closePaymentOptionsModal,
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
    generationCost,
    imageComponents, // Destructure imageComponents from the hook
  } = usePromptGeneration({
    setErrorKey,
    t,
    language,
    currentUser,
    currentUserData,
    updateUserData,
    openOutOfCoinsModal,
  });

  useMonetagLoader();

  const [page, setPage] = useState<Page>('main');
  const [isLaunching, setIsLaunching] = useState(false);
  const [isCardOnFire, setIsCardOnFire] = useState(false);
  const generateButtonRef = useRef<HTMLButtonElement>(null);
  const ideaCardWrapperRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const handlePurchaseRequest = (tier: ProTier, amount: string) => {
    const durationMap: Record<ProTier, number> = {
      bronze: 7,
      silver: 30,
      gold: 90,
    };
    const durationDays = durationMap[tier];
    openPaymentOptionsModal({ tier, amount, durationDays });
  };

  const handleSelectPaymentMethod = (paymentMethod: 'vodafone' | 'paypal') => {
      if (subscriptionContext) {
          openPaymentModal({ ...subscriptionContext, paymentMethod });
      }
      closePaymentOptionsModal();
  };

  const handleConfirmPayment = async () => {
    if (!paymentContext) return;

    // تنفيذ عملية الشراء (اشتراك المستخدم)
    await handlePurchase(paymentContext.tier, paymentContext.durationDays);

    // إغلاق نافذة الدفع والعودة للصفحة الرئيسية
    closePaymentModal();
    setPage('main');

    // Reload واحد بعد الاشتراك لضمان تحميل الموقع في وضع Premium بدون Monetag
    setTimeout(() => {
      window.location.reload();
    }, 500);
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
        handleWatchAd().then(success => {
            if (success) {
                closeEarnCoinsModal();
                openAdRewardModal();
            } else {
                closeEarnCoinsModal();
            }
        });
    };
    
    const handleShareForCoins = async () => {
        const shareData = {
            title: 'PROMPT MASTER v4.1',
            text: t.sharePageText,
            url: 'https://prompt-master-v4-1-2.vercel.app',
        };
        try {
            await navigator.share(shareData);
            const rewarded = await handleShareReward();
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

  const InfoPage: React.FC<{ title: string; gradient: string; children: React.ReactNode; }> = ({ title, gradient, children }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className={`relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl bg-white/15 dark:bg-black/25 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-2xl`}>
            <div className={`pointer-events-none absolute inset-0 ${gradient}`} />
            <div className="relative p-6 md:p-8 text-right">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    {title}
                </h2>
                <div className="text-sm md:text-base text-white leading-relaxed space-y-4">
                    {children}
                </div>
                <button 
                    onClick={() => setPage('main')} 
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    </div>
  );

  const renderPage = () => {
    switch(page) {
      case 'favorites':
        return <PromptsPage type="favorites" prompts={currentUserData?.favorites || []} onUse={handleUsePrompt} onDelete={deletePrompt} onBack={() => setPage('main')} t={t} />;
      case 'history':
        return <PromptsPage type="history" prompts={currentUserData?.history || []} onUse={handleUsePrompt} onDelete={deletePrompt} onBack={() => setPage('main')} t={t} />;
      case 'subscription':
        return <SubscriptionPage onBack={() => setPage('main')} onPurchase={handlePurchaseRequest} t={t} />;
      case 'report':
        return <PerformanceReport onBack={() => setPage('main')} t={t} mode="text" />;
      case 'image_report':
        return <PerformanceReport onBack={() => setPage('main')} t={t} mode="image" />;
      case 'video_report':
        return <PerformanceReport onBack={() => setPage('main')} t={t} mode="video" />;
        case 'about':
            return (
              <InfoPage title={language === 'ar' ? '😎 من نحن' : '😎 About Us'} gradient="bg-gradient-to-br from-white/20 via-transparent to-purple-500/10 dark:from-white/5 dark:to-purple-500/20">
              {
                language === 'ar' ? (
                  <p className="text-sm md:text-base leading-relaxed">
                    انا اللي ضاع من عمري سنين 😮‍💨 وانا بعملك موقع لعمل أفضل برومبت احترافي في العالم 🌍
                    <br />
                    مش لازم تشكرني 🙏… بس على الأقل شارك الموقع مع أصحابك 🫶، يمكن ربنا يهديهم ويبطلوا برومبتات مكسّرة 😄
                    <br /><br />
                    بص يا بطل… أنا عارف إنك كنت بتضيّع وقت كتير 😩
                    <br />
                    تلف بين جروبات وتليجرام ويوتيوب وجوجل…
                    <br />
                    وفي الآخر الذكاء الاصطناعي 🤖 يبصلك كده ويقولك:
                    <br />
                    <span className="inline-block ms-2">«مش فاهم انت عايز إيه بالظبط!» 🤦</span>
                    <br /><br />
                    بهزر معاك طبعًا 😄 بس متقلّقش 🫡
                    <br />
                    تعبك انتهى… انت وصلت للمكان الصح 🥳
                    <br /><br />
                    بدل ما تقعد تكتب برومبت ٣٠ سطر، وتعدّل عليهم ٦٠ مرة 🙄
                    <br />
                    <strong>Prompt Master</strong> بيشيل عنك وجع الدماغ.
                    <br /><br />
                    - عايز نص يطلع فخامة؟ نخلي كلامك يلبس بدلة رسمية 😏
                    <br />
                    - عايز صورة أسطورية؟ ندي الـ AI 🤖 برومبت يخليه يرسم لك خيال اتحقق 🔥
                    <br />
                    - عايز فيديو يبهر الدنيا؟ نزبطله سيناريو يخلي المحتوى بتاعك عامل زي إعلان عالمي 😎
                    <br /><br />
                    كل ده من خلال واجهة عربية بسيطة،
                    <br />
                    تختار فكرتك 💡، والمنصّة اللي هتشتغل عليها، وشوية إعدادات كده من بتوع المحترفين،
                    <br />
                    وإحنا نرجعلك برومبت مظبوط جاهز تنسخه وتلزّقه، والذكاء الاصطناعي 🤖 يسمع الكلام من غير فصال 😁
                    <br /><br />
                    هدفنا إننا نوفرلك وقتك ⏱️ وأعصابك 🤯
                    <br />
                    بدل ما كل شوية تقول: <em>«أكتب إيه للـ AI؟»</em> وتتمرمط بين المقالات والتجارب الفاشلة 😪
                    <br /><br />
                    ركّز أنت على فكرتك وإبداعك 💡
                    <br />
                    وسيب علينا حوارات الصياغة والتركيب والتفاصيل التقنية 💪
                    <br /><br />
                    أهو عملتلك موقع يخليك تطلع شغل نااار 🔥
                    <br />
                    بس ما تولّعش في الدنيا بجد، إحنا مش ناقصين حرايق 😅
                    <br />
                    بهزر برضه… مالك واخد الكلام جد كده ليه؟ 🙄
                    <br />
                    يلا يا بطل، ورينا إبداعاتك الجاية 😉
                  </p>
                ) : (
                  <p className="text-sm md:text-base leading-relaxed">
                    I’m the guy who spent years of his life 😮‍💨 building you a website
                    just to give you the best prompt generator in the world 🌍
                    <br />
                    You don’t have to thank me 🙏… but at least share the site with your friends 🫶
                    so they stop bullying the poor AI 🤖 with broken prompts 😄
                    <br /><br />
                    Look, hero… I know you’ve wasted a lot of time 😩
                    jumping between YouTube, Telegram groups, and random blogs…
                    <br />
                    and in the end the AI 🤖 just stares at you like:
                    <br />
                    <span className="inline-block ms-2">“I have no idea what you want.” 🤦</span>
                    <br /><br />
                    I’m only teasing you 😄 but seriously, don’t worry 🫡
                    your suffering is over… you’ve reached the right place 🥳
                    <br /><br />
                    Instead of writing 30 lines of prompt and editing them 60 times 🙄,
                    <br />
                    <strong>Prompt Master</strong> takes the headache away.
                    <br /><br />
                    - Need a powerful text prompt? We make you sound like a pro 😏
                    <br />
                    - Want an epic image? We feed the AI 🤖 a prompt that turns imagination into pixels 🔥
                    <br />
                    - Planning a jaw-dropping video? We help you set the scene like a world-class director 😎
                    <br /><br />
                    All through a simple, Arabic-friendly interface:
                    <br />
                    you bring your idea 💡, choose the platform, tweak a few options,
                    <br />
                    and we dress it in a clean, professional prompt any AI 🤖 will respect 😁
                    <br /><br />
                    Our goal is simple:
                    save your time ⏱️, save your nerves 🤯,
                    and let you focus on creativity instead of asking
                    <em>“What should I write for the AI?”</em> 🤔
                    <br /><br />
                    You bring the ideas 💡,
                    Prompt Master handles the wording, structure, and all the nerdy stuff 💪
                    <br /><br />
                    I built you a tool that lets you create 🔥 hot work…
                    <br />
                    just don’t burn down the whole internet with it, okay? 😅
                    <br />
                    Kidding… why so serious? 🙄
                    <br />
                    Come on, hero — let’s see what you create next 😉
                  </p>
                )
              }
              </InfoPage>
            );
          case 'terms':
            return (
              <InfoPage title={language === 'ar' ? '🥱 شروط الاستخدام' : '🥱 Terms of Use'} gradient="bg-gradient-to-br from-amber-300/20 via-transparent to-orange-500/10 dark:from-amber-200/10 dark:to-orange-500/25">
                {language === 'ar' ? (
                  <>
                    <p className="text-sm md:text-base leading-relaxed">
                      باستخدامك لـ Prompt Master فأنت توافق على عدم إساءة استخدام المحتوى الناتج
                      أو مخالفته للقوانين المحلية أو حقوق الملكية الفكرية. أنت وحدك المسؤول
                      عن أي محتوى تقوم بإنشائه أو مشاركته من خلال المنصة.
                    </p>
                    <p className="text-sm md:text-base leading-relaxed">
                      لا نتحمل أي مسؤولية قانونية عن سوء استخدام البرومبتات أو المحتوى الناتج.
                      يُسمح بالاستخدام الشخصي والتجاري في حدود القوانين والأنظمة المعمول بها في بلدك.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm md:text-base leading-relaxed">
                      By using Prompt Master, you agree not to misuse the generated content
                      or violate any local laws, community standards, or intellectual property rights.
                      You are fully responsible for any content you create or share through this platform.
                    </p>
                    <p className="text-sm md:text-base leading-relaxed">
                      We do not accept legal liability for any misuse of prompts or generated output.
                      Personal and commercial use is allowed as long as it complies with the laws
                      and regulations in your country.
                    </p>
                  </>
                )}
              </InfoPage>
            );
          case 'privacy':
            return (
              <InfoPage title={language === 'ar' ? '🤫 سياسة الخصوصية' : '🤫 Privacy Policy'} gradient="bg-gradient-to-br from-cyan-300/20 via-transparent to-emerald-500/10 dark:from-cyan-200/10 dark:to-emerald-500/25">
                {language === 'ar' ? (
                  <>
                    <p className="text-sm md:text-base leading-relaxed">
                      نقوم بتخزين بعض البيانات الأساسية مثل البريد الإلكتروني، رصيد العملات
                      وسجل البرومبتات داخل قاعدة البيانات لتحسين التجربة وحماية حسابك.
                      لا نقوم ببيع بياناتك لأي طرف ثالث.
                    </p>
                    <p className="text-sm md:text-base leading-relaxed">
                      قد نستخدم بيانات الاستخدام بشكل مجهول لتحليل الأداء وتحسين واجهة الاستخدام.
                      يمكنك طلب حذف بياناتك من خلال التواصل معنا إذا رغبت في ذلك،
                      ما لم يكن هناك التزام قانوني بالاحتفاظ ببعض المعلومات.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm md:text-base leading-relaxed">
                      We store basic data such as your email address, coin balance,
                      and prompt history in our database to improve your experience
                      and secure your account. We do not sell your personal data
                      to any third party.
                    </p>
                    <p className="text-sm md:text-base leading-relaxed">
                      We may use anonymized usage data to analyze performance and
                      enhance the user interface. You can request deletion of your data
                      by contacting us, unless we are legally required to retain
                      certain information.
                    </p>
                  </>
                )}
              </InfoPage>
            );
          case 'contact':
            return (
              <InfoPage title={language === 'ar' ? '😏 اتصل بنا' : '😏 Contact Us'} gradient="bg-gradient-to-br from-pink-300/20 via-transparent to-indigo-500/10 dark:from-pink-200/10 dark:to-indigo-500/25">
                {language === 'ar' ? (
                  <>
                    <p className="text-sm md:text-base leading-relaxed">
                      إذا كان لديك أي اقتراح أو استفسار أو واجهت مشكلة أثناء استخدام Prompt Master،
                      يسعدنا تواصلك معنا في أي وقت.
                    </p>
                    <p className="text-sm md:text-base leading-relaxed">
                      يمكنك مراسلتنا عبر البريد الإلكتروني التالي:
                    </p>
                    <a href="mailto:promptmasteraiv5@gmail.com" className="font-semibold text-emerald-300 underline decoration-dotted hover:text-emerald-200">
promptmasteraiv5@gmail.com
</a>
                    <p className="text-xs text-white/60">
                      (يمكنك لاحقًا تعديل هذا البريد في الكود ليطابق بريد الدعم الفعلي الخاص بك)
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm md:text-base leading-relaxed">
                      If you have any suggestions, questions, or encounter a problem while
                      using Prompt Master, we would be happy to hear from you.
                    </p>
                    <p className="text-sm md:text-base leading-relaxed">
                      You can contact us via the following email address:
                    </p>
                    <a href="mailto:promptmasteraiv5@gmail.com" className="font-semibold text-emerald-300 underline decoration-dotted hover:text-emerald-200">
promptmasteraiv5@gmail.com
</a>
                    <p className="text-xs text-white/60">
                      (You can later update this email in the code to match your real support address.)
                    </p>
                  </>
                )}
              </InfoPage>
            );
      case 'main':
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div ref={ideaCardWrapperRef}><IdeaInput ref={textAreaRef} userInput={userInput} setUserInput={setUserInput} t={t} placeholderText={placeholderText} isEnhancedText={isEnhancedText} onTextChange={() => setIsEnhancedText(false)} mode={mode} isCardOnFire={isCardOnFire} onGetNewIdea={handleGetNewIdea} currentUser={currentUser} proTier={currentUserData?.proTier || null} language={language} /></div>
              {/* Pass imageComponents down to the SettingsPanel */}
              <SettingsPanel 
                settings={settings} 
                setSettings={setSettings} 
                proTextSettings={proTextSettings} 
                setProTextSettings={setProTextSettings} 
                mode={mode} 
                setMode={setMode} 
                selectedPlatformName={selectedPlatformName} 
                setSelectedPlatformName={setSelectedPlatformName} 
                t={t} 
                setPage={(p: string) => setPage(p as Page)}
                imageComponents={imageComponents} // Pass the prop here
              />
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
                      {currentUser && currentUserData?.proTier !== 'gold' && <span className="text-xs opacity-80 mt-1">{t.costGenerate} {generationCost} 🪙</span>}
                    </div>
                  )}
                </button>
                {errorKey && <p className="text-red-400 mt-4 animate-pulse">{t[errorKey] as string}</p>}
              </div>
            </div>
            <div ref={resultsRef} className="lg:col-span-1 space-y-8">
              <ResultsDisplay result={generatedResult} t={t} currentUser={currentUser} isFavorite={(id) => (currentUserData?.favorites || []).some(f => f.id === id)} onToggleFavorite={handleToggleFavorite} />
            </div>
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen text-slate-800 dark:text-white selection:bg-purple-500 selection:text-white transition-colors duration-300 overflow-x-hidden">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <Header language={language} toggleLanguage={toggleLanguage} slogan={t.headerSlogan} slogan2={t.headerSlogan2} t={t} theme={theme} setTheme={setTheme} currentUser={currentUser} currentUserData={currentUserData} handleLogout={logout} openLoginModal={openLoginModal} openEarnCoinsModal={openEarnCoinsModal} setPage={setPage} />
        <main>{renderPage()}</main>

        <footer className="text-center text-sm text-white mt-12 pb-6">
            <p className="text-lg">👨‍💻</p>
            <p>{t.footerDevelopedBy}</p>
            <p className="font-bold">{t.footerSlogan}</p>

            <div className="mt-6 max-w-3xl mx-auto">
                <div className="relative overflow-hidden rounded-2xl bg-white/15 dark:bg-black/25 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-xl p-4">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/20 dark:from-black/10 dark:to-black/20" />
                    <div className="relative flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white">
                        <button onClick={() => setPage('about')} className="hover:text-amber-300 transition-colors">{footerLabels.about}</button>
                        <button onClick={() => setPage('terms')} className="hover:text-amber-300 transition-colors">{footerLabels.terms}</button>
                        <button onClick={() => setPage('privacy')} className="hover:text-amber-300 transition-colors">{footerLabels.privacy}</button>
                        <button onClick={() => setPage('contact')} className="hover:text-amber-300 transition-colors">{footerLabels.contact}</button>
                    </div>
                </div>
            </div>
        </footer>
      </div>
      {isLaunching && (
        <RocketAnimation 
            startRef={generateButtonRef}
            endRef={textAreaRef}
            onAnimationComplete={handleAnimationComplete}
        />
      )}
      {isLoginModalOpen && <Login onClose={closeLoginModal} t={t} />}
      {isSaveModalOpen && promptToSave && <SavePromptModal onClose={closeSaveModal} onSave={(name) => handleSavePrompt(promptToSave, name)} t={t} />}
      {isOutOfCoinsModalOpen && <OutOfCoinsModal onClose={closeOutOfCoinsModal} onSubscribe={() => setPage('subscription')} onWatchAd={onWatchAd} t={t} />}
      {isEarnCoinsModalOpen && <EarnCoinsModal onClose={closeEarnCoinsModal} onAdComplete={onAdComplete} onShareForCoins={handleShareForCoins} t={t} userData={currentUserData} onSubscribe={() => { closeEarnCoinsModal(); setPage('subscription'); }} />}
      {isAdRewardModalOpen && <AdRewardModal onClose={closeAdRewardModal} t={t} userName={currentUser?.displayName || 'Guest'} />}
      {isPaymentModalOpen && paymentContext && <PaymentModal t={t} context={paymentContext} onClose={closePaymentModal} onConfirm={handleConfirmPayment} />}
      {isPaymentOptionsModalOpen && subscriptionContext && (
        <PaymentOptionsModal
          t={t}
          onClose={closePaymentOptionsModal}
          onSelectPayment={handleSelectPaymentMethod}
          planId={subscriptionContext.tier}
          amount={subscriptionContext.amount}
        />
      )}
    </div>
  );
}
