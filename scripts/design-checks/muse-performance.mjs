import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const trace = JSON.parse(await readFile(new URL('../../apps/web/.next/server/app/products/muse/page.js.nft.json', import.meta.url), 'utf8'));
assert.ok(trace.files.some(file => file.endsWith('/packages/inspora/inspora.db')), '部署包必须包含数据库');
assert.ok(trace.files.some(file => file.includes('/public/inspora/posters/')), '部署包必须保留本地媒体存在性检查所需文件');

const base = process.argv[2] || 'http://localhost:3101';
const response = await fetch(new URL('/products/muse', base));
assert.equal(response.status, 200);
const html = await response.text();
assert.equal((html.match(/id="muse-/g) || []).length, 24, '首批24件必须在服务器 HTML 中呈现');
const poster = html.match(/poster="([^"]+)"/)?.[1]?.replaceAll('&amp;', '&');
assert.ok(poster, '首屏视频必须有可直接请求的封面');
const posterUrl = new URL(poster, base);
assert.match(posterUrl.searchParams.get('v') || '', /^[a-f0-9]{40}$/, '使用 MEDIA_VERSION=<commit sha> 构建后测试缓存');
const cached = await fetch(posterUrl, { method: 'HEAD' });
assert.match(cached.headers.get('cache-control') || '', /max-age=31536000/);
posterUrl.search = '';
const plain = await fetch(posterUrl, { method: 'HEAD' });
assert.doesNotMatch(plain.headers.get('cache-control') || '', /immutable/, '无版本地址不能永久缓存');
const filtered = await fetch(new URL('/products/muse?q=brand%20work', base)).then(r => r.text());
assert.match(filtered, /id="muse-brand-work"/);
assert.doesNotMatch(filtered, /id="muse-cartridge-portfolio"/);
console.log('PASS: SSR首批24件、搜索首屏、版本化媒体缓存、无版本缓存保护');
