import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, title, icon, className = '', actions }) => {
  return (
    <div className={`relative bg-white/90 dark:bg-black/20 backdrop-blur-lg rounded-2xl p-6 shadow-lg dark:shadow-2xl border border-transparent dark:border-white/20 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center text-slate-800 dark:text-white">
          <span className="text-3xl me-3">{icon}</span>
          {title}
        </h2>
        {actions}
      </div>
      {children}
    </div>
  );
};
