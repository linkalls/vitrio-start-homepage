import type { LoaderCtx, ActionApi } from '@potetotown/vitrio'
import { z } from 'zod'
import { compilePath, type CompiledPath } from './server/match'
import { HIGHLIGHT } from './server/highlight'

export interface RouteDef {
  path: string
  /**
   * Enable client-side JS for this route ("use client"-style).
   * Default is SSR-only: fully usable without JS.
   */
  client?: boolean
  loader?: (ctx: LoaderCtx) => Promise<unknown> | unknown
  action?: (ctx: LoaderCtx, formData: FormData) => Promise<unknown> | unknown
  component: (props: {
    data: unknown
    action: ActionApi<FormData, unknown>
    csrfToken: string
  }) => unknown
}

export type CompiledRouteDef = RouteDef & { _compiled: CompiledPath }

export function defineRoute(route: RouteDef): RouteDef {
  return route
}

type TocLink = { href: string; label: string }

type RefPage = {
  path: string
  title: string
  short: string
  client?: boolean
}

const REF_PAGES: RefPage[] = [
  {
    path: '/reference',
    title: 'Reference',
    short: '全体像 + 目次',
    client: false,
  },
  {
    path: '/reference/routing',
    title: 'Routing',
    short: 'パスのマッチ/params/優先順位',
    client: true,
  },
  {
    path: '/reference/data-loading',
    title: 'Data loading',
    short: 'loaderの実行順/キャッシュ',
    client: true,
  },
  {
    path: '/reference/actions',
    title: 'Actions (PRG)',
    short: 'POST→303→GETの流れ',
    client: true,
  },
  {
    path: '/reference/csrf-flash',
    title: 'CSRF / Flash',
    short: 'cookie token + one-shot flash',
    client: true,
  },
  {
    path: '/reference/use-client',
    title: '“use client”',
    short: 'ルート単位の最小JS',
    client: true,
  },
  {
    path: '/reference/workers-deploy',
    title: 'Workers deployment',
    short: 'assets binding / wrangler / env',
    client: true,
  },
  {
    path: '/reference/security',
    title: 'Security',
    short: '最低限のヘッダ/CSPの考え方',
    client: true,
  },
  {
    path: '/reference/faq',
    title: 'FAQ',
    short: 'ハマりどころ集',
    client: false,
  },
]

function getRefNav(path: string): { prev?: RefPage; next?: RefPage } {
  const idx = REF_PAGES.findIndex((p) => p.path === path)
  if (idx === -1) return {}
  return {
    prev: REF_PAGES[idx - 1],
    next: REF_PAGES[idx + 1],
  }
}

function Brand() {
  return (
    <a href="/" class="flex items-center gap-2">
      <span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-sm font-black text-zinc-950">V</span>
      <span class="text-sm font-semibold tracking-tight text-zinc-100">vitrio-start</span>
    </a>
  )
}

function RefChrome(p: {
  title: string
  subtitle?: string
  toc: TocLink[]
  children: unknown
  path: string
}) {
  const nav = getRefNav(p.path)

  return (
    <div class="bg-grid">
      <div class="mx-auto max-w-7xl px-6 py-12">
        <div class="flex items-center justify-between">
          <Brand />
          <a href="/" class="text-sm text-zinc-300 hover:text-zinc-100">← Back</a>
        </div>

        <div class="mt-10 grid gap-10 lg:grid-cols-[260px_1fr]">
          {/* Mobile: collapsible table of contents (no JS required) */}
          <details class="lg:hidden rounded-3xl border border-zinc-800 bg-zinc-900/30 p-4">
            <summary class="cursor-pointer select-none text-sm font-semibold text-zinc-100">
              On this page
              <span class="ml-2 text-xs font-normal text-zinc-400">(tap to expand)</span>
            </summary>
            <nav class="mt-4 grid gap-1 text-sm">
              {p.toc.map((l) => (
                <a data-toc-link class="rounded-xl px-3 py-2 text-zinc-300 hover:bg-zinc-950/60" href={l.href}>
                  {l.label}
                </a>
              ))}
            </nav>
          </details>

          {/* Desktop: sticky sidebar */}
          <aside class="hidden lg:block lg:sticky lg:top-8 lg:self-start">
            <div class="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-4">
              <div class="text-xs font-semibold uppercase tracking-wider text-zinc-400">On this page</div>
              <nav class="mt-4 grid gap-1 text-sm">
                {p.toc.map((l) => (
                  <a data-toc-link class="rounded-xl px-3 py-2 text-zinc-300 hover:bg-zinc-950/60" href={l.href}>
                    {l.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <main class="min-w-0 rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8">
            <div class="flex items-start justify-between gap-6">
              <div>
                <div class="text-sm font-medium text-zinc-400">Reference</div>
                <h1 class="mt-2 text-3xl font-semibold tracking-tight">{p.title}</h1>
                {p.subtitle ? <p class="mt-3 text-zinc-300">{p.subtitle}</p> : null}
              </div>
              <a
                href="/reference"
                class="shrink-0 rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-950"
              >
                Index
              </a>
            </div>

            <div class="mt-10">{p.children}</div>

            <div class="mt-12 flex items-center justify-between border-t border-zinc-800/80 pt-6 text-sm">
              <div>
                {nav.prev ? (
                  <a class="text-zinc-300 hover:text-zinc-100" href={nav.prev.path}>
                    ← {nav.prev.title}
                  </a>
                ) : (
                  <span />
                )}
              </div>
              <div>
                {nav.next ? (
                  <a class="text-zinc-300 hover:text-zinc-100" href={nav.next.path}>
                    {nav.next.title} →
                  </a>
                ) : (
                  <span />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function DocArticle(p: { children: unknown }) {
  return (
    <article
      class={
        "space-y-10 " +
        "[\&_h2]:scroll-mt-24 [\&_h2]:text-xl [\&_h2]:font-semibold " +
        "[\&_p]:break-words [\&_p]:leading-7 [\&_p]:text-zinc-300 " +
        "[\&_pre]:leading-relaxed " +
        "[\&_a]:text-indigo-200 [\&_a:hover]:text-indigo-100"
      }
    >
      {p.children}
    </article>
  )
}

function CodeBlock(p: { title: string; lang: string; htmlKey?: keyof typeof HIGHLIGHT; code: string }) {
  const html = p.htmlKey ? HIGHLIGHT[p.htmlKey] : undefined

  return (
    <div class="mt-4 min-w-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60">
      <div class="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 py-2">
        <div class="text-xs font-semibold text-zinc-300">{p.title}</div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="rounded-md border border-zinc-800 bg-zinc-950/40 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-950"
            data-copy={p.code}
            aria-label="Copy code"
          >
            Copy
          </button>
          <div class="text-[11px] text-zinc-500">{p.lang}</div>
        </div>
      </div>
      {html ? (
        <div class="overflow-x-auto p-0 text-[12px] leading-relaxed" innerHTML={html} />
      ) : (
        <pre class="overflow-x-auto p-4 text-[12px] leading-relaxed text-zinc-200">
          <code>{p.code}</code>
        </pre>
      )}
    </div>
  )
}

export const routes = [
  defineRoute({
    path: '/',
    loader: () => ({ now: Date.now() }),
    component: ({ data }) => {
      const homeData = z.object({ now: z.number() }).parse(data)
      return (
        <div class="bg-grid">
          <div class="mx-auto max-w-6xl px-6 py-10">
            <div class="flex items-center justify-between">
              <a href="/" class="flex items-center gap-2">
                <span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-sm font-black text-zinc-950">V</span>
                <span class="text-sm font-semibold tracking-tight text-zinc-100">vitrio-start</span>
              </a>
              <div class="flex items-center gap-2">
                <a
                  href="#quickstart"
                  class="rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-950"
                >
                  Quickstart
                </a>
                <a
                  href="/reference"
                  class="rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-950"
                >
                  Reference
                </a>
              </div>
            </div>

            <div class="mt-14 grid items-center gap-12 lg:grid-cols-2">
              <div>
                <a
                  href="/reference"
                  class="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-950"
                >
                  <span class="rounded-full bg-indigo-500/20 px-2 py-0.5 text-indigo-200">New</span>
                  Reference is live
                  <span class="text-zinc-500">→</span>
                </a>

                <h1 class="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight">
                  <span class="text-indigo-200">vitrio-start</span>
                  <br />
                  SSR framework for Workers.
                </h1>

                <p class="mt-5 text-lg text-zinc-300">
                  vitrio-start は Cloudflare Workers 上で動く Bun-first / SSR-first のスターターです。
                  “server actions magic” を避けて、Plain HTTP + PRG（POST→Redirect→GET）でシンプルに作れます。
                </p>

                <div class="mt-7 flex flex-wrap items-center gap-3">
                  <a
                    href="#quickstart"
                    class="inline-flex items-center rounded-2xl bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-950 shadow hover:bg-white"
                  >
                    Quickstart
                  </a>
                  <a
                    href="/reference"
                    class="inline-flex items-center rounded-2xl border border-zinc-800 bg-zinc-950/40 px-5 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-950"
                  >
                    Reference
                  </a>
                </div>

                <div class="mt-6 text-xs text-zinc-500">
                  Rendered at <span class="font-mono text-zinc-300">{String(homeData.now)}</span>
                </div>
              </div>

              <div id="quickstart" class="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 shadow-sm">
                <div class="flex items-center justify-between">
                  <div class="text-sm font-semibold">Quickstart</div>
                  <div class="text-xs text-zinc-500">bun + wrangler</div>
                </div>
                <pre class="mt-4 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 text-xs text-zinc-200">
                  <code>{`bun install\nbun run build\nbunx wrangler deploy`}</code>
                </pre>
                <div class="mt-5 grid gap-3 sm:grid-cols-2">
                  <div class="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                    <div class="text-xs font-semibold text-zinc-400">Runtime</div>
                    <div class="mt-1 text-sm font-semibold">Workers</div>
                  </div>
                  <div class="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                    <div class="text-xs font-semibold text-zinc-400">Mode</div>
                    <div class="mt-1 text-sm font-semibold">SSR-first</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div class="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6">
                <div class="text-sm font-semibold">Plain HTTP + PRG</div>
                <p class="mt-2 text-sm text-zinc-400">POST は action を実行して 303 でリダイレクト。RPCっぽい魔法に寄せない。</p>
              </div>
              <div class="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6">
                <div class="text-sm font-semibold">CSRF + Flash built-in</div>
                <p class="mt-2 text-sm text-zinc-400">cookie token + hidden input のCSRF。結果通知は1-shot flash cookie。</p>
              </div>
              <div class="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6">
                <div class="text-sm font-semibold">Small files, obvious flow</div>
                <p class="mt-2 text-sm text-zinc-400">ルート定義はデータ。制御フローが読みやすく、AIにも優しい。</p>
              </div>
            </div>

            <div class="mt-16 flex items-center justify-between border-t border-zinc-900/80 py-8 text-xs text-zinc-500">
              <div>© {new Date().getUTCFullYear()} vitrio-start</div>
              <div class="flex items-center gap-3">
                <a class="hover:text-zinc-300" href="#quickstart">Quickstart</a>
                <a class="hover:text-zinc-300" href="/reference">Reference</a>
              </div>
            </div>
          </div>
        </div>
      )
    },
  }),

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

  // Reference index (SSR-only)
  defineRoute({
    path: '/reference',
    loader: () => ({ version: 'v1' }),
    component: ({ data }) => {
      const d = z.object({ version: z.string() }).parse(data)
      const toc: TocLink[] = [
        { href: '#overview', label: 'Overview' },
        { href: '#mental-model', label: 'Mental model' },
        { href: '#pages', label: 'Pages' },
        { href: '#quickstart', label: 'Quickstart' },
      ]

      return (
        <RefChrome
          path="/reference"
          title={`vitrio-start (${d.version})`}
          subtitle="React公式サイトみたいに、章ごとに分割して“濃いけど迷子にならない” reference を作る。"
          toc={toc}
        >
          <DocArticle>
            <section id="overview">
              <h2>Overview</h2>
              <p class="mt-3">
                vitrio-start は “server actions をRPC化する魔法” を作りません。代わりに <span class="font-mono text-zinc-200">action</span> を普通のHTTPとして扱い、
                結果は redirect で戻します。
              </p>
              <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-300">
                <div class="font-semibold text-zinc-200">Key ideas</div>
                <ul class="mt-2 list-disc space-y-1 pl-5">
                  <li>Routes are data: <span class="font-mono">path / loader / action / component</span></li>
                  <li>POST is PRG (303 redirect)</li>
                  <li>CSRF + flash messages are cookie-based</li>
                </ul>
              </div>
            </section>

            <section id="mental-model">
              <h2>Mental model</h2>
              <p class="mt-3">「HTTPの気持ち」を捨てない設計なのだ。だから挙動が予測しやすい。</p>
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                  <div class="text-sm font-semibold">GET</div>
                  <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                    <li>match route</li>
                    <li>run loader(s)</li>
                    <li>SSR render</li>
                  </ul>
                </div>
                <div class="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                  <div class="text-sm font-semibold">POST</div>
                  <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                    <li>match action</li>
                    <li>verify CSRF</li>
                    <li>set flash cookie</li>
                    <li>303 redirect</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="pages">
              <h2>Pages</h2>
              <p class="mt-3">カテゴリ別に分割して、必要なところだけ読めるようにした。</p>
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                {REF_PAGES.filter((p) => p.path !== '/reference').map((p) => (
                  <a
                    href={p.path}
                    class="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 hover:bg-zinc-950/60"
                  >
                    <div class="text-sm font-semibold text-zinc-100">{p.title}</div>
                    <div class="mt-1 text-sm text-zinc-400">{p.short}</div>
                  </a>
                ))}
              </div>
            </section>

            <section id="quickstart">
              <h2>Quickstart</h2>
              <p class="mt-3">最短の流れ。細部は各ページに分解してある。</p>
              <div class="mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60">
                <pre class="overflow-x-auto p-4 text-[12px] leading-relaxed text-zinc-200">
                  <code>{`bun install\nbun run build\nbunx wrangler deploy`}</code>
                </pre>
              </div>
            </section>
          </DocArticle>
        </RefChrome>
      )
    },
  }),

  // Routing
  defineRoute({
    path: '/reference/routing',
    client: true,
    loader: () => ({ version: 'v1' }),
    component: ({ data }) => {
      z.object({ version: z.string() }).parse(data)
      const toc: TocLink[] = [
        { href: '#overview', label: 'Overview' },
        { href: '#matching', label: 'Matching' },
        { href: '#params', label: 'Params' },
        { href: '#contracts', label: 'Contracts' },
      ]

      return (
        <RefChrome
          path="/reference/routing"
          title="Routing"
          subtitle="pathのマッチ、paramsの取り回し、leaf優先のルール。"
          toc={toc}
        >
          <DocArticle>
            <section id="overview">
              <h2>Overview</h2>
              <p class="mt-3">ルートは配列で定義。マッチは親→子っぽく進み、actionはより深い（leaf）を優先する。</p>
            </section>

            <section id="matching">
              <h2>Matching</h2>
              <p class="mt-3">ルート定義はデータ。だから「何が起きるか」が読みやすい。</p>
              <CodeBlock
                title="routes.tsx"
                lang="ts"
                htmlKey="routes_ts"
                code={`defineRoute({\n  path: '/reference',\n  loader: (ctx) => ({ /* ... */ }),\n  action: (ctx, formData) => ({ /* ... */ }),\n  component: ({ data, csrfToken }) => <Page />,\n})`}
              />
            </section>

            <section id="params">
              <h2>Params</h2>
              <p class="mt-3">params は parent → child でマージされる想定。重複キーは後勝ち（= より具体的なルート側が強い）。</p>
            </section>

            <section id="contracts">
              <h2>Contracts</h2>
              <ul class="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                <li>末尾スラッシュは正規化（/foo/ → /foo）</li>
                <li>より深い action を優先（leaf-first）</li>
                <li>GET の loader は SSR 前に実行</li>
              </ul>
            </section>
          </DocArticle>
        </RefChrome>
      )
    },
  }),

  // Data loading
  defineRoute({
    path: '/reference/data-loading',
    client: true,
    loader: () => ({}),
    component: () => {
      const toc: TocLink[] = [
        { href: '#overview', label: 'Overview' },
        { href: '#order', label: 'Execution order' },
        { href: '#cache', label: 'Loader cache' },
      ]

      return (
        <RefChrome
          path="/reference/data-loading"
          title="Data loading"
          subtitle="loaderをいつ実行するか、どうキャッシュするか。"
          toc={toc}
        >
          <DocArticle>
            <section id="overview">
              <h2>Overview</h2>
              <p class="mt-3">
                SSR-firstなので、GET は「loader → SSR」。クライアントの水和がなくても、ページは完成する。
              </p>
            </section>

            <section id="order">
              <h2>Execution order</h2>
              <p class="mt-3">GET の時点で loader を回す。SSR はその後。</p>
            </section>

            <section id="cache">
              <h2>Loader cache</h2>
              <p class="mt-3">
                loader 結果は request スコープでキャッシュ（prime）される前提。重い計算を二重にしない。
              </p>
            </section>
          </DocArticle>
        </RefChrome>
      )
    },
  }),

  // Actions
  defineRoute({
    path: '/reference/actions',
    client: true,
    loader: () => ({}),
    component: ({ csrfToken }) => {
      const toc: TocLink[] = [
        { href: '#overview', label: 'Overview' },
        { href: '#flow', label: 'Request flow (PRG)' },
        { href: '#example', label: 'Example' },
        { href: '#framework', label: 'Internals' },
      ]

      return (
        <RefChrome
          path="/reference/actions"
          title="Actions (PRG)"
          subtitle="POSTは副作用、結果は303でGETに戻す。HTTPで勝つ。"
          toc={toc}
        >
          <DocArticle>
            <section id="overview">
              <h2>Overview</h2>
              <p class="mt-3">
                vitrio-start の action は普通の POST ハンドラです。
                <span class="font-mono text-zinc-200">routes.tsx</span> に関数として定義し、フォームから直接呼び出します（JS不要）。
                サーバーサイドで実行され、データベース操作などの副作用を起こします。
              </p>
            </section>

            <section id="flow">
              <h2>Request flow (PRG)</h2>
              <p class="mt-3">
                POST リクエストは以下の流れで処理されます。これにより、ブラウザの「戻る」ボタンやリロードによる二重送信を防ぎます（PRGパターン）。
              </p>
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                  <div class="text-sm font-semibold text-indigo-300">1. POST (Action)</div>
                  <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                    <li>CSRF check</li>
                    <li>Execute action()</li>
                    <li>Set Flash Cookie (result)</li>
                    <li><strong>303 Redirect</strong> to GET</li>
                  </ul>
                </div>
                <div class="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                  <div class="text-sm font-semibold text-emerald-300">2. GET (Render)</div>
                  <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                    <li>Read & Clear Flash Cookie</li>
                    <li>Run loader()</li>
                    <li>SSR HTML with Flash message</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="example">
              <h2>Example: Form Action</h2>
              <p class="mt-3">
                シンプルなフォーム処理の例です。バリデーション失敗時や成功時のリダイレクトを制御できます。
              </p>
              <CodeBlock
                title="src/routes.tsx (Action)"
                lang="ts"
                htmlKey="action_ts"
                code={`import { redirect } from './server/response'

export const action = async (ctx, formData) => {
  const email = formData.get('email')
  
  // 1. Validation
  if (!email || typeof email !== 'string') {
    // Return redirect with flash (handled by framework)
    // Note: framework.tsx handles the actual cookie setting based on return value
    // or you can set it manually if you modify framework.
    // In default starter:
    return { ok: false, error: 'Email is required' }
  }

  // 2. Mutation (e.g. D1, KV)
  await ctx.env.DB.prepare('INSERT INTO users...').run()

  // 3. Success (PRG)
  return redirect('/thanks', { status: 303 })
}`}
              />
              <p class="mt-3 text-sm text-zinc-400">
                <span class="font-mono text-zinc-200">redirect()</span> ヘルパーを使うと、ステータスコード 303 で指定パスへ遷移します。
                何もしなければ、現在のパスへ 303 リダイレクト（リロード相当）します。
              </p>
            </section>

            <section id="framework">
              <h2>Framework Internals</h2>
              <p class="mt-3">
                この挙動は <span class="font-mono text-zinc-200">src/server/framework.tsx</span> で実装されています。隠蔽された黒魔術ではなく、あなたが所有するコードの一部です。
              </p>
              <CodeBlock
                title="src/server/framework.tsx"
                lang="ts"
                htmlKey="framework_post_ts"
                code={`// src/server/framework.tsx (Simplified)
if (method === 'POST') {
  const r = await runMatchedAction(c, routes, path, url)

  if (r.kind === 'redirect') {
    return c.redirect(r.to, r.status)
  }
  
  // Set flash cookie based on result
  setFlash(c, { ok: r.kind === 'ok', at: Date.now() })
  return c.redirect(path, 303)
}`}
              />
              <p class="mt-3 text-sm text-zinc-400">
                必要であれば、このファイルを編集して Flash の挙動やエラーハンドリングをカスタマイズできます。
              </p>
            </section>
          </DocArticle>
        </RefChrome>
      )
    },
  }),

  // CSRF / Flash
  defineRoute({
    path: '/reference/csrf-flash',
    client: true,
    loader: () => ({}),
    component: () => {
      const toc: TocLink[] = [
        { href: '#csrf', label: 'CSRF' },
        { href: '#flash', label: 'Flash' },
      ]

      return (
        <RefChrome
          path="/reference/csrf-flash"
          title="CSRF / Flash"
          subtitle="cookie token + hidden input / one-shot flash cookie。"
          toc={toc}
        >
          <DocArticle>
            <section id="csrf">
              <h2>CSRF</h2>
              <p class="mt-3">
                CSRF は <span class="font-mono text-zinc-200">vitrio_csrf</span> cookie を発行して、フォームの <span class="font-mono text-zinc-200">_csrf</span> と照合する。
              </p>
            </section>
            <section id="flash">
              <h2>Flash</h2>
              <p class="mt-3">
                flash は <span class="font-mono text-zinc-200">vitrio_flash</span> cookie（1-shot）で結果表示。GETで消えるので再表示されない。
              </p>
            </section>
          </DocArticle>
        </RefChrome>
      )
    },
  }),

  // use client
  defineRoute({
    path: '/reference/use-client',
    client: true,
    loader: () => ({}),
    component: () => {
      const toc: TocLink[] = [
        { href: '#overview', label: 'Overview' },
        { href: '#what', label: 'What runs' },
        { href: '#why', label: 'Why minimal' },
      ]

      return (
        <RefChrome path="/reference/use-client" title="“use client”" subtitle="必要なページだけ最小JSを注入する。" toc={toc}>
          <DocArticle>
            <section id="overview">
              <h2>Overview</h2>
              <p class="mt-3">デフォはSSR-only。必要なページだけ <span class="font-mono text-zinc-200">client: true</span> を付けてJSを読み込む。</p>
            </section>
            <section id="what">
              <h2>What runs</h2>
              <p class="mt-3">今は TOC active と code copy だけ。ページの意味はSSRが担保する。</p>
            </section>
            <section id="why">
              <h2>Why minimal</h2>
              <ul class="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                <li>JSなしでも読める（アクセシビリティ/速度）</li>
                <li>Workers でのランタイム差を踏みにくい</li>
                <li>デバッグが簡単</li>
              </ul>
            </section>
          </DocArticle>
        </RefChrome>
      )
    },
  }),

  // Workers deploy
  defineRoute({
    path: '/reference/workers-deploy',
    client: true,
    loader: () => ({}),
    component: () => {
      const toc: TocLink[] = [
        { href: '#assets', label: 'Assets' },
        { href: '#wrangler', label: 'Wrangler' },
        { href: '#env', label: 'Env' },
      ]

      return (
        <RefChrome
          path="/reference/workers-deploy"
          title="Workers deployment"
          subtitle="assets binding / run_worker_first / envの流し方。"
          toc={toc}
        >
          <DocArticle>
            <section id="assets">
              <h2>Assets</h2>
              <p class="mt-3">
                静的アセットは assets binding で配信し、それ以外は Worker が SSR を返す。<span class="font-mono text-zinc-200">run_worker_first = true</span> が重要。
              </p>
              <CodeBlock
                title="wrangler.toml"
                lang="toml"
                htmlKey="wrangler_toml"
                code={`[assets]\ndirectory = "dist/client"\nbinding = "ASSETS"\nrun_worker_first = true`}
              />
            </section>
            <section id="wrangler">
              <h2>Wrangler</h2>
              <p class="mt-3">この環境だと API token 運用が安定。必要なら <span class="font-mono text-zinc-200">account_id</span> を設定して memberships lookup を回避。</p>
            </section>
            <section id="env">
              <h2>Env</h2>
              <p class="mt-3">Workers の env を直接参照せず、起動時に <span class="font-mono text-zinc-200">globalThis.__VITRIO_ENV</span> へ流す方式で統一するのが安全。</p>
            </section>
          </DocArticle>
        </RefChrome>
      )
    },
  }),

  // Security
  defineRoute({
    path: '/reference/security',
    client: true,
    loader: () => ({}),
    component: () => {
      const toc: TocLink[] = [
        { href: '#baseline', label: 'Baseline headers' },
        { href: '#csp', label: 'CSP' },
      ]

      return (
        <RefChrome path="/reference/security" title="Security" subtitle="最低限のヘッダ + CSPは現実的に。" toc={toc}>
          <DocArticle>
            <section id="baseline">
              <h2>Baseline headers</h2>
              <p class="mt-3">まずはこれだけでだいぶマシになる。</p>
              <CodeBlock
                title="headers"
                lang="text"
                htmlKey="headers_text"
                code={`X-Content-Type-Options: nosniff\nReferrer-Policy: strict-origin-when-cross-origin\nContent-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'`}
              />
            </section>
            <section id="csp">
              <h2>CSP</h2>
              <p class="mt-3">プロダクトに合わせて締める前提。最初から完璧はしんどいので段階的にやる。</p>
            </section>
          </DocArticle>
        </RefChrome>
      )
    },
  }),

  // FAQ (SSR-only)
  defineRoute({
    path: '/reference/faq',
    loader: () => ({}),
    component: () => {
      const toc: TocLink[] = [
        { href: '#shiki', label: 'Shiki / Workers' },
        { href: '#overflow', label: 'Mobile overflow' },
        { href: '#wrangler', label: 'Wrangler auth' },
      ]

      return (
        <RefChrome path="/reference/faq" title="FAQ" subtitle="ハマりどころを雑に全部メモる場所。" toc={toc}>
          <DocArticle>
            <section id="shiki">
              <h2>Shiki / Workers</h2>
              <p class="mt-3">Workers実行時に <span class="font-mono text-zinc-200">import('shiki')</span> すると死ぬことがあるので、Nodeで事前生成して埋め込む。</p>
            </section>
            <section id="overflow">
              <h2>Mobile overflow</h2>
              <p class="mt-3">コードブロックがページ全体の横スクロールを発生させがち。<span class="font-mono text-zinc-200">min-w-0</span> と <span class="font-mono text-zinc-200">.shiki{'{'}overflow-x:auto{'}'}</span> で封じる。</p>
            </section>
            <section id="wrangler">
              <h2>Wrangler auth</h2>
              <p class="mt-3">API token が whoami では通るのに deploy/delete で memberships が死ぬ場合、wrangler.toml に <span class="font-mono text-zinc-200">account_id</span> を置くと回避できることがある。</p>
            </section>
          </DocArticle>
        </RefChrome>
      )
    },
  }),
]

export const compiledRoutes: CompiledRouteDef[] = routes.map((r) => ({
  ...r,
  _compiled: compilePath(r.path),
}))
