import rawCatalog from '../catalog.json';
import rawCorrections from '../corrections.json';

/** 上游 catalog.json 的单条记录（字段与上游保持一致，不要改动语义）。 */
export interface LayoutItem {
  /** 全局编号，"001"–"350" */
  id: string;
  /** 中文名称，如「三分法构图」 */
  name: string;
  /** 一级分类中文名，如「构图逻辑」 */
  category: string;
  /** 一级分类稳定标识，如 "01-composition-logic" */
  category_slug: string;
  /** 二级分类中文名 */
  subcategory: string;
  /** 二级分类稳定标识 */
  subcategory_slug: string;
  /** 上游仓库内高清图路径（本仓库不直接使用，见 imageUrl） */
  image: string;
  /** 上游仓库内缩略图路径（本仓库不直接使用，见 thumbnailUrl） */
  thumbnail: string;
  width: number;
  height: number;
  sha256: string;
}

export interface Category {
  slug: string;
  name: string;
  count: number;
  subcategories: Subcategory[];
}

export interface Subcategory {
  slug: string;
  name: string;
  count: number;
}

/** 全部 350 条排版记录，顺序与上游一致（按 id 升序）。 */
export const catalog = rawCatalog as LayoutItem[];

function buildCategories(items: LayoutItem[]): Category[] {
  const categories: Category[] = [];
  const bySlug = new Map<string, Category>();
  const subBySlug = new Map<string, Subcategory>();

  for (const item of items) {
    let category = bySlug.get(item.category_slug);
    if (!category) {
      category = {
        slug: item.category_slug,
        name: item.category,
        count: 0,
        subcategories: [],
      };
      bySlug.set(item.category_slug, category);
      categories.push(category);
    }
    category.count += 1;

    const subKey = `${item.category_slug}/${item.subcategory_slug}`;
    let subcategory = subBySlug.get(subKey);
    if (!subcategory) {
      subcategory = {
        slug: item.subcategory_slug,
        name: item.subcategory,
        count: 0,
      };
      subBySlug.set(subKey, subcategory);
      category.subcategories.push(subcategory);
    }
    subcategory.count += 1;
  }
  return categories;
}

/** 8 个一级分类（含二级分类与条目数），按上游顺序。 */
export const categories = buildCategories(catalog);

const byId = new Map(catalog.map((item) => [item.id, item]));

export function getLayoutById(id: string): LayoutItem | undefined {
  return byId.get(id);
}

/** 站点内高清 WebP 路径（由 sync 脚本生成到 apps/web/public 下）。 */
export function imageUrl(item: LayoutItem): string {
  return `/layout-compositions/images/${item.category_slug}/${item.id}.webp`;
}

/** 站点内缩略图 WebP 路径。 */
export function thumbnailUrl(item: LayoutItem): string {
  return `/layout-compositions/thumbnails/${item.category_slug}/${item.id}.webp`;
}

type Corrections = Record<string, { v2?: string; v1?: string; missing?: boolean }>;
const corrections = rawCorrections as Corrections;

/** 上游图片缺失的条目 id（v2 丢失且 v1 无等价图）。 */
export const missingImageIds: ReadonlySet<string> = new Set(
  Object.entries(corrections)
    .filter(([, correction]) => correction.missing)
    .map(([id]) => id),
);

/** 该条目是否有可展示的图片（上游缺失时为 false，站点应渲染占位）。 */
export function hasImage(item: LayoutItem): boolean {
  return !missingImageIds.has(item.id);
}

/** 按一级分类取条目，保持 id 顺序。 */
export function itemsByCategory(categorySlug: string): LayoutItem[] {
  return catalog.filter((item) => item.category_slug === categorySlug);
}

/** 按二级分类取条目，保持 id 顺序。 */
export function itemsBySubcategory(
  categorySlug: string,
  subcategorySlug: string,
): LayoutItem[] {
  return catalog.filter(
    (item) =>
      item.category_slug === categorySlug &&
      item.subcategory_slug === subcategorySlug,
  );
}

/** 上游项目信息（CC BY 4.0 署名用）。 */
export const upstream = {
  name: '350-layout-compositions',
  author: 'nevertoday',
  url: 'https://github.com/nevertoday/350-layout-compositions',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
} as const;
