
import React, { useState, useCallback, useEffect } from 'react';
import { assembleTextPrompt } from '../../services/textPromptAssembler.ts';
import { assembleImagePrompt, SelectedItem as ImageSelectedItem } from '../../services/imagePromptAssembler.ts';
import { assembleVideoPrompt, SelectedItem as VideoSelectedItem } from '../../services/videoPromptAssembler.ts';

import { PLATFORMS_DATA } from '../constants.ts';
import { translations } from '../../translations.ts';
import type { PromptSettings, GenerationMode, GeneratedPrompt, ProfessionalTextSettings, UserData, Platform } from '../../types.ts';

type TranslationKeys = keyof typeof translations['en'];

const initialProTextSettings: ProfessionalTextSettings = {
    writingIdentity: 'default',
    purpose: 'normal',
    creativeTone: ['normal'],
    writingStyle: ['normal'],
    audience: 'general',
    formality: 'neutral',
    citationStyle: 'none',
    fontSuggestion: 'auto',
    aiPlatform: 'Auto',
    outputFormat: 'view_only',
    formattingQuality: 75,
    paperSize: 'A4',
    fontSize: 12,
    pageSettings: { count: 500, type: 'words' },
    authorInfo: { name: '', title: 'none', language: 'en', repeatOnEveryPage: false, placement: { macro: 'footer', horizontal: 'right' }, placementSetByUser: false },
};

export function usePromptGeneration({
    setErrorKey,
    t,
    language,
    currentUser,
    currentUserData,
    updateUserData,
    openOutOfCoinsModal,
}: {
    setErrorKey: React.Dispatch<React.SetStateAction<TranslationKeys | null>>;
    t: typeof translations['en'];
    language: 'en' | 'ar' | 'fr';
    currentUser?: any;
    currentUserData?: UserData | null;
    updateUserData?: (data: Partial<UserData>) => void;
    openOutOfCoinsModal?: () => void;
}) {
    const [userInput, setUserInput] = useState('');
    const [mode, setMode] = useState<GenerationMode>('image');
    const [settings, setSettings] = useState<PromptSettings>({
        imagePurpose: 'default',
        style: 'default',
        lighting: 'default',
        composition: 'default',
        cameraAngle: 'default',
        mood: 'default',
        colorPalette: 'default',
        aspectRatio: '1:1',
        quality: 'default',
        cameraShot: 'default',
        cameraMovement: 'default', 
        fashionEra: 'default',
        videoEffect: 'default',
        videoPurpose: 'default',
        videoDuration: 'short',
    });
    const [proTextSettings, setProTextSettings] = useState<ProfessionalTextSettings>({ ...initialProTextSettings, authorInfo: { ...initialProTextSettings.authorInfo, language }});
    const [selectedPlatformName, setSelectedPlatformName] = useState<string>('General Mode');
    const [generatedResult, setGeneratedResult] = useState<GeneratedPrompt | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingLabelKey, setProcessingLabelKey] = useState<TranslationKeys | null>(null);
    const [isEnhancedText, setIsEnhancedText] = useState(false);
    const [placeholderText, setPlaceholderText] = useState('');
    
    useEffect(() => {
        setProTextSettings(prev => ({ ...prev, authorInfo: { ...prev.authorInfo, language }}));
    }, [language]);

    const getRandomPlaceholder = useCallback(() => {
        const currentTranslations = translations[language] || translations.en;
        const placeholders = currentTranslations.ideaPlaceholders;
        if (!placeholders || placeholders.length === 0) return currentTranslations.ideaInputPlaceholder || '';
        return placeholders[Math.floor(Math.random() * placeholders.length)];
    }, [language]);

    useEffect(() => {
        setPlaceholderText(getRandomPlaceholder());
    }, [language, getRandomPlaceholder]);

    useEffect(() => {
        setSelectedPlatformName(PLATFORMS_DATA[mode]?.[0]?.name || 'General Mode');
        setGeneratedResult(null);
    }, [mode]);

    const handleGetNewIdea = useCallback(() => {
        setUserInput(getRandomPlaceholder());
        setIsEnhancedText(false);
    }, [getRandomPlaceholder]);

    const checkAndDeductCoins = (cost: number): boolean => {
        if (!currentUser || !currentUserData || !updateUserData || !openOutOfCoinsModal) return true;
        if (currentUserData.proTier === 'gold') return true; 
        if (currentUserData.coins < cost) {
            openOutOfCoinsModal();
            return false;
        }
        updateUserData({ coins: currentUserData.coins - cost });
        return true;
    };
    
    const handleGenerate = async () => {
        if (!userInput) { setErrorKey('errorEnterIdea'); return; }
        if (!checkAndDeductCoins(10)) return;
        
        setIsProcessing(true);
        setProcessingLabelKey('generatingButton');
        setErrorKey(null);
        
        let finalPrompt = '';
        let platform: Platform | undefined;

        if (mode === 'image') {
            // Fix for type error: `value` is inferred as `unknown`. Casting to `string` to match `SelectedItem` type.
            const selectedItems: ImageSelectedItem[] = Object.entries(settings)
                .filter(([_, value]) => value !== 'default')
                .map(([key, value]) => ({ key: value as string, category: key }));
            
            finalPrompt = await assembleImagePrompt({
                userDescription: userInput,
                selectedItems,
                faceSwapEnabled: false, 
                faceDescription: null,
                platformName: selectedPlatformName,
            });
            platform = PLATFORMS_DATA.image.find(p => p.name === selectedPlatformName);

        } else if (mode === 'video') {
             // Fix for type error: `value` is inferred as `unknown`. Casting to `string` to match `SelectedItem` type.
             const selectedItems: VideoSelectedItem[] = Object.entries(settings)
                .filter(([_, value]) => value !== 'default')
                .map(([key, value]) => ({ key: value as string, category: key }));
            
            finalPrompt = await assembleVideoPrompt({
                userDescription: userInput,
                selectedItems,
                platformName: selectedPlatformName,
            });
            platform = PLATFORMS_DATA.video.find(p => p.name === selectedPlatformName);

        } else if (mode === 'text') {
            finalPrompt = await assembleTextPrompt(proTextSettings, userInput);
            platform = { name: t.proText.title, icon: '✍️', url: '#' };
        }
        
        if (!platform) {
          platform = { name: 'General Mode', icon: '🌐', url: '#' };
        }

        const result: GeneratedPrompt = {
            id: `prompt_${Date.now()}`,
            prompt: finalPrompt,
            platformName: platform.name,
            platformIcon: platform.icon,
            platformUrl: platform.url,
            baseIdea: userInput,
            timestamp: Date.now(),
            mode: mode,
            settings: mode !== 'text' ? settings : undefined,
            proTextSettings: mode === 'text' ? proTextSettings : undefined,
        };

        if (currentUserData && updateUserData) {
            const newHistory = [result, ...currentUserData.history.slice(0, 49)];
            updateUserData({ history: newHistory });
        }

        setGeneratedResult(result);
        setIsEnhancedText(false);
        setIsProcessing(false);
        setProcessingLabelKey(null);
    };
    
    return {
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
    };
}