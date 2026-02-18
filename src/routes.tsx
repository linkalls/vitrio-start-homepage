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
          <details class="lg:hidden rounded-3xl border border-zinc-800 bg-zinc-900/30 p-4">
            <summary class="cursor-pointer select-none text-sm font-semibold text-zinc-100">
              On this page
              <span class="ml-2 text-xs font-normal text-zinc-400">(tap to expand)</span>
            </summary>
            <nav class="mt-4 grid gap-1 text-sm">
              {p.toc.map((l) => (
                <a data-toc-link class="rounded-xl px-3 py-2 text-zinc-300 hover:bg-zinc-950/60 data-[active=1]:bg-zinc-950/60 data-[active=1]:text-zinc-100" href={l.href}>
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
                  <a data-toc-link class="rounded-xl px-3 py-2 text-zinc-300 hover:bg-zinc-950/60 data-[active=1]:bg-zinc-950/60 data-[active=1]:text-zinc-100" href={l.href}>
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
    client: true,
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
              <div class="min-w-0">
                <a
                  href="/reference"
                  class="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-950"
                >
                  <span class="rounded-full bg-indigo-500/20 px-2 py-0.5 text-indigo-200">New</span>
                  Reference is live
                  <span class="text-zinc-500">→</span>
                </a>

                <h1 class="mt-6 text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.1] tracking-tight">
                  <span class="text-indigo-200">vitrio-start</span>
                  <br />
                  SSR framework for Workers.
                </h1>

                <p class="mt-5 text-base sm:text-lg text-zinc-300">
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

              <div class="min-w-0 rounded-3xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-6 shadow-sm">
                <div class="flex items-center justify-between mb-4">
                  <div class="text-sm font-semibold text-indigo-300">Route Definition</div>
                  <div class="text-xs text-zinc-500">All-in-one file</div>
                </div>
                <CodeBlock
                  title="src/routes.tsx"
                  lang="ts"
                  htmlKey="hero_route_ts"
                  code={`defineRoute({\n  path: '/posts/:slug',\n  // 1. Loader: Fetch data on GET (runs before SSR)\n  loader: async ({ params, env }) => {\n    const post = await env.DB.prepare('SELECT * FROM posts WHERE slug = ?')\n      .bind(params.slug).first()\n    if (!post) return { notFound: true }\n    return { post }\n  },\n  // 2. Action: Handle POST (PRG pattern)\n  action: async ({ params, request, env }) => {\n    const fd = await request.formData()\n    await env.DB.prepare('UPDATE posts SET likes = likes + 1 WHERE slug = ?')\n      .bind(params.slug).run()\n    return redirect(\`/posts/\${params.slug}\`, 303)\n  },\n  // 3. Component: Render HTML (SSR)\n  component: ({ data, csrfToken }) => (\n    <article>\n      <h1>{data.post.title}</h1>\n      <form method="post">\n        <input type="hidden" name="_csrf" value={csrfToken} />\n        <button>Like ({data.post.likes})</button>\n      </form>\n    </article>\n  ),\n})`}
                />
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

            <section class="mt-16" id="what">
              <h2 class="text-xl font-semibold">What is vitrio-start?</h2>
              <p class="mt-3 text-zinc-300 leading-7">
                vitrio-start は <strong>Cloudflare Workers</strong> を前提にした SSR フレームワーク（スターター）なのだ。
                Next.js や TanStack Start みたいに「フルスタック」だけど、<strong>魔法を増やさず</strong>、HTTPの素直さを優先する。
              </p>
              <div class="mt-6 grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <div class="text-sm font-semibold text-indigo-200">Positioning</div>
                  <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                    <li>Workers の SSR でページを返す</li>
                    <li>フォームは action で処理（PRG）</li>
                    <li>データ取得は loader（GET）</li>
                    <li>クライアントJSは必要最小限（Islands）</li>
                  </ul>
                </div>
                <div class="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <div class="text-sm font-semibold text-indigo-200">Non-goals</div>
                  <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                    <li>server actions を RPC 魔法にしない</li>
                    <li>巨大なバンドル/複雑なコンパイラは持たない</li>
                    <li>"勝手に最適化" より "読める" を優先</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="mt-16" id="how-it-works">
              <h2 class="text-xl font-semibold">How it works (mental model)</h2>
              <p class="mt-3 text-zinc-300 leading-7">ざっくりこの流れだけ覚えると迷子にならないのだ。</p>
              <div class="mt-6 grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <div class="text-sm font-semibold text-emerald-300">GET</div>
                  <ol class="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-400">
                    <li>route match</li>
                    <li>loader 実行（必要な分）</li>
                    <li>SSR（HTML生成）</li>
                    <li>Assets は CDN（Worker を起動しない）</li>
                  </ol>
                </div>
                <div class="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <div class="text-sm font-semibold text-indigo-300">POST</div>
                  <ol class="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-400">
                    <li>CSRF verify</li>
                    <li>action 実行（副作用）</li>
                    <li>flash cookie set</li>
                    <li>303 redirect → GET</li>
                  </ol>
                </div>
              </div>
            </section>

            <section class="mt-16" id="islands">
              <h2 class="text-xl font-semibold">Islands (Hydration)</h2>
              <p class="mt-3 text-zinc-300 leading-7">
                vitrio-start は <span class="font-mono text-zinc-200">data-island</span> マーカー + 自動生成 registry で、
                TSXコンポーネントをクライアントで mount できる（use client っぽい体験）。
                ※現状は island 単位の置き換え mount（true hydrate は今後）。
              </p>
              <div class="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-400">
                <div class="font-semibold text-zinc-200">Convention</div>
                <ul class="mt-2 list-disc space-y-1 pl-5">
                  <li><span class="font-mono text-zinc-200">src/**/**/*.client.tsx</span> を置く</li>
                  <li>default export 推奨（名前はファイル名から推測）</li>
                  <li>ビルド時に registry を自動生成して islands を hydrate</li>
                </ul>
              </div>
            </section>

            <section class="mt-16" id="deploy-cost">
              <h2 class="text-xl font-semibold">Deploy & Cost</h2>
              <p class="mt-3 text-zinc-300 leading-7">
                vitrio-start は「静的アセットは CDN、HTML だけ Worker」っていう割り切りを強めに推してるのだ。
                これで <strong>リクエスト単価</strong> と <strong>パフォーマンス</strong> が読みやすくなる。
              </p>
              <div class="mt-6 grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <div class="text-sm font-semibold text-zinc-100">Static assets</div>
                  <p class="mt-2 text-sm text-zinc-400 leading-relaxed">
                    CSS/JS/画像は <span class="font-mono text-zinc-200">assets binding</span> で配信。
                    <span class="font-mono text-zinc-200">run_worker_first = false</span> なら Worker を起動せずに CDN が返す。
                  </p>
                </div>
                <div class="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <div class="text-sm font-semibold text-zinc-100">HTML (SSR)</div>
                  <p class="mt-2 text-sm text-zinc-400 leading-relaxed">
                    HTML は Worker が生成して返す。ここだけが compute の対象。
                    つまり「どこでコストが発生するか」が直感的なのだ。
                  </p>
                </div>
              </div>
              <CodeBlock title="wrangler.toml" lang="toml" htmlKey="wrangler_toml" code={`[assets]\ndirectory = "dist/client"\nbinding = "ASSETS"\nrun_worker_first = false`} />
            </section>

            <section class="mt-16" id="project-structure">
              <h2 class="text-xl font-semibold">Project structure (Reactっぽく説明すると)</h2>
              <p class="mt-3 text-zinc-300 leading-7">
                Next.js だと <span class="font-mono text-zinc-200">app/</span> とか <span class="font-mono text-zinc-200">pages/</span> に概念が散るけど、
                vitrio-start は「全部 routes.tsx に集約」しつつ、必要なランタイムだけ分ける。
                <strong>“Reactの考え方（propsでデータ渡す）”</strong> をそのまま SSR に持ち込む感じ。
              </p>
              <CodeBlock title="Typical tree" lang="text" htmlKey="project_tree_text" code={`src/\n  routes.tsx\n  client/\n    entry.tsx\n    islands.tsx\n    islands.gen.ts\n  server/\n    framework.tsx\n    island.tsx\n  components/\n    Counter.client.tsx`} />
            </section>

            <section class="mt-16" id="routing-in-one">
              <h2 class="text-xl font-semibold">Routing: ルート = 設定オブジェクト（Reactでいう props みたいなもん）</h2>
              <p class="mt-3 text-zinc-300 leading-7">
                ルーティングは「ファイル構造」じゃなくて、<span class="font-mono text-zinc-200">defineRoute()</span> の配列。
                これが React のコンポーネントツリーみたいに、アプリの形を決める。
              </p>
              <CodeBlock title="routes.tsx" lang="ts" htmlKey="route_simple_ts" code={`import { defineRoute } from '@potetotown/vitrio-start'\n\nexport const routes = [\n  defineRoute({\n    path: '/',\n    loader: () => ({ message: 'hello' }),\n    component: ({ data }) => <h1>{data.message}</h1>,\n  }),\n]`} />
              <div class="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                <div class="text-sm font-semibold text-indigo-200">Reactっぽい読み替え</div>
                <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                  <li><span class="font-mono text-zinc-200">loader()</span> = サーバー側で props を作る関数</li>
                  <li><span class="font-mono text-zinc-200">component()</span> = props を受け取って HTML を返す React component</li>
                  <li><span class="font-mono text-zinc-200">action()</span> = POST のイベントハンドラ（ただし HTTP）</li>
                </ul>
              </div>
            </section>

            <section class="mt-16" id="data-loading-deep">
              <h2 class="text-xl font-semibold">Data loading: loader は "GET のための関数"</h2>
              <p class="mt-3 text-zinc-300 leading-7">
                loader は SSR の前に走って、コンポーネントに渡すデータを作る。
                React で言うなら「サーバーで props を作って渡す」だけ。
                重要なのは、返す値を <strong>JSON-ish</strong>（シリアライズ安全）にすること。
              </p>
              <CodeBlock title="loader (parallel I/O)" lang="ts" htmlKey="loader_parallel_ts" code={`loader: async ({ params, request, env }) => {\n  const [post, user] = await Promise.all([\n    getPost(env.DB, params.slug),\n    getViewer(request),\n  ])\n\n  if (!post) return { notFound: true }\n\n  return { post, user }\n}`} />
              <div class="mt-6 grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <div class="text-sm font-semibold text-emerald-300">Rule of thumb</div>
                  <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                    <li>I/O は <span class="font-mono text-zinc-200">Promise.all</span> で並列</li>
                    <li>例外は 500（= バグ）として扱う</li>
                    <li>notFound は <span class="font-mono text-zinc-200">{'{ notFound: true }'}</span> で表現</li>
                  </ul>
                </div>
                <div class="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <div class="text-sm font-semibold text-amber-300">Anti-pattern</div>
                  <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                    <li>loader で JSX を返す（やらない）</li>
                    <li>class instance を返す（シリアライズで死ぬ）</li>
                    <li>グローバル mutable state に依存（Workersで事故る）</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="mt-16" id="actions-deep">
              <h2 class="text-xl font-semibold">Actions: action は "POST のための関数"（PRGで脳を守る）</h2>
              <p class="mt-3 text-zinc-300 leading-7">
                action はフォームPOSTを受けて副作用を起こす。
                でも React の onSubmit みたいに「その場で画面を更新」じゃなくて、
                <strong>POST → 303 → GET</strong> の PRG に寄せる。
                これでリロード/戻る/二重送信の地獄が減るのだ。
              </p>
              <CodeBlock title="action (PRG)" lang="ts" htmlKey="action_prg_ts" code={`import { redirect } from './server/response'\n\naction: async ({ request, env }) => {\n  const fd = await request.formData()\n  const email = fd.get('email')\n\n  if (typeof email !== 'string' || !email.includes('@')) {\n    return { ok: false, error: 'invalid email' }\n  }\n\n  await env.DB.prepare('INSERT INTO users(email) VALUES (?)').bind(email).run()\n  return redirect('/thanks', 303)\n}`} />
              <div class="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                <div class="text-sm font-semibold text-zinc-100">Flash（1-shot cookie）</div>
                <p class="mt-2 text-sm text-zinc-400 leading-relaxed">
                  action が返した結果は、フレームワーク側で flash cookie に入れて次の GET で読める。
                  React で言うと「navigate した後に toast を出す」ための最小機構。
                </p>
              </div>
            </section>

            <section class="mt-16" id="islands-deep">
              <h2 class="text-xl font-semibold">Islands: "use client" を雑に言うと "*.client.tsx を置け"</h2>
              <p class="mt-3 text-zinc-300 leading-7">
                ここは Next.js の <span class="font-mono text-zinc-200">"use client"</span> と似た気持ちで使えるようにしてある。
                <span class="font-mono text-zinc-200">src/**/**/*.client.tsx</span> を置くと build が registry を生成して、
                SSR が吐いた <span class="font-mono text-zinc-200">data-island</span> を探して mount する。
              </p>
              <div class="mt-6 grid gap-6 sm:grid-cols-2">
                <div class="min-w-0">
                  <div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Server</div>
                  <CodeBlock title="SSR (call-site)" lang="ts" htmlKey="island_server_ts" code={`// routes.tsx (SSR)\nimport { island } from './server/island'\nimport { Counter } from './components/Counter'\n\nexport function Page() {\n  return (\n    <div>\n      {island(Counter, { initial: 1 }, { name: 'Counter' })}\n    </div>\n  )\n}`} />
                </div>
                <div class="min-w-0">
                  <div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Client</div>
                  <CodeBlock title="client entry" lang="ts" htmlKey="island_client_ts" code={`// client/entry.tsx\nimport { hydrateIslands } from './islands'\n\nasync function main() {\n  const { islands } = await import('./islands.gen')\n  hydrateIslands(islands)\n}\n\nmain()`} />
                </div>
              </div>
              <p class="mt-4 text-sm text-zinc-400 leading-relaxed">
                ※いまの "hydration" は true hydration（DOMを再利用）じゃなくて、island container に mount する方式。
                ただ、UIを小さく切って使う前提なら体感はかなり良い。
              </p>
            </section>

            <div class="mt-16 flex items-center justify-between border-t border-zinc-900/80 py-8 text-xs text-zinc-500">
              <div>© {new Date().getUTCFullYear()} vitrio-start</div>
              <div class="flex items-center gap-3">
                <a class="hover:text-zinc-300" href="#quickstart">Quickstart</a>
                <a class="hover:text-zinc-300" href="/reference">Reference</a>
                <a class="hover:text-zinc-300" href="https://github.com/linkalls/vitrio-start" target="_blank" rel="noreferrer">GitHub</a>
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
              <p class="mt-3">
                最短の流れ。まずはスターターを clone して動かすのが早いです。
                スターター（Next.js / TanStack Start の代替ポジション）:
                <a class="ml-2 underline text-indigo-200 hover:text-indigo-100" href="https://github.com/linkalls/vitrio-start" target="_blank" rel="noreferrer">github.com/linkalls/vitrio-start</a>
              </p>
              <div class="mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60">
                <pre class="overflow-x-auto p-4 text-[12px] leading-relaxed text-zinc-200">
                  <code>{`git clone https://github.com/linkalls/vitrio-start\ncd vitrio-start\nbun install\nbun run build\nbunx wrangler deploy`}</code>
                </pre>
              </div>
              <p class="mt-3 text-sm text-zinc-400">
                ※ドキュメントサイト（このサイト）のコードはこちら:
                <a class="ml-2 underline text-indigo-200 hover:text-indigo-100" href="https://github.com/linkalls/vitrio-start-homepage" target="_blank" rel="noreferrer">github.com/linkalls/vitrio-start-homepage</a>
              </p>
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
        { href: '#the-shape', label: 'The shape of a route' },
        { href: '#matching', label: 'Matching rules' },
        { href: '#params', label: 'Params (and merging)' },
        { href: '#prefix-layouts', label: 'Prefix routes (layouts)' },
        { href: '#normalization', label: 'URL normalization' },
        { href: '#status', label: '404 vs * route' },
      ]

      return (
        <RefChrome
          path="/reference/routing"
          title="Routing"
          subtitle="React の mental model で読む: ルート = data。path が match して loader/action/component が走るだけ。"
          toc={toc}
        >
          <DocArticle>
            <section id="the-shape">
              <h2>The shape of a route</h2>
              <p class="mt-3">
                vitrio-start のルートは <span class="font-mono text-zinc-200">defineRoute</span> に渡すただのオブジェクトです。
                React で言うと「コンポーネントに渡す props の束」みたいなもので、フレームワークが読むための設定データ。
              </p>
              <CodeBlock
                title="RouteDef (concept)"
                lang="ts"
                htmlKey="route_def_ts"
                code={`type RouteDef = {
  path: string
  client?: boolean
  loader?: (ctx: LoaderCtx) => unknown | Promise<unknown>
  action?: (ctx: LoaderCtx, formData: FormData) => unknown | Promise<unknown>
  component: (props: {
    data: unknown
    action: ActionApi<FormData, unknown>
    csrfToken: string
  }) => unknown
}`}
              />
              <p class="mt-3">
                <span class="font-mono text-zinc-200">loader</span> と <span class="font-mono text-zinc-200">action</span> は “React の event handler / data fetch”
                に見えるけど、実体は Plain HTTP（GET/POST）です。
              </p>
            </section>

            <section id="matching">
              <h2>Matching rules</h2>
              <p class="mt-3">
                マッチは <strong>URL pathname</strong> に対して行われます（query はマッチ条件に使わない）。
                ルールはシンプルで、セグメント単位に比較します。
              </p>
              <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-300">
                <div class="font-semibold text-zinc-100">Supported patterns</div>
                <ul class="mt-2 list-disc space-y-1 pl-5 text-zinc-400">
                  <li><span class="font-mono text-zinc-200">/users/123</span> : static segments</li>
                  <li><span class="font-mono text-zinc-200">/users/:id</span> : dynamic segment (captures <span class="font-mono">id</span>)</li>
                  <li><span class="font-mono text-zinc-200">/dashboard/*</span> : prefix match (layout-style)</li>
                  <li><span class="font-mono text-zinc-200">*</span> : catch-all (UI 404 route)</li>
                </ul>
              </div>
              <CodeBlock
                title="Dynamic segment"
                lang="ts"
                htmlKey="routing_param_ts"
                code={`defineRoute({
  path: '/users/:id',
  loader: ({ params }) => ({ userId: params.id }),
  component: ({ data }) => <div>User {data.userId}</div>,
})`}
              />
            </section>

            <section id="params">
              <h2>Params (and merging)</h2>
              <p class="mt-3">
                <span class="font-mono text-zinc-200">:param</span> でキャプチャした値は
                <span class="font-mono text-zinc-200">ctx.params</span> に入ります。
                さらに vitrio-start は「prefix route を layout として使う」ために、
                <strong>親 → 子の順で params を merge</strong> します。
              </p>
              <CodeBlock
                title="Params merging (concept)"
                lang="ts"
                htmlKey="routing_merge_params_ts"
                code={`// matched: /orgs/:orgId/*  and  /orgs/:orgId/repos/:repoId
// ctx.params becomes: { orgId: 'acme', repoId: 'vitrio' }
loader: ({ params }) => {
  params.orgId
  params.repoId
}`}
              />
              <p class="mt-3 text-sm text-zinc-400">
                ルールは「同名キーがあれば後勝ち」。つまり leaf 側が上書きします。
              </p>
            </section>

            <section id="prefix-layouts">
              <h2>Prefix routes (layouts)</h2>
              <p class="mt-3">
                <span class="font-mono text-zinc-200">/parent/*</span> みたいな prefix route を作ると、
                <span class="font-mono text-zinc-200">/parent/child</span> の GET で <strong>両方の loader</strong> が走ります（親 → 子）。
                これは React でいう「Layout が data を読み、Leaf が追加で読む」構造に近い。
              </p>
              <CodeBlock
                title="Prefix route + leaf route"
                lang="ts"
                htmlKey="routing_prefix_ts"
                code={`export const routes = [
  defineRoute({
    path: '/dashboard/*',
    loader: async ({ env }) => ({ viewer: await getViewer(env) }),
    component: ({ data }) => <DashboardLayout viewer={data.viewer} />,
  }),
  defineRoute({
    path: '/dashboard/settings',
    loader: async () => ({ tab: 'settings' }),
    component: ({ data }) => <Settings tab={data.tab} />,
  }),
]`}
              />
            </section>

            <section id="normalization">
              <h2>URL normalization</h2>
              <p class="mt-3">
                ドキュメントリクエストでは末尾スラッシュを正規化します。
                <span class="font-mono text-zinc-200">/foo/</span> へのアクセスは <span class="font-mono text-zinc-200">/foo</span> に 301 で寄せます
                （root の <span class="font-mono">/</span> は例外）。
              </p>
            </section>

            <section id="status">
              <h2>404 vs the <span class="font-mono text-zinc-200">*</span> route</h2>
              <p class="mt-3">
                vitrio-start は「HTTP ステータス」と「UI」の責務を分けています。
              </p>
              <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-400">
                <ul class="list-disc space-y-2 pl-5">
                  <li>
                    <strong>HTTP 404</strong>: loader が <span class="font-mono">notFound()</span> を返す/投げる、またはマッチがゼロ。
                  </li>
                  <li>
                    <strong>UI</strong>: アプリ側で <span class="font-mono">path: '*'</span> を置いて「見た目の 404 ページ」を実装する。
                  </li>
                </ul>
              </div>
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
        { href: '#signature', label: 'LoaderCtx' },
        { href: '#execution', label: 'Execution model' },
        { href: '#cache', label: 'SSR cache priming' },
        { href: '#redirect-notfound', label: 'redirect() / notFound()' },
        { href: '#serialization', label: 'Serialization rules' },
        { href: '#patterns', label: 'Common patterns' },
      ]

      return (
        <RefChrome
          path="/reference/data-loading"
          title="Data loading"
          subtitle="loader は GET 専用。SSR 前に props を作る関数、と考えると React っぽく理解できる。"
          toc={toc}
        >
          <DocArticle>
            <section id="overview">
              <h2>Overview</h2>
              <p class="mt-3">
                <span class="font-mono text-zinc-200">loader</span> は GET リクエストのときにサーバーで実行され、
                コンポーネントに渡す <span class="font-mono text-zinc-200">data</span> を作ります。
                つまり React の「Server で props を計算して渡す」モデル。
              </p>
              <CodeBlock
                title="Loader → Component data"
                lang="ts"
                htmlKey="loader_to_component_ts"
                code={`import { notFound } from './server/response'

defineRoute({
  path: '/posts/:slug',
  loader: async ({ params, env }) => {
    const post = await env.DB.prepare('SELECT * FROM posts WHERE slug = ?')
      .bind(params.slug)
      .first()
    if (!post) return notFound()
    return { post }
  },
  component: ({ data }) => <PostPage post={data.post} />,
})`}
              />
            </section>

            <section id="signature">
              <h2>LoaderCtx</h2>
              <p class="mt-3">
                loader が受け取るのは Web の Request そのものではなく、ルート解決に必要な情報をまとめた <span class="font-mono text-zinc-200">LoaderCtx</span>。
                依存を小さくして “React っぽく純粋に” 書けるようにしてあります。
              </p>
              <CodeBlock
                title="LoaderCtx (what you get)"
                lang="ts"
                htmlKey="loader_ctx_ts"
                code={`type LoaderCtx = {
  params: Record<string, string>
  search: URLSearchParams
  location: { path: string; query: string; hash: string }
}`}
              />
            </section>

            <section id="execution">
              <h2>Execution model</h2>
              <p class="mt-3">
                ルートが prefix マッチ（例: <span class="font-mono text-zinc-200">/dashboard/*</span>）している場合、
                <strong>親 → 子の順</strong>で複数 loader が実行されます。
                これは Layout + Leaf の考え方に近いです。
              </p>
              <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-400">
                <div class="font-semibold text-zinc-200">Rules of thumb</div>
                <ul class="mt-2 list-disc space-y-1 pl-5">
                  <li>I/O は <span class="font-mono text-zinc-200">Promise.all</span> で並列化</li>
                  <li>例外は 500（=バグ）として扱う</li>
                  <li>404 は <span class="font-mono text-zinc-200">notFound()</span> を返す/投げる</li>
                </ul>
              </div>
            </section>

            <section id="cache">
              <h2>SSR cache priming (important)</h2>
              <p class="mt-3">
                SSR のとき、vitrio-start は先に loader を実行して結果をキャッシュに入れます。
                これで Vitrio の <span class="font-mono text-zinc-200">Route()</span> が SSR 中に loader を二重実行しない。
              </p>
              <CodeBlock
                title="SSR primes loader cache (concept)"
                lang="ts"
                htmlKey="loader_cache_prime_ts"
                code={`// Pseudocode
const key = makeRouteCacheKey(route.path, ctx)
cacheMap.set(key, { status: 'fulfilled', value: out })
// later: Route() reads from the cache instead of calling loader again`}
              />
            </section>

            <section id="redirect-notfound">
              <h2><span class="font-mono text-zinc-200">redirect()</span> / <span class="font-mono text-zinc-200">notFound()</span></h2>
              <p class="mt-3">
                loader は “HTTP を返す” のではなく、基本は data を返します。
                ただし「この GET は別 URL を見せたい」や「存在しない」は例外なので、
                <span class="font-mono text-zinc-200">redirect()</span> / <span class="font-mono text-zinc-200">notFound()</span> を使います。
              </p>
              <CodeBlock
                title="Redirect from loader"
                lang="ts"
                htmlKey="loader_redirect_ts"
                code={`import { redirect, notFound } from './server/response'

loader: async ({ params, search }) => {
  if (!params.slug) return notFound()
  if (search.get('legacy') === '1') {
    return redirect('/posts/' + params.slug, 302)
  }
  return { ok: true }
}`}
              />
              <p class="mt-3 text-sm text-zinc-400">
                例外として <span class="font-mono text-zinc-200">throw redirect(...)</span> でも同じ扱いになります。
              </p>
            </section>

            <section id="serialization">
              <h2>Serialization rules</h2>
              <p class="mt-3">
                loader の戻り値は “JSON-ish” を推奨します。
                class instance / Date / Map などをそのまま返すと、将来の dehydrations で事故りやすい。
              </p>
            </section>

            <section id="patterns">
              <h2>Common patterns</h2>
              <CodeBlock
                title="Parallel I/O"
                lang="ts"
                htmlKey="loader_parallel_ts"
                code={`loader: async ({ params, request, env }) => {
  const [post, user] = await Promise.all([
    getPost(env.DB, params.slug),
    getViewer(request),
  ])

  if (!post) return { notFound: true }
  return { post, user }
}`}
              />
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
    action: async (_ctx, fd) => {
      // Demo: return a payload that becomes flash.newCount
      if (fd.get('intent') === 'inc') return { newCount: Math.floor(Math.random() * 1000) }
      return { ok: true }
    },
    component: ({ csrfToken }) => {
      const toc: TocLink[] = [
        { href: '#overview', label: 'Overview (PRG)' },
        { href: '#signature', label: 'Signature' },
        { href: '#result', label: 'Return values' },
        { href: '#csrf', label: 'CSRF integration' },
        { href: '#flash', label: 'Flash + redirect back' },
        { href: '#explicit-redirect', label: 'Explicit redirects' },
        { href: '#patterns', label: 'Patterns' },
        { href: '#demo', label: 'Demo form' },
      ]

      return (
        <RefChrome
          path="/reference/actions"
          title="Actions (PRG)"
          subtitle="React の onSubmit を “HTTP に戻す”。POST は副作用、結果は 303 で GET に戻す。"
          toc={toc}
        >
          <DocArticle>
            <section id="overview">
              <h2>Overview (PRG)</h2>
              <p class="mt-3">
                <span class="font-mono text-zinc-200">action</span> は POST 専用。
                HTML フォームで送られた <span class="font-mono text-zinc-200">FormData</span> を受け取り、副作用（DB更新など）を起こします。
                そして <strong>POST → 303 → GET</strong> で “画面” に戻る。
              </p>
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                  <div class="text-sm font-semibold text-indigo-300">Why PRG?</div>
                  <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                    <li>リロードで二重送信しない</li>
                    <li>戻る/進むが素直</li>
                    <li>URL と表示が一致する</li>
                  </ul>
                </div>
                <div class="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                  <div class="text-sm font-semibold text-emerald-300">What you write</div>
                  <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                    <li>validate</li>
                    <li>mutate</li>
                    <li>redirect (or return plain object)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="signature">
              <h2>Signature</h2>
              <p class="mt-3">
                action は <span class="font-mono text-zinc-200">(ctx, formData)</span> を受け取ります。
                <span class="font-mono text-zinc-200">formData</span> は framework が先にパースして渡します。
              </p>
              <CodeBlock
                title="Action signature"
                lang="ts"
                htmlKey="action_signature_ts"
                code={`action: async (ctx: LoaderCtx, formData: FormData) => {
  // ctx.params / ctx.search / ctx.location
  const intent = formData.get('intent')
  return { ok: true }
}`}
              />
              <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                <div class="text-sm font-semibold text-zinc-100">CSRF hidden input</div>
                <p class="mt-2 text-sm text-zinc-400">
                  <span class="font-mono text-zinc-200">csrfToken</span> は SSR で props として渡されます。
                  これを <span class="font-mono text-zinc-200">_csrf</span> に入れるだけ。
                </p>
                <CodeBlock title="form" lang="html" htmlKey="form_html" code={`<form method="post">
  <input type="hidden" name="_csrf" value={csrfToken} />
  ...
</form>`} />
              </div>
            </section>

            <section id="result">
              <h2>Return values</h2>
              <p class="mt-3">
                action は 3 通りの返し方があります（=フレームワークが扱える “プロトコル”）。
              </p>
              <CodeBlock
                title="ActionResult"
                lang="ts"
                htmlKey="action_result_ts"
                code={`// 1) redirect(to): explicit redirect (no automatic flash)
return redirect('/posts', 303)

// 2) notFound(): treated as failure (flash ok=false), then redirect back
return notFound()

// 3) plain object: treated as success (flash ok=true), then redirect back
return { ok: true, newCount: 123 }`}
              />
            </section>

            <section id="csrf">
              <h2>CSRF integration</h2>
              <p class="mt-3">
                action 実行前に CSRF を検証します。
                失敗した場合は action 自体が実行されず、失敗 flash をセットして 303 で同じページに戻ります。
              </p>
              <CodeBlock
                title="CSRF verify (double submit cookie)"
                lang="ts"
                htmlKey="csrf_verify_ts"
                code={`function verifyCsrf(c: Context, formData: FormData): boolean {
  const cookieTok = getCookie(c, 'vitrio_csrf')
  const bodyTok = String(formData.get('_csrf') ?? '')
  return !!cookieTok && cookieTok === bodyTok
}`}
              />
            </section>

            <section id="flash">
              <h2>Flash + redirect back</h2>
              <p class="mt-3">
                vitrio-start の default は「成功/失敗を 1-shot cookie に入れて、同じ URL に 303 で戻す」です。
                React でいうと “navigate 後に toast を出す” の最小機構。
              </p>
              <CodeBlock
                title="Framework POST flow (simplified)"
                lang="ts"
                htmlKey="framework_post_ts"
                code={`if (method === 'POST') {
  const r = await runMatchedAction(c, routes, path, url)

  if (r.kind === 'redirect') return c.redirect(r.to, r.status)

  setFlash(c, { ok: r.kind === 'ok', at: Date.now() })
  return c.redirect(path, 303)
}`}
              />
            </section>

            <section id="explicit-redirect">
              <h2>Explicit redirects</h2>
              <p class="mt-3">
                「成功したら別ページへ」みたいなケースは、action から <span class="font-mono text-zinc-200">redirect()</span> を返します。
                これは “PRG の Redirect” を action が明示するパターン。
              </p>
              <CodeBlock
                title="Explicit redirect"
                lang="ts"
                htmlKey="action_prg_ts"
                code={`import { redirect } from './server/response'

action: async ({ request, env }) => {
  const fd = await request.formData()
  const email = fd.get('email')

  if (typeof email !== 'string' || !email.includes('@')) {
    return { ok: false, error: 'invalid email' }
  }

  await env.DB.prepare('INSERT INTO users(email) VALUES (?)').bind(email).run()
  return redirect('/thanks', 303)
}`}
              />
            </section>

            <section id="patterns">
              <h2>Patterns</h2>
              <p class="mt-3">
                <strong>Intent pattern</strong>（同じフォームで複数ボタン）などは <span class="font-mono text-zinc-200">formData.get('intent')</span> で分岐します。
                JS を書かなくても十分戦える。
              </p>
              <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-400">
                <div class="font-semibold text-zinc-200">Tip</div>
                返す plain object に <span class="font-mono text-zinc-200">newCount</span> などを入れると、
                このサイトのフレームワーク実装では flash に同梱されます。
              </div>
            </section>

            <section id="demo">
              <h2>Demo form</h2>
              <p class="mt-3">このページにも CSRF hidden input が入っている。POST すると 303 で戻って flash が出る。</p>
              <form method="post" class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                <input type="hidden" name="_csrf" value={csrfToken} />
                <div class="flex flex-wrap items-center gap-3">
                  <button class="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-white" name="intent" value="inc">
                    Submit (inc)
                  </button>
                  <div class="text-sm text-zinc-400">Try reloading after submit: no “resubmit form” warning.</div>
                </div>
              </form>
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
        { href: '#csrf', label: 'CSRF (double submit cookie)' },
        { href: '#csrf-usage', label: 'How to use in forms' },
        { href: '#flash', label: 'Flash cookie' },
        { href: '#flash-read', label: 'Reading flash on client' },
        { href: '#cookie-flags', label: 'Cookie flags' },
      ]

      return (
        <RefChrome
          path="/reference/csrf-flash"
          title="CSRF / Flash"
          subtitle="cookie token + hidden input / one-shot flash cookie。Workers でも state-less に成立する最小セット。"
          toc={toc}
        >
          <DocArticle>
            <section id="csrf">
              <h2>CSRF (double submit cookie)</h2>
              <p class="mt-3">
                vitrio-start は <strong>Double Submit Cookie</strong> パターンです。
                セッションストアを持たずに成立するので、Workers と相性が良い。
              </p>
              <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-400">
                <ol class="list-decimal space-y-2 pl-5">
                  <li>GET で CSRF cookie（<span class="font-mono text-zinc-200">vitrio_csrf</span>）を発行</li>
                  <li>SSR で <span class="font-mono text-zinc-200">csrfToken</span> を props に渡す</li>
                  <li>フォームが hidden input <span class="font-mono text-zinc-200">_csrf</span> として送る</li>
                  <li>POST で cookie と body が一致することを確認</li>
                </ol>
              </div>
              <CodeBlock
                title="Verify logic (same as framework)"
                lang="ts"
                htmlKey="csrf_verify_ts"
                code={`const cookieTok = getCookie(c, 'vitrio_csrf')
const bodyTok = String(formData.get('_csrf') ?? '')
const ok = !!cookieTok && cookieTok === bodyTok`}
              />
            </section>

            <section id="csrf-usage">
              <h2>How to use in forms</h2>
              <p class="mt-3">
                やることは 1 行。
                SSR component に渡される <span class="font-mono text-zinc-200">csrfToken</span> を hidden input に入れるだけ。
              </p>
              <CodeBlock title="Form" lang="html" htmlKey="form_html" code={`<form method="post">
  <input type="hidden" name="_csrf" value={csrfToken} />
  ...
</form>`} />
            </section>

            <section id="flash">
              <h2>Flash cookie</h2>
              <p class="mt-3">
                flash は「次の GET で 1 回だけ読める」データです。
                action の結果（成功/失敗や軽い payload）を cookie に入れて、GET で読む。
              </p>
              <CodeBlock
                title="Flash write/read (concept)"
                lang="ts"
                htmlKey="flash_readclear_ts"
                code={`// Write (on POST)
setCookie(c, 'vitrio_flash', JSON.stringify({ ok: true, at: Date.now() }), {
  path: '/', httpOnly: true, sameSite: 'Lax'
})

// Read + clear (on GET)
const raw = getCookie(c, 'vitrio_flash')
setCookie(c, 'vitrio_flash', '', { path: '/', maxAge: 0 })`}
              />
            </section>

            <section id="flash-read">
              <h2>Reading flash on client</h2>
              <p class="mt-3">
                SSR が <span class="font-mono text-zinc-200">globalThis.__VITRIO_FLASH__</span> に埋め込むと、
                route を <span class="font-mono">client: true</span> にしたページで toast 表示などが可能です。
              </p>
              <CodeBlock
                title="Client-side read"
                lang="ts"
                htmlKey="flash_client_ts"
                code={`// in client entry
const flash = (globalThis as any).__VITRIO_FLASH__
if (flash?.ok) {
  console.log('success at', flash.at)
}`}
              />
            </section>

            <section id="cookie-flags">
              <h2>Cookie flags</h2>
              <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-400">
                <ul class="list-disc space-y-2 pl-5">
                  <li>
                    <span class="font-mono text-zinc-200">vitrio_csrf</span>: <strong>not HttpOnly</strong>
                    （SSR でフォームに埋めるため）。ただし <span class="font-mono">SameSite=Lax</span>。
                  </li>
                  <li>
                    <span class="font-mono text-zinc-200">vitrio_flash</span>: <strong>HttpOnly</strong>
                    （JS から読ませない）。GET で即削除。
                  </li>
                </ul>
              </div>
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
        { href: '#concept', label: 'Concept (route-level JS)' },
        { href: '#what-loads', label: 'What gets loaded' },
        { href: '#progressive', label: 'Progressive Enhancement' },
        { href: '#islands', label: 'Islands (*.client.tsx)' },
        { href: '#autogen', label: 'Auto-generated registry' },
      ]

      return (
        <RefChrome path="/reference/use-client" title="“use client”" subtitle="必要なページだけ JS。さらに island 単位なら TSX をそのまま mount。" toc={toc}>
          <DocArticle>
            <section id="concept">
              <h2>Concept (route-level JS)</h2>
              <p class="mt-3">
                デフォルトは SSR のみ（No client JS）。
                でも UI をちょっとだけ便利にしたいページ（目次ハイライト、Copy ボタン、toast など）もある。
              </p>
              <p class="mt-3">
                vitrio-start はルートに <span class="font-mono text-zinc-200">client: true</span> を付けると、
                そのページにだけクライアントエントリ（例: <span class="font-mono text-zinc-200">/assets/entry.js</span>）を読み込みます。
              </p>
              <CodeBlock
                title="client: true"
                lang="ts"
                htmlKey="client_true_ts"
                code={`defineRoute({
  path: '/reference/routing',
  client: true,
  loader: () => ({}),
  component: () => <Page />,
})`}
              />
            </section>

            <section id="what-loads">
              <h2>What gets loaded</h2>
              <p class="mt-3">
                client が有効なページでは、SSR の HTML に加えて 1 本だけ script を足します。
                HTML 自体は常に完全に表示できる（JS は “後付け”）。
              </p>
              <CodeBlock
                title="SSR adds entry script"
                lang="ts"
                htmlKey="enable_client_ts"
                code={`const enableClient = !!bestMatch.client
return html(
  '<body>...'+(enableClient ? '<script src="/assets/entry.js"></script>' : '')+'</body>'
)`}
              />
            </section>

            <section id="progressive">
              <h2>Progressive Enhancement</h2>
              <p class="mt-3">
                JS が遅い/無効でもページは動く。
                その上で JS がある時だけ「コピーできる」「スクロール位置で目次が光る」などを足す。
                React の “render is pure, effects enhance” みたいな感覚に近い。
              </p>
            </section>

            <section id="islands">
              <h2>Islands (*.client.tsx)</h2>
              <p class="mt-3">
                ページ全体を hydrate するのではなく「必要な部分だけ TSX を mount」できます。
                vitrio-start は <span class="font-mono text-zinc-200">src/**/**/*.client.tsx</span> を island として扱う設計。
              </p>
              <CodeBlock
                title="Server call-site (island helper)"
                lang="ts"
                htmlKey="island_server_ts"
                code={`import { island } from './server/island'
import Counter from './components/Counter.client'

export function Page() {
  return <div>{island(Counter, { initial: 1 })}</div>
}`}
              />
            </section>

            <section id="autogen">
              <h2>Auto-generated registry</h2>
              <p class="mt-3">
                island を手で登録するのは面倒なので、ビルド時に registry を自動生成します。
                いまの vitrio-start は <span class="font-mono text-zinc-200">src/**/**/*.client.tsx</span> をスキャンして
                <span class="font-mono text-zinc-200">islands.gen.ts</span> を吐く方式。
              </p>
              <CodeBlock
                title="src/client/islands.gen.ts (example output)"
                lang="ts"
                htmlKey="islands_gen_ts"
                code={`// AUTO-GENERATED
import Counter from '../components/Counter.client'
import SearchBox from '../routes/search/SearchBox.client'

export const islands = {
  Counter,
  SearchBox,
} as const`}
              />
              <CodeBlock title="client entry" lang="ts" htmlKey="island_client_ts" code={`import { hydrateIslands } from './islands'

async function main() {
  const { islands } = await import('./islands.gen')
  hydrateIslands(islands)
}

main()`} />
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
        { href: '#assets-binding', label: 'Assets binding' },
        { href: '#worker-entry', label: 'Worker entry' },
        { href: '#run-worker-first', label: 'run_worker_first' },
        { href: '#env', label: 'Env bindings' },
        { href: '#wrangler', label: 'Wrangler deploy' },
      ]

      return (
        <RefChrome
          path="/reference/workers-deploy"
          title="Workers deployment"
          subtitle="静的アセットは CDN、HTML だけ Worker。assets binding / wrangler / env のつなぎ方。"
          toc={toc}
        >
          <DocArticle>
            <section id="assets-binding">
              <h2>Assets binding</h2>
              <p class="mt-3">
                vitrio-start の基本戦略は「静的アセット（CSS/JS/画像）は Assets CDN、HTML は Worker SSR」です。
                これでコストとパフォーマンスが読みやすくなる。
              </p>
              <CodeBlock
                title="wrangler.toml"
                lang="toml"
                htmlKey="wrangler_toml"
                code={`[assets]
directory = "dist/client"
binding = "ASSETS"
run_worker_first = false`}
              />
            </section>

            <section id="worker-entry">
              <h2>Worker entry</h2>
              <p class="mt-3">
                Worker は 2 つの責務を持ちます。
                <strong>(1) assets を binding から返す</strong>、<strong>(2) それ以外は SSR</strong>。
              </p>
              <CodeBlock
                title="src/server/workers.ts (pattern)"
                lang="ts"
                htmlKey="worker_entry_ts"
                code={`import { Hono } from 'hono'
import { handleDocumentRequest } from './framework'

type Env = { ASSETS: { fetch(req: Request): Promise<Response> } }
const app = new Hono<{ Bindings: Env }>()

app.get('/assets/*', (c) => c.env.ASSETS.fetch(c.req.raw))
app.all('*', (c) => handleDocumentRequest(c, compiledRoutes, {
  title: 'vitrio-start',
  entrySrc: '/assets/entry.js',
}))

export default { fetch: (req: Request, env: Env, ctx: any) => app.fetch(req, env, ctx) }`}
              />
            </section>

            <section id="run-worker-first">
              <h2><span class="font-mono text-zinc-200">run_worker_first = false</span></h2>
              <p class="mt-3">
                これが重要。
                <span class="font-mono text-zinc-200">false</span> にすると <span class="font-mono text-zinc-200">/assets/*</span> は CDN が先に捌くので、
                アセット配信で Worker を起動しません。
              </p>
              <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-400">
                Workers の課金やパフォーマンスを “HTML のみ” に寄せられるのがメリット。
              </div>
            </section>

            <section id="env">
              <h2>Env bindings</h2>
              <p class="mt-3">
                Workers の env（D1/KV/R2 など）は request ごとに渡されます。
                SSR フレームワークでは “深い場所まで prop drilling” しがちなので、
                vitrio-start では現実解として global に inject するパターンを用意しています。
              </p>
              <CodeBlock title="Inject env" lang="ts" htmlKey="worker_env_ts" code={`export default {
  fetch(request: Request, env: Env, ctx: any) {
    ;(globalThis as any).__VITRIO_ENV = env
    return app.fetch(request, env, ctx)
  },
}`}
              />
            </section>

            <section id="wrangler">
              <h2>Wrangler deploy</h2>
              <p class="mt-3">
                ビルド → deploy の順です。
                CI では API token を使い、<span class="font-mono text-zinc-200">account_id</span> を <span class="font-mono">wrangler.toml</span> に入れておくと安定します。
              </p>
              <CodeBlock title="Commands" lang="bash" htmlKey="commands_bash" code={`bun run build
bunx wrangler deploy`} />
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
