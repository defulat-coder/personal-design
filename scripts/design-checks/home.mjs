import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.DESIGN_BASE_URL || 'http://localhost:3000';
const evidenceURL = new URL('../../docs/design/execution/evidence/home-behavior.json', import.meta.url);
const evidence = { baseURL, checks: {}, pageErrors: [] };
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', error => evidence.pageErrors.push(error.message));
  await page.goto(baseURL);
  const region = page.getByRole('region', { name: '产品上线时间轴' });
  await region.waitFor();
  evidence.checks.baseline = await region.evaluate(el => ({
    scroll: el.scrollLeft, width: el.clientWidth, total: el.scrollWidth, height: el.clientHeight,
  }));
  assert.equal(await page.getByRole('link', { name: '浏览布局参考', exact: true }).count(), 1);
  assert(evidence.checks.baseline.total > evidence.checks.baseline.width);

  await page.getByRole('button', { name: '下一个时间节点', exact: true }).click();
  await page.waitForTimeout(600);
  evidence.checks.nextOffset = await region.evaluate(el => el.scrollLeft);
  assert(evidence.checks.nextOffset > 0);

  await region.focus();
  await page.keyboard.press('End');
  await page.waitForTimeout(700);
  evidence.checks.end = await region.evaluate(el => ({ left: el.scrollLeft, max: el.scrollWidth - el.clientWidth }));
  assert(Math.abs(evidence.checks.end.max - evidence.checks.end.left) <= 2);
  assert(await page.getByRole('button', { name: '下一个时间节点', exact: true }).isDisabled());

  await page.keyboard.press('Home');
  await page.waitForTimeout(700);
  assert(await region.evaluate(el => el.scrollLeft <= 2));
  const rect = await region.boundingBox();
  assert(rect);
  await page.mouse.move(rect.x + 250, rect.y + 150);
  await page.mouse.down();
  await page.mouse.move(rect.x + 50, rect.y + 150, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(700);
  evidence.checks.drag = { offset: await region.evaluate(el => el.scrollLeft), pathname: new URL(page.url()).pathname };
  assert(evidence.checks.drag.offset > 0);
  assert.equal(evidence.checks.drag.pathname, '/');

  await region.focus();
  await page.keyboard.press('Home');
  await page.waitForTimeout(700);
  await page.mouse.move(rect.x + 150, rect.y + 15);
  await page.mouse.wheel(0, 450);
  await page.waitForTimeout(700);
  evidence.checks.wheelOffset = await region.evaluate(el => el.scrollLeft);
  assert(evidence.checks.wheelOffset > 0);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await region.focus();
  await page.keyboard.press('End');
  evidence.checks.reduced = await region.evaluate(el => ({ left: el.scrollLeft, max: el.scrollWidth - el.clientWidth }));
  assert.equal(evidence.checks.reduced.left, evidence.checks.reduced.max);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  evidence.checks.mobile = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  assert.equal(evidence.checks.mobile.width, evidence.checks.mobile.scroll);
  evidence.checks.mobileRegion = await region.evaluate(el => ({ height: el.clientHeight, scroll: el.scrollWidth }));

  await page.route('**/_next/image?**', route => route.abort());
  await page.reload();
  await page.getByText('封面暂时无法显示').first().waitFor();
  evidence.checks.failedCovers = await page.getByText('封面暂时无法显示').count();
  assert.equal(evidence.checks.failedCovers, 2);
  assert.deepEqual(evidence.pageErrors, []);
  evidence.passed = true;
} catch (error) {
  evidence.passed = false;
  evidence.failure = error.stack;
  throw error;
} finally {
  await mkdir(new URL('.', evidenceURL), { recursive: true });
  await writeFile(evidenceURL, `${JSON.stringify(evidence, null, 2)}\n`);
  await browser.close();
}
console.log('Homepage behavior checks passed. Evidence: docs/design/execution/evidence/home-behavior.json');
