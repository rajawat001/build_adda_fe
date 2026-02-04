import { useState, useEffect, useCallback } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import {
  FaWhatsapp,
  FaFacebookF,
  FaTelegramPlane,
  FaEnvelope,
  FaLink,
  FaInstagram,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  text: string;
  url: string;
  image?: string;
}

export default function ShareSheet({ isOpen, onClose, title, text, url, image }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  const encodedTitle = encodeURIComponent(title);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [url]);

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp size={24} />,
      color: '#25D366',
      bg: '#e7faf0',
      action: () => window.open(`https://wa.me/?text=${encodedText}%0A${encodedUrl}`, '_blank'),
    },
    {
      name: 'Facebook',
      icon: <FaFacebookF size={22} />,
      color: '#1877F2',
      bg: '#e8f0fe',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank'),
    },
    {
      name: 'X',
      icon: <FaXTwitter size={22} />,
      color: '#000000',
      bg: '#f0f0f0',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank'),
    },
    {
      name: 'Telegram',
      icon: <FaTelegramPlane size={22} />,
      color: '#0088cc',
      bg: '#e6f3fb',
      action: () => window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank'),
    },
    {
      name: 'Instagram',
      icon: <FaInstagram size={22} />,
      color: '#E4405F',
      bg: '#fde8ec',
      action: () => {
        copyToClipboard();
      },
    },
    {
      name: 'Email',
      icon: <FaEnvelope size={22} />,
      color: '#EA4335',
      bg: '#fce8e6',
      action: () => window.open(`mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`, '_self'),
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="share-sheet-overlay" onClick={onClose}>
      <div className="share-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Handle bar */}
        <div className="share-sheet-handle" />

        {/* Header */}
        <div className="share-sheet-header">
          <h3>Share</h3>
          <button className="share-sheet-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        {/* Preview card */}
        <div className="share-sheet-preview">
          {image && (
            <div className="share-sheet-preview-img">
              <img src={image} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
          <div className="share-sheet-preview-text">
            <p className="share-sheet-preview-title">{title}</p>
            <p className="share-sheet-preview-url">{url.replace(/^https?:\/\//, '').split('/').slice(0, 2).join('/')}</p>
          </div>
        </div>

        {/* Share grid */}
        <div className="share-sheet-grid">
          {shareOptions.map((opt) => (
            <button
              key={opt.name}
              className="share-sheet-option"
              onClick={() => { opt.action(); }}
            >
              <div className="share-sheet-icon" style={{ background: opt.bg, color: opt.color }}>
                {opt.icon}
              </div>
              <span>{opt.name}</span>
            </button>
          ))}
        </div>

        {/* Copy link bar */}
        <div className="share-sheet-copy-bar">
          <div className="share-sheet-copy-url">
            <FaLink size={14} />
            <span>{url.length > 45 ? url.slice(0, 45) + '...' : url}</span>
          </div>
          <button
            className={`share-sheet-copy-btn ${copied ? 'copied' : ''}`}
            onClick={copyToClipboard}
          >
            {copied ? <><FiCheck size={14} /> Copied</> : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
