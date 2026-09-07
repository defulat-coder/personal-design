import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { listPosts } from '../../packages/inspora/src/index.ts';

const base = process.env.DESIGN_BASE_URL ?? 'http://localhost:3000';
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
    colorScheme: 'dark',
  });
  const go = async (path) => {
    await page.goto(new URL(path, base).href, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1400);
  };

  await go('/products/muse?cat=invalid-category&q=dashboard');
  assert.equal(await page.getByRole('searchbox').inputValue(), 'dashboard');
  assert((await page.locator('figure').count()) > 0);
  await page.getByRole('button', { name: /^Product/ }).click();
  await page.waitForTimeout(400);
  assert.equal(new URL(page.url()).searchParams.get('q'), 'dashboard');
  assert.equal(new URL(page.url()).searchParams.get('cat'), 'Product');
  await page.getByRole('button', { name: '清除筛选', exact: true }).click();
  await page.waitForTimeout(400);
  const before = await page.locator('figure').count();
  await page.getByRole('button', { name: '加载更多灵感', exact: true }).click();
  assert((await page.locator('figure').count()) > before);
  await page.getByRole('searchbox').fill('x'.repeat(180));
  await page.waitForTimeout(300);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  console.log('PASS invalid category normalization/combined query/category/manual append/long query mobile dark reduced motion');

  const post = listPosts().find((item) => item.slug === 'file-management-dashboard');
  const src = post.media[0].src;
  const mediaUrl = new URL(src, base).href;
  const held = [];
  await page.route(mediaUrl, (route) => { held.push(route); });
  await go('/products/muse/file-management-dashboard');
  await page.getByText('媒体暂时无法加载', { exact: true }).waitFor({ timeout: 18000 });
  assert(await page.getByRole('button', { name: '重试', exact: true }).isVisible());
  const original = page.getByRole('link', { name: '打开原媒体', exact: true });
  assert((await original.count()) >= 1);
  for (const route of held) await route.abort();
  await page.unroute(mediaUrl);
  await page.getByRole('button', { name: '重试', exact: true }).click();
  console.log('PASS 15-second stalled-media timeout/retry/original-media recovery controls');
} finally {
  await browser.close();
}
