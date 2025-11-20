
import { useState } from 'react';
import type { GeneratedPrompt } from '../../types.ts';

export function useModals() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isOutOfCoinsModalOpen, setIsOutOfCoinsModalOpen] = useState(false);
    const [isEarnCoinsModalOpen, setIsEarnCoinsModalOpen] = useState(false);
    const [isAdRewardModalOpen, setIsAdRewardModalOpen] = useState(false);
    const [promptToSave, setPromptToSave] = useState<GeneratedPrompt | null>(null);


    const openSaveModal = (prompt: GeneratedPrompt) => {
        setPromptToSave(prompt);
        setIsSaveModalOpen(true);
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
    };
}
