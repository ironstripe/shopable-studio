export const isIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  
  // Method 1: Direct UA patterns for iPhone/iPad/iPod
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  
  // Method 2: iOS pattern in user agent (covers more cases)
  if (/\(i[^;]+;( U;)? CPU.+Mac OS X/.test(ua)) return true;
  
  // Method 3: iPad in desktop mode (reports as Mac with touch)
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return true;
  
  return false;
};

export const isIOSSafari = (): boolean => {
  if (!isIOS()) return false;
  const ua = navigator.userAgent;
  // Safari but not Chrome/Firefox on iOS
  return /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);
};

export const isIOSChrome = (): boolean => {
  if (!isIOS()) return false;
  return /CriOS/.test(navigator.userAgent);
};
