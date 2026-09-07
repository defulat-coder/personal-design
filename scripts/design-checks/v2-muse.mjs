import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { listPosts } from '../../packages/inspora/src/index.ts';

const base = process.env.DESIGN_BASE_URL ?? 'http://localhost:3000';
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const go = async (path) => {
    await page.goto(new URL(path, base).href, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1600); // Let the local development build hydrate before typing.
  };
  const cards = page.locator('a[id^="muse-"]');
  await go('/products/muse');
  assert.equal(await cards.count(), 24);
  assert.equal(await page.locator('main video').count(), 0);
  assert.equal(await cards.locator('a,button').count(), 0, 'A work has only its enclosing native link');
  await page.getByRole('button', { name: '加载更多灵感', exact: true }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  assert.equal(await cards.count(), 24, 'Scrolling cannot append content');
  await page.getByRole('button', { name: '加载更多灵感', exact: true }).click();
  assert.equal(await cards.count(), 48);
  const selected = cards.nth(30);
  const selectedId = await selected.getAttribute('id');
  const href = await selected.getAttribute('href');
  await selected.focus();
  await page.keyboard.press('Enter');
  await page.waitForURL(new URL(href, base).href);
  assert.equal(await page.getByRole('dialog').count(), 0, 'List activation goes directly to detail');
  await page.getByRole('link', { name: '返回灵感集', exact: true }).click();
  await cards.nth(47).waitFor();
  await page.waitForTimeout(300);
  assert.equal(await cards.count(), 48);
  assert.equal(await page.evaluate(() => document.activeElement?.id), selectedId);
  assert(await page.evaluate(() => window.scrollY > 0));
  console.log('PASS static single-link gallery, explicit append, keyboard detail, return batch/scroll/focus');

  await go('/products/muse?cat=invalid&q=dashboard');
  const search = page.getByRole('searchbox');
  assert.equal(await search.inputValue(), 'dashboard');
  assert((await cards.count()) > 0);
  await page.getByRole('button', { name: /^Product/ }).click();
  await page.waitForURL((url) => url.searchParams.get('cat') === 'Product');
  assert.equal(new URL(page.url()).searchParams.get('q'), 'dashboard');
  assert.equal(new URL(page.url()).searchParams.get('cat'), 'Product');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1600);
  assert.equal(await search.inputValue(), 'dashboard');
  const filteredDetail = await cards.first().getAttribute('href');
  await cards.first().click();
  await page.waitForURL(new URL(filteredDetail, base).href);
  await page.goBack({ waitUntil: 'domcontentloaded' });
  await search.waitFor();
  assert.equal(await search.inputValue(), 'dashboard');
  await search.fill('no-result-v2-9173');
  await page.getByRole('heading', { name: '没有找到匹配的灵感' }).waitFor();
  await page.getByRole('button', { name: '查看全部灵感', exact: true }).click();
  await cards.first().waitFor();
  await cards.first().click();
  await page.waitForURL('**/products/muse/portfolio-page');
  assert(await page.locator('video').first().evaluate((video) => video.controls && !video.autoplay));
  assert(await page.getByRole('button', { name: '已是第一件' }).isDisabled());
  console.log('PASS combined filters, invalid category, reload, browser history, empty recovery, direct native video');

  await go('/products/muse/product-comps');
  const track = page.getByRole('region', { name: '作品媒体' });
  const titleBounds = await page.getByRole('heading', { level: 1 }).boundingBox();
  const mediaBounds = await track.boundingBox();
  assert(titleBounds.y + titleBounds.height < mediaBounds.y, 'Title precedes media');
  assert(mediaBounds.height <= 900 * 0.71, 'Media has a bounded natural-ratio stage');
  await track.focus();
  await page.keyboard.press('End');
  await page.waitForTimeout(600);
  assert(await page.getByRole('button', { name: '下一张媒体', exact: true }).isDisabled());
  await page.keyboard.press('Home');
  await page.waitForTimeout(600);
  assert(await page.getByRole('button', { name: '上一张媒体', exact: true }).isDisabled());
  const enlarge = page.getByRole('button', { name: '放大查看', exact: true });
  await enlarge.click();
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  assert(await enlarge.evaluate((element) => document.activeElement === element));
  assert(await page.getByRole('link', { name: '查看原始出处', exact: true }).getAttribute('href'));
  const raw = page.locator('summary').filter({ hasText: '原始 JSON' });
  await raw.click();
  const pre = page.locator('pre');
  await pre.waitFor({ state: 'visible' });
  assert((await pre.textContent()).length > 20);
  await pre.focus();
  const detailUrl = page.url();
  await page.keyboard.press('ArrowRight');
  assert.equal(page.url(), detailUrl);
  await page.keyboard.press('Escape');
  assert(await raw.evaluate((element) => document.activeElement === element));
  console.log('PASS title-first natural media, multi controls, enlargement/Escape/focus, source and raw JSON');

  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  for (const width of [1024, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await go('/products/muse');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await go('/products/muse/1-23');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const heading = await page.getByRole('heading', { level: 1 }).boundingBox();
    const media = await track.boundingBox();
    assert(heading.y + heading.height < media.y);
  }
  await go('/products/muse/404-page');
  assert(await page.getByRole('button', { name: '已是最后一件' }).isDisabled());
  console.log('PASS dark/reduced-motion list and title-first detail at 1024/390/320, last boundary');

  const post = listPosts().find((item) => item.slug === 'file-management-dashboard');
  const mediaUrl = new URL(post.media[0].src, base).href;
  const held = [];
  await page.route(mediaUrl, (route) => { held.push(route); });
  await go('/products/muse/file-management-dashboard');
  await page.getByText('媒体暂时无法加载', { exact: true }).waitFor({ timeout: 18000 });
  assert(await page.getByRole('button', { name: '重试', exact: true }).isVisible());
  assert(await page.getByRole('link', { name: '原始文件', exact: true }).isVisible());
  for (const route of held) await route.abort();
  await page.unroute(mediaUrl);
  await page.getByRole('button', { name: '重试', exact: true }).click();
  console.log('PASS bounded image failure with thumbnail, retry/original file');

  const videoPost = listPosts().find((item) => item.slug === 'multi-action-button');
  const videoUrl = new URL(videoPost.media[0].src, base).href;
  const heldVideo = [];
  await page.route(videoUrl, (route) => { heldVideo.push(route); });
  await go('/products/muse/multi-action-button');
  // Simulate metadata arriving while the media response remains stalled. Metadata
  // alone must not mark a video ready or cancel the bounded data-loading timer.
  await page.locator('video').first().dispatchEvent('loadedmetadata');
  await page.getByText('媒体暂时无法加载', { exact: true }).waitFor({ timeout: 18000 });
  assert(await page.getByRole('button', { name: '重试', exact: true }).isVisible());
  await page.locator('video').first().dispatchEvent('waiting');
  assert(await page.getByText('媒体暂时无法加载', { exact: true }).isVisible(), 'Waiting cannot erase a latched error');
  for (const route of heldVideo) await route.abort();
  await page.unroute(videoUrl);
  assert.deepEqual(errors, []);
  console.log('PASS metadata-only video stall remains bounded; zero page errors');
} finally {
  await browser.close();
}
