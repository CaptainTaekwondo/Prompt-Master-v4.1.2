
import { useState } from 'react';
import type { GeneratedPrompt, ProTier } from '../../types.ts';

export type PaymentContext = {
    tier: ProTier;
    durationDays: number;
    paymentMethod: 'vodafone' | 'paypal';
} | null;

export type SubscriptionContext = {
    tier: ProTier;
    durationDays: number;
} | null;

export function useModals() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isOutOfCoinsModalOpen, setIsOutOfCoinsModalOpen] = useState(false);
    const [isEarnCoinsModalOpen, setIsEarnCoinsModalOpen] = useState(false);
    const [isAdRewardModalOpen, setIsAdRewardModalOpen] = useState(false);
    const [promptToSave, setPromptToSave] = useState<GeneratedPrompt | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentContext, setPaymentContext] = useState<PaymentContext>(null);
    const [isPaymentOptionsModalOpen, setIsPaymentOptionsModalOpen] = useState(false);
    const [subscriptionContext, setSubscriptionContext] = useState<SubscriptionContext>(null);


    const openSaveModal = (prompt: GeneratedPrompt) => {
        setPromptToSave(prompt);
        setIsSaveModalOpen(true);
    };
    
    const openPaymentModal = (context: PaymentContext) => {
        setPaymentContext(context);
        setIsPaymentModalOpen(true);
    };

    const closePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setPaymentContext(null);
    };

    const openPaymentOptionsModal = (context: SubscriptionContext) => {
        setSubscriptionContext(context);
        setIsPaymentOptionsModalOpen(true);
    };

    const closePaymentOptionsModal = () => {
        setIsPaymentOptionsModalOpen(false);
        setSubscriptionContext(null);
    };

    return {
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),

        isSaveModalOpen,
        openSaveModal,
        closeSaveModal: () => {
            setIsSaveModalOpen(false);
            setPromptToSave(null);
        },
        promptToSave,
        
        isOutOfCoinsModalOpen,
        openOutOfCoinsModal: () => setIsOutOfCoinsModalOpen(true),
        closeOutOfCoinsModal: () => setIsOutOfCoinsModalOpen(false),

        isEarnCoinsModalOpen,
        openEarnCoinsModal: () => setIsEarnCoinsModalOpen(true),
        closeEarnCoinsModal: () => setIsEarnCoinsModalOpen(false),
        
        isAdRewardModalOpen,
        openAdRewardModal: () => setIsAdRewardModalOpen(true),
        closeAdRewardModal: () => setIsAdRewardModalOpen(false),
        
        isPaymentModalOpen,
        paymentContext,
        openPaymentModal,
        closePaymentModal,

        isPaymentOptionsModalOpen,
        subscriptionContext,
        openPaymentOptionsModal,
        closePaymentOptionsModal,
    };
}
