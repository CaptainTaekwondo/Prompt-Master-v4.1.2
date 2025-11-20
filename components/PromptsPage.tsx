import React, { useState, useMemo } from 'react';
import type { GeneratedPrompt } from '../types.ts';
import type { translations } from '../translations.ts';

type Translations = typeof translations['en'];

interface PromptsPageProps {
  type: 'favorites' | 'history';
  prompts: GeneratedPrompt[];
  onUse: (prompt: GeneratedPrompt) => void;
  onDelete: (promptId: string, type: 'favorites' | 'history') => void;
  onBack: () => void;
  t: Translations;
}

const PromptCard: React.FC<{ prompt: GeneratedPrompt; onUse: () => void; onDelete: () => void; t: Translations }> = ({ prompt, onUse, onDelete, t }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/10 dark:bg-black/20 p-4 rounded-lg flex flex-col gap-3 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{prompt.name || new Date(prompt.timestamp).toLocaleString()}</h3>
          <p className="text-xs text-white/60">{new Date(prompt.timestamp).toLocaleDateString()}</p>
        </div>
        <span className="text-2xl">{prompt.platformIcon}</span>
      </div>
      <p className="text-sm text-white/80 bg-black/20 p-2 rounded-md max-h-24 overflow-y-auto break-words">{prompt.prompt}</p>
      <div className="flex items-center gap-2 mt-auto pt-2">
        <button onClick={onUse} className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-semibold transition-colors">{t.usePromptButton}</button>
        <button onClick={handleCopy} className="p-2 bg-slate-500/50 hover:bg-slate-500/80 rounded-md transition-colors">{copied ? '✅' : '📋'}</button>
        <button onClick={onDelete} className="p-2 bg-red-500/50 hover:bg-red-500/80 rounded-md transition-colors">🗑️</button>
      </div>
    </div>
  );
};

export const PromptsPage: React.FC<PromptsPageProps> = ({ type, prompts, onUse, onDelete, onBack, t }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  const filteredPrompts = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week = new Date(today);
    week.setDate(today.getDate() - today.getDay());
    const month = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    return prompts
      .filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(p => {
        if (filter === 'Today') return p.timestamp >= today.getTime();
        if (filter === 'This Week') return p.timestamp >= week.getTime();
        if (filter === 'Last Month') return p.timestamp >= month.getTime();
        return true;
      });
  }, [prompts, searchTerm, filter]);

  const title = type === 'favorites' ? t.promptsPageTitleFavorites : t.promptsPageTitleHistory;

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="mb-6 font-semibold hover:text-purple-300 transition-colors">
        &larr; {t.backToMainPage}
      </button>
      <h1 className="text-4xl font-bold text-center mb-8">{title}</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-grow p-3 bg-white/10 dark:bg-black/20 border-2 border-white/30 rounded-lg focus:outline-none focus:border-purple-400"
        />
        <div className="flex-shrink-0 flex items-center bg-white/10 dark:bg-black/20 rounded-lg p-1">
          {['All', 'Today', 'This Week', 'Last Month'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter === f ? 'bg-purple-600' : 'hover:bg-white/10'}`}
            >
              {t[`filter${f.replace(' ', '')}` as keyof Translations] as string}
            </button>
          ))}
        </div>
      </div>

      {prompts.length === 0 ? (
        <p className="text-center text-white/70 mt-10">{type === 'favorites' ? t.noFavorites : t.noHistory}</p>
      ) : filteredPrompts.length === 0 ? (
        <p className="text-center text-white/70 mt-10">{t.noResultsFound}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map(p => (
            <PromptCard key={p.id} prompt={p} onUse={() => onUse(p)} onDelete={() => onDelete(p.id, type)} t={t} />
          ))}
        </div>
      )}
    </div>
  );
};