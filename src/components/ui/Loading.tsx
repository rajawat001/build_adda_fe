import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ size = 'md', fullScreen = false, text }) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`${sizes[size]} border-4 border-[var(--border-primary)] border-t-[var(--primary-color)] rounded-full`}
        style={{ animation: 'spin 1s linear infinite' }}
      />
      {text && <p className="text-[var(--text-secondary)] text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[var(--bg-primary)] flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-8">{spinner}</div>
};
