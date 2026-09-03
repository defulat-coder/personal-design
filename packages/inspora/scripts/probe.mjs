import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('https://www.inspora.design/posts/mega-menu', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(2000);
const html = await page.content();

// 拼出 RSC payload 文本，定位含 sourceUrl 的 post 对象
const payloads = [...html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)].map((m) => JSON.parse(m[1]));
const text = payloads.join('');
const i = text.indexOf('"sourceUrl"');
const start = text.lastIndexOf('{"id"', i);
// 找对象结束：粗略打印 2500 字符
console.log(text.slice(start, start + 2500));
await browser.close();
