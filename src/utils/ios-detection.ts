export const isIOSSafari = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua);
  return isIOS && isSafari;
};

export const isIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const isIOSChrome = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return isIOS && /CriOS/.test(ua);
};
