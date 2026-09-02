# Agent Instructions

## Package Manager

Use **pnpm** (11.x, workspaces): `pnpm install`, `pnpm dev`, `pnpm build`

## Commit Attribution

AI commits MUST include:

```
Co-Authored-By: (the agent model's name and attribution byline)
```

## File-Scoped Commands

| Task | Command |
| --- | --- |
| Typecheck (one pkg) | `pnpm --filter @personal-design/web typecheck` |
| Lint (one file) | `pnpm --filter @personal-design/web exec eslint <file>` |
| Sync layout images | `pnpm sync:layouts`（幂等，已生成的 WebP 会跳过） |

## Monorepo Conventions

- `apps/web` — 唯一站点（Next.js 16 App Router + Tailwind v4），产品集门户
- `packages/<product>` — 每个产品的内容/数据包（catalog、类型、同步脚本）
- 新增产品：`packages/<product>` + `apps/web/app/products/<slug>/` + 在 `apps/web/lib/products.ts` 注册；需要独立部署才拆 `apps/<product>`
- 站点内图片一律放 `apps/web/public/`，由包的同步脚本生成，不手写路径

## layout-compositions 包

- `catalog.json` 是上游原样拷贝，**不要改内容**；`category_slug`、`id` 是稳定标识
- 上游 v2 图片存在系统性图文错位，`corrections.json` 记录「内容 id → 实际源文件」的纠正映射（319 条 v2 重映射、3 条 v1 补齐、8 条上游缺失）；sync 脚本与 `hasImage()` 都依赖它，改动前先看脚本里的说明
- 查询一律用 `src/index.ts` 的 API（`catalog`、`categories`、`imageUrl`、`thumbnailUrl`、`hasImage`…），不在 app 里拼路径
- 图片署名（CC BY 4.0）由 `apps/web/components/attribution.tsx` 统一渲染，相关产品页必须带上
