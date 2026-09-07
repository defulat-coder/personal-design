import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.env.DESIGN_BASE_URL ?? 'http://localhost:3000';
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  for (const [width, height] of [[1440, 900], [1024, 768], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto(new URL('/products/muse/multi-action-button', base).href, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1600);
    const video = page.locator('video').first();
    const frame = await video.boundingBox();
    const file = await page.getByRole('link', { name: '原始文件', exact: true }).boundingBox();
    assert(frame.y + frame.height <= height, `${width}: native playback bar should fit on first entry`);
    assert(file.y + file.height <= height, `${width}: media toolbar should fit on first entry`);
    assert(await video.evaluate((element) => element.controls));
    const before = frame.height;
    await page.evaluate(() => window.scrollTo(0, 150));
    await page.waitForTimeout(200);
    assert(Math.abs((await video.boundingBox()).height - before) < 1, 'Ordinary scrolling cannot resize the video');
    console.log('PASS video and toolbar in initial viewport; stable on scroll', { width, height, videoBottom: frame.y + frame.height, toolbarBottom: file.y + file.height });
  }
  // Exercise measured refitting after resize without a route remount.
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  const refit = await page.locator('video').first().boundingBox();
  assert(refit.y + refit.height <= 768);
  console.log('PASS resize refits video without navigation');
} finally {
  await browser.close();
}
