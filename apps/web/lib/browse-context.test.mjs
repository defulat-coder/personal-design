import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveBrowseContext } from './browse-context.ts';

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
