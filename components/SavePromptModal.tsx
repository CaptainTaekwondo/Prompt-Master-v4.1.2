import React, { useState } from 'react';
import type { translations } from '../translations.ts';

type Translations = typeof translations['en'];

interface SavePromptModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
  t: Translations;
}

export const SavePromptModal: React.FC<SavePromptModalProps> = ({ onClose, onSave, t }) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-white/20" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-center">{t.savePromptModalTitle}</h2>
        <div>
          <label htmlFor="promptName" className="block text-sm font-medium text-white/80 mb-1">{t.promptNameLabel}</label>
          <input
            type="text"
            id="promptName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 bg-black/30 border-2 border-white/30 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors">
            {t.cancelButton}
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50" disabled={!name.trim()}>
            {t.saveButton}
          </button>
        </div>
      </div>
    </div>
  );
};
