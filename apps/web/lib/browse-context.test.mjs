import assert from 'node:assert/strict';
import test from 'node:test';
import { browseHref, browseMemoryKey, resolveBrowseContext, resolveUrlBrowseContext } from './browse-context.ts';

const path = '/products/muse';
const entries = [
  { href: `${path}/first`, title: 'First motion' },
  { href: `${path}/second`, title: 'Second motion' },
];

test('keeps the filtered order and return query together', () => {
  const raw = JSON.stringify({ href: `${path}?cat=Motion&q=button`, entries });
  assert.deepEqual(resolveBrowseContext(raw, path, entries[0].href), { href: `${path}?cat=Motion&q=button`, entries });
});
test('unrelated direct entry cannot inherit an old browsing trail', () => {
  assert.equal(resolveBrowseContext(JSON.stringify({ href: path, entries }), path, `${path}/unrelated`), null);
});
test('ignores another product or malformed saved data', () => {
  assert.equal(resolveBrowseContext(JSON.stringify({ href: '/products/layout-compositions', entries }), path, entries[0].href), null);
  assert.equal(resolveBrowseContext('{', path, entries[0].href), null);
  assert.equal(resolveBrowseContext(null, path, entries[0].href), null);
});
test('supports layout return records and excludes invalid destinations', () => {
  const raw = JSON.stringify({ url: path, entries: [null, { href: 'https://example.com', title: 'Elsewhere' }, ...entries] });
  assert.deepEqual(resolveBrowseContext(raw, path, entries[1].href), { href: path, entries });
});

const searchable = [
  { ...entries[0], category: 'Motion', theme: 'buttons', search: ['First motion', 'Alice', 'Button interaction', '动效'] },
  { ...entries[1], category: 'Motion', theme: 'cards', search: ['Second motion', 'Bob', 'Card interaction', '动效'] },
  { href: `${path}/third`, title: 'Third button', category: 'Product', theme: 'buttons', search: ['Third button', 'Alice', '产品设计'] },
];
const resolveLink = (href) => {
  const [pathname, query] = href.split('?');
  return resolveUrlBrowseContext(query, path, pathname, searchable);
};

test('a copied or new-tab link preserves filters without a click or storage', () => {
  const href = browseHref(entries[0].href, `${path}?cat=Motion&q=BUTTON`);
  const resolved = resolveLink(href);
  assert.equal(resolved.href, `${path}?cat=Motion&q=BUTTON`);
  assert.deepEqual(resolved.entries.map(entry => entry.href), [entries[0].href]);
});

test('an older detail URL keeps its own result order after another browsing trail', () => {
  const oldLink = browseHref(entries[0].href, `${path}?q=button`);
  const newLink = browseHref(entries[0].href, path);
  assert.deepEqual(resolveLink(newLink).entries.map(entry => entry.href), searchable.map(entry => entry.href));
  assert.deepEqual(resolveLink(oldLink).entries.map(entry => entry.href), [entries[0].href, `${path}/third`]);
  const nextLink = browseHref(`${path}/third`, resolveLink(oldLink).href);
  assert.equal(resolveLink(nextLink).href, `${path}?q=button`);
});

test('theme/category combinations and Chinese or author queries preserve matching order', () => {
  assert.deepEqual(resolveLink(browseHref(entries[0].href, `${path}?cat=Motion&theme=buttons`)).entries.map(entry => entry.href), [entries[0].href]);
  assert.equal(resolveLink(browseHref(entries[0].href, `${path}?q=动效`)).entries.length, 2);
  assert.equal(resolveLink(browseHref(entries[0].href, `${path}?q=alice`)).entries.length, 2);
  assert.equal(resolveLink(browseHref(entries[0].href, `${path}?cat=missing&theme=missing`)).href, path);
});

test('direct details and inconsistent filtered links do not create unrelated trails', () => {
  assert.equal(resolveUrlBrowseContext('', path, entries[0].href, searchable), null);
  assert.equal(resolveUrlBrowseContext('browse=1', path, entries[0].href, searchable), null);
  assert.equal(resolveLink(browseHref(entries[0].href, `${path}?q=card`)), null);
});

test('return positions use independent filter memories with stable parameter ordering', () => {
  assert.equal(browseMemoryKey('muse-return', `${path}?q=button&cat=Motion`), browseMemoryKey('muse-return', `${path}?cat=Motion&q=button`));
  assert.notEqual(browseMemoryKey('muse-return', `${path}?q=button`), browseMemoryKey('muse-return', path));
  assert.equal(browseHref(entries[0].href, `${path}?q=A%26B&unused=1`), `${entries[0].href}?browse=2&q=A%26B`);
});

 test('layout detail returns to the current image inside its filtered book', () => {
  const base = '/products/layout-compositions';
  const layouts = [{ href: `${base}/003`, title: '三分法', category: '构图', search: ['三分法'] }];
  const result = resolveUrlBrowseContext('browse=2&cat=构图&q=三分', base, `${base}/003`, layouts);
  const url = new URL(result.href, 'https://example.test');
  assert.equal(url.searchParams.get('page'), '003');
  assert.equal(url.searchParams.get('cat'), '构图');
  assert.equal(url.searchParams.get('q'), '三分');
});
