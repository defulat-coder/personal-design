/**
 * inspora 数据包查询 API —— web 端只通过这里取数，不直接读 DB、不手拼路径。
 * 数据由 `scripts/sync.mjs` 生成：inspora.db（SQLite）+ apps/web/public/inspora/（媒体）。
 */
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DB_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../inspora.db');

let db: DatabaseSync | undefined;
function conn(): DatabaseSync {
  db ??= new DatabaseSync(DB_PATH, { readOnly: true });
  return db;
}

export interface InsporaMedia {
  id: string;
  postId: string;
  position: number;
  type: 'image' | 'video';
  /** 上游原始 URL（media.inspora.design） */
  url: string;
  posterUrl: string | null;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  alt: string | null;
  /** 本地路径（/inspora/...），同步未完成时可能为 null */
  src: string | null;
  /** 视频封面（本地） */
  poster: string | null;
  /** 缩略图（本地）：图片为最小 variant，视频为封面 */
  thumb: string | null;
}

export interface InsporaPost {
  id: string;
  slug: string;
  title: string;
  creatorName: string | null;
  /** 作者主页（多为 x.com） */
  creatorUrl: string | null;
  /** 作者头像（本地路径） */
  creatorAvatar: string | null;
  description: string | null;
  category: string | null;
  industries: string[];
  colors: string[];
  styles: string[];
  /** 原始出处（多为 X 原帖）——「查看原信息」的核心字段 */
  sourceUrl: string | null;
  createdAt: string;
  publishedAt: string | null;
  isFeatured: boolean;
  media: InsporaMedia[];
  /** 上游原始 JSON（详情页 RSC 里提取的完整帖子对象） */
  raw: unknown;
}

export interface InsporaCategory {
  name: string;
  count: number;
}

/** inspora 原帖链接 */
export function upstreamUrl(post: Pick<InsporaPost, 'slug'>): string {
  return `https://www.inspora.design/posts/${post.slug}`;
}

interface PostRow {
  id: string;
  slug: string;
  title: string;
  creator_name: string | null;
  creator_url: string | null;
  creator_avatar: string | null;
  description: string | null;
  category: string | null;
  industries: string | null;
  colors: string | null;
  styles: string | null;
  source_url: string | null;
  created_at: string;
  published_at: string | null;
  is_featured: number;
  raw_json: string | null;
}

interface MediaRow {
  id: string;
  post_id: string;
  position: number;
  type: string;
  url: string;
  poster_url: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  alt: string | null;
  local_path: string | null;
  local_poster_path: string | null;
  local_thumb_path: string | null;
}

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function toMedia(row: MediaRow): InsporaMedia {
  return {
    id: row.id,
    postId: row.post_id,
    position: row.position,
    type: row.type === 'video' ? 'video' : 'image',
    url: row.url,
    posterUrl: row.poster_url,
    width: row.width,
    height: row.height,
    sizeBytes: row.size_bytes,
    alt: row.alt,
    src: row.local_path,
    poster: row.local_poster_path,
    thumb: row.local_thumb_path,
  };
}

function toPost(row: PostRow, media: InsporaMedia[]): InsporaPost {
  let raw: unknown = null;
  if (row.raw_json) {
    try {
      raw = JSON.parse(row.raw_json);
    } catch {
      raw = null;
    }
  }
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    creatorName: row.creator_name,
    creatorUrl: row.creator_url,
    creatorAvatar: row.creator_avatar,
    description: row.description,
    category: row.category,
    industries: parseJsonArray(row.industries),
    colors: parseJsonArray(row.colors),
    styles: parseJsonArray(row.styles),
    sourceUrl: row.source_url,
    createdAt: row.created_at,
    publishedAt: row.published_at,
    isFeatured: row.is_featured === 1,
    media,
    raw,
  };
}

function mediaForPosts(postIds: string[]): Map<string, InsporaMedia[]> {
  const map = new Map<string, InsporaMedia[]>();
  if (postIds.length === 0) return map;
  const placeholders = postIds.map(() => '?').join(',');
  const rows = conn()
    .prepare(`SELECT * FROM media WHERE post_id IN (${placeholders}) ORDER BY position`)
    .all(...postIds) as unknown as MediaRow[];
  for (const row of rows) {
    const list = map.get(row.post_id) ?? [];
    list.push(toMedia(row));
    map.set(row.post_id, list);
  }
  return map;
}

/** 全部帖子，按发布时间倒序 */
export function listPosts(): InsporaPost[] {
  const rows = conn()
    .prepare('SELECT * FROM posts ORDER BY created_at DESC')
    .all() as unknown as PostRow[];
  const mediaMap = mediaForPosts(rows.map((r) => r.id));
  return rows.map((r) => toPost(r, mediaMap.get(r.id) ?? []));
}

export function getPostBySlug(slug: string): InsporaPost | undefined {
  const row = conn().prepare('SELECT * FROM posts WHERE slug = ?').get(slug) as
    | PostRow
    | undefined;
  if (!row) return undefined;
  const mediaMap = mediaForPosts([row.id]);
  return toPost(row, mediaMap.get(row.id) ?? []);
}

export function listCategories(): InsporaCategory[] {
  const rows = conn()
    .prepare(
      "SELECT category AS name, COUNT(*) AS count FROM posts WHERE category IS NOT NULL GROUP BY category ORDER BY count DESC",
    )
    .all() as unknown as { name: string; count: number }[];
  return rows;
}

/** 同分类内的前后帖（按发布时间倒序的位置），用于详情页翻页 */
export function getAdjacentPosts(post: InsporaPost): {
  prev: Pick<InsporaPost, 'slug' | 'title'> | null;
  next: Pick<InsporaPost, 'slug' | 'title'> | null;
} {
  const rows = conn()
    .prepare('SELECT slug, title, created_at FROM posts ORDER BY created_at DESC')
    .all() as unknown as { slug: string; title: string; created_at: string }[];
  const idx = rows.findIndex((r) => r.slug === post.slug);
  return {
    prev: idx > 0 ? { slug: rows[idx - 1].slug, title: rows[idx - 1].title } : null,
    next:
      idx >= 0 && idx < rows.length - 1
        ? { slug: rows[idx + 1].slug, title: rows[idx + 1].title }
        : null,
  };
}
