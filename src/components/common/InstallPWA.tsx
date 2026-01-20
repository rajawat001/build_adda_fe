import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isInStandaloneMode = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://')
      );
    };
    
    const standalone = isInStandaloneMode();
    setIsStandalone(standalone);

    // Check if iOS device
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Don't show if already installed
    if (standalone) {
      return;
    }

    // Check dismiss history
    const dismissData = localStorage.getItem('pwa-install-dismissed');
    if (dismissData) {
      try {
        const { timestamp, count } = JSON.parse(dismissData);
        const now = Date.now();
        const hoursSinceDismiss = (now - timestamp) / (1000 * 60 * 60);
        
        // Progressive delay: 1 day → 3 days → 7 days
        let delayHours = 24;
        if (count === 2) delayHours = 72;
        if (count >= 3) delayHours = 168;
        
        if (hoursSinceDismiss < delayHours) {
          return;
        } else {
          localStorage.removeItem('pwa-install-dismissed');
        }
      } catch {
        localStorage.removeItem('pwa-install-dismissed');
      }
    }

    // Android/Chrome install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS install prompt
    if (iOS && !standalone) {
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    }

    // Track successful installation
    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        localStorage.removeItem('pwa-install-dismissed');
      }

      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      // Silent fail - user may have cancelled
    }
  };

  const handleDismiss = () => {
    const dismissData = localStorage.getItem('pwa-install-dismissed');
    let count = 1;
    
    if (dismissData) {
      try {
        const parsed = JSON.parse(dismissData);
        count = (parsed.count || 0) + 1;
      } catch {
        count = 1;
      }
    }
    
    localStorage.setItem('pwa-install-dismissed', JSON.stringify({
      timestamp: Date.now(),
      count: count
    }));
    
    setShowInstallPrompt(false);
  };

  // Don't render if installed or not ready
  if (isStandalone || !showInstallPrompt) {
    return null;
  }

  // iOS Installation Banner
  if (isIOS) {
    return (
      <div className="pwa-install-banner ios-install">
        <div className="install-content">
          <img src="/icons/icon-96x96.png" alt="BuildAdda" className="install-icon" />
          <div className="install-text">
            <h4>Install BuildAdda App</h4>
            <p>
              Tap <span className="ios-share-icon">
                <svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor">
                  <path d="M8 0L3 5h3v7h4V5h3L8 0zm-7 18v2h14v-2H1z"/>
                </svg>
              </span> then "Add to Home Screen"
            </p>
          </div>
          <button 
            onClick={handleDismiss} 
            className="dismiss-btn"
            aria-label="Close install prompt"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // Android/Chrome Installation Banner
  if (deferredPrompt) {
    return (
      <div className="pwa-install-banner" onClick={handleInstallClick}>
        <div className="install-content">
          <img src="/icons/icon-96x96.png" alt="BuildAdda" className="install-icon" />
          <div className="install-text">
            <h4>Install BuildAdda</h4>
            <p>Get quick access to construction materials</p>
          </div>
          <div className="install-actions">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleInstallClick();
              }} 
              className="install-btn"
              aria-label="Install app"
            >
              Install
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }} 
              className="dismiss-btn"
              aria-label="Close install prompt"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InstallPWA;