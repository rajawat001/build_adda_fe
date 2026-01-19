import React, { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Mobile display variant: 'center' | 'bottom-sheet' | 'fullscreen' */
  mobileVariant?: 'center' | 'bottom-sheet' | 'fullscreen';
}

// Hook to detect mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  mobileVariant = 'bottom-sheet',
}) => {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  // Handle drag end for bottom sheet
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  // Mobile Bottom Sheet Variant
  if (isMobile && mobileVariant === 'bottom-sheet') {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={onClose}
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={handleDragEnd}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-card,#ffffff)] rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh]"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
              {/* Drag Handle */}
              <div className="flex justify-center py-3 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              {title && (
                <div className="px-4 pb-3 border-b border-[var(--border-primary)] flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
                  <button
                    onClick={onClose}
                    className="p-2 -mr-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Body */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div
                  className="px-4 py-4 border-t border-[var(--border-primary)] bg-[var(--bg-tertiary)]"
                  style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
                >
                  {footer}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Mobile Fullscreen Variant
  if (isMobile && mobileVariant === 'fullscreen') {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[var(--bg-card,#ffffff)] flex flex-col"
            style={{
              paddingTop: 'env(safe-area-inset-top, 0px)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {/* Header */}
            <div className="px-4 py-4 border-b border-[var(--border-primary)] flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 -ml-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
              >
                <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {title && (
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-4 py-4 border-t border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
                {footer}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Desktop / Mobile Center Variant
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`bg-[var(--bg-card)] rounded-xl shadow-2xl w-full ${sizes[size]} pointer-events-auto max-h-[90vh] flex flex-col`}
        >
          {/* Header */}
          {title && (
            <div className="px-6 py-4 border-b border-[var(--border-primary)] flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h3>
              <button
                onClick={onClose}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-4 overflow-y-auto flex-1">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-[var(--border-primary)] bg-[var(--bg-tertiary)] rounded-b-xl">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};
