import React from 'react';
// loading.css is imported globally in _app.tsx

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  fullScreen = false,
  message
}) => {
  const spinnerContent = (
    <div className={`loading-spinner-wrapper ${fullScreen ? 'fullscreen' : ''}`}>
      <div className={`loading-logo-spinner loading-logo-spinner-${size}`}>
        <div className="logo-spinner-ring"></div>
        <img
          src="/icons/icon-192x192.png"
          alt="BuildAdda"
          className="logo-spinner-image"
        />
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-overlay">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
