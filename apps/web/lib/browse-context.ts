export type BrowseEntry = { href: string; title: string };
export type BrowseContext = { href: string; entries: BrowseEntry[] };

/** A saved trail only applies to the product and work that created it. */
export function resolveBrowseContext(raw: string | null, listPath: string, pathname: string): BrowseContext | null {
  if (!raw) return null;
  try {
    const saved = JSON.parse(raw);
    const href = saved.href ?? saved.url;
    if (typeof href !== 'string' || (href !== listPath && !href.startsWith(`${listPath}?`))) return null;
    if (!Array.isArray(saved.entries)) return null;
    const entries: BrowseEntry[] = saved.entries.filter((entry: BrowseEntry) => typeof entry?.href === 'string' && entry.href.startsWith(`${listPath}/`) && !entry.href.includes('?') && typeof entry.title === 'string');
    if (!entries.some(entry => entry.href === pathname)) return null;
    return { href, entries };
  } catch { return null; }
}
