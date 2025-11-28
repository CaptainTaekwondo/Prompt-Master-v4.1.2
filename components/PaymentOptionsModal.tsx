
import React, { useState } from 'react';
import type { translations } from '../translations.ts';
import { PaypalPlanButton } from '../src/components/PaypalPlanButton';

type Translations = typeof translations['en'];

// Define plan amounts inside the modal
const PLAN_AMOUNTS: Record<string, string> = {
    bronze: "5.00",
    silver: "20.00",
    gold: "50.00",
};

interface PaymentOptionsModalProps {
    t: Translations;
    onClose: () => void;
    onSelectPayment: (method: 'vodafone') => void; 
    planId: 'bronze' | 'silver' | 'gold'; // Using the ProTier type names
}

export const PaymentOptionsModal: React.FC<PaymentOptionsModalProps> = ({ t, onClose, onSelectPayment, planId }) => {
    const [step, setStep] = useState('choose'); // 'choose' | 'paypal'
    const amount = PLAN_AMOUNTS[planId] || "0.00";

    const handlePaypalSelect = () => {
        setStep('paypal');
    };

    const handleBackToChoose = () => {
        setStep('choose');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in-fast">
            <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-purple-500/30">
                
                {step === 'choose' && (
                    <>
                        <h2 className="text-2xl font-bold text-center mb-6 text-white">{t.selectPaymentMethod}</h2>
                        <div className="space-y-4">
                            <button 
                                onClick={() => onSelectPayment('vodafone')} 
                                className="w-full flex items-center justify-center py-3 px-6 bg-red-600 hover:bg-red-700 rounded-md text-white font-semibold transition-colors">
                                Vodafone Cash
                            </button>
                            <button 
                                onClick={handlePaypalSelect} 
                                className="w-full flex items-center justify-center py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors">
                                PayPal
                            </button>
                        </div>
                        <div className="text-center mt-6">
                            <button onClick={onClose} className="text-sm text-white/60 hover:text-white">{t.cancelButton}</button>
                        </div>
                    </>
                )}

                {step === 'paypal' && (
                    <>
                        <div className="flex items-center mb-6">
                            <button onClick={handleBackToChoose} className="text-sm text-white/60 hover:text-white mr-4">&#x2190; رجوع</button>
                            <h2 className="text-xl font-bold text-center text-white">تابع الدفع عبر PayPal</h2>
                        </div>
                        <p className="text-center text-white/70 mb-5">سيتم الدفع لهذه الخطة عبر PayPal.</p>
                        <div id="paypal-button-wrapper">
                           <PaypalPlanButton planId={planId} amount={amount} />
                        </div>
                         <div className="text-center mt-6">
                            <button onClick={onClose} className="text-sm text-white/60 hover:text-white">{t.cancelButton}</button>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};
