
import React, { useState } from 'react';
import type { translations } from '../translations.ts';
import { useAuth } from '../src/context/AuthContext';
import { FirebaseError } from 'firebase/app';

type Translations = typeof translations['en'];
type LoginView = 'main' | 'email' | 'phone';

interface LoginModalProps {
    onClose: () => void;
    t: Translations;
}

export const Login: React.FC<LoginModalProps> = ({ onClose, t }) => {
    const [view, setView] = useState<LoginView>('main');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [code, setCode] = useState('');
    const [phoneAuthStep, setPhoneAuthStep] = useState<'enter-phone' | 'enter-code'>('enter-phone');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { signInWithGoogle, signUpWithEmail, signInWithEmail, sendPhoneCode, confirmPhoneCode } = useAuth();

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
            onClose();
        } catch (error) {
            setError("حدث خطأ أثناء تسجيل الدخول باستخدام جوجل. يرجى المحاولة مرة أخرى.");
            console.error(error);
        }
    };

    const handleEmailAuth = async (action: 'login' | 'register') => {
        if (!email || !password) {
            setError("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            if (action === 'register') {
                await signUpWithEmail(email, password);
            } else {
                await signInWithEmail(email, password);
            }
            onClose();
        } catch (e: unknown) {
            const error = e as FirebaseError;
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
                    break;
                case 'auth/email-already-in-use':
                    setError("هذا البريد الإلكتروني مسجل بالفعل.");
                    break;
                case 'auth/weak-password':
                    setError("كلمة المرور ضعيفة جدًا. يجب أن تتكون من 6 أحرف على الأقل.");
                    break;
                default:
                    setError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
                    break;
            }
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendCode = async () => {
        if (!phoneNumber) {
            setError("يرجى إدخال رقم الهاتف.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            await sendPhoneCode(phoneNumber);
            setPhoneAuthStep('enter-code');
        } catch (error) {
            setError("حدث خطأ أثناء إرسال الكود. تأكد من أن صيغة الرقم صحيحة (مثال: +11234567890) ومن وجود حاوية reCAPTCHA.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmCode = async () => {
        if (!code) {
            setError("يرجى إدخال كود التحقق.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            await confirmPhoneCode(code);
            onClose();
        } catch (error) {
            setError("كود التحقق غير صحيح أو منتهي الصلاحية.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetState = () => {
        setView('main');
        setError(null);
        setEmail('');
        setPassword('');
        setPhoneNumber('');
        setCode('');
        setPhoneAuthStep('enter-phone');
        setIsSubmitting(false);
    }

    const renderMainView = () => (
        <>
            <h2 className="text-2xl font-bold mb-2">{t.loginModalTitle}</h2>
            <p className="text-white/70 mb-6">{t.loginModalSubtitle}</p>
            <div className="space-y-4">
                <button onClick={handleGoogleSignIn} className="w-full py-3 px-4 bg-white text-gray-800 font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center border border-gray-300 shadow-sm">
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.565-3.108-11.283-7.481l-6.571,4.819C9.656,39.663,16.318,44,24,44z"></path>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.011,35.451,44,30.027,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    </svg>
                    <span className="ltr:ml-3 rtl:mr-3">{t.signInWithGoogle}</span>
                </button>
                <button onClick={() => { setView('email'); setError(null); }} className="w-full py-3 px-4 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center">
                     <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path></svg>
                    <span className="ltr:ml-3 rtl:mr-3">{t.signInWithEmail}</span>
                </button>
                <button onClick={() => { setView('phone'); setError(null); }} className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.02.74-.25 1.02l-2.2 2.2z"></path></svg>
                    <span className="ltr:ml-3 rtl:mr-3">{t.signInWithPhone}</span>
                </button>
            </div>
        </>
    );

    const renderEmailView = () => (
        <div className="animate-fade-in text-start">
            <button onClick={() => resetState()} className="absolute top-4 start-4 text-white/50 hover:text-white transition-colors flex items-center gap-1 text-sm">
                <span className="text-lg">&larr;</span> {t.backButton}
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">{t.loginWithEmailTitle}</h2>
            {error && <p className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg text-center text-sm mb-4">{error}</p>}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">{t.emailAddressLabel}</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.emailPlaceholder} className="w-full p-2.5 bg-black/30 border-2 border-white/30 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">{t.passwordLabel}</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t.passwordPlaceholder} className="w-full p-2.5 bg-black/30 border-2 border-white/30 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400" />
                </div>
            </div>
            <div className="flex gap-3 mt-6">
                 <button onClick={() => handleEmailAuth('login')} disabled={isSubmitting || !email || !password} className="w-full py-3 px-4 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? t.loading : t.signInButton}
                </button>
                <button onClick={() => handleEmailAuth('register')} disabled={isSubmitting || !email || !password} className="w-full py-3 px-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? t.loading : t.registerButton}
                </button>
            </div>
        </div>
    );
    
    const renderPhoneView = () => (
        <div className="animate-fade-in text-start">
             <button onClick={() => resetState()} className="absolute top-4 start-4 text-white/50 hover:text-white transition-colors flex items-center gap-1 text-sm">
                <span className="text-lg">&larr;</span> {t.backButton}
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">{"دخول برقم الهاتف"}</h2>
            {error && <p className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg text-center text-sm mb-4">{error}</p>}

            {phoneAuthStep === 'enter-phone' ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">{"رقم الهاتف"}</label>
                        <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+201234567890" className="w-full p-2.5 bg-black/30 border-2 border-white/30 rounded-lg text-white focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400" />
                    </div>
                    <button onClick={handleSendCode} disabled={isSubmitting} className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? t.loading : "إرسال الكود"}
                    </button>
                </div>
            ) : (
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">{"كود التحقق"}</label>
                        <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="123456" className="w-full p-2.5 bg-black/30 border-2 border-white/30 rounded-lg text-white focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400" />
                    </div>
                    <button onClick={handleConfirmCode} disabled={isSubmitting} className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? t.loading : "تأكيد الكود"}
                    </button>
                </div>
            )}
             <div id="recaptcha-container" className="my-4"></div>
        </div>
    );

    const renderContent = () => {
        switch(view) {
            case 'email': return renderEmailView();
            case 'phone': return renderPhoneView();
            case 'main':
            default: return renderMainView();
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="w-full max-w-sm bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border border-white/20 relative text-center transition-all duration-300" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 end-3 text-white/50 hover:text-white transition-colors text-2xl">&times;</button>
                {renderContent()}
            </div>
        </div>
    );
};
