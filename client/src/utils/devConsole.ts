/**
 * Development-only console utilities
 * These functions are only used in development mode
 */

/**
 * Mutes known Chrome extension noise in development
 * Wraps console.error to filter out extension port errors
 */
export function muteExtensionNoise(): void {
  if (import.meta.env.DEV) {
    const originalError = console.error;
    
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // Filter out Chrome extension port errors
      if (message.includes('The message port closed before a response was received')) {
        return;
      }
      
      // Call original error for all other messages
      originalError.apply(console, args);
    };
  }
}

