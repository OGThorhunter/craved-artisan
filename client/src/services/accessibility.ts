import { useEffect, useRef, useState } from 'react';

export interface AccessibilityOptions {
  announceChanges?: boolean;
  focusManagement?: boolean;
  keyboardNavigation?: boolean;
  screenReaderSupport?: boolean;
  highContrast?: boolean;
  reducedMotion?: boolean;
}

export interface FocusTrapOptions {
  initialFocus?: HTMLElement | null;
  returnFocus?: HTMLElement | null;
  preventScroll?: boolean;
}

export class AccessibilityService {
  private static instance: AccessibilityService;
  private options: AccessibilityOptions = {
    announceChanges: true,
    focusManagement: true,
    keyboardNavigation: true,
    screenReaderSupport: true,
    highContrast: false,
    reducedMotion: false
  };

  public static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  // Initialize accessibility features
  initialize(): void {
    this.setupFocusManagement();
    this.setupKeyboardNavigation();
    this.setupScreenReaderSupport();
    this.setupHighContrast();
    this.setupReducedMotion();
  }

  // Setup focus management
  private setupFocusManagement(): void {
    if (!this.options.focusManagement) return;

    // Track focus changes
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      if (target) {
        target.setAttribute('data-focused', 'true');
      }
    });

    document.addEventListener('focusout', (event) => {
      const target = event.target as HTMLElement;
      if (target) {
        target.removeAttribute('data-focused');
      }
    });
  }

  // Setup keyboard navigation
  private setupKeyboardNavigation(): void {
    if (!this.options.keyboardNavigation) return;

    // Handle tab navigation
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    // Remove keyboard navigation class on mouse use
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  }

  // Setup screen reader support
  private setupScreenReaderSupport(): void {
    if (!this.options.screenReaderSupport) return;

    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);
  }

  // Setup high contrast mode
  private setupHighContrast(): void {
    if (!this.options.highContrast) return;

    // Check for system high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      document.body.classList.add('high-contrast');
    }

    // Listen for changes
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      if (e.matches) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
    });
  }

  // Setup reduced motion
  private setupReducedMotion(): void {
    if (!this.options.reducedMotion) return;

    // Check for system reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('reduced-motion');
    }

    // Listen for changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      if (e.matches) {
        document.body.classList.add('reduced-motion');
      } else {
        document.body.classList.remove('reduced-motion');
      }
    });
  }

  // Announce changes to screen readers
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.options.announceChanges) return;

    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }

  // Focus trap for modals and drawers
  createFocusTrap(container: HTMLElement, options: FocusTrapOptions = {}): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus initial element
    if (options.initialFocus) {
      options.initialFocus.focus();
    } else if (firstElement) {
      firstElement.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (options.returnFocus) {
        options.returnFocus.focus();
      }
    };
  }

  // Skip to content link
  createSkipLink(targetId: string, text: string = 'Skip to main content'): HTMLElement {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 1000;
      border-radius: 4px;
    `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    return skipLink;
  }

  // Update options
  updateOptions(newOptions: Partial<AccessibilityOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  // Get current options
  getOptions(): AccessibilityOptions {
    return { ...this.options };
  }
}

// Export singleton instance
export const accessibilityService = AccessibilityService.getInstance();

// React hook for accessibility announcements
export function useAccessibilityAnnouncement() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    accessibilityService.announce(message, priority);
  };

  return { announce };
}

// React hook for focus management
export function useFocusManagement() {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      setFocusedElement(event.target as HTMLElement);
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

  const focusElement = (element: HTMLElement | null) => {
    if (element) {
      element.focus();
      setFocusedElement(element);
    }
  };

  return { focusedElement, focusElement };
}

// React hook for focus trap
export function useFocusTrap(options: FocusTrapOptions = {}) {
  const containerRef = useRef<HTMLElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const activate = () => {
    if (containerRef.current && !cleanupRef.current) {
      cleanupRef.current = accessibilityService.createFocusTrap(containerRef.current, options);
    }
  };

  const deactivate = () => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      deactivate();
    };
  }, []);

  return { containerRef, activate, deactivate };
}

// React hook for keyboard navigation
export function useKeyboardNavigation() {
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsKeyboardNavigation(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardNavigation(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return { isKeyboardNavigation };
}

// React hook for reduced motion
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { prefersReducedMotion };
}

// React hook for high contrast
export function useHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { prefersHighContrast };
}

// Utility function to check if element is visible to screen readers
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.getAttribute('aria-hidden') !== 'true'
  );
}

// Utility function to get accessible name
export function getAccessibleName(element: HTMLElement): string {
  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // Check aria-labelledby
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy);
    if (labelElement) return labelElement.textContent || '';
  }

  // Check associated label
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) return label.textContent || '';
  }

  // Check title attribute
  const title = element.getAttribute('title');
  if (title) return title;

  // Fallback to text content
  return element.textContent || '';
}

// Utility function to set accessible name
export function setAccessibleName(element: HTMLElement, name: string): void {
  element.setAttribute('aria-label', name);
}

// Utility function to make element focusable
export function makeFocusable(element: HTMLElement, tabIndex: number = 0): void {
  element.setAttribute('tabindex', tabIndex.toString());
}

// Utility function to make element not focusable
export function makeNotFocusable(element: HTMLElement): void {
  element.setAttribute('tabindex', '-1');
}

// Initialize accessibility service
export function initializeAccessibility(): void {
  accessibilityService.initialize();
}























