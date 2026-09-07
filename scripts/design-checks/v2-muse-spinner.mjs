import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

// Focused diagnostic for the native video buffering panel. Prefer a production
// preview to avoid a development indicator changing screenshot bytes.
const base = process.env.DESIGN_BASE_URL ?? 'http://localhost:3000';
const browser = await chromium.launch();
try {
  const results = [];
  for (const reducedMotion of ['no-preference', 'reduce']) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion });
    await page.goto(new URL('/products/muse/multi-action-button', base).href, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('video')?.readyState === 4);
    await page.waitForTimeout(2500);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('DOM.enable');
    const document = await cdp.send('DOM.getDocument', { depth: -1, pierce: true });
    const loadingNodes = [];
    const walk = (node) => {
      if (node.attributes?.includes('-internal-media-controls-loading-panel')) loadingNodes.push(node);
      for (const key of ['children', 'shadowRoots']) for (const child of node[key] ?? []) walk(child);
    };
    walk(document.root);
    const panels = [];
    for (const node of loadingNodes) {
      const { object } = await cdp.send('DOM.resolveNode', { nodeId: node.nodeId });
      const result = await cdp.send('Runtime.callFunctionOn', {
        objectId: object.objectId,
        functionDeclaration: 'function(){const s=getComputedStyle(this);const r=this.getBoundingClientRect();return {display:s.display,visibility:s.visibility,animation:s.animation,rect:[r.x,r.y,r.width,r.height]}}',
        returnByValue: true,
      });
      panels.push(result.result.value);
      assert.equal(result.result.value.display, 'none');
      assert.deepEqual(result.result.value.rect, [0, 0, 0, 0]);
    }
    assert(loadingNodes.length > 0, 'Chromium native buffering panel was inspected');
    const media = await page.locator('video').evaluate((video) => ({ ready: video.readyState, network: video.networkState, paused: video.paused, current: video.currentTime }));
    const screenshot = await page.screenshot();
    results.push({ reducedMotion, panels, media, screenshotSha256: createHash('sha256').update(screenshot).digest('hex') });
    await page.close();
  }
  console.log(JSON.stringify(results, null, 2));
  console.log('sameScreenshotBytes', results[0].screenshotSha256 === results[1].screenshotSha256);
} finally {
  await browser.close();
}
