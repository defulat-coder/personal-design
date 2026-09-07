import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.DESIGN_BASE_URL || 'http://localhost:3000';
const output = new URL('../../docs/design/redesign-v2/evidence/home.json', import.meta.url);
const evidence = { baseURL, checks: {}, errors: [] };
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', error => evidence.errors.push(error.message));
  await page.goto(baseURL);
  await page.getByRole('heading', { level: 1, name: '设计，随手可查。' }).waitFor();
  const layouts = page.getByRole('link', { name: '进入布局参考', exact: true });
  const muse = page.getByRole('link', { name: '进入灵感集', exact: true });
  assert.equal(await layouts.count(), 1);
  assert.equal(await muse.count(), 1);
  assert.equal(await page.getByRole('region', { name: /时间轴/ }).count(), 0);
  assert.equal(await page.getByText('规划中', { exact: true }).count(), 0);
  const layoutBox = await layouts.boundingBox();
  const museBox = await muse.boundingBox();
  assert(layoutBox && museBox);
  assert.equal(layoutBox.y, museBox.y);
  assert(museBox.x > layoutBox.x + layoutBox.width);
  assert(layoutBox.y + layoutBox.height < 900 && museBox.y + museBox.height < 900);
  evidence.checks.desktopChoices = { layoutBox, museBox };

  const images = page.locator('main img');
  await page.waitForFunction(() => [...document.querySelectorAll('main img')].every(image => image.complete && image.naturalWidth > 0));
  evidence.checks.loadedImages = await images.count();
  assert(evidence.checks.loadedImages >= 2);
  assert(await page.getByRole('heading', { name: '图鉴来源与许可' }).isVisible());

  await layouts.focus();
  await page.keyboard.press('Enter');
  await page.waitForURL('**/products/layout-compositions');
  evidence.checks.keyboardLayout = new URL(page.url()).pathname;
  await page.goBack();
  await muse.click();
  await page.waitForURL('**/products/muse');
  evidence.checks.mouseMuse = new URL(page.url()).pathname;
  await page.goBack();
  await page.getByRole('heading', { level: 1, name: '设计，随手可查。' }).waitFor();

  evidence.checks.viewports = [];
  for (const width of [1440, 1024, 390, 320]) {
    await page.setViewportSize({ width, height: width >= 1024 ? 900 : 844 });
    const geometry = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
    assert.equal(geometry.width, geometry.scrollWidth);
    const first = await layouts.boundingBox();
    const second = await muse.boundingBox();
    assert(first && second);
    if (width <= 640) assert(second.y > first.y + first.height);
    evidence.checks.viewports.push({ ...geometry, stacked: second.y > first.y + first.height });
  }

  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.evaluate(() => document.documentElement.dataset.theme = 'dark');
  assert(await layouts.isVisible());
  assert(await muse.isVisible());
  evidence.checks.darkReducedMotion = true;
  await page.route('**/_next/image?**', route => route.abort());
  await page.reload();
  await page.getByText('预览暂不可用').first().waitFor();
  evidence.checks.failedImages = await page.getByText('预览暂不可用').count();
  assert(evidence.checks.failedImages > 0);
  assert.equal(await layouts.getAttribute('href'), '/products/layout-compositions');
  assert.equal(await muse.getAttribute('href'), '/products/muse');
  assert.deepEqual(evidence.errors, []);
  evidence.passed = true;
} catch (error) {
  evidence.passed = false;
  evidence.failure = error.stack;
  throw error;
} finally {
  await mkdir(new URL('.', output), { recursive: true });
  await writeFile(output, `${JSON.stringify(evidence, null, 2)}\n`);
  await browser.close();
}
console.log('V2 homepage checks passed: docs/design/redesign-v2/evidence/home.json');
