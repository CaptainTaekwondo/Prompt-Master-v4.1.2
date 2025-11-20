

import React, { useState, useMemo } from 'react';
import type { PromptSettings, GenerationMode, ProfessionalTextSettings } from '../types.ts';
import { Card } from './Card.tsx';
import { 
    BASE_IMAGE_STYLES,
    BASE_IMAGE_LIGHTING,
    BASE_IMAGE_COMPOSITIONS,
    PLATFORMS_DATA, 
    ASPECT_RATIOS, 
    QUALITIES,
    VIDEO_PURPOSES,
    VIDEO_DURATIONS,
    getVideoOptionsForPurpose,
    VIDEO_PURPOSE_PRESETS,
    BASE_VIDEO_CAMERA_MOVEMENTS
} from './constants.ts';
import { ProfessionalTextSettings as ProTextSettingsComponent } from './ProfessionalTextSettings.tsx';
import type { translations } from '../translations.ts';
import { Tooltip } from './Tooltip.tsx';

type Translations = typeof translations['en'];

interface SettingsPanelProps {
  settings: PromptSettings;
  setSettings: React.Dispatch<React.SetStateAction<PromptSettings>>;
  proTextSettings: ProfessionalTextSettings;
  setProTextSettings: React.Dispatch<React.SetStateAction<ProfessionalTextSettings>>;
  mode: GenerationMode;
  setMode: React.Dispatch<React.SetStateAction<GenerationMode>>;
  selectedPlatformName: string;
  setSelectedPlatformName: (name: string) => void;
  t: Translations;
  setPage: (page: string) => void;
}

const CustomSelect: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  className?: string;
  tooltip?: string;
}> = ({ label, value, onChange, options, className = '', tooltip }) => (
  <div className={`flex-1 min-w-[150px] ${className}`}>
    <div className="flex items-center gap-1.5 mb-1">
      <label className="block text-sm font-medium text-slate-600 dark:text-white/80">{label}</label>
      {tooltip && <Tooltip text={tooltip} />}
    </div>
    <select
      value={value}
      onChange={onChange}
      className="w-full p-2.5 bg-slate-100 dark:bg-black/30 border-2 border-slate-300 dark:border-white/30 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400 transition-colors"
    >
      {options.map(option => (
        <option key={option.value} value={option.value} className="bg-white dark:bg-gray-800 text-slate-800 dark:text-white">{option.label}</option>
      ))}
    </select>
  </div>
);

const ImageVideoSettings: React.FC<Omit<SettingsPanelProps, 'proTextSettings' | 'setProTextSettings'>> = ({ settings, setSettings, mode, selectedPlatformName, setSelectedPlatformName, t, setPage }) => {
  
  const dynamicVideoOptions = useMemo(() => getVideoOptionsForPurpose(settings.videoPurpose), [settings.videoPurpose]);

  const handleSettingChange = (field: keyof PromptSettings) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handlePurposeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPurpose = e.target.value;
    const preset = VIDEO_PURPOSE_PRESETS[newPurpose];

    if (preset) {
        setSettings(prev => ({
            ...prev,
            videoPurpose: newPurpose,
            ...preset.settings,
        }));
        setSelectedPlatformName(preset.platformName);
    } else { // This handles 'default' and any future purposes without a preset
        setSettings(prev => ({
            ...prev,
            videoPurpose: newPurpose,
            style: 'default',
            lighting: 'default',
            cameraShot: 'default',
            cameraMovement: 'default',
            fashionEra: 'default',
            videoEffect: 'default',
            aspectRatio: '1:1',
            quality: 'default',
            videoDuration: 'short',
        }));
        setSelectedPlatformName('General Mode');
    }
  };

  type TranslationOptionKey = 'style' | 'videoStyle' | 'lighting' | 'videoLighting' | 'composition' | 'cameraShot' | 'cameraMovement' | 'fashionEra' | 'videoEffect' | 'aspectRatio' | 'quality' | 'videoPurpose' | 'videoDuration';
  const translatedOptions = (options: readonly {value: string, label: string}[] | readonly string[], translationKey: TranslationOptionKey) => {
    const translationObject = t[translationKey] as Record<string, string>;
    return options.map(opt => {
        if (typeof opt === 'string') {
            return { value: opt, label: translationObject[opt] || opt };
        }
        return { value: opt.value, label: translationObject[opt.value] || opt.label };
    });
  };
  
  type TooltipCategory = 'platforms' | 'styles' | 'videoStyles' | 'lightings' | 'videoLightings' | 'compositions' | 'cameraShots' | 'aspectRatios' | 'qualities';

  const getTooltipText = (category: TooltipCategory, value: string): string => {
    const generalTooltipKey = category.slice(0, -1) as keyof typeof t.tooltips;
    const specificTooltips = t.tooltips[category] as Record<string, string> | undefined;
    
    const generalTooltip = t.tooltips[generalTooltipKey as keyof typeof t.tooltips];
    return specificTooltips?.[value] || (typeof generalTooltip === 'string' ? generalTooltip : '') || '';
  }

  return (
    <div className="space-y-4">
      {mode === 'image' ? (
          <>
            <div className="flex flex-col sm:flex-row gap-4">
                <CustomSelect
                    label={t.platformLabel}
                    tooltip={getTooltipText('platforms', selectedPlatformName)}
                    value={selectedPlatformName}
                    onChange={(e) => setSelectedPlatformName(e.target.value)}
                    options={PLATFORMS_DATA.image.map(p => ({ value: p.name, label: p.name }))}
                />
                <CustomSelect
                    label={t.styleLabel}
                    tooltip={getTooltipText('styles', settings.style)}
                    value={settings.style}
                    onChange={handleSettingChange('style')}
                    options={translatedOptions(BASE_IMAGE_STYLES, 'style')}
                />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <CustomSelect
                    label={t.lightingLabel}
                    tooltip={getTooltipText('lightings', settings.lighting)}
                    value={settings.lighting}
                    onChange={handleSettingChange('lighting')}
                    options={translatedOptions(BASE_IMAGE_LIGHTING, 'lighting')}
                />
                <CustomSelect
                    label={t.compositionLabel}
                    tooltip={getTooltipText('compositions', settings.composition)}
                    value={settings.composition}
                    onChange={handleSettingChange('composition')}
                    options={translatedOptions(BASE_IMAGE_COMPOSITIONS, 'composition')}
                />
            </div>
          </>
      ) : ( // Video Mode
        <>
            <div className="flex flex-col sm:flex-row gap-4">
                <CustomSelect
                    label={t.videoPurposeLabel}
                    tooltip={t.tooltips.videoPurpose}
                    value={settings.videoPurpose}
                    onChange={handlePurposeChange}
                    options={translatedOptions(VIDEO_PURPOSES, 'videoPurpose')}
                />
                <CustomSelect
                    label={t.videoDurationLabel}
                    tooltip={t.tooltips.videoDuration}
                    value={settings.videoDuration}
                    onChange={handleSettingChange('videoDuration')}
                    options={translatedOptions(VIDEO_DURATIONS, 'videoDuration')}
                />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                 <CustomSelect
                    label={t.platformLabel}
                    tooltip={getTooltipText('platforms', selectedPlatformName)}
                    value={selectedPlatformName}
                    onChange={(e) => setSelectedPlatformName(e.target.value)}
                    options={PLATFORMS_DATA.video.map(p => ({ value: p.name, label: p.name }))}
                />
                <CustomSelect
                    label={t.styleLabel}
                    tooltip={getTooltipText('videoStyles', settings.style)}
                    value={settings.style}
                    onChange={handleSettingChange('style')}
                    options={translatedOptions(dynamicVideoOptions.styles, 'videoStyle')}
                />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <CustomSelect
                    label={t.lightingLabel}
                    tooltip={getTooltipText('videoLightings', settings.lighting)}
                    value={settings.lighting}
                    onChange={handleSettingChange('lighting')}
                    options={translatedOptions(dynamicVideoOptions.lighting, 'videoLighting')}
                />
                <CustomSelect
                    label={t.cameraShotLabel}
                    tooltip={t.tooltips.cameraShot}
                    value={settings.cameraShot}
                    onChange={handleSettingChange('cameraShot')}
                    options={translatedOptions(dynamicVideoOptions.cameraShots, 'cameraShot')}
                />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <CustomSelect
                    label={t.cameraMovementLabel}
                    tooltip={t.tooltips.cameraMovement}
                    value={settings.cameraMovement}
                    onChange={handleSettingChange('cameraMovement')}
                    options={translatedOptions(BASE_VIDEO_CAMERA_MOVEMENTS, 'cameraMovement')}
                />
                <CustomSelect
                    label={t.fashionEraLabel}
                    tooltip={t.tooltips.fashionEra}
                    value={settings.fashionEra}
                    onChange={handleSettingChange('fashionEra')}
                    options={translatedOptions(dynamicVideoOptions.fashionEras, 'fashionEra')}
                />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <CustomSelect
                    label={t.videoEffectLabel}
                    tooltip={t.tooltips.videoEffect}
                    value={settings.videoEffect}
                    onChange={handleSettingChange('videoEffect')}
                    options={translatedOptions(dynamicVideoOptions.videoEffects, 'videoEffect')}
                />
            </div>
        </>
      )}

       {/* Common settings for both Image and Video */}
       <div className="flex flex-col sm:flex-row gap-4">
            <CustomSelect
                label={t.aspectRatioLabel}
                tooltip={getTooltipText('aspectRatios', settings.aspectRatio)}
                value={settings.aspectRatio}
                onChange={handleSettingChange('aspectRatio')}
                options={translatedOptions(ASPECT_RATIOS, 'aspectRatio')}
            />
            <CustomSelect
                label={t.qualityLabel}
                tooltip={getTooltipText('qualities', settings.quality)}
                value={settings.quality}
                onChange={handleSettingChange('quality')}
                options={translatedOptions(QUALITIES, 'quality')}
            />
        </div>
        
        <div className="border-t border-slate-300 dark:border-white/20 my-4"></div>
        <button
            onClick={() => setPage(mode === 'image' ? 'image_report' : 'video_report')}
            className="w-full text-center py-2 px-3 rounded-lg font-semibold bg-sky-600/80 hover:bg-sky-600 text-white transition-colors"
        >
            {t.report?.viewReportButton || 'View Performance Report'}
        </button>
    </div>
  );
};


export const SettingsPanel: React.FC<SettingsPanelProps> = (props) => {
  const { mode, setMode, t, setSettings } = props;
  const [isGearSpinning, setIsGearSpinning] = useState(false);

  const triggerSpin = () => {
    if (isGearSpinning) return;
    setIsGearSpinning(true);
    setTimeout(() => {
        setIsGearSpinning(false);
    }, 800); // Animation duration 0.8s
  };

  // Wrapped state setters
  const wrappedSetSettings: typeof props.setSettings = (value) => {
    props.setSettings(value);
    triggerSpin();
  };
  
  const wrappedSetProTextSettings: typeof props.setProTextSettings = (value) => {
    props.setProTextSettings(value);
    triggerSpin();
  };

  const wrappedSetMode: typeof props.setMode = (value) => {
    if (mode !== value) { // Only reset if the mode actually changes
        // Reset settings to default when switching between image/video to avoid carrying over incompatible settings
        setSettings(prev => ({
            ...prev,
            style: 'default',
            lighting: 'default',
            composition: 'default',
            cameraShot: 'default',
            cameraMovement: 'default',
            fashionEra: 'default',
            videoEffect: 'default',
            videoPurpose: 'default',
            videoDuration: 'short'
        }));
    }
    props.setMode(value);
    triggerSpin();
  };

  const wrappedSetSelectedPlatformName: typeof props.setSelectedPlatformName = (value) => {
    props.setSelectedPlatformName(value);
    triggerSpin();
  };

  const imageVideoProps = {
      ...props,
      setSettings: wrappedSetSettings,
      setSelectedPlatformName: wrappedSetSelectedPlatformName,
  };

  return (
    <Card title={t.settingsCardTitle} icon={<span className={isGearSpinning ? 'spin-animation' : ''}>⚙️</span>}>
      <div className="flex flex-col gap-6">
        {mode === 'text' ? (
          <ProTextSettingsComponent 
            settings={props.proTextSettings} 
            setSettings={wrappedSetProTextSettings} 
            t={t} 
            setPage={props.setPage}
          />
        ) : (
          <ImageVideoSettings {...imageVideoProps} />
        )}
        
        <div className="bg-slate-200/70 dark:bg-black/30 p-1 rounded-full flex w-full">
          <button
            onClick={() => wrappedSetMode('image')}
            className={`w-1/3 px-4 sm:px-6 py-2 rounded-full transition-colors duration-300 text-slate-700 dark:text-white ${mode === 'image' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            <span className="hidden sm:inline">🖼️ </span>{t.imageToggle}
          </button>
          <button
            onClick={() => wrappedSetMode('video')}
            className={`w-1/3 px-4 sm:px-6 py-2 rounded-full transition-colors duration-300 text-slate-700 dark:text-white ${mode === 'video' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            <span className="hidden sm:inline">🎬 </span>{t.videoToggle}
          </button>
          <button
            onClick={() => wrappedSetMode('text')}
            className={`w-1/3 px-4 sm:px-6 py-2 rounded-full transition-colors duration-300 text-slate-700 dark:text-white ${mode === 'text' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
             <span className="hidden sm:inline">✍️ </span>{t.textToggle}
          </button>
        </div>
      </div>
    </Card>
  );
};