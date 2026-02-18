import { defineRoute, type RouteDef } from './route'

export const manualRoutes: RouteDef[] = [
  // Old docs routes: moved
  defineRoute({
    path: '/docs',
    loader: () => ({}),
    component: () => (
      <div class="bg-grid">
        <div class="mx-auto max-w-3xl px-6 py-16">
          <a href="/" class="text-sm text-zinc-300 hover:text-zinc-100">← Back to Home</a>
          <h1 class="mt-8 text-3xl font-semibold tracking-tight">Moved</h1>
          <p class="mt-3 text-zinc-300">
            vitrio-start は 1ページのホームに統合しました。Quickstart は <span class="font-mono">/#quickstart</span>、Reference は{' '}
            <span class="font-mono">/reference</span> です。
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a href="/#quickstart" class="rounded-2xl bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-white">
              Open Quickstart
            </a>
            <a href="/reference" class="rounded-2xl border border-zinc-800 bg-zinc-950/40 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-950">
              Open Reference
            </a>
          </div>
        </div>
      </div>
    ),
  }),
  defineRoute({
    path: '/docs/getting-started',
    loader: () => ({}),
    component: () => (
      <div class="bg-grid">
        <div class="mx-auto max-w-3xl px-6 py-16">
          <a href="/" class="text-sm text-zinc-300 hover:text-zinc-100">← Back to Home</a>
          <h1 class="mt-8 text-3xl font-semibold tracking-tight">Moved</h1>
          <p class="mt-3 text-zinc-300">
            Getting Started はホームの Quickstart に統合しました。<span class="font-mono">/#quickstart</span> を見てください。
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a href="/#quickstart" class="rounded-2xl bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-white">
              Open Quickstart
            </a>
            <a href="/reference" class="rounded-2xl border border-zinc-800 bg-zinc-950/40 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-950">
              Open Reference
            </a>
          </div>
        </div>
      </div>
    ),
  }),
  defineRoute({
    path: '/docs/why',
    loader: () => ({}),
    component: () => (
      <div class="bg-grid">
        <div class="mx-auto max-w-3xl px-6 py-16">
          <a href="/" class="text-sm text-zinc-300 hover:text-zinc-100">← Back to Home</a>
          <h1 class="mt-8 text-3xl font-semibold tracking-tight">Moved</h1>
          <p class="mt-3 text-zinc-300">
            Why は Reference に統合しました。<span class="font-mono">/reference</span> を見てください。
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a href="/reference" class="rounded-2xl bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-white">
              Open Reference
            </a>
            <a href="/#quickstart" class="rounded-2xl border border-zinc-800 bg-zinc-950/40 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-950">
              Open Quickstart
            </a>
          </div>
        </div>
      </div>
    ),
  }),
]
