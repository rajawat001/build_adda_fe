import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for responsive media query detection
 * @param query - CSS media query string
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Add listener
    media.addEventListener('change', listener);

    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * Hook to detect mobile devices (screen width <= 768px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

/**
 * Hook to detect tablet devices (screen width between 769px and 1024px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

/**
 * Hook to detect desktop devices (screen width > 1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}

/**
 * Hook to detect small mobile devices (screen width <= 375px)
 */
export function useIsSmallMobile(): boolean {
  return useMediaQuery('(max-width: 375px)');
}

/**
 * Hook to detect touch devices
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery('(hover: none) and (pointer: coarse)');
}

/**
 * Hook to detect user preference for reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Hook to detect user preference for dark mode
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * Hook to get current breakpoint
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export function useBreakpoint(): Breakpoint {
  const isXs = useMediaQuery('(max-width: 639px)');
  const isSm = useMediaQuery('(min-width: 640px) and (max-width: 767px)');
  const isMd = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isLg = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)');
  const isXl = useMediaQuery('(min-width: 1280px) and (max-width: 1535px)');

  if (isXs) return 'xs';
  if (isSm) return 'sm';
  if (isMd) return 'md';
  if (isLg) return 'lg';
  if (isXl) return 'xl';
  return '2xl';
}

/**
 * Hook to detect landscape orientation
 */
export function useIsLandscape(): boolean {
  return useMediaQuery('(orientation: landscape)');
}

/**
 * Hook to detect portrait orientation
 */
export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)');
}
