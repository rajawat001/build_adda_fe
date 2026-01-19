import React, { ReactNode, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

interface BottomSheetProps {
  /** Whether the bottom sheet is open */
  isOpen: boolean;
  /** Callback when the sheet should close */
  onClose: () => void;
  /** Title displayed in the header */
  title?: string;
  /** Content to render inside the sheet */
  children: ReactNode;
  /** Footer content (buttons, etc.) */
  footer?: ReactNode;
  /** Height preset: 'auto' | 'half' | 'full' */
  height?: 'auto' | 'half' | 'full';
  /** Whether to show the drag handle */
  showHandle?: boolean;
  /** Whether to close on backdrop click */
  closeOnBackdrop?: boolean;
  /** Custom max height in pixels */
  maxHeight?: number;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  height = 'auto',
  showHandle = true,
  closeOnBackdrop = true,
  maxHeight,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle drag end
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Close if dragged down more than 100px or with velocity
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  // Get height style based on preset
  const getHeightStyle = () => {
    if (maxHeight) {
      return { maxHeight: `${maxHeight}px` };
    }
    switch (height) {
      case 'half':
        return { maxHeight: '50vh' };
      case 'full':
        return { maxHeight: 'calc(100vh - 40px)' };
      default:
        return { maxHeight: 'calc(100vh - 100px)' };
    }
  };

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
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-card,#ffffff)] rounded-t-2xl shadow-2xl flex flex-col"
            style={{
              ...getHeightStyle(),
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {/* Drag Handle */}
            {showHandle && (
              <div className="flex justify-center py-3 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>
            )}

            {/* Header */}
            {title && (
              <div className="px-4 pb-3 border-b border-[var(--border-primary,#e5e7eb)] flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--text-primary,#1a202c)]">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 rounded-lg hover:bg-[var(--bg-hover,#f3f4f6)] transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5 text-[var(--text-secondary,#6b7280)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div
                className="px-4 py-4 border-t border-[var(--border-primary,#e5e7eb)] bg-[var(--bg-tertiary,#f9fafb)]"
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
};

/**
 * Bottom Sheet with confirmation actions
 */
interface ConfirmBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  isLoading?: boolean;
}

export const ConfirmBottomSheet: React.FC<ConfirmBottomSheetProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  isLoading = false,
}) => {
  const confirmButtonClass = confirmVariant === 'danger'
    ? 'bg-red-500 hover:bg-red-600 text-white'
    : 'bg-primary hover:bg-primary-dark text-white';

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border-primary,#e5e7eb)] text-[var(--text-primary,#1a202c)] font-medium hover:bg-[var(--bg-hover,#f3f4f6)] transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 ${confirmButtonClass}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </span>
            ) : confirmText}
          </button>
        </div>
      }
    >
      <div className="text-[var(--text-secondary,#6b7280)]">
        {message}
      </div>
    </BottomSheet>
  );
};

export default BottomSheet;
