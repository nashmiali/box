import { useEffect, useCallback } from 'react';

export const useTVNavigation = (onSelect: (id: string) => void) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        // Simple focus management: move focus to the next/prev element
        // This is a basic implementation; for complex grids, a dedicated library is better.
        event.preventDefault();
        const focusable = Array.from(document.querySelectorAll('[data-tv-focusable]'));
        const currentIndex = focusable.indexOf(document.activeElement as Element);
        let nextIndex = currentIndex;
        
        if (event.key === 'ArrowRight') nextIndex = Math.min(currentIndex + 1, focusable.length - 1);
        if (event.key === 'ArrowLeft') nextIndex = Math.max(currentIndex - 1, 0);
        
        (focusable[nextIndex] as HTMLElement)?.focus();
        break;
      case 'Enter':
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement?.dataset.tvId) {
          onSelect(activeElement.dataset.tvId);
        }
        break;
    }
  }, [onSelect]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
