
import React from 'react';
import type { PaymentContext } from './hooks/useModals.ts';
import type { translations } from '../translations.ts';

type Translations = typeof translations['en'];

interface PaymentModalProps {
    t: Translations;
    context: PaymentContext;
    onClose: () => void;
    onConfirm: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ t, context, onClose, onConfirm }) => {
    if (!context) return null;

    const { tier, paymentMethod } = context;
    const planKey = tier as keyof Translations['proPlans'];
    const planName = t.proPlans[planKey].tierName;
    const price = t.proPlans[planKey].price;

    const paymentDetails = {
        vodafone: {
            title: 'Vodafone Cash Payment',
            instructions: 'Please transfer the payment to the following number: <strong>01012345678</strong> and enter the transaction ID below.',
            inputLabel: 'Transaction ID',
            confirmText: 'Confirm Payment'
        },
        paypal: {
            title: 'PayPal Payment',
            instructions: `You will be redirected to PayPal to complete your purchase for the <strong>${planName}</strong> plan for <strong>${price}</strong>. A new tab will open. Once you complete the payment, you can close the tab and return here. Click the button below to proceed.`,
            inputLabel: 'PayPal Transaction ID',
            confirmText: 'Proceed to PayPal'
        }
    };

    const details = paymentDetails[paymentMethod];

    const handleConfirm = () => {
        if (paymentMethod === 'paypal') {
            // Simulate opening PayPal in a new tab
            window.open('https://www.paypal.com/signin', '_blank');
        } 
        onConfirm();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in-fast">
            <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-purple-500/30">
                <h2 className="text-2xl font-bold text-center mb-6 text-white">{details.title}</h2>
                
                <div className="text-center text-white/80 space-y-4 mb-8">
                    <p dangerouslySetInnerHTML={{ __html: details.instructions }}></p>
                </div>

                {paymentMethod === 'vodafone' && (
                    <div className="space-y-4">
                        <label htmlFor="transactionId" className="block text-sm font-medium text-white/70">{details.inputLabel}</label>
                        <input
                            type="text"
                            id="transactionId"
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-white focus:ring-purple-500 focus:border-purple-500"
                            placeholder="e.g., 9876543210"
                        />
                    </div>
                )}
                
                <div className="flex justify-end items-center mt-8 space-x-4">
                    <button onClick={onClose} className="py-2 px-6 bg-slate-700 hover:bg-slate-600 rounded-md text-white font-semibold transition-colors">{t.cancelButton}</button>
                    <button onClick={handleConfirm} className={`py-2 px-6 rounded-md font-semibold transition-colors text-white ${paymentMethod === 'vodafone' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {details.confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
