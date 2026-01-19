import { useState, useCallback, useEffect } from 'react';

interface UseMobileDrawerOptions {
  /** Initial open state */
  initialState?: boolean;
  /** Lock body scroll when drawer is open */
  lockScroll?: boolean;
  /** Close on escape key press */
  closeOnEscape?: boolean;
  /** Callback when drawer opens */
  onOpen?: () => void;
  /** Callback when drawer closes */
  onClose?: () => void;
}

interface UseMobileDrawerReturn {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Open the drawer */
  open: () => void;
  /** Close the drawer */
  close: () => void;
  /** Toggle the drawer state */
  toggle: () => void;
  /** Set the drawer state directly */
  setIsOpen: (value: boolean) => void;
}

/**
 * Custom hook for managing mobile drawer/sidebar state
 * Handles body scroll locking and escape key closing
 */
export function useMobileDrawer(options: UseMobileDrawerOptions = {}): UseMobileDrawerReturn {
  const {
    initialState = false,
    lockScroll = true,
    closeOnEscape = true,
    onOpen,
    onClose,
  } = options;

  const [isOpen, setIsOpenState] = useState(initialState);

  const open = useCallback(() => {
    setIsOpenState(true);
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpenState(false);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    setIsOpenState(prev => {
      const newState = !prev;
      if (newState) {
        onOpen?.();
      } else {
        onClose?.();
      }
      return newState;
    });
  }, [onOpen, onClose]);

  const setIsOpen = useCallback((value: boolean) => {
    setIsOpenState(value);
    if (value) {
      onOpen?.();
    } else {
      onClose?.();
    }
  }, [onOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!lockScroll) return;

    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;

      // Apply styles to prevent scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      // Get the scroll position from the body's top style
      const scrollY = document.body.style.top;

      // Reset styles
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';

      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }

    return () => {
      // Cleanup on unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
    };
  }, [isOpen, lockScroll]);

  // Close on escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, isOpen, close]);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}

/**
 * Hook for managing multiple drawers (e.g., sidebar + filter drawer)
 */
interface UseMultipleDrawersOptions {
  drawers: string[];
  lockScroll?: boolean;
}

interface UseMultipleDrawersReturn {
  openDrawer: string | null;
  open: (drawer: string) => void;
  close: () => void;
  isOpen: (drawer: string) => boolean;
  toggle: (drawer: string) => void;
}

export function useMultipleDrawers(options: UseMultipleDrawersOptions): UseMultipleDrawersReturn {
  const { lockScroll = true } = options;
  const [openDrawer, setOpenDrawer] = useState<string | null>(null);

  const open = useCallback((drawer: string) => {
    setOpenDrawer(drawer);
  }, []);

  const close = useCallback(() => {
    setOpenDrawer(null);
  }, []);

  const isOpen = useCallback((drawer: string) => {
    return openDrawer === drawer;
  }, [openDrawer]);

  const toggle = useCallback((drawer: string) => {
    setOpenDrawer(prev => prev === drawer ? null : drawer);
  }, []);

  // Lock body scroll when any drawer is open
  useEffect(() => {
    if (!lockScroll) return;

    if (openDrawer) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
    };
  }, [openDrawer, lockScroll]);

  // Close on escape key
  useEffect(() => {
    if (!openDrawer) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [openDrawer, close]);

  return {
    openDrawer,
    open,
    close,
    isOpen,
    toggle,
  };
}
