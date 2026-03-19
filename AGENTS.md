
# Repository Guidelines

- Stack: Next.js App Router, TypeScript, Tailwind, Vitest, Playwright, Supabase. Main code lives in `src/*`; static and data assets live in `public` and `docs`.
- Node: use Node.js 24.x from `.nvmrc`.
- Commands: `npm run lint`. Run `npm run build` and `npm run test` and `npm run lint` only when the user explicitly asks.
- Style: TypeScript, 2-space indentation, no semicolons, prefer named function declarations, match existing local patterns, and keep Tailwind class ordering consistent with nearby code.
- Naming: components use `PascalCase`, hooks use `use*`
- Testing: cover user-visible behavior and important trading/data-flow regressions when relevant.
- Commits: use Conventional Commits such as `feat:`, `fix:`, and `refactor:`.
- Config: copy `.env.example`; never commit secrets.
- Reporting: omit routine success confirmations for commands such as `npm run lint`. Report only failures, blockers, or outcomes that change the recommendation.
- zsh path rule: always quote or escape any path containing brackets like `[locale]` or `[slug]`. Treat this as mandatory, not optional, because unquoted App Router paths fail in `zsh` with `no matches found`.