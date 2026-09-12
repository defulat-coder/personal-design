/**
 * inspora.design 增量同步脚本
 *
 * 数据源（均已实测）：
 * - 列表：公开分类页 HTML 的 RSC initialPage，16 条/页，按 createdAt 倒序。
 *   /api/posts 即使在正常浏览器中也可能返回 Vercel checkpoint（HTTP 429）；
 *   优先逐分类读取首屏，只有未遇到旧作品时才请求 API 翻页，失败则不写入列表。
 *   无头浏览器遇到校验时使用 ego-browser 正常会话（本机需运行 ego lite）。
 * - 详情：无 API，抓取 `/posts/<slug>` 的 HTML，从 RSC payload
 *   （self.__next_f.push）里提取含 sourceUrl 的完整帖子对象
 *   （description / category / industries / colors / styles / sourceUrl …）。
 * - 媒体：`media.inspora.design`（Cloudflare R2）直链无防护。只下载
 *   海报/缩略图/头像入库；大图与视频不入库，web 端热链原站，
 *   包查询 API 按本地文件存在性自动优先本地副本。
 *
 * 增量逻辑：各分类遇到「本次运行前已入库的 post id」即停；先完整发现再写库；
 * 详情只在 enriched_at 为空时补抓；
 * 媒体文件已存在且非空即跳过。可随时中断，下次接着跑。
 *
 * 用法：
 *   node scripts/sync.mjs              # 增量（日常）
 *   node scripts/sync.mjs --full       # 全量 backfill（首次）
 *   node scripts/sync.mjs --max-pages N  # 调试用，限制每个分类的翻页数（覆盖不足时报错）
 */
import { chromium } from 'playwright';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { collectFeed, extractInitialPage, extractDetailPost } from './sync-source.mjs';
import { DatabaseSync } from 'node:sqlite';
import { createWriteStream } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = path.resolve(PKG_ROOT, '../..');
const DB_PATH = path.join(PKG_ROOT, 'inspora.db');
const PUBLIC_DIR = path.join(REPO_ROOT, 'apps/web/public/inspora');
const SITE = 'https://www.inspora.design';

const args = process.argv.slice(2);
const FULL = args.includes('--full');
const maxPagesIdx = args.indexOf('--max-pages');
const MAX_PAGES = maxPagesIdx >= 0 ? Number(args[maxPagesIdx + 1]) : Infinity;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const execFileAsync = promisify(execFile);
const EGO_TASK = '灵感集数据同步';
let usedEgo = false;
let egoFailed = false;

// 无头 Chromium 无法完成校验时，使用项目指定的正常浏览器会话。
async function verifiedFetch(url) {
  usedEgo = true;
  const expression = `(async () => { const res = await fetch(${JSON.stringify(url)}); return { status: res.status, challenge: res.headers.get('x-vercel-mitigated'), body: await res.text() }; })()`;
  const script = `await useOrCreateTaskSpace(${JSON.stringify(EGO_TASK)});
await openOrReuseTab(${JSON.stringify(SITE)}, { wait: true, timeout: 30 });
let response = await js(${JSON.stringify(expression)});
if (response.challenge === 'challenge') {
  await gotoAndWait(${JSON.stringify(SITE + url)}, { timeout: 30 });
  await wait(5);
  response = await js(${JSON.stringify(expression)});
}
cliLog('SYNC_RESULT:' + JSON.stringify(response));`;
  try {
    const { stdout, stderr } = await execFileAsync('/bin/zsh', ['-c', `ego-browser nodejs <<'EGO_SYNC_SCRIPT'\n${script}\nEGO_SYNC_SCRIPT`], {
      timeout: 90000, maxBuffer: 10 * 1024 * 1024,
    });
    const result = `${stdout}\n${stderr}`.split('\n').find((line) => line.startsWith('SYNC_RESULT:'));
    if (!result) throw new Error('ego-browser 未返回同步数据');
    return JSON.parse(result.slice('SYNC_RESULT:'.length));
  } catch {
    // 失去会话控制时立即停止；不重试或主动收回用户的浏览器。
    egoFailed = true;
    throw new Error('ego-browser 会话不可用或控制权已改变；同步已停止，请检查浏览器后重试');
  }
}

// ---------- DB ----------

const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    creator_name TEXT,
    creator_url TEXT,
    creator_avatar TEXT,
    description TEXT,
    category TEXT,
    industries TEXT,
    colors TEXT,
    styles TEXT,
    source_url TEXT,
    created_at TEXT NOT NULL,
    published_at TEXT,
    is_featured INTEGER DEFAULT 0,
    raw_json TEXT,
    enriched_at TEXT,
    synced_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id),
    position INTEGER NOT NULL DEFAULT 0,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    poster_url TEXT,
    width INTEGER,
    height INTEGER,
    size_bytes INTEGER,
    alt TEXT,
    local_path TEXT,
    local_poster_path TEXT,
    local_thumb_path TEXT,
    raw_json TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_media_post ON media(post_id);
  CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
`);

const stmts = {
  hasPost: db.prepare('SELECT 1 FROM posts WHERE id = ?'),
  needsEnrich: db.prepare('SELECT slug FROM posts WHERE enriched_at IS NULL'),
  upsertPost: db.prepare(`
    INSERT INTO posts (id, slug, title, creator_name, creator_url, creator_avatar,
      description, category, industries, colors, styles, source_url,
      created_at, published_at, is_featured, raw_json, enriched_at, synced_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      slug=excluded.slug, title=excluded.title,
      creator_name=excluded.creator_name, creator_url=excluded.creator_url,
      creator_avatar=COALESCE(excluded.creator_avatar, posts.creator_avatar),
      description=COALESCE(excluded.description, posts.description),
      category=COALESCE(excluded.category, posts.category),
      industries=COALESCE(excluded.industries, posts.industries),
      colors=COALESCE(excluded.colors, posts.colors),
      styles=COALESCE(excluded.styles, posts.styles),
      source_url=COALESCE(excluded.source_url, posts.source_url),
      created_at=excluded.created_at,
      published_at=COALESCE(excluded.published_at, posts.published_at),
      is_featured=CASE WHEN posts.enriched_at IS NULL THEN excluded.is_featured ELSE posts.is_featured END,
      raw_json=COALESCE(excluded.raw_json, posts.raw_json),
      enriched_at=COALESCE(excluded.enriched_at, posts.enriched_at),
      synced_at=excluded.synced_at
  `),
  upsertMedia: db.prepare(`
    INSERT INTO media (id, post_id, position, type, url, poster_url, width, height,
      size_bytes, alt, local_path, local_poster_path, local_thumb_path, raw_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      post_id=excluded.post_id, position=excluded.position, type=excluded.type,
      url=excluded.url, poster_url=excluded.poster_url,
      width=excluded.width, height=excluded.height,
      size_bytes=COALESCE(excluded.size_bytes, media.size_bytes),
      alt=excluded.alt,
      local_path=COALESCE(media.local_path, excluded.local_path),
      local_poster_path=COALESCE(media.local_poster_path, excluded.local_poster_path),
      local_thumb_path=COALESCE(media.local_thumb_path, excluded.local_thumb_path),
      raw_json=excluded.raw_json
  `),
  // 大图/视频不再下载（热链原站，见包 README/AGENTS.md）；只补本地的海报与缩略图
  mediaNeedingDownload: db.prepare(`
    SELECT id, type, url, poster_url, local_path, local_poster_path, local_thumb_path, raw_json
    FROM media
    WHERE (type = 'video' AND local_poster_path IS NULL AND poster_url IS NOT NULL)
       OR (type = 'image' AND local_thumb_path IS NULL)
  `),
  updateMediaPaths: db.prepare(
    'UPDATE media SET local_path = ?, local_poster_path = ?, local_thumb_path = ? WHERE id = ?',
  ),
  creatorsNeedingAvatar: db.prepare(`
    SELECT DISTINCT creator_name, json_extract(raw_json, '$.creator.avatarUrl') AS avatar_url
    FROM posts
    WHERE creator_avatar IS NULL AND json_extract(raw_json, '$.creator.avatarUrl') IS NOT NULL
  `),
  updateAvatar: db.prepare('UPDATE posts SET creator_avatar = ? WHERE creator_name = ?'),
};

// ---------- 媒体下载 ----------

const extOf = (url) => path.extname(new URL(url).pathname) || '';

async function fileNonEmpty(p) {
  try {
    return (await stat(p)).size > 0;
  } catch {
    return false;
  }
}

async function download(url, absPath, retries = 3) {
  if (await fileNonEmpty(absPath)) return 'skipped';
  await mkdir(path.dirname(absPath), { recursive: true });
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      await pipeline(Readable.fromWeb(res.body), createWriteStream(absPath));
      return 'downloaded';
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(1000 * attempt);
    }
  }
}

/** 简单并发池 */
async function pool(items, concurrency, fn) {
  const results = { downloaded: 0, skipped: 0, failed: 0 };
  let i = 0;
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (i < items.length) {
        const item = items[i++];
        try {
          const r = await fn(item);
          results[r] = (results[r] ?? 0) + 1;
        } catch (err) {
          results.failed++;
          console.warn(`  ✗ ${item.url ?? item.avatar_url}: ${err.message}`);
        }
      }
    }),
  );
  return results;
}

// ---------- 主流程 ----------

async function main() {
  console.log(`模式: ${FULL ? '全量 backfill' : '增量'}${MAX_PAGES < Infinity ? `（最多 ${MAX_PAGES} 页）` : ''}`);

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(SITE + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    const title = await page.title();
    if (/checkpoint|security/i.test(title)) {
      throw new Error(`未通过 Vercel checkpoint（标题: ${title}），请稍后重试`);
    }
    console.log(`已进入站点（${title}）`);

    // 分类从实际导航读取，避免上游新增分类时静默漏同步。
    const categories = await page.locator('a[href*="category="]').evaluateAll((links) =>
      [...new Set(links.map((link) => new URL(link.href).searchParams.get('category')).filter(Boolean))],
    );
    if (categories.length === 0) throw new Error('未找到分类导航，停止同步以避免漏数据');
    const knownIds = new Set(db.prepare('SELECT id FROM posts').all().map((row) => row.id));
    const feed = await collectFeed(categories, knownIds, async (category, cursor) => {
      const query = new URLSearchParams({ category, view: 'latest' });
      if (cursor) query.set('cursor', cursor);
      const url = `${cursor ? '/api/posts' : '/'}?${query}`;
      let response = await page.evaluate(async (url) => {
        const res = await fetch(url);
        return { status: res.status, challenge: res.headers.get('x-vercel-mitigated'), body: await res.text() };
      }, url);
      if (response.challenge === 'challenge') response = await verifiedFetch(url);
      if (response.status !== 200) {
        throw new Error(`${category}: HTTP ${response.status}${response.challenge === 'challenge' ? ' Vercel checkpoint' : ''}，分类列表未完整读取，未写入新增作品`);
      }
      const data = cursor ? JSON.parse(response.body) : extractInitialPage(response.body);
      console.log(`分类 ${category}${cursor ? ' 翻页' : ' 首屏'}: ${data.items.length} 条`);
      await sleep(300);
      return data;
    }, { full: FULL, maxPages: MAX_PAGES });

    let newPosts = 0;
    db.exec('BEGIN');
    try {
      for (const item of feed) {
        const isNew = !stmts.hasPost.get(item.id);
        stmts.upsertPost.run(
          item.id,
          item.slug,
          item.title,
          item.creator?.name ?? null,
          null, // creator_url 只有详情页有
          null, // creator_avatar 下载阶段回填
          null,
          null,
          null,
          null,
          null,
          null,
          item.createdAt,
          null,
          item.isFeatured ? 1 : 0,
          null, // raw_json 等详情补全
          null, // enriched_at
          new Date().toISOString(),
        );
        for (const [pos, media] of (item.media ?? []).entries()) {
          stmts.upsertMedia.run(
            media.id,
            item.id,
            media.position ?? pos,
            media.type,
            media.url,
            media.posterUrl ?? null,
            media.width ?? null,
            media.height ?? null,
            media.sizeBytes ?? null,
            media.alt ?? null,
            null,
            null,
            null,
            JSON.stringify(media),
          );
        }
        if (isNew) newPosts++;
      }
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
    console.log(`feed 同步完成，新增 ${newPosts} 条`);

    // 2. 详情补全（含 category / description / sourceUrl / 完整 raw_json）
    const toEnrich = stmts.needsEnrich.all();
    console.log(`待补全详情: ${toEnrich.length} 条`);
    const idBySlug = new Map();
    {
      const rows = db.prepare('SELECT id, slug FROM posts').all();
      for (const r of rows) idBySlug.set(r.slug, r.id);
    }
    let enriched = 0;
    for (const { slug } of toEnrich) {
      const postId = idBySlug.get(slug);
      try {
        let response = await page.evaluate(async (p) => {
          const res = await fetch(p, { headers: { accept: 'text/html' } });
          return { status: res.status, challenge: res.headers.get('x-vercel-mitigated'), body: await res.text() };
        }, `/posts/${slug}`);
        if (response.challenge === 'challenge') {
          response = await verifiedFetch(`/posts/${slug}`);
        }
        if (response.status !== 200) throw new Error(`HTTP ${response.status}${response.challenge ? ' Vercel checkpoint' : ''}`);
        const html = response.body;
        const detail = html && extractDetailPost(html, postId);
        if (!detail) throw new Error('详情对象提取失败');
        stmts.upsertPost.run(
          postId,
          detail.slug ?? slug,
          detail.title ?? '',
          detail.creator?.name ?? null,
          detail.creator?.url ?? null,
          null,
          detail.description ?? null,
          detail.category ?? null,
          detail.industries ? JSON.stringify(detail.industries) : null,
          detail.colors ? JSON.stringify(detail.colors) : null,
          detail.styles ? JSON.stringify(detail.styles) : null,
          detail.sourceUrl ?? null,
          detail.createdAt,
          detail.publishedAt ?? null,
          detail.isFeatured ? 1 : 0,
          JSON.stringify(detail),
          new Date().toISOString(),
          new Date().toISOString(),
        );
        // 详情里的 media 字段更全（sizeBytes / mimeType），覆盖一次
        for (const [pos, media] of (detail.media ?? []).entries()) {
          stmts.upsertMedia.run(
            media.id,
            postId,
            media.position ?? pos,
            media.type,
            media.url,
            media.posterUrl ?? null,
            media.width ?? null,
            media.height ?? null,
            media.sizeBytes ?? null,
            media.alt ?? null,
            null,
            null,
            null,
            JSON.stringify(media),
          );
        }
        enriched++;
        if (enriched % 20 === 0) console.log(`  详情进度 ${enriched}/${toEnrich.length}`);
      } catch (err) {
        if (egoFailed) throw err;
        console.warn(`  ✗ 详情 ${slug}: ${err.message}（下次同步会重试）`);
      }
      await sleep(300);
    }
    console.log(`详情补全完成: ${enriched}/${toEnrich.length}`);

    await browser.close();

    // 3. 媒体下载（R2 直链，无需浏览器）——只下载海报/缩略图；
    //    大图与视频热链原站（src/index.ts 查询时按本地文件存在性回退）
    const mediaRows = stmts.mediaNeedingDownload.all();
    console.log(`待下载媒体: ${mediaRows.length} 个`);
    const mediaResults = await pool(mediaRows, 6, async (m) => {
      if (m.type === 'video') {
        const relP = `posters/${m.id}${extOf(m.poster_url)}`;
        const r = await download(m.poster_url, path.join(PUBLIC_DIR, relP));
        stmts.updateMediaPaths.run(null, `/inspora/${relP}`, `/inspora/${relP}`, m.id);
        return r;
      }
      // image：只留最小 variant 作缩略图，原图热链
      let thumbUrl = m.url;
      try {
        const variants = JSON.parse(m.raw_json)?.variants;
        if (Array.isArray(variants) && variants.length > 0) {
          thumbUrl = variants.reduce((a, b) => (a.bytes <= b.bytes ? a : b)).url;
        }
      } catch {}
      const relT = `thumbnails/${m.id}${extOf(thumbUrl)}`;
      const r = await download(thumbUrl, path.join(PUBLIC_DIR, relT));
      stmts.updateMediaPaths.run(null, null, `/inspora/${relT}`, m.id);
      return r;
    });
    console.log(`媒体下载: ${JSON.stringify(mediaResults)}`);

    // 4. 作者头像
    const avatars = stmts.creatorsNeedingAvatar.all();
    let avatarFailed = 0;
    if (avatars.length > 0) {
      const avatarResults = await pool(avatars, 6, async (a) => {
        const rel = `avatars/${path.basename(new URL(a.avatar_url).pathname)}`;
        const r = await download(a.avatar_url, path.join(PUBLIC_DIR, rel));
        stmts.updateAvatar.run(`/inspora/${rel}`, a.creator_name);
        return r;
      });
      console.log(`头像下载: ${JSON.stringify(avatarResults)}`);
      avatarFailed = avatarResults.failed;
    }

    const total = db.prepare('SELECT COUNT(*) AS c FROM posts').get().c;
    const totalMedia = db.prepare('SELECT COUNT(*) AS c FROM media').get().c;
    console.log(`完成。posts=${total} media=${totalMedia}`);
    if (enriched < toEnrich.length || mediaResults.failed > 0 || avatarFailed > 0) {
      throw new Error('详情、媒体或头像未全部同步成功，下次增量会继续补齐');
    }
  } finally {
    await browser.close();
    db.close();
    if (usedEgo && !egoFailed) {
      await execFileAsync('/bin/zsh', ['-c', `ego-browser nodejs <<'EGO_SYNC_SCRIPT'\ncliLog(await completeTaskSpace(${JSON.stringify(EGO_TASK)}, { keep: false }));\nEGO_SYNC_SCRIPT`]);
    }
  }
}

await main();
