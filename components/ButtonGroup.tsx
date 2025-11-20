import React from 'react';

interface ButtonGroupProps {
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ options, selectedValue, onChange }) => {
  return (
    <div className="flex bg-slate-200/70 dark:bg-black/30 p-1 rounded-full w-full">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`w-full px-2 py-1.5 rounded-full transition-colors duration-300 text-sm font-semibold text-slate-700 dark:text-white ${
            selectedValue === option.value
              ? 'bg-purple-600 text-white shadow-md'
              : 'hover:bg-black/5 dark:hover:bg-white/10'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
