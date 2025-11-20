
import React, { useState, useMemo } from 'react';
import type { ProfessionalTextSettings as ProfessionalTextSettingsType } from '../types.ts';
import type { translations } from '../translations.ts';
import { 
    WRITING_IDENTITIES,
    TEXT_PURPOSES, 
    AI_PLATFORMS, 
    OUTPUT_FORMATS, 
    AUTHOR_TITLES, 
    PAPER_SIZES,
    getTextOptionsForPurpose,
    WRITING_IDENTITY_PRESETS,
    AUDIENCES,
    FORMALITY_LEVELS,
    CITATION_STYLES,
    FONT_SUGGESTIONS,
} from './constants.ts';
import { MultiSelectDropdown } from './MultiSelectDropdown.tsx';
import { Tooltip } from './Tooltip.tsx';
import { AuthorPlacementModal } from './AuthorPlacementModal.tsx';

type Translations = typeof translations['en'];

interface ProTextSettingsProps {
  settings: ProfessionalTextSettingsType;
  setSettings: React.Dispatch<React.SetStateAction<ProfessionalTextSettingsType>>;
  t: Translations;
  setPage: (page: string) => void;
}

const CustomSelect: React.FC<{
  label: string;
  tooltip?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  className?: string;
}> = ({ label, tooltip, value, onChange, options, className = '' }) => (
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

export const ProfessionalTextSettings: React.FC<ProTextSettingsProps> = ({ settings, setSettings, t, setPage }) => {
    const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);
    
    const dynamicTextOptions = useMemo(() => getTextOptionsForPurpose(settings.purpose), [settings.purpose]);

    type TooltipCategory = 'aiPlatforms' | 'outputFormats' | 'purposes' | 'creativeTones' | 'writingStyles' | 'fontSuggestions' | 'writingIdentities';

    const getTooltipText = (category: TooltipCategory, value: string | string[], t: Translations): string => {
        const genericKey = category.slice(0, -1);
        
        let keyForTooltip: string | undefined = undefined;
    
        if (typeof value === 'string') {
            keyForTooltip = value;
        } else if (Array.isArray(value) && value.length === 1) {
            keyForTooltip = value[0];
        }
    
        if (keyForTooltip) {
            const specificTooltips = t.tooltips[category] as Record<string, string> | undefined;
            if (specificTooltips && specificTooltips[keyForTooltip]) {
                return specificTooltips[keyForTooltip];
            }
        }
    
        const fallbackKey = genericKey as 'purpose' | 'creativeTone' | 'writingStyle' | 'aiPlatform' | 'outputFormat' | 'fontSuggestion' | 'writingIdentity';
        return t.tooltips[fallbackKey] || '';
    };

    const handleSettingChange = (field: keyof ProfessionalTextSettingsType) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const target = e.currentTarget;
        let value: string | number = target.value;

        if (target instanceof HTMLInputElement && (target.type === 'number' || target.type === 'range')) {
            value = parseInt(target.value, 10) || 0;
        }

        setSettings(prev => ({ ...prev, [field]: value }));
    };

  const handleMultiSelectChange = (field: 'creativeTone' | 'writingStyle') => (selected: string[]) => {
      setSettings(prev => ({...prev, [field]: selected.length > 0 ? selected : ['normal']}));
  }

  const handleIdentityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newIdentity = e.target.value;
    const preset = WRITING_IDENTITY_PRESETS[newIdentity];
    if (preset) {
        setSettings(prev => ({
            ...prev,
            writingIdentity: newIdentity,
            ...preset,
        }));
    } else {
        setSettings(prev => ({ ...prev, writingIdentity: newIdentity }));
    }
  };

  const handleAuthorInfoChange = (field: keyof ProfessionalTextSettingsType['authorInfo']) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const target = e.currentTarget;
      const value = target instanceof HTMLInputElement && target.type === 'checkbox'
        ? target.checked
        : target.value;
      setSettings(prev => ({...prev, authorInfo: {...prev.authorInfo, [field]: value}}));
  }
  
  const handleSavePlacement = (
      placement: ProfessionalTextSettingsType['authorInfo']['placement'], 
      repeatOnEveryPage: boolean
    ) => {
      setSettings(prev => ({
        ...prev,
        authorInfo: {
          ...prev.authorInfo,
          placement,
          repeatOnEveryPage,
          placementSetByUser: true,
        },
      }));
    };

  const handlePageSettingsChange = (field: 'count' | 'type') => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setSettings(prev => ({
          ...prev,
          pageSettings: {
              ...prev.pageSettings,
              [field]: field === 'count' ? parseInt(e.target.value, 10) : e.target.value,
          }
      }));
  };
  
  return (
    <div className="space-y-4">
        {/* Row 1: Writing Identity */}
        <div className="flex">
            <CustomSelect
                label={t.proText.writingIdentity}
                tooltip={getTooltipText('writingIdentities', settings.writingIdentity, t)}
                value={settings.writingIdentity}
                onChange={handleIdentityChange}
                options={WRITING_IDENTITIES.map(id => ({ value: id, label: t.writingIdentities[id as keyof typeof t.writingIdentities] || id }))}
                className="w-full"
            />
        </div>
        
        {/* Row 2: Purpose & Audience */}
        <div className="flex flex-col sm:flex-row gap-4">
            <CustomSelect
                label={t.proText.purpose}
                tooltip={getTooltipText('purposes', settings.purpose, t)}
                value={settings.purpose}
                onChange={handleSettingChange('purpose')}
                options={TEXT_PURPOSES.map(p => ({ value: p, label: t.purposes[p as keyof typeof t.purposes] || p }))}
            />
            <CustomSelect
                label={t.proText.audience}
                tooltip={t.tooltips.audience}
                value={settings.audience}
                onChange={handleSettingChange('audience')}
                options={AUDIENCES.map(a => ({ value: a, label: t.audiences[a as keyof typeof t.audiences] || a }))}
            />
        </div>

        {/* Row 3: Tone & Style */}
        <div className="flex flex-col sm:flex-row gap-4">
            <MultiSelectDropdown
                label={t.proText.creativeTone}
                tooltip={getTooltipText('creativeTones', settings.creativeTone, t)}
                placeholder={t.selectPlaceholder}
                options={dynamicTextOptions.tones.map(tVal => ({ value: tVal, label: t.creativeTones[tVal as keyof typeof t.creativeTones] || tVal }))}
                selectedOptions={settings.creativeTone}
                onChange={handleMultiSelectChange('creativeTone')}
            />
            <MultiSelectDropdown
                label={t.proText.writingStyle}
                tooltip={getTooltipText('writingStyles', settings.writingStyle, t)}
                placeholder={t.selectPlaceholder}
                options={dynamicTextOptions.styles.map(sVal => ({ value: sVal, label: t.writingStyles[sVal as keyof typeof t.writingStyles] || sVal }))}
                selectedOptions={settings.writingStyle}
                onChange={handleMultiSelectChange('writingStyle')}
            />
        </div>

        {/* Row 4: Formality & Citation */}
        <div className="flex flex-col sm:flex-row gap-4">
            <CustomSelect
                label={t.proText.formality}
                tooltip={t.tooltips.formality}
                value={settings.formality}
                onChange={handleSettingChange('formality')}
                options={FORMALITY_LEVELS.map(f => ({ value: f, label: t.formalityLevels[f as keyof typeof t.formalityLevels] || f }))}
            />
            <CustomSelect
                label={t.proText.citationStyle}
                tooltip={t.tooltips.citationStyle}
                value={settings.citationStyle}
                onChange={handleSettingChange('citationStyle')}
                options={CITATION_STYLES.map(c => ({ value: c, label: t.citationStyles[c as keyof typeof t.citationStyles] || c }))}
            />
        </div>
        
        {/* Row 5: Font Suggestion */}
        <div className="flex">
            <CustomSelect
                label={t.proText.fontSuggestion}
                tooltip={t.tooltips.fontSuggestion}
                value={settings.fontSuggestion}
                onChange={handleSettingChange('fontSuggestion')}
                options={FONT_SUGGESTIONS.map(f => ({ value: f, label: t.fontSuggestions[f as keyof typeof t.fontSuggestions] || f }))}
                className="w-full"
            />
        </div>

        {/* Divider */}
        <div className="border-t border-slate-300 dark:border-white/20 my-4"></div>

        {/* Section: Output Settings */}
        <div className="flex flex-col sm:flex-row gap-4">
            <CustomSelect
                label={t.proText.aiPlatform}
                tooltip={getTooltipText('aiPlatforms', settings.aiPlatform, t)}
                value={settings.aiPlatform}
                onChange={handleSettingChange('aiPlatform')}
                options={AI_PLATFORMS.map(p => ({ value: p, label: t.aiPlatforms[p as keyof typeof t.aiPlatforms] || p }))}
            />
            <CustomSelect
                label={t.proText.outputFormat}
                tooltip={getTooltipText('outputFormats', settings.outputFormat, t)}
                value={settings.outputFormat}
                onChange={handleSettingChange('outputFormat')}
                options={OUTPUT_FORMATS.map(f => ({ value: f, label: t.outputFormats[f as keyof typeof t.outputFormats] || f }))}
            />
        </div>
        
        <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
                <label className="block text-sm font-medium text-slate-600 dark:text-white/80">{t.proText.formattingQuality}: {settings.formattingQuality}%</label>
                <Tooltip text={t.tooltips.formattingQuality} />
            </div>
            <input
                type="range"
                min="0"
                max="100"
                step="25"
                value={settings.formattingQuality}
                onChange={handleSettingChange('formattingQuality')}
                className="w-full h-2 bg-slate-200 dark:bg-black/30 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
        </div>

        {/* Row 7: Page/Word Count & Paper Size */}
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 min-w-[150px]">
                <div className="flex items-center gap-1.5 mb-1">
                    <label className="block text-sm font-medium text-slate-600 dark:text-white/80">{t.proText.pageSettings}</label>
                    <Tooltip text={t.tooltips.pageSettings} />
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={settings.pageSettings.count}
                        onChange={handlePageSettingsChange('count')}
                        className="w-full p-2.5 bg-slate-100 dark:bg-black/30 border-2 border-slate-300 dark:border-white/30 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400"
                    />
                    <select
                        value={settings.pageSettings.type}
                        onChange={handlePageSettingsChange('type')}
                        className="p-2.5 bg-slate-100 dark:bg-black/30 border-2 border-slate-300 dark:border-white/30 rounded-lg text-slate-800 dark:text-white"
                    >
                        <option value="words">{t.proText.words}</option>
                        <option value="pages">{t.proText.pages}</option>
                    </select>
                </div>
            </div>
            <CustomSelect
                label={t.proText.paperSize}
                tooltip={t.tooltips.paperSize}
                value={settings.paperSize}
                onChange={handleSettingChange('paperSize')}
                options={PAPER_SIZES.map(p => ({ value: p, label: t.paperSizes[p as keyof typeof t.paperSizes] || p }))}
            />
             <div className="flex-1 min-w-[100px]">
                <div className="flex items-center gap-1.5 mb-1">
                  <label htmlFor="fontSizeInput" className="block text-sm font-medium text-slate-600 dark:text-white/80">{t.proText.fontSize}</label>
                  <Tooltip text={t.tooltips.fontSize} />
                </div>
                <input
                    id="fontSizeInput"
                    type="number"
                    min="8"
                    max="72"
                    value={settings.fontSize}
                    onChange={handleSettingChange('fontSize')}
                    className="w-full p-2.5 bg-slate-100 dark:bg-black/30 border-2 border-slate-300 dark:border-white/30 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400"
                />
            </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-300 dark:border-white/20 my-4"></div>
        
        {/* Section: Author Info */}
        <div>
            <div className="flex items-center gap-1.5 mb-2">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-white/90">{t.proText.authorInfo}</h3>
                <Tooltip text={t.tooltips.authorInfo} />
            </div>
            <div className="space-y-4 p-4 bg-slate-100 dark:bg-black/20 rounded-lg">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-600 dark:text-white/80 mb-1">{t.proText.authorName}</label>
                        <input type="text" value={settings.authorInfo.name} onChange={handleAuthorInfoChange('name')} className="w-full p-2.5 bg-white dark:bg-black/30 border-2 border-slate-300 dark:border-white/30 rounded-lg text-slate-800 dark:text-white" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-600 dark:text-white/80 mb-1">{t.proText.authorTitle}</label>
                        <select value={settings.authorInfo.title} onChange={handleAuthorInfoChange('title')} className="w-full p-2.5 bg-white dark:bg-black/30 border-2 border-slate-300 dark:border-white/30 rounded-lg text-slate-800 dark:text-white">
                            {AUTHOR_TITLES.map(title => <option key={title} value={title}>{t.authorTitles[title as keyof typeof t.authorTitles]}</option>)}
                        </select>
                    </div>
                </div>
                <button
                    onClick={() => setIsPlacementModalOpen(true)}
                    disabled={!settings.authorInfo.name}
                    className="w-full text-center py-2 px-3 rounded-lg font-semibold bg-purple-600/80 hover:bg-purple-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {t.proText.setAttributionPlacement}
                </button>
            </div>
        </div>
        
        {isPlacementModalOpen && (
            <AuthorPlacementModal 
                onClose={() => setIsPlacementModalOpen(false)}
                authorInfo={settings.authorInfo}
                onSave={handleSavePlacement}
                t={t}
            />
        )}

        <div className="border-t border-slate-300 dark:border-white/20 my-4"></div>

        <button
            onClick={() => setPage('report')}
            className="w-full text-center py-2 px-3 rounded-lg font-semibold bg-sky-600/80 hover:bg-sky-600 text-white transition-colors"
        >
            {t.report?.viewReportButton || 'View Performance Report'}
        </button>
    </div>
);
}
