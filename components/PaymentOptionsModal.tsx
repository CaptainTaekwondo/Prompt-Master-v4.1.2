
import React, { useState, useRef, useEffect } from 'react';
import type { translations } from '../translations.ts';

type Translations = typeof translations['en'];

declare global {
  interface Window {
    paypal: any;
  }
}

const PLAN_AMOUNTS: Record<string, string> = {
    bronze: "5.00",
    silver: "20.00",
    gold: "50.00",
};

interface PaymentOptionsModalProps {
    t: Translations;
    onClose: () => void;
    onSelectPayment: (method: 'vodafone') => void;
    planId: 'bronze' | 'silver' | 'gold';
}

export const PaymentOptionsModal: React.FC<PaymentOptionsModalProps> = ({ t, onClose, onSelectPayment, planId }) => {
    const [step, setStep] = useState('choose');
    const [paypalStatus, setPaypalStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [paypalError, setPaypalError] = useState<string | null>(null);
    const paypalButtonRef = useRef<HTMLDivElement | null>(null);

    const amount = PLAN_AMOUNTS[planId] || "0.00";

    useEffect(() => {
        if (step === 'paypal' && paypalButtonRef.current && window.paypal) {
            setPaypalStatus('loading');
            paypalButtonRef.current.innerHTML = '';

            window.paypal.Buttons({
                createOrder: (data: any, actions: any) => {
                    setPaypalStatus('loading');
                    return actions.order.create({
                        purchase_units: [{
                            description: `Prompt Master - ${planId.toUpperCase()} plan`,
                            amount: {
                                value: amount,
                                currency_code: 'USD'
                            }
                        }]
                    });
                },
                onApprove: async (data: any, actions: any) => {
                    try {
                        const capture = await actions.order.capture();
                        console.log('Payment successful!', capture);
                        setPaypalStatus('success');
                    } catch (error) {
                        console.error('Error capturing payment:', error);
                        setPaypalStatus('error');
                        setPaypalError('حدث خطأ أثناء تأكيد الدفع. يرجى المحاولة مرة أخرى.');
                    }
                },
                onError: (err: any) => {
                    console.error('PayPal Button Error:', err);
                    setPaypalStatus('error');
                    setPaypalError('حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.');
                },
                onCancel: () => {
                    setPaypalStatus('idle');
                }
            }).render(paypalButtonRef.current).then(() => {
                // When the button is rendered, the loading is done.
                if (paypalStatus === 'loading') {
                    setPaypalStatus('idle');
                }
            }).catch((err: any) => {
                console.error('Failed to render PayPal button:', err);
                setPaypalStatus('error');
                setPaypalError('فشل تحميل زر الدفع. يرجى تحديث الصفحة.');
            });
        }
    }, [step, planId, amount]);

    const handlePaypalSelect = () => {
        setStep('paypal');
        setPaypalStatus('idle'); // Reset status when entering the step
        setPaypalError(null);
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

                        <div className="text-center my-4 min-h-[150px]">
                            {paypalStatus !== 'success' && <div ref={paypalButtonRef} />}

                            {paypalStatus === 'loading' && <p className="text-sm text-white/50">جاري تحميل زر الدفع من PayPal...</p>}
                            {paypalStatus === 'success' && <p className="text-green-400">تم الدفع بنجاح! سيتم تفعيل اشتراكك قريباً.</p>}
                            {paypalStatus === 'error' && paypalError && <p className="text-red-400">{paypalError}</p>}
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
