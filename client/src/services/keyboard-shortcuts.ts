import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean; // Cmd on Mac, Windows key on Windows
  description: string;
  action: () => void;
  category?: string;
  disabled?: boolean;
}

export interface ShortcutGroup {
  name: string;
  shortcuts: KeyboardShortcut[];
}

export class KeyboardShortcutService {
  private static instance: KeyboardShortcutService;
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private isEnabled = true;

  public static getInstance(): KeyboardShortcutService {
    if (!KeyboardShortcutService.instance) {
      KeyboardShortcutService.instance = new KeyboardShortcutService();
    }
    return KeyboardShortcutService.instance;
  }

  // Register a keyboard shortcut
  register(shortcut: KeyboardShortcut): void {
    const key = this.generateKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  // Unregister a keyboard shortcut
  unregister(shortcut: KeyboardShortcut): void {
    const key = this.generateKey(shortcut);
    this.shortcuts.delete(key);
  }

  // Enable/disable shortcuts
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Get all shortcuts grouped by category
  getShortcutsByCategory(): ShortcutGroup[] {
    const groups: Map<string, KeyboardShortcut[]> = new Map();
    
    this.shortcuts.forEach(shortcut => {
      const category = shortcut.category || 'General';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(shortcut);
    });

    return Array.from(groups.entries()).map(([name, shortcuts]) => ({
      name,
      shortcuts: shortcuts.sort((a, b) => a.description.localeCompare(b.description))
    }));
  }

  // Generate a unique key for the shortcut
  private generateKey(shortcut: KeyboardShortcut): string {
    const modifiers = [];
    if (shortcut.ctrl) modifiers.push('ctrl');
    if (shortcut.alt) modifiers.push('alt');
    if (shortcut.shift) modifiers.push('shift');
    if (shortcut.meta) modifiers.push('meta');
    
    return `${modifiers.join('+')}+${shortcut.key.toLowerCase()}`;
  }

  // Handle keydown events
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.isEnabled) return;

    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    const key = this.generateKey({
      key: event.key,
      ctrl: event.ctrlKey,
      alt: event.altKey,
      shift: event.shiftKey,
      meta: event.metaKey,
      description: '',
      action: () => {}
    });

    const shortcut = this.shortcuts.get(key);
    if (shortcut && !shortcut.disabled) {
      event.preventDefault();
      shortcut.action();
    }
  };

  // Initialize the service
  initialize(): void {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  // Cleanup the service
  cleanup(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
  }
}

// Export singleton instance
export const keyboardShortcutService = KeyboardShortcutService.getInstance();

// React hook for keyboard shortcuts
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]): void {
  useEffect(() => {
    // Register shortcuts
    shortcuts.forEach(shortcut => {
      keyboardShortcutService.register(shortcut);
    });

    // Cleanup on unmount
    return () => {
      shortcuts.forEach(shortcut => {
        keyboardShortcutService.unregister(shortcut);
      });
    };
  }, [shortcuts]);
}

// React hook for a single keyboard shortcut
export function useKeyboardShortcut(
  key: string,
  action: () => void,
  options: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
    description?: string;
    category?: string;
    disabled?: boolean;
  } = {}
): void {
  const shortcut: KeyboardShortcut = {
    key,
    action,
    description: options.description || `${key} shortcut`,
    category: options.category || 'General',
    disabled: options.disabled || false,
    ...options
  };

  useKeyboardShortcuts([shortcut]);
}

// Admin-specific keyboard shortcuts
export const adminShortcuts: KeyboardShortcut[] = [
  {
    key: '1',
    ctrl: true,
    description: 'Go to Overview',
    action: () => {
      const overviewTab = document.querySelector('[data-tab="overview"]') as HTMLElement;
      overviewTab?.click();
    },
    category: 'Navigation'
  },
  {
    key: '2',
    ctrl: true,
    description: 'Go to Revenue',
    action: () => {
      const revenueTab = document.querySelector('[data-tab="revenue"]') as HTMLElement;
      revenueTab?.click();
    },
    category: 'Navigation'
  },
  {
    key: '3',
    ctrl: true,
    description: 'Go to Operations',
    action: () => {
      const opsTab = document.querySelector('[data-tab="operations"]') as HTMLElement;
      opsTab?.click();
    },
    category: 'Navigation'
  },
  {
    key: '4',
    ctrl: true,
    description: 'Go to Marketplace',
    action: () => {
      const marketplaceTab = document.querySelector('[data-tab="marketplace"]') as HTMLElement;
      marketplaceTab?.click();
    },
    category: 'Navigation'
  },
  {
    key: '5',
    ctrl: true,
    description: 'Go to Trust & Safety',
    action: () => {
      const trustTab = document.querySelector('[data-tab="trust"]') as HTMLElement;
      trustTab?.click();
    },
    category: 'Navigation'
  },
  {
    key: '6',
    ctrl: true,
    description: 'Go to Growth & Social',
    action: () => {
      const growthTab = document.querySelector('[data-tab="growth"]') as HTMLElement;
      growthTab?.click();
    },
    category: 'Navigation'
  },
  {
    key: '7',
    ctrl: true,
    description: 'Go to Security & Compliance',
    action: () => {
      const securityTab = document.querySelector('[data-tab="security"]') as HTMLElement;
      securityTab?.click();
    },
    category: 'Navigation'
  },
  {
    key: 'r',
    ctrl: true,
    description: 'Refresh current view',
    action: () => {
      const refreshButton = document.querySelector('[data-action="refresh"]') as HTMLElement;
      refreshButton?.click();
    },
    category: 'Actions'
  },
  {
    key: 's',
    ctrl: true,
    description: 'Open search',
    action: () => {
      const searchInput = document.querySelector('[data-action="search"]') as HTMLInputElement;
      searchInput?.focus();
    },
    category: 'Actions'
  },
  {
    key: 'm',
    ctrl: true,
    description: 'Toggle system messages',
    action: () => {
      const messagesButton = document.querySelector('[data-action="messages"]') as HTMLElement;
      messagesButton?.click();
    },
    category: 'Actions'
  },
  {
    key: 'h',
    ctrl: true,
    description: 'Show keyboard shortcuts help',
    action: () => {
      const helpButton = document.querySelector('[data-action="help"]') as HTMLElement;
      helpButton?.click();
    },
    category: 'Help'
  },
  {
    key: 'Escape',
    description: 'Close modals/drawers',
    action: () => {
      const closeButton = document.querySelector('[data-action="close"]') as HTMLElement;
      closeButton?.click();
    },
    category: 'Navigation'
  }
];

// Initialize admin shortcuts
export function initializeAdminShortcuts(): void {
  adminShortcuts.forEach(shortcut => {
    keyboardShortcutService.register(shortcut);
  });
}
