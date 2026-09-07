// Run: node scripts/design-checks/shared-browser.cjs (requires a running preview).
const { chromium }=require('playwright');
const assert=require('node:assert/strict');
const baseURL = process.env.DESIGN_BASE_URL || 'http://localhost:3000';
const target = (path) => new URL(path, baseURL).href;
(async()=>{const b=await chromium.launch();try {
const p=await b.newPage({viewport:{width:390,height:844},ignoreHTTPSErrors:true});
await p.goto(target('/products/muse?cat=invalid&q=keep'),{waitUntil:'domcontentloaded'});await p.waitForTimeout(700);assert.ok(!new URL(p.url()).searchParams.has('cat'));assert.equal(new URL(p.url()).searchParams.get('q'),'keep');
await p.goto(target('/products/layout-compositions'),{waitUntil:'domcontentloaded'});
const trigger=p.getByRole('button',{name:/放大查看/}).first(); await trigger.focus();await trigger.click();const d=p.getByRole('dialog');await d.waitFor();await p.waitForTimeout(250);assert.equal(await p.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'关闭');assert.equal(await p.evaluate(()=>document.body.style.overflow),'hidden');
await p.keyboard.press('Shift+Tab');assert.ok(await p.evaluate(()=>!!document.activeElement?.closest('[role=dialog]')));await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'关闭');
await p.keyboard.press('ArrowRight');await p.waitForTimeout(100);assert.match(await d.innerText(),/2 \/ /);await p.keyboard.press('Escape');await p.waitForTimeout(300);assert.equal(await d.count(),0);assert.match(await p.evaluate(()=>document.activeElement?.getAttribute('aria-label')),/放大查看/);assert.equal(await p.evaluate(()=>document.body.style.overflow),'');
await trigger.click();await d.waitFor();await p.keyboard.press('Escape');await p.keyboard.press('ArrowRight');await p.waitForTimeout(350);assert.equal(await d.count(),1);await p.keyboard.press('Escape');await p.waitForTimeout(300);
await p.route('**/*',route=>route.request().resourceType()==='image' ? route.abort():route.continue());await trigger.click();await d.waitFor();await p.waitForTimeout(300);await d.getByText(/图片暂时无法加载|高清图暂时无法加载/).waitFor({timeout:15000});await d.getByRole('button',{name:'重新加载'}).click();await p.keyboard.press('Escape');await p.waitForTimeout(300);
await p.unroute('**/*');await p.goto(target('/unknown-g5-verification'),{waitUntil:'domcontentloaded'});assert.equal(await p.getByRole('heading',{name:'找不到这个页面'}).count(),1);assert.equal(await p.getByRole('link',{name:'浏览灵感集'}).getAttribute('href'),'/products/muse');
await p.goto(target('/products/muse'),{waitUntil:'domcontentloaded'});const href=await p.locator('a[href^="/products/muse/"]').first().getAttribute('href');assert.ok(href);await p.goto(target(href),{waitUntil:'domcontentloaded'});const summary=p.locator('summary');await summary.focus();await p.keyboard.press('Enter');assert.equal(await p.locator('details').getAttribute('open'),'');const url=p.url();await p.locator('pre').focus();await p.keyboard.press('ArrowRight');assert.equal(p.url(),url);await p.keyboard.press('Escape');assert.equal(await p.locator('details').getAttribute('open'),null);assert.equal(await p.evaluate(()=>document.activeElement?.tagName),'SUMMARY');
console.log('PASS browser: invalid category/preserved query; mobile lightbox focus wrap/return, arrows, scroll cleanup, interrupted close, failed media/retry; 404 navigation; JSON Enter/arrow isolation/Escape focus');
} finally { await b.close(); }
})().catch(e=>{console.error(e);process.exit(1)});
