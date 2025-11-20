import React, { useState } from 'react';
import type { translations } from '../translations.ts';

type Translations = typeof translations['en'];
type LoginMethod = 'google' | 'email' | 'phone';
type LoginView = 'main' | 'email' | 'phone';

interface LoginModalProps {
    onClose: () => void;
    handleLogin: (method: LoginMethod) => void;
    t: Translations;
}

export const Login: React.FC<LoginModalProps> = ({ onClose, handleLogin, t }) => {
    const [view, setView] = useState<LoginView>('main');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');

    const renderMainView = () => (
        <>
            <h2 className="text-2xl font-bold mb-2">{t.loginModalTitle}</h2>
            <p className="text-white/70 mb-6">{t.loginModalSubtitle}</p>
            <div className="space-y-4">
                <button
                    onClick={() => handleLogin('google')}
                    className="w-full py-3 px-4 bg-white text-gray-800 font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center border border-gray-300 shadow-sm"
                >
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.565-3.108-11.283-7.481l-6.571,4.819C9.656,39.663,16.318,44,24,44z"></path>
                      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.011,35.451,44,30.027,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    </svg>
                    <span className="ltr:ml-3 rtl:mr-3">{t.signInWithGoogle}</span>
                </button>
                <button
                    onClick={() => setView('email')}
                    className="w-full py-3 px-4 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path>
                    </svg>
                    <span className="ltr:ml-3 rtl:mr-3">{t.signInWithEmail}</span>
                </button>
                <button
                    onClick={() => setView('phone')}
                    className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.02.74-.25 1.02l-2.2 2.2z"></path>
                    </svg>
                    <span className="ltr:ml-3 rtl:mr-3">{t.signInWithPhone}</span>
                </button>
            </div>
        </>
    );

    const renderEmailView = () => (
        <div className="animate-fade-in text-start">
            <button onClick={() => setView('main')} className="absolute top-4 start-4 text-white/50 hover:text-white transition-colors flex items-center gap-1 text-sm">
                <span className="text-lg">&larr;</span> {t.backButton}
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">{t.loginWithEmailTitle}</h2>
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
            <button
                onClick={() => handleLogin('email')}
                disabled={!email || !password}
                className="w-full mt-6 py-3 px-4 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {t.signInButton}
            </button>
        </div>
    );

    const renderPhoneView = () => (
         <div className="animate-fade-in text-start">
            <button onClick={() => setView('main')} className="absolute top-4 start-4 text-white/50 hover:text-white transition-colors flex items-center gap-1 text-sm">
                <span className="text-lg">&larr;</span> {t.backButton}
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">{t.loginWithPhoneTitle}</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">{t.phoneNumberLabel}</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t.phonePlaceholder} className="w-full p-2.5 bg-black/30 border-2 border-white/30 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400" />
                </div>
            </div>
            <button
                onClick={() => handleLogin('phone')}
                disabled={!phone}
                className="w-full mt-6 py-3 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {t.continueButton}
            </button>
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
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-sm bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border border-white/20 relative text-center transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-3 end-3 text-white/50 hover:text-white transition-colors text-2xl">&times;</button>
                {renderContent()}
            </div>
        </div>
    );
};