import React, { useState, useRef, useEffect } from 'react';
import { Tooltip } from './Tooltip.tsx';

interface MultiSelectDropdownProps {
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  className?: string;
  tooltip?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  placeholder,
  options,
  selectedOptions,
  onChange,
  className = '',
  tooltip,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    let newSelection: string[];
    const isCurrentlySelected = selectedOptions.includes(value);

    if (value === 'normal') {
      // If 'normal' is clicked, it becomes the only selection.
      newSelection = ['normal'];
    } else {
      // If another option is clicked, remove 'normal' and toggle the clicked option.
      const withoutNormal = selectedOptions.filter(item => item !== 'normal');
      if (isCurrentlySelected) {
        newSelection = withoutNormal.filter(item => item !== value);
      } else {
        newSelection = [...withoutNormal, value];
      }
    }
    
    // If the selection becomes empty (e.g., by deselecting the last item), default back to 'normal'.
    if (newSelection.length === 0) {
        newSelection = ['normal'];
    }

    onChange(newSelection);
  };
  
  const getDisplayValue = () => {
    if (selectedOptions.length === 0) return placeholder;
    return selectedOptions
        .map(val => options.find(opt => opt.value === val)?.label || val)
        .join(', ');
  };

  return (
    <div className={`flex-1 min-w-[150px] relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center gap-1.5 mb-1">
        <label className="block text-sm font-medium text-slate-600 dark:text-white/80">{label}</label>
        {tooltip && <Tooltip text={tooltip} />}
      </div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2.5 bg-slate-100 dark:bg-black/30 border-2 border-slate-300 dark:border-white/30 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400 transition-colors text-left truncate"
      >
        {getDisplayValue()}
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-slate-300 dark:border-white/30 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map(option => (
            <div
              key={option.value}
              className="flex items-center p-2 hover:bg-slate-100 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => handleSelect(option.value)}
            >
              <input
                type="checkbox"
                checked={selectedOptions.includes(option.value)}
                readOnly
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <span className={`flex-grow ltr:ml-2 rtl:mr-2 text-slate-800 dark:text-white ${option.value === 'normal' ? 'rtl:text-left' : ''}`}>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
