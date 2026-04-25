<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# Repository Guidelines

- Stack: Next.js App Router, TypeScript, Tailwind, Supabase. Main code lives in `src/*`; static and data assets live in `public` and `content`.
- Node: use Node.js 24.x from `.nvmrc`.
- Commands: `npm run lint`, `npm run test`, `npm run test:unit`, `npm run test:e2e`, `npm run db:push`. Run `npm run build` and `npm run test` and `npm run lint` `npx vitest` or `npx tsc` only when the user explicitly asks.
- Style: TypeScript, 2-space indentation, no semicolons, prefer named function declarations, match existing local patterns, and keep Tailwind class ordering consistent with nearby code.
- Naming: components use `PascalCase`, hooks use `use*`.
- Testing: cover user-visible behavior and important trading/data-flow regressions when relevant.
- Commits: use Conventional Commits such as `feat:`, `fix:`, and `refactor:`.
- Config: copy `.env.example`; never commit secrets.
- Reporting: omit routine success confirmations for commands such as `npm run lint`
  and tests. Report only failures, blockers, or outcomes that change the
  recommendation.

# Before Writing useEffect

Every time you are about to write a useEffect, stop and answer:
**Is this syncing with an external system?**

External systems: WebSocket, browser APIs (IntersectionObserver,
navigator.onLine), third-party libraries, DOM measurements, timers.

NOT external systems: props, state, derived values, user events.

## Check each case before writing the effect:

1. **Transforming data?** → Compute inline, or useMemo if expensive
2. **Responding to a user event?** → Put logic in the event handler
3. **Resetting state on prop change?** → Use the key prop
4. **Fetching data?** → Use TanStack Query; if useEffect, add cleanup
5. **Notifying a parent?** → Call callback in the event handler
6. **Chaining effects?** → Move cascade into one event handler
7. **Subscribing to external store?** → useSyncExternalStore

If none apply and the answer is genuinely "yes, external system,"
then useEffect is correct.

## Rules
- NEVER write useEffect(() => setSomething(derived), [dep])
- NEVER use useEffect for click/submit/change events
- NEVER use useEffect to reset state without considering key prop
- ALWAYS add cleanup when subscribing to external systems
- ALWAYS name effect functions for readability
