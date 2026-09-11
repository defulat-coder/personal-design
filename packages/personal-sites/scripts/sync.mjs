import { copyFile, mkdir, rm } from 'node:fs/promises';
import sharp from 'sharp';

// 2026-09-09 截取自 https://default-coder.lovemyrmb.cn/ 的公开首页。
// 更换 assets/home.jpg 后重跑即可更新本地预览，不读取原项目私有数据。
const output = new URL('../../../apps/web/public/personal-sites/', import.meta.url);
await mkdir(output, { recursive: true });
for (const name of ['home', 'news', 'curation', 'open-source']) {
  await sharp(new URL(`../assets/${name}.jpg`, import.meta.url).pathname)
    .resize({ width: name === 'home' ? 1080 : 1512, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(new URL(`${name}.webp`, output).pathname);
}
// Existing profile portrait from the user's personal website.
await sharp(new URL('../assets/profile-avatar.png', import.meta.url).pathname)
  .resize(128, 128)
  .webp({ quality: 92 })
  .toFile(new URL('profile-avatar.webp', output).pathname);
// 宣传片由本包的 Remotion 工程生成；先 render:promo，再同步。
await copyFile(new URL('../promo/out/promo.mp4', import.meta.url), new URL('promo.mp4', output));
await sharp(new URL('../promo/out/poster.png', import.meta.url).pathname)
  .resize({ width: 1920, withoutEnlargement: true })
  .webp({ quality: 88 })
  .toFile(new URL('promo-poster.webp', output).pathname);
await rm(new URL('walkthrough.mp4', output), { force: true });

await rm(new URL('timeline-avatar.webp', output), { force: true });

await rm(new URL('timeline-avatar-full.webp', output), { force: true });
