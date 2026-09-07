import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import{mkdir,writeFile}from'node:fs/promises';
const base=process.env.DESIGN_BASE_URL??'http://localhost:3000';const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});const checks=[];const errors=[];p.on('pageerror',e=>errors.push(e.message));
try{
 await p.goto(base,{waitUntil:'domcontentloaded'});await p.getByRole('link',{name:'进入灵感集',exact:true}).click();
 await p.getByRole('searchbox').fill('dashboard');await p.waitForURL(u=>u.searchParams.get('q')==='dashboard');
 await p.locator('a[id^="muse-"]').first().click();await p.getByRole('button',{name:'放大查看',exact:true}).click();await p.getByRole('dialog').waitFor();await p.keyboard.press('Escape');await p.getByRole('dialog').waitFor({state:'hidden'});
 await p.locator('summary').filter({hasText:'原始 JSON'}).click();assert.ok((await p.locator('pre').textContent()).length>20);assert.ok((await p.getByRole('link',{name:'查看原始出处',exact:true}).getAttribute('href')).startsWith('https://'));await p.keyboard.press('Escape');
 await p.getByRole('link',{name:'返回灵感集',exact:true}).click();await p.getByRole('searchbox').waitFor();assert.equal(await p.getByRole('searchbox').inputValue(),'dashboard');checks.push('首页→灵感检索→直接详情→放大/关闭→来源/JSON→返回原筛选');
 await p.getByRole('link',{name:'返回首页',exact:true}).click();await p.getByRole('link',{name:'进入布局参考',exact:true}).click();
 await p.getByRole('searchbox',{name:'搜索图鉴'}).fill('三分');await p.getByRole('button',{name:'搜索',exact:true}).click();await p.waitForURL(u=>u.searchParams.get('q')==='三分');
 await p.locator('#layout-001').click();await p.getByRole('button',{name:/放大/}).first().click();await p.getByRole('dialog').waitFor();await p.keyboard.press('Escape');await p.getByRole('dialog').waitFor({state:'hidden'});
 assert.equal(await p.getByRole('link',{name:'打开高清原图',exact:true}).getAttribute('target'),'_blank');await p.getByRole('link',{name:'返回图鉴',exact:true}).click();await p.getByRole('searchbox',{name:'搜索图鉴'}).waitFor();assert.equal(await p.getByRole('searchbox').inputValue(),'三分');checks.push('首页→图鉴搜索→直接详情→放大/关闭→高清入口→返回原查询');
 assert.deepEqual(errors,[]);
}finally{await b.close();await mkdir('docs/design/redesign-v2/evidence',{recursive:true});await writeFile('docs/design/redesign-v2/evidence/journeys.json',JSON.stringify({base,checks,errors,passed:checks.length===2&&errors.length===0},null,2)+'\n');}
console.log('PASS',checks);
