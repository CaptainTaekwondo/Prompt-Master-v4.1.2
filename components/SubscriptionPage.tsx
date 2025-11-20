import React, { useState } from 'react';
import type { translations } from '../translations.ts';
import type { ProTier } from '../types.ts';

type Translations = typeof translations['en'];

interface SubscriptionPageProps {
  onBack: () => void;
  onPurchase: (tier: ProTier, durationDays: number) => void;
  t: Translations;
}

const plans: { tier: ProTier; durationDays: number; tierKey: keyof Translations['proPlans'], cardClass: string, ctaClass: string }[] = [
    { tier: 'bronze', durationDays: 7, tierKey: 'bronze', cardClass: 'plan-card--bronze', ctaClass: 'plan-cta-button--bronze' },
    { tier: 'silver', durationDays: 30, tierKey: 'silver', cardClass: 'plan-card--silver', ctaClass: 'plan-cta-button--silver' },
    { tier: 'gold', durationDays: 90, tierKey: 'gold', cardClass: 'plan-card--gold', ctaClass: 'plan-cta-button--gold' },
];

// Map for English tier names, to be displayed regardless of language
const tierNames: Record<ProTier, string> = {
    bronze: "Lite",
    silver: "Plus",
    gold: "Pro"
};

const badgeClasses: Record<ProTier, string> = {
    bronze: "tier-badge-bronze",
    silver: "tier-badge-silver",
    gold: "tier-badge-gold"
};

const badgeFontClasses: Record<ProTier, string> = {
    bronze: "tier-badge-font-bronze",
    silver: "tier-badge-font-silver",
    gold: "tier-badge-font-gold"
};

const planDescriptions: Record<string, Record<string, string>> = {
  en: {
    bronze: "Perfect for getting started and casual creation.",
    silver: "For power users who want more features and no interruptions.",
    gold: "The ultimate package for professionals and enthusiasts."
  },
  ar: {
    bronze: "مثالية للبدء والاستخدام العادي.",
    silver: "للمستخدمين المتقدمين الذين يريدون ميزات أكثر وبلا مقاطعة.",
    gold: "الباقة الكاملة للمحترفين والمتحمسين."
  },
  fr: {
    bronze: "Parfait pour débuter et pour une création occasionnelle.",
    silver: "Pour les utilisateurs avancés qui veulent plus de fonctionnalités sans interruptions.",
    gold: "Le pack ultime pour les professionnels et les passionnés."
  }
};


export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onBack, onPurchase, t }) => {
  const [selectedTier, setSelectedTier] = useState<ProTier>('silver');
  
  const getLang = () => {
      if (typeof window === 'undefined') return 'en';
      return document.documentElement.lang || 'en';
  }
  const currentLang = getLang();
  const descriptions = planDescriptions[currentLang] || planDescriptions.en;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <button onClick={onBack} className="mb-8 font-semibold hover:text-purple-300 transition-colors text-lg">
        &larr; {t.backToMainPage}
      </button>
      <div className="text-center mb-16">
        <h1 className="subscription-title-badge text-3xl md:text-4xl font-black inline-block">{t.subscriptionPageTitle}</h1>
        <p className="text-lg text-white/80 mt-4 max-w-2xl mx-auto">{t.subscriptionPageSubtitle}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 text-center items-center">
        {plans.map(plan => {
          const planDetails = t.proPlans[plan.tierKey];
          const isSelected = selectedTier === plan.tier;
          const isRecommended = plan.tier === 'silver';
          
          return (
            <div
              key={plan.tier}
              onClick={() => setSelectedTier(plan.tier)}
              className={`plan-card ${plan.cardClass} ${isSelected ? 'selected' : ''} ${isRecommended ? 'plan-card--recommended' : ''}`}
            >
              {planDetails.bestValue && isRecommended && <div className="most-popular-badge">{planDetails.bestValue}</div>}
              
              <div className="h-16 flex items-center justify-center">
                <span className={`tier-badge ${badgeClasses[plan.tier]} ${badgeFontClasses[plan.tier]}`}>{tierNames[plan.tier]}</span>
              </div>
              <p className="text-white/60 text-sm mb-6 h-10">{descriptions[plan.tier]}</p>

              <p className="text-5xl font-black my-4 text-white">
                {planDetails.price} 
                <span className="text-xl font-medium text-white/70">/ {planDetails.duration}</span>
              </p>

              <ul className="text-left space-y-3 my-8 plan-features text-base">
                 {planDetails.features.map((feature: string) => <li key={feature}>{feature}</li>)}
              </ul>
              
              <button
                onClick={(e) => { e.stopPropagation(); onPurchase(plan.tier, plan.durationDays); }}
                className={`plan-cta-button ${plan.ctaClass} ${isSelected ? 'selected' : ''}`}
              >
                {t.purchaseButton}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};