import { useState, useRef, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const languages = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'hi', label: 'HI', name: 'हिन्दी' },
  { code: 'mr', label: 'MR', name: 'मराठी' },
  { code: 'gu', label: 'GU', name: 'ગુજરાતી' },
  { code: 'ta', label: 'TA', name: 'தமிழ்' },
  { code: 'te', label: 'TE', name: 'తెలుగు' },
  { code: 'kn', label: 'KN', name: 'ಕನ್ನಡ' },
  { code: 'bn', label: 'BN', name: 'বাংলা' },
  { code: 'pa', label: 'PA', name: 'ਪੰਜਾਬੀ' },
  { code: 'ml', label: 'ML', name: 'മലയാളം' },
];

export default function GoogleTranslate() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Initialize Google Translate
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check current language from cookie
    const match = document.cookie.match(/googtrans=\/[^/]+\/(\w+)/);
    if (match?.[1]) {
      setCurrentLang(match[1]);
    }

    // Create hidden element
    if (!document.getElementById('google_translate_element')) {
      const div = document.createElement('div');
      div.id = 'google_translate_element';
      div.style.cssText = 'position:absolute;top:-9999px;left:-9999px;visibility:hidden;';
      document.body.appendChild(div);
    }

    // Init callback
    window.googleTranslateElementInit = function() {
      try {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,hi,mr,gu,ta,te,kn,bn,pa,ml',
          autoDisplay: false,
          multilanguagePage: true
        }, 'google_translate_element');

        // Check if ready
        const check = setInterval(() => {
          const combo = document.querySelector('.goog-te-combo');
          if (combo) {
            setReady(true);
            clearInterval(check);
          }
        }, 200);
        setTimeout(() => clearInterval(check), 10000);
      } catch (e) {
        console.log('GT init:', e);
      }
    };

    // Load script
    if (!document.querySelector('script[src*="translate.google.com/translate_a/element.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate) {
      window.googleTranslateElementInit();
    }
  }, []);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close on outside click (mousedown for desktop, touchstart for mobile)
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.type === 'touchstart'
        ? (e as TouchEvent).touches[0]?.target as Node
        : e.target as Node;
      if (dropdownRef.current && target && !dropdownRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  // Monitor language changes
  useEffect(() => {
    const checkLang = () => {
      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (combo?.value) {
        setCurrentLang(combo.value);
      } else {
        const match = document.cookie.match(/googtrans=\/[^/]+\/(\w+)/);
        if (match?.[1]) setCurrentLang(match[1]);
      }
    };
    const interval = setInterval(checkLang, 1000);
    return () => clearInterval(interval);
  }, []);

  const selectLanguage = useCallback((code: string) => {
    setIsOpen(false);
    setCurrentLang(code);

    // Try Google's combo
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (combo) {
      combo.value = code;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    // Fallback: set cookie and reload
    const host = window.location.hostname;

    // Clear old cookies
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host}`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${host}`;

    if (code !== 'en') {
      const val = `/en/${code}`;
      document.cookie = `googtrans=${val}; path=/`;
      document.cookie = `googtrans=${val}; path=/; domain=${host}`;
      document.cookie = `googtrans=${val}; path=/; domain=.${host}`;
    }

    window.location.reload();
  }, []);

  const current = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div ref={dropdownRef} className="gt-wrap">
      <button
        ref={btnRef}
        className="gt-btn"
        onClick={() => {
          if (isMobile && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setMenuTop(rect.bottom + 6);
          }
          setIsOpen(!isOpen);
        }}
        type="button"
        title="Translate"
      >
        {current.label}
      </button>

      {isOpen && (
        <div className="gt-menu" style={isMobile ? { top: `${menuTop}px` } : undefined}>
          <div className="gt-header">Select Language</div>
          <div className="gt-list">
            {languages.map(lang => (
              <button
                key={lang.code}
                className={`gt-item ${currentLang === lang.code ? 'active' : ''}`}
                onClick={() => selectLanguage(lang.code)}
                type="button"
              >
                <span className="gt-code">{lang.label}</span>
                <span className="gt-name">{lang.name}</span>
                {currentLang === lang.code && <span className="gt-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .gt-wrap {
          position: relative;
          z-index: 9999;
        }
        .gt-btn {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(249,115,22,0.3);
        }
        .gt-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(249,115,22,0.4);
        }
        .gt-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 180px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }
        .gt-header {
          padding: 12px 14px;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: #fff;
          font-weight: 700;
          font-size: 13px;
        }
        .gt-list {
          max-height: 280px;
          overflow-y: auto;
          padding: 6px;
        }
        .gt-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
        }
        .gt-item:hover {
          background: #f9fafb;
        }
        .gt-item.active {
          background: #fff7ed;
        }
        .gt-code {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          color: #6b7280;
        }
        .gt-item.active .gt-code {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: #fff;
        }
        .gt-name {
          flex: 1;
          font-size: 14px;
          color: #374151;
        }
        .gt-item.active .gt-name {
          color: #ea580c;
          font-weight: 600;
        }
        .gt-check {
          color: #f97316;
          font-weight: bold;
        }
        @media (max-width: 768px) {
          .gt-wrap {
            overflow: visible !important;
            max-width: none !important;
          }
          .gt-btn {
            width: 28px;
            height: 28px;
            font-size: 9px;
            border-radius: 6px;
            min-height: 28px !important;
            min-width: 28px !important;
            box-shadow: 0 1px 4px rgba(249,115,22,0.3);
          }
          .gt-menu {
            position: fixed;
            top: auto;
            right: 12px;
            left: auto;
            width: 180px;
            max-width: none !important;
            z-index: 99999;
          }
          .gt-item {
            min-height: 40px !important;
            min-width: auto !important;
            padding: 8px;
          }
          .gt-list {
            max-height: 60vh;
          }
        }
      `}</style>

      <style jsx global>{`
        .goog-te-banner-frame,
        .skiptranslate,
        #goog-gt-tt,
        .goog-te-balloon-frame {
          display: none !important;
        }
        body {
          top: 0 !important;
        }
        .goog-text-highlight {
          background: none !important;
          box-shadow: none !important;
        }
        .VIpgJd-ZVi9od-ORHb-OEVmcd,
        .VIpgJd-ZVi9od-aZ2wEe-wOHMyf {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
