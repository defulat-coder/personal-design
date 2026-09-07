import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base=(process.env.DESIGN_BASE_URL??'http://localhost:3000').replace(/\/$/,'');
const checks=[];let failure=null;
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const page=await context.newPage();
const go=async path=>{await page.goto(base+path,{waitUntil:'domcontentloaded'});await page.getByRole('heading',{level:1}).waitFor();await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));};
const cards=async count=>page.waitForFunction(n=>document.querySelectorAll('a[id^=\"layout-\"]').length===n,count);
const check=async(name,fn)=>{await fn();checks.push(name);console.log('PASS',name)};
try {
 await go('/products/layout-compositions');
 await page.getByRole('heading',{name:'布局参考',exact:true}).waitFor();
 await check('all350 original cards including8 missing are native detail links',async()=>{
  await cards(350);
  assert.equal(await page.locator('a[id^="layout-"][aria-label*="暂缺图片"]').count(),8);
  assert.equal(await page.getByRole('button',{name:/自动浏览|放大查看/}).count(),0);
  assert.equal(await page.locator('a[id="layout-001"]').getAttribute('href'),'/products/layout-compositions/001');
 });
 await check('desktop uses static five-column grid',async()=>assert.equal(await page.locator('#layout-001').evaluate(e=>getComputedStyle(e.parentElement).gridTemplateColumns.split(' ').length),5));
 await check('missing item can be searched and read directly',async()=>{
  await page.getByRole('searchbox',{name:'搜索图鉴'}).fill('063');await page.getByRole('button',{name:'搜索',exact:true}).click();
  await page.waitForURL(/q=063/,{waitUntil:'domcontentloaded'});
  await cards(1);
  await page.locator('#layout-063').click();await page.waitForURL('**/063',{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:'这张图鉴暂缺图片',exact:true}).waitFor();
  assert.equal(await page.getByRole('link',{name:'打开高清原图',exact:true}).count(),0);
  await page.getByRole('link',{name:'返回图鉴',exact:true}).click();await page.waitForURL(/q=063/,{waitUntil:'domcontentloaded'});
  assert.equal(await page.getByRole('searchbox',{name:'搜索图鉴'}).inputValue(),'063');
 });
 await check('category theme and keyword combine and survive refresh',async()=>{
  await page.getByRole('button',{name:'清除筛选',exact:true}).click();await page.waitForURL('**/products/layout-compositions',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/^构图逻辑/}).click();await page.waitForURL(/cat=/,{waitUntil:'domcontentloaded'});
  await page.getByLabel('主题',{exact:true}).selectOption('classic-rules');await page.waitForURL(/theme=classic-rules/,{waitUntil:'domcontentloaded'});
  await page.getByRole('searchbox',{name:'搜索图鉴'}).fill('三分');await page.getByRole('button',{name:'搜索',exact:true}).click();await page.waitForURL(url=>url.searchParams.get('q')==='三分',{waitUntil:'domcontentloaded'});
  await cards(1);
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await page.getByRole('searchbox',{name:'搜索图鉴'}).inputValue(),'三分');assert.equal(await page.getByLabel('主题',{exact:true}).inputValue(),'classic-rules');
 });
 await check('unknown filter has clear empty recovery',async()=>{
  await go('/products/layout-compositions?cat=unknown&theme=invalid&q=none');await page.getByRole('heading',{name:'没有找到匹配的图鉴'}).waitFor();
  await page.getByRole('button',{name:'查看全部图鉴',exact:true}).click();await page.waitForURL('**/products/layout-compositions',{waitUntil:'domcontentloaded'});
  await cards(350);
 });
 await check('detail return restores actual scroll and card focus',async()=>{
  const card=page.locator('#layout-081');await card.scrollIntoViewIfNeeded();const y=await page.evaluate(()=>scrollY);
  await card.click();await page.waitForURL('**/081',{waitUntil:'domcontentloaded'});
  await page.getByRole('link',{name:'返回图鉴',exact:true}).click();await page.waitForURL('**/products/layout-compositions',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.activeElement?.id==='layout-081');
  assert.ok(Math.abs((await page.evaluate(()=>scrollY))-y)<4);
 });
 await check('detail title precedes media and first boundary is explicit',async()=>{
  await go('/products/layout-compositions/001');
  const positions=await page.evaluate(()=>({title:document.querySelector('h1').getBoundingClientRect().top,media:document.querySelector('[aria-label="图鉴图片"]').getBoundingClientRect().top}));
  assert.ok(positions.title<positions.media);assert.equal(await page.getByText('本主题第一张',{exact:true}).count(),1);
  assert.equal(await page.getByRole('link',{name:'打开高清原图',exact:true}).getAttribute('target'),'_blank');
 });
 await check('last theme boundary and theme navigation remain accessible',async()=>{
  await go('/products/layout-compositions/015');assert.equal(await page.getByText('本主题最后一张',{exact:true}).count(),1);
  await page.getByRole('link',{name:'查看主题全部',exact:true}).click();await page.waitForURL(/theme=classic-rules/,{waitUntil:'domcontentloaded'});
  await cards(15);
 });
 for(const width of [1024,390,320]) await check(`responsive${width} no page overflow and title precedes media`,async()=>{
  await page.setViewportSize({width,height:844});await go('/products/layout-compositions');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.waitForFunction(columns=>{const e=document.querySelector('#layout-001');return e&&getComputedStyle(e.parentElement).gridTemplateColumns.split(' ').length===columns;},width===1024?4:2);
  await go('/products/layout-compositions/342');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.ok(await page.evaluate(()=>document.querySelector('h1').getBoundingClientRect().top<document.querySelector('[aria-label="图鉴图片"]').getBoundingClientRect().top));
 });

 await check('detail enlarge opens once and Escape returns focus',async()=>{
  await go('/products/layout-compositions/001');const trigger=page.getByRole('button',{name:'放大查看 三分法构图',exact:true});
  await trigger.click();await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});
  assert.equal(await trigger.evaluate(e=>document.activeElement===e),true);
 });
 await check('stalled HD resolves to readable thumbnail fallback',async()=>{
  const isolated=await context.newPage();
  await isolated.route('**/_next/image?*',route=>(new URL(route.request().url()).searchParams.get('url')??'').startsWith('https:')?new Promise(()=>{}):route.continue());
  await isolated.goto(base+'/products/layout-compositions/001',{waitUntil:'domcontentloaded'});
  await isolated.getByText('高清图暂不可用，已显示预览；可点击放大后重试',{exact:true}).waitFor({timeout:16000});await isolated.close();
 });

 await check('detail arrow navigation respects focused controls and browser history',async()=>{
  await go('/products/layout-compositions/001');await page.getByRole('link',{name:'返回图鉴',exact:true}).focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(100);assert.ok(page.url().endsWith('/001'));
  await page.evaluate(()=>{document.body.tabIndex=-1;document.body.focus();});await page.keyboard.press('ArrowRight');await page.waitForURL('**/002',{waitUntil:'domcontentloaded'});
  await page.goBack({waitUntil:'domcontentloaded'});await page.waitForURL('**/001',{waitUntil:'domcontentloaded'});
 });
 await check('touch card opens detail and returns the search context',async()=>{
  const touchContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const touch=await touchContext.newPage();
  await touch.goto(base+'/products/layout-compositions?q=063',{waitUntil:'domcontentloaded'});await touch.locator('#layout-063').tap();await touch.waitForURL('**/063',{waitUntil:'domcontentloaded'});
  await touch.getByRole('link',{name:'返回图鉴',exact:true}).tap();await touch.waitForURL(/q=063/,{waitUntil:'domcontentloaded'});await touchContext.close();
 });
 await check('dark theme keeps every card and visible search controls',async()=>{
  await go('/products/layout-compositions');await page.evaluate(()=>document.documentElement.dataset.theme='dark');
  await cards(350);assert.ok(await page.getByRole('searchbox',{name:'搜索图鉴'}).isVisible());
 });
} catch(error){failure=error instanceof Error?error.message:String(error);throw error;}
finally {await browser.close();await mkdir('.impeccable/review/redesign-v2',{recursive:true});await writeFile('.impeccable/review/redesign-v2/layouts.json',JSON.stringify({base,passed:failure===null,checks,failure},null,2)+'\n');}
