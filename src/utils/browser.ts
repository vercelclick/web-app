export function isSafari() {
  const ua = navigator.userAgent;
  const vendor = navigator.vendor;

  // 1. Check for Desktop / Core Safari
  const isAppleSafari = /Safari/.test(ua) && /Apple Computer/.test(vendor);

  // 2. Rule out other Chromium/Blink or Gecko browsers mimicking Safari
  const isChrome = /Chrome|CriOS/.test(ua);
  const isEdge = /Edg|EdgiOS/.test(ua);
  const isFirefox = /FxiOS/.test(ua);

  return isAppleSafari && !isChrome && !isEdge && !isFirefox;
}
