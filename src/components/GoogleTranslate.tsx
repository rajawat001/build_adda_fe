import { useState, useRef, useEffect } from 'react';

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
  const [isLocalhost, setIsLocalhost] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if localhost
    const host = window.location.hostname;
    setIsLocalhost(host === 'localhost' || host === '127.0.0.1');

    // Get saved language
    const saved = localStorage.getItem('gt_lang');
    if (saved) setCurrentLang(saved);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectLanguage = (code: string) => {
    localStorage.setItem('gt_lang', code);
    setCurrentLang(code);
    setIsOpen(false);

    if (code === 'en') {
      // Reset to English
      if (window.location.href.includes('translate.goog')) {
        window.location.href = window.location.origin + window.location.pathname;
      }
      return;
    }

    if (isLocalhost) {
      alert('Translation works only on production (buildadda.in).\n\nDeploy to test translation feature.');
      return;
    }

    // Redirect to Google Translate (production only)
    const url = encodeURIComponent(window.location.href);
    window.location.href = `https://translate.google.com/translate?sl=en&tl=${code}&u=${url}`;
  };

  const current = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div ref={dropdownRef} className="gt-wrap">
      <button className="gt-btn" onClick={() => setIsOpen(!isOpen)} type="button" title="Translate">
        {current.label}
      </button>

      {isOpen && (
        <div className="gt-menu">
          <div className="gt-header">
            Select Language
            {isLocalhost && <span className="gt-badge">Demo</span>}
          </div>
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
          {isLocalhost && (
            <div className="gt-footer">Works on production only</div>
          )}
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
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .gt-badge {
          background: rgba(255,255,255,0.2);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
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
        .gt-footer {
          padding: 8px 12px;
          background: #fef3c7;
          color: #92400e;
          font-size: 11px;
          text-align: center;
        }
        @media (max-width: 768px) {
          .gt-btn {
            width: 36px;
            height: 36px;
            font-size: 11px;
          }
          .gt-menu {
            right: -10px;
          }
        }
      `}</style>
    </div>
  );
}
