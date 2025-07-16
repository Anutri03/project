/**
 * Utility functions for QR code generation and handling
 */

export interface QRCodeData {
  type: 'event' | 'poll';
  eventCode: string;
  pollId?: string;
  url: string;
}

/**
 * Generate a QR code URL for joining an event
 */
export const generateEventQRUrl = (eventCode: string, baseUrl?: string): string => {
  const base = baseUrl || window.location.origin;
  return `${base}?join=${eventCode}`;
};

/**
 * Generate a QR code URL for a specific poll
 */
export const generatePollQRUrl = (pollId: string, eventCode: string, baseUrl?: string): string => {
  const base = baseUrl || window.location.origin;
  return `${base}?poll=${pollId}&event=${eventCode}`;
};

/**
 * Parse QR code data from URL parameters
 */
export const parseQRCodeUrl = (url: string): QRCodeData | null => {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    
    const joinCode = params.get('join');
    const pollId = params.get('poll');
    const eventCode = params.get('event');

    if (joinCode) {
      return {
        type: 'event',
        eventCode: joinCode,
        url
      };
    }

    if (pollId && eventCode) {
      return {
        type: 'poll',
        eventCode,
        pollId,
        url
      };
    }

    return null;
  } catch (error) {
    console.error('Error parsing QR code URL:', error);
    return null;
  }
};

/**
 * Generate a short event code (similar to Slido)
 */
export const generateEventCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validate event code format
 */
export const isValidEventCode = (code: string): boolean => {
  return /^[A-Z0-9]{6}$/.test(code.toUpperCase());
};

/**
 * Format event code for display (adds # prefix)
 */
export const formatEventCode = (code: string): string => {
  return `#${code.toUpperCase()}`;
};

/**
 * Clean event code (removes # prefix and converts to uppercase)
 */
export const cleanEventCode = (code: string): string => {
  return code.replace('#', '').toUpperCase();
};