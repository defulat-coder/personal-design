import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = (process.env.DESIGN_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const evidenceDir = '.impeccable/review/full-design';

const result = [];
let failure = null;
const browser=await chromium.launch({headless:true});
try {

const context=await browser.newContext({viewport:{width:1440,height:900}});
const page=await context.newPage();

const assert=(x,label)=>{if(!x)throw new Error(label);result.push(label)};
await page.goto(base + '/products/layout-compositions',{waitUntil:'domcontentloaded'});
await page.getByRole('button',{name:'暂停自动浏览',exact:true}).waitFor();
const rows=page.getByRole('region',{name:/第.*行图鉴/});
assert(await rows.count()===2,'two native rows');
assert(await rows.locator('button').count()===342,'342 original reachable cards');
const before=await rows.evaluateAll(es=>es.map(e=>e.scrollLeft));
await page.waitForTimeout(350);
const after=await rows.evaluateAll(es=>es.map(e=>e.scrollLeft));
assert(after[0]>before[0]&&after[1]<before[1],'opposite auto movement');
await page.getByRole('button',{name:'暂停自动浏览',exact:true}).click();
const paused=await rows.evaluateAll(es=>es.map(e=>e.scrollLeft));
await page.waitForTimeout(250);
assert(JSON.stringify(paused)===JSON.stringify(await rows.evaluateAll(es=>es.map(e=>e.scrollLeft))),'explicit pause freezes both rows');
await page.reload({waitUntil:'domcontentloaded'});
await page.getByRole('button',{name:'继续自动浏览',exact:true}).waitFor();result.push('pause preference survives reload');
await page.goto(base + '/products/layout-compositions?cat=unknown',{waitUntil:'domcontentloaded'});
await page.getByRole('heading',{name:'未找到这个分类'}).waitFor();
await page.getByRole('button',{name:'查看全部图鉴',exact:true}).click();
await page.waitForURL('**/products/layout-compositions');result.push('invalid category recovery removes URL query');
await page.goto(base + '/products/layout-compositions/001',{waitUntil:'domcontentloaded'});
await page.getByRole('heading',{name:'三分法构图',exact:true}).waitFor();
assert(await page.getByText('已是本主题第一张',{exact:true}).count()===1,'first theme boundary');
const hd=page.getByRole('link',{name:'打开高清原图',exact:true});
assert(await hd.getAttribute('target')==='_blank'&&await hd.getAttribute('download')===null,'external HD truthful open-link semantics');
await page.getByRole('link',{name:'构图逻辑',exact:true}).click();
await page.waitForURL(/cat=/);
assert(decodeURIComponent(page.url()).includes('cat=构图逻辑'),'detail category returns matching URL');
await page.goto(base + '/products/layout-compositions/063',{waitUntil:'domcontentloaded'});
assert(await page.getByText('此图鉴暂缺图片；可继续浏览同主题内容',{exact:true}).count()===1,'missing image explanation');
assert(await page.getByRole('link',{name:'打开高清原图',exact:true}).count()===0,'missing image no false resource action');
await context.close();
const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
const m=await mobile.newPage();
await m.goto(base + '/products/layout-compositions',{waitUntil:'domcontentloaded'});
await m.getByText('当前使用手动浏览',{exact:false}).waitFor();
const mr=m.getByRole('region',{name:/第.*行图鉴/});
assert(await mr.locator('button').count()===342,'mobile reduced motion keeps all cards');
await mr.first().locator('button').last().focus();
assert(await mr.first().evaluate(e=>e.scrollLeft)>0,'keyboard last card scrolls into view in manual mode');
assert(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'390px no page horizontal overflow');
await m.goto(base + '/products/layout-compositions/342',{waitUntil:'domcontentloaded'});
assert(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'long-title detail no mobile horizontal overflow');


} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  await browser.close();
  await mkdir(evidenceDir, { recursive: true });
  const evidence = { base, passed: failure === null, checks: result, failure };
  await writeFile(`${evidenceDir}/layouts-check.json`, JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify(evidence, null, 2));
}
