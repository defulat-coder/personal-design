#!/bin/sh
set -eu
ego-browser nodejs <<'EOF'
const assert=(await import('node:assert/strict')).default;
const task=await taskSpace('恢复搜索验收');const page=task.page('p1');
await page.goto('https://personal-design.localhost/products/muse?cat=Motion',{waitUntil:'domcontentloaded'});
await page.waitForSelector('input[type="search"]',{state:'visible'});
await page.fill('input[type="search"]','progress');
await page.waitForFunction(()=>new URLSearchParams(location.search).get('q')==='progress');
assert.equal(new URL(await page.url()).searchParams.get('cat'),'Motion');
await page.waitForSelector('a[id^="muse-"]',{state:'visible'});
const first=await page.evaluate(()=>document.querySelector('a[id^="muse-"]').id);
await page.click('#'+first);await page.waitForSelector('main h1',{state:'visible'});
assert.equal(new URL(await page.url()).searchParams.get('q'),'progress');
await page.click('nav[aria-label="作品导航"] a:first-child');
await page.waitForSelector('input[type="search"]',{state:'visible'});
assert.equal(await page.evaluate(()=>document.querySelector('input').value),'progress');
await page.waitForFunction(id=>document.activeElement?.id===id,first);
await page.click('button[aria-label="清除搜索"]');
await page.waitForFunction(()=>!new URLSearchParams(location.search).has('q'));
assert.equal(new URL(await page.url()).searchParams.get('cat'),'Motion');
await page.goto('https://personal-design.localhost/products/layout-compositions',{waitUntil:'domcontentloaded'});
await page.waitForSelector('input[type="search"]',{state:'visible'});
await page.fill('input[type="search"]','黄金比例');
await page.waitForSelector('section[aria-label="图鉴搜索结果"] button',{state:'visible'});
await page.waitForFunction(()=>[...document.querySelectorAll('section[aria-label="图鉴搜索结果"] button')].some(e=>e.textContent.includes('黄金比例')));
await page.click('section[aria-label="图鉴搜索结果"] div:last-child button:first-child');
await page.waitForSelector('select[aria-label="跳转到图鉴"]',{state:'visible'});
await page.waitForFunction(()=>!document.querySelector('[data-opening]'));
assert.equal(new URL(await page.url()).searchParams.get('q'),'黄金比例');
await page.press('button[aria-label="返回书架"]','Enter');await page.waitForSelector('input[type="search"]',{state:'visible'});
assert.equal(await page.evaluate(()=>document.querySelector('input').value),'黄金比例');
await page.fill('input[type="search"]','no-match-xyz');
await page.waitForFunction(()=>document.body.innerText.includes('没有匹配的图鉴'));
await page.click('button[aria-label="清除搜索"]');
assert.equal(await page.evaluate(()=>document.querySelector('input').value),'');
cliLog('PASS: immediate search, category preserved, detail and return search context/focus, book result navigation, empty state, clear');
EOF
