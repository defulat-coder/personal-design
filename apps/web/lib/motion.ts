/** Call in interaction handlers: repeated keyboard actions never wait on motion. */
export function instantMotion() {
  return document.documentElement.dataset.input === 'keyboard'
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
