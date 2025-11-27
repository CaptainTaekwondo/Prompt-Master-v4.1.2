
import React from 'react';
import type { translations } from '../translations.ts';

type Translations = typeof translations['en'];

interface PaymentOptionsModalProps {
    t: Translations;
    onClose: () => void;
    onSelectPayment: (method: 'vodafone' | 'paypal') => void;
}

export const PaymentOptionsModal: React.FC<PaymentOptionsModalProps> = ({ t, onClose, onSelectPayment }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in-fast">
            <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-purple-500/30">
                <h2 className="text-2xl font-bold text-center mb-6 text-white">{t.selectPaymentMethod}</h2>
                
                <div className="space-y-4">
                    <button 
                        onClick={() => onSelectPayment('vodafone')} 
                        className="w-full flex items-center justify-center py-3 px-6 bg-red-600 hover:bg-red-700 rounded-md text-white font-semibold transition-colors">
                        Vodafone Cash
                    </button>
                    <button 
                        onClick={() => onSelectPayment('paypal')} 
                        className="w-full flex items-center justify-center py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors">
                        PayPal
                    </button>
                </div>
                
                <div className="text-center mt-6">
                    <button onClick={onClose} className="text-sm text-white/60 hover:text-white">{t.cancelButton}</button>
                </div>
            </div>
        </div>
    );
};
