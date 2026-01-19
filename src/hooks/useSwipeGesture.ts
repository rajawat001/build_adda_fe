import { useRef, useCallback, useState } from 'react';

type SwipeDirection = 'left' | 'right' | 'up' | 'down';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipe?: (direction: SwipeDirection) => void;
}

interface SwipeOptions {
  /** Minimum distance in pixels to trigger a swipe (default: 50) */
  threshold?: number;
  /** Maximum time in ms for a valid swipe (default: 300) */
  maxTime?: number;
  /** Prevent default touch behavior */
  preventDefault?: boolean;
}

interface SwipeState {
  swiping: boolean;
  direction: SwipeDirection | null;
  deltaX: number;
  deltaY: number;
}

interface UseSwipeGestureReturn {
  /** Touch event handlers to spread on the element */
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
  /** Current swipe state */
  state: SwipeState;
}

/**
 * Custom hook for detecting swipe gestures
 * @param callbacks - Object containing swipe direction callbacks
 * @param options - Configuration options
 */
export function useSwipeGesture(
  callbacks: SwipeHandlers = {},
  options: SwipeOptions = {}
): UseSwipeGestureReturn {
  const { threshold = 50, maxTime = 300, preventDefault = false } = options;

  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });

  const [state, setState] = useState<SwipeState>({
    swiping: false,
    direction: null,
    deltaX: 0,
    deltaY: 0,
  });

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }

    const touch = e.targetTouches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
    };

    setState({
      swiping: true,
      direction: null,
      deltaX: 0,
      deltaY: 0,
    });
  }, [preventDefault]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }

    const touch = e.targetTouches[0];
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
    };

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    let direction: SwipeDirection | null = null;

    if (absX > absY) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else if (absY > absX) {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    setState({
      swiping: true,
      direction,
      deltaX,
      deltaY,
    });
  }, [preventDefault]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaX = touchStart.current.x - touchEnd.current.x;
    const deltaY = touchStart.current.y - touchEnd.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const elapsedTime = Date.now() - touchStart.current.time;

    // Check if swipe is valid (within time limit and above threshold)
    const isValidSwipe = elapsedTime <= maxTime;

    if (isValidSwipe) {
      // Determine if horizontal or vertical swipe
      if (absX > absY && absX > threshold) {
        // Horizontal swipe
        if (deltaX > 0) {
          callbacks.onSwipeLeft?.();
          callbacks.onSwipe?.('left');
        } else {
          callbacks.onSwipeRight?.();
          callbacks.onSwipe?.('right');
        }
      } else if (absY > absX && absY > threshold) {
        // Vertical swipe
        if (deltaY > 0) {
          callbacks.onSwipeUp?.();
          callbacks.onSwipe?.('up');
        } else {
          callbacks.onSwipeDown?.();
          callbacks.onSwipe?.('down');
        }
      }
    }

    setState({
      swiping: false,
      direction: null,
      deltaX: 0,
      deltaY: 0,
    });
  }, [callbacks, threshold, maxTime]);

  return {
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    state,
  };
}

/**
 * Hook specifically for horizontal swipe on drawers/sidebars
 * Provides smooth drag-to-close functionality
 */
interface UseDragToCloseOptions {
  /** Direction the drawer opens from */
  direction: 'left' | 'right';
  /** Width of the drawer in pixels */
  drawerWidth: number;
  /** Callback when drawer should close */
  onClose: () => void;
  /** Whether the drawer is currently open */
  isOpen: boolean;
  /** Threshold percentage to trigger close (default: 0.3 = 30%) */
  closeThreshold?: number;
}

interface UseDragToCloseReturn {
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
  /** Current drag offset in pixels */
  dragOffset: number;
  /** Whether currently dragging */
  isDragging: boolean;
}

export function useDragToClose(options: UseDragToCloseOptions): UseDragToCloseReturn {
  const { direction, drawerWidth, onClose, isOpen, closeThreshold = 0.3 } = options;

  const touchStart = useRef({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isOpen) return;

    const touch = e.targetTouches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
    setIsDragging(true);
  }, [isOpen]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isOpen || !isDragging) return;

    const touch = e.targetTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;

    // For left drawer: allow dragging left (negative deltaX)
    // For right drawer: allow dragging right (positive deltaX)
    if (direction === 'left') {
      if (deltaX < 0) {
        setDragOffset(Math.max(deltaX, -drawerWidth));
      }
    } else {
      if (deltaX > 0) {
        setDragOffset(Math.min(deltaX, drawerWidth));
      }
    }
  }, [isOpen, isDragging, direction, drawerWidth]);

  const onTouchEnd = useCallback(() => {
    if (!isOpen || !isDragging) return;

    const threshold = drawerWidth * closeThreshold;
    const shouldClose = Math.abs(dragOffset) > threshold;

    if (shouldClose) {
      onClose();
    }

    setDragOffset(0);
    setIsDragging(false);
  }, [isOpen, isDragging, dragOffset, drawerWidth, closeThreshold, onClose]);

  return {
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    dragOffset,
    isDragging,
  };
}
