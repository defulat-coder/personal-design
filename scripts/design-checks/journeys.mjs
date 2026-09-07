import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base=process.env.DESIGN_BASE_URL ?? 'http://localhost:3000';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});const results=[];const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.getByRole('link',{name:'进入灵感集',exact:true}).click();
 await page.getByRole('searchbox').fill('dashboard');
 await page.waitForFunction(()=>new URL(location.href).searchParams.get('q')==='dashboard');
 await page.locator('figure button').first().click();
 await page.getByRole('dialog').waitFor();
 await page.getByRole('link',{name:'查看详情',exact:true}).click();
 await page.locator('summary').filter({hasText:'原始 JSON'}).click();
 assert.ok((await page.locator('pre').textContent()).length>20);
 const source=await page.getByRole('link',{name:'查看原始出处',exact:true}).getAttribute('href');assert.ok(source.startsWith('https://'));
 await page.keyboard.press('Escape');
 await page.getByRole('link',{name:'返回灵感集',exact:true}).click();
 await page.getByRole('searchbox').waitFor();assert.equal(await page.getByRole('searchbox').inputValue(),'dashboard');
 results.push('home → muse → query → lightbox → detail → JSON/source → return restores query');
 await page.getByRole('navigation',{name:'主导航'}).getByRole('link',{name:'产品集'}).click();
 await page.getByRole('link',{name:'进入布局参考',exact:true}).click();
 await page.getByRole('button',{name:/构图逻辑/}).click();
 await page.getByRole('region',{name:/第.*行图鉴/}).first().getByRole('button').first().click();
 await page.getByRole('dialog').waitFor();
 await page.getByRole('link',{name:'查看详情',exact:true}).click();
 const hd=page.getByRole('link',{name:'打开高清原图',exact:true});await hd.waitFor();assert.equal(await hd.getAttribute('target'),'_blank');
 await page.getByRole('link',{name:'构图逻辑',exact:true}).click();
 await page.waitForURL(/cat=/);assert.equal(new URL(page.url()).searchParams.get('cat'),'构图逻辑');
 results.push('home → layouts → category → lightbox → detail → original image link → category return');
 assert.deepEqual(errors,[]);
} finally {
 await browser.close();await mkdir('docs/design/execution/evidence',{recursive:true});await writeFile('docs/design/execution/evidence/journeys.json',JSON.stringify({base,results,errors,passed:results.length===2&&errors.length===0},null,2)+'\n');
}
console.log('PASS',results);
