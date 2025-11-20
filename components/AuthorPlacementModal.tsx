
import React, { useState } from 'react';
import type { ProfessionalTextSettings as ProfessionalTextSettingsType } from '../types.ts';
import type { translations } from '../translations.ts';
import { ButtonGroup } from './ButtonGroup.tsx';
import { 
    AUTHOR_MACRO_POSITIONS,
    AUTHOR_HORIZONTAL_ALIGNMENTS
} from './constants.ts';

type Translations = typeof translations['en'];

interface AuthorPlacementModalProps {
  onClose: () => void;
  authorInfo: ProfessionalTextSettingsType['authorInfo'];
  onSave: (placement: ProfessionalTextSettingsType['authorInfo']['placement'], repeat: boolean) => void;
  t: Translations;
}

export const AuthorPlacementModal: React.FC<AuthorPlacementModalProps> = ({ onClose, authorInfo, onSave, t }) => {
  const [placement, setPlacement] = useState(authorInfo.placement);
  const [repeat, setRepeat] = useState(authorInfo.repeatOnEveryPage);

  const handleSave = () => {
    onSave(placement, repeat);
    onClose();
  };

  const translatedPlacementOptions = (options: string[], type: 'macro' | 'horizontal') => {
      const translationObject = t.authorPlacements[type] as Record<string, string>;
      return options.map(opt => ({ value: opt, label: translationObject[opt] || opt}));
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-white/20 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">{t.proText.attributionPlacementModalTitle}</h2>
        
        <div className="space-y-6 text-start">
            <div>
                <label className="block text-sm font-medium text-white/80 mb-2">{t.proText.macroPosition}</label>
                <ButtonGroup 
                    selectedValue={placement.macro}
                    onChange={(value) => setPlacement(prev => ({...prev, macro: value as 'header' | 'footer'}))}
                    options={translatedPlacementOptions(AUTHOR_MACRO_POSITIONS, 'macro')}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-white/80 mb-2">{t.proText.horizontalJustification}</label>
                <ButtonGroup 
                    selectedValue={placement.horizontal}
                    onChange={(value) => setPlacement(prev => ({...prev, horizontal: value as 'left' | 'center' | 'right'}))}
                    options={translatedPlacementOptions(AUTHOR_HORIZONTAL_ALIGNMENTS, 'horizontal')}
                />
            </div>
            <div className="flex items-center gap-3 pt-2">
                <input
                    type="checkbox"
                    id="modalRepeatOnEveryPage"
                    checked={repeat}
                    onChange={(e) => setRepeat(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 dark:border-white/40 text-purple-600 focus:ring-purple-500 cursor-pointer bg-slate-200 dark:bg-black/40"
                />
                <label htmlFor="modalRepeatOnEveryPage" className="text-sm font-medium text-white/80 cursor-pointer">
                    {t.proText.repeatOnEveryPage}
                </label>
            </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
            <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
            >
                {t.cancelButton}
            </button>
            <button
                onClick={handleSave}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
                {t.saveButton}
            </button>
        </div>
      </div>
    </div>
  );
};
