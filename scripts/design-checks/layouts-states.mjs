import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = (process.env.DESIGN_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const evidenceDir = '.impeccable/review/full-design';

const results = [];
let failure = null;
const browser=await chromium.launch({headless:true});
try {
const page=await browser.newPage({viewport:{width:1024,height:768}});
const assert=(x,s)=>{if(!x)throw new Error(s);results.push(s)};
await page.route('**/_next/image?*',route=>{const u=new URL(route.request().url()).searchParams.get('url')??'';return u.startsWith('https:')?new Promise(()=>{}):route.continue()});
await page.goto(base + '/products/layout-compositions/001',{waitUntil:'domcontentloaded'});
await page.getByText('高清图暂不可用，已显示预览；可点击放大后重试',{exact:true}).waitFor({timeout:16000});results.push('12 second stalled HD falls back to preview');
await page.getByRole('link',{name:'构图逻辑',exact:true}).focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(200);assert(page.url().endsWith('/001'),'focused link arrow not hijacked');
await page.evaluate(()=>{document.body.tabIndex=-1;document.body.focus()});await page.keyboard.press('ArrowRight');await page.waitForURL('**/002',{waitUntil:'domcontentloaded'});results.push('body arrow navigates next detail');
await page.goBack({waitUntil:'domcontentloaded'});await page.waitForURL('**/001',{waitUntil:'domcontentloaded'});results.push('browser back restores preceding detail');
await page.goto(base + '/products/layout-compositions/015',{waitUntil:'domcontentloaded'});await page.getByText('已是本主题最后一张',{exact:true}).waitFor();results.push('last theme boundary');
await page.goto(base + '/products/layout-compositions',{waitUntil:'domcontentloaded'});
await page.getByRole('button',{name:'暂停自动浏览',exact:true}).waitFor();
const row=page.getByRole('region',{name:'第一行图鉴，横向浏览',exact:true});await row.hover();const before=await row.evaluate(e=>e.scrollLeft);await page.waitForTimeout(250);assert(before===await row.evaluate(e=>e.scrollLeft),'hover pauses row');
await page.mouse.move(0,0);await row.locator('button').first().focus();const focus=await row.evaluate(e=>e.scrollLeft);await page.waitForTimeout(250);assert(focus===await row.evaluate(e=>e.scrollLeft),'focus pauses row');
await page.evaluate(()=>document.documentElement.dataset.theme='dark');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'1024 dark no horizontal page overflow');


} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  await browser.close();
  await mkdir(evidenceDir, { recursive: true });
  const evidence = { base, passed: failure === null, checks: results, failure };
  await writeFile(`${evidenceDir}/layouts-states.json`, JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify(evidence, null, 2));
}
