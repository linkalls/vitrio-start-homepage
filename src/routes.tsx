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
        { href: '#overview', label: 'Overview' },
        { href: '#dynamic-params', label: 'Dynamic params' },
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
              <p class="mt-3">
                vitrio-start のルーティングは、URLとページの1対1のマッピングを定義するシンプルな仕組みです。
                <span class="font-mono text-zinc-200">routes.tsx</span> に配列として定義し、上から順に評価されます。
              </p>
              <CodeBlock
                title="routes.tsx"
                lang="ts"
                htmlKey="routes_ts"
                code={`defineRoute({\n  path: '/reference',\n  loader: (ctx) => ({ /* ... */ }),\n  action: (ctx, formData) => ({ /* ... */ }),\n  component: ({ data, csrfToken }) => <Page />,\n})`}
              />
            </section>

            <section id="dynamic-params">
              <h2>Dynamic Params</h2>
              <p class="mt-3">
                パスセグメントに <span class="font-mono text-zinc-200">:</span> を付けることで、動的なパラメータをキャプチャできます。
                キャプチャされた値は <span class="font-mono text-zinc-200">params</span> オブジェクトとして <span class="font-mono text-zinc-200">loader</span>, <span class="font-mono text-zinc-200">action</span> に渡されます。
              </p>
              <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                <div class="text-sm font-semibold text-emerald-300">Supported Patterns</div>
                <ul class="mt-2 space-y-2 text-sm text-zinc-400">
                  <li class="flex items-center gap-2">
                    <span class="font-mono text-zinc-200">/users/:id</span>
                    <span>→ matches <span class="font-mono">/users/123</span></span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="font-mono text-zinc-200">/posts/:slug/edit</span>
                    <span>→ matches <span class="font-mono">/posts/hello-world/edit</span></span>
                  </li>
                </ul>
              </div>
              <CodeBlock
                title="Dynamic Params Usage"
                lang="ts"
                htmlKey="routing_param_ts"
                code={`defineRoute({\n  path: '/users/:id',\n  loader: ({ params }) => {\n    // params.id is string (URL decoded)\n    return { userId: params.id }\n  },\n  component: ({ data }) => <div>User {data.userId}</div>\n})`}
              />
            </section>

            <section id="contracts">
              <h2>Routing Contracts</h2>
              <p class="mt-3">
                フレームワークが保証するルーティングの挙動（仕様）です。これを知っておくと、迷わず設計できます。
              </p>
              
              <div class="mt-6 space-y-8">
                <div>
                  <h3 class="text-lg font-semibold text-zinc-100">1. Prefix Matching & Ordering</h3>
                  <p class="mt-2 text-sm text-zinc-300">
                    ルートは **定義順** にマッチングを試みます。最初にマッチしたルートが採用されます（First Match Wins）。
                    ただし、Action（POST）の場合は、より具体的な（深い）ルートが優先される場合があります。
                  </p>
                </div>

                <div>
                  <h3 class="text-lg font-semibold text-zinc-100">2. Normalization</h3>
                  <p class="mt-2 text-sm text-zinc-300">
                    末尾のスラッシュ（Trailing Slash）は自動的に削除されます。
                    <span class="font-mono text-zinc-400">/foo/</span> へのアクセスは <span class="font-mono text-zinc-400">/foo</span> へ 301 リダイレクトされます。
                    SEOとキャッシュの一貫性を保つためです。
                  </p>
                </div>

                <div>
                  <h3 class="text-lg font-semibold text-zinc-100">3. Wildcards</h3>
                  <p class="mt-2 text-sm text-zinc-300">
                    <span class="font-mono text-zinc-200">*</span> を使うと、それ以降のすべてのパスにマッチします（Prefix Match）。
                    404ページや、SPAのようなクライアントサイド・ルーティングを行いたい場合に使います。
                  </p>
                </div>
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
        { href: '#loader-signature', label: 'Loader signature' },
        { href: '#patterns', label: 'Patterns' },
        { href: '#error-handling', label: 'Error handling' },
      ]

      return (
        <RefChrome
          path="/reference/data-loading"
          title="Data loading"
          subtitle="GETリクエスト時にデータを取得し、SSRを行うまでの流れ。"
          toc={toc}
        >
          <DocArticle>
            <section id="overview">
              <h2>Overview</h2>
              <p class="mt-3">
                <span class="font-mono text-zinc-200">loader</span> は、GETリクエスト時にサーバーサイドで実行される非同期関数です。
                データベースへの問い合わせや外部APIコールを行い、その結果をオブジェクトとして返します。
                返されたデータは、<span class="font-mono text-zinc-200">component</span> の <span class="font-mono text-zinc-200">props.data</span> に型安全に渡されます。
              </p>
            </section>

            <section id="loader-signature">
              <h2>Loader Signature</h2>
              <p class="mt-3">
                <span class="font-mono text-zinc-200">loader</span> 関数は、<span class="font-mono text-zinc-200">LoaderCtx</span> オブジェクトを受け取ります。
              </p>
              <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm">
                <ul class="space-y-3 text-zinc-300">
                  <li>
                    <span class="font-mono text-indigo-300">params</span>
                    <br />
                    <span class="text-zinc-400">動的ルートパラメータ（例: /users/:id → {`{ id: "123" }`}）。</span>
                  </li>
                  <li>
                    <span class="font-mono text-indigo-300">request</span>
                    <br />
                    <span class="text-zinc-400">Web Standard Request オブジェクト。URLやHeadersへのアクセスに使用します。</span>
                  </li>
                  <li>
                    <span class="font-mono text-indigo-300">env</span>
                    <br />
                    <span class="text-zinc-400">Cloudflare Workers Env（D1, KV, R2 バインディングなど）。</span>
                  </li>
                  <li>
                    <span class="font-mono text-indigo-300">ctx</span>
                    <br />
                    <span class="text-zinc-400">Workers ExecutionContext（waitUntil など）。</span>
                  </li>
                </ul>
              </div>
            </section>

            <section id="patterns">
              <h2>Patterns</h2>
              
              <h3 class="mt-6 text-lg font-semibold text-zinc-100">Parallel Fetching</h3>
              <p class="mt-2">
                複数のデータソースが必要な場合は、<span class="font-mono text-zinc-200">Promise.all</span> を使って並列に取得します。
                Waterfall（直列実行）を防ぐことで、レスポンスタイムを短縮できます。
              </p>
              <CodeBlock
                title="Parallel Fetching Example"
                lang="ts"
                htmlKey="loader_example_ts"
                code={`loader: async ({ params, env }) => {
  // Parallel fetch: avoid waterfall!
  const [user, posts] = await Promise.all([
    fetchUser(params.id),
    fetchPosts(params.id),
  ])
  
  return { user, posts }
}`}
              />

              <h3 class="mt-8 text-lg font-semibold text-zinc-100">Direct DB Access</h3>
              <p class="mt-2">
                Loader はサーバーサイドで実行されるため、D1 や KV などのデータベースに直接アクセスできます。
                API エンドポイントを別途作成する必要はありません。
              </p>
            </section>

            <section id="error-handling">
              <h2>Error Handling</h2>
              <p class="mt-3">
                Loader 内で例外がスローされた場合、フレームワークは 500 エラーとして扱います。
                404 Not Found などを返したい場合は、明示的にデータを返すか、Response オブジェクトを投げます。
              </p>
              <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-400">
                <p>
                  推奨パターン: <span class="font-mono text-zinc-200">{`{ notFound: true }`}</span> のようなフラグをデータに含め、
                  コンポーネント側で条件分岐して 404 UI を表示します（SSR時にステータスコード 404 を出力する機能と組み合わせます）。
                </p>
              </div>
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
        { href: '#validation', label: 'Validation' },
        { href: '#redirects', label: 'Redirects' },
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
                <span class="font-mono text-zinc-200">action</span> は、フォーム送信（POSTリクエスト）を処理するサーバーサイド関数です。
                <span class="font-mono text-zinc-200">routes.tsx</span> に定義し、データの作成・更新・削除（Mutation）を行います。
                クライアントサイドJSなしで動作し、Progressive Enhancement の基盤となります。
              </p>
            </section>

            <section id="flow">
              <h2>Request flow (PRG)</h2>
              <p class="mt-3">
                Post-Redirect-Get (PRG) パターンを採用しています。
                Action は HTML を返さず、必ずリダイレクト（またはリダイレクト指示）を返します。
              </p>
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                  <div class="text-sm font-semibold text-indigo-300">1. POST (Action)</div>
                  <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                    <li>CSRF トークンの検証（自動）</li>
                    <li>Action 関数の実行</li>
                    <li>結果（成功/失敗）を Flash Cookie に保存</li>
                    <li><strong>303 See Other</strong> で GET へリダイレクト</li>
                  </ul>
                </div>
                <div class="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                  <div class="text-sm font-semibold text-emerald-300">2. GET (Render)</div>
                  <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                    <li>リダイレクト先を表示</li>
                    <li>Flash Cookie を読み取り、UI に反映（Toastなど）</li>
                    <li>Flash Cookie を削除（1回きり）</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="validation">
              <h2>Validation</h2>
              <p class="mt-3">
                <span class="font-mono text-zinc-200">FormData</span> を受け取り、<span class="font-mono text-zinc-200">zod</span> などでバリデーションを行います。
                失敗した場合は、エラーメッセージを含むオブジェクトを返し（Flash経由で伝達）、元のページにリダイレクトします。
              </p>
              <CodeBlock
                title="Action Validation Example"
                lang="ts"
                htmlKey="action_ts"
                code={`import { redirect } from './server/response'

export const action = async (ctx, formData) => {
  const email = formData.get('email')
  
  // 1. Validation (Manual or Zod)
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    // Return error object -> saves to Flash -> redirects back
    return { ok: false, error: 'Invalid email address' }
  }

  // 2. Mutation
  await ctx.env.DB.prepare('INSERT INTO users...').run()

  // 3. Success Redirect
  return redirect('/thanks', { status: 303 })
}`}
              />
            </section>

            <section id="redirects">
              <h2>Redirects</h2>
              <p class="mt-3">
                <span class="font-mono text-zinc-200">redirect(url, status)</span> ヘルパーを使用します。
                デフォルトのステータスコードは 302 ですが、PRG パターンでは **303 See Other** を推奨します（POST後のリロード警告を防ぐため）。
              </p>
              <ul class="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-400">
                <li>
                  <span class="font-mono text-zinc-200">redirect('/foo', 303)</span>: 指定パスへ遷移。
                </li>
                <li>
                  <span class="font-mono text-zinc-200">return {`{ ... }`}</span> (オブジェクト返却): 現在のパスへ 303 リダイレクトし、返却値を Flash データとして渡す。
                </li>
              </ul>
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
              <h2>CSRF Protection</h2>
              <p class="mt-3">
                CSRF (Cross-Site Request Forgery) 対策は、Web フレームワークにとって必須の機能です。
                vitrio-start は、<span class="font-mono text-zinc-200">Double Submit Cookie</span> パターンを使用してこれを実装しています。
              </p>
              
              <h3 class="mt-6 text-lg font-semibold text-zinc-100">How it works</h3>
              <ul class="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-400">
                <li>
                  サーバーは <span class="font-mono text-zinc-200">vitrio_csrf</span> クッキー（HttpOnly ではない）を発行します。
                </li>
                <li>
                  フォーム送信時に、隠しフィールド <span class="font-mono text-zinc-200">_csrf</span> としてトークンを送信します。
                </li>
                <li>
                  サーバー側で、クッキーの値とフォームの値が一致することを確認します。
                </li>
              </ul>

              <h3 class="mt-6 text-lg font-semibold text-zinc-100">Usage</h3>
              <p class="mt-2 text-sm text-zinc-300">
                <span class="font-mono text-zinc-200">csrfToken</span> プロップがコンポーネントに自動的に渡されます。これを隠し入力フィールドにセットするだけです。
              </p>
              <CodeBlock
                title="CSRF Token Usage"
                lang="html"
                htmlKey="form_html"
                code={`<form method="post">
  <input type="hidden" name="_csrf" value={csrfToken} />
  ...
</form>`}
              />
            </section>

            <section id="flash">
              <h2>Flash Messages</h2>
              <p class="mt-3">
                Flash Message は、リダイレクト後の「1回だけ表示される」メッセージです（例: "Saved successfully!"）。
                サーバーレス環境（ステートレス）でも動作するように、クッキーベースで実装されています。
              </p>

              <h3 class="mt-6 text-lg font-semibold text-zinc-100">Mechanism</h3>
              <div class="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm">
                <ol class="list-decimal space-y-2 pl-5 text-zinc-300">
                  <li>
                    Action が結果を返す（例: <span class="font-mono text-zinc-200">{`{ ok: true }`}</span>）。
                  </li>
                  <li>
                    フレームワークがそれを JSON シリアライズし、<span class="font-mono text-zinc-200">vitrio_flash</span> クッキーにセットしてリダイレクト。
                  </li>
                  <li>
                    次の GET リクエストで、フレームワークがクッキーを読み取り、<span class="font-mono text-zinc-200">Set-Cookie: vitrio_flash=; Max-Age=0</span> で即座に消去。
                  </li>
                  <li>
                    読み取ったデータはコンポーネントの <span class="font-mono text-zinc-200">props.flash</span> に渡される（現状の実装ではまだ明示的なprop渡しが必要ですが、仕組みは整っています）。
                  </li>
                </ol>
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
        { href: '#concept', label: 'Concept' },
        { href: '#progressive', label: 'Progressive Enhancement' },
        { href: '#implementation', label: 'Implementation' },
      ]

      return (
        <RefChrome path="/reference/use-client" title="“use client”" subtitle="必要なページだけ最小JSを注入する。" toc={toc}>
          <DocArticle>
            <section id="concept">
              <h2>Concept</h2>
              <p class="mt-3">
                vitrio-start のデフォルトは <strong>No Client JS</strong> (SSR HTML only) です。
                しかし、インタラクティブな機能（このページの目次ハイライトやコピーボタンなど）には JS が必要です。
              </p>
              <p class="mt-3 text-sm text-zinc-300">
                <span class="font-mono text-zinc-200">client: true</span> をルート定義に追加すると、
                そのページ専用のクライアントエントリーポイント (<span class="font-mono text-zinc-200">src/client/entry.tsx</span>) が読み込まれます。
              </p>
            </section>

            <section id="islands">
              <h2>Islands / Feature Detection</h2>
              <p class="mt-3">
                React Server Components のような「コンポーネント単位の境界線」はありません。
                代わりに、ページ全体に対して「必要な機能（Islands）」を後付けで有効化するアプローチをとります。
              </p>
              
              <div class="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                <h3 class="text-sm font-semibold text-emerald-300">Why Feature Detection?</h3>
                <p class="mt-2 text-sm text-zinc-400 leading-relaxed">
                  URLやコンポーネントツリー構造に依存せず、<strong>「HTML内にその要素があるか？」</strong> だけで判断します。
                  これにより、サーバー側の実装（どのコンポーネントを使ったか）とクライアント側の実装（どのJSをロードするか）を疎結合に保てます。
                </p>
              </div>
              
              <div class="mt-4 rounded-2xl border border-emerald-800/40 bg-emerald-950/10 p-4">
                <h3 class="text-sm font-semibold text-emerald-300">Now: TSX Islands (use-client-ish)</h3>
                <p class="mt-2 text-sm text-zinc-300 leading-relaxed">
                  vitrio-start は <span class="font-mono text-zinc-200">data-island</span> マーカー + registry で Islands をサポートします。
                  つまり「Vanilla JS を手書き」ではなく、<strong>普通に Vitrio で書いた TSX コンポーネント</strong> をそのまま client 側で mount できます。
                </p>
                <p class="mt-2 text-sm text-zinc-400 leading-relaxed">
                  さらに、registry は <span class="font-mono text-zinc-200">src/**/**/*.client.tsx</span> をスキャンして自動生成できます。
                </p>
              </div>

              <div class="mt-6 grid gap-6 sm:grid-cols-2">
                <div class="min-w-0">
                  <div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Server (Call-site)</div>
                  <CodeBlock
                    title="routes.tsx (SSR)"
                    lang="ts"
                    htmlKey="island_server_ts"
                    code={`// routes.tsx (SSR)
import { island } from './server/island'
import { Counter } from './components/Counter'

export function Page() {
  return (
    <div>
      {island(Counter, { initial: 1 }, { name: 'Counter' })}
    </div>
  )
}`}
                  />
                </div>
                <div class="min-w-0">
                  <div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Client (Auto-generated registry)</div>
                  <CodeBlock
                    title="client/entry.tsx"
                    lang="ts"
                    htmlKey="island_client_ts"
                    code={`// client/entry.tsx
import { hydrateIslands } from './islands'

async function main() {
  // generated by scripts/gen-islands.ts
  const { islands } = await import('./islands.gen')
  hydrateIslands(islands)
}

main()`}
                  />
                </div>
              </div>
            </section>

            <section id="progressive">
              <h2>Progressive Enhancement</h2>
              <p class="mt-3">
                このアーキテクチャにより、JSが無効な環境やロード前でもコンテンツは完全に閲覧可能です。
                JSはあくまで「体験を向上させる（Enhance）」ためのものであり、レンダリングそのものには関与しません。
              </p>
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
        { href: '#env', label: 'Env Injection' },
        { href: '#wrangler', label: 'Wrangler' },
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
              <h2>Static Assets & Cost Optimization</h2>
              <p class="mt-3">
                Cloudflare Workers で SSR を行う場合、静的アセット（画像、CSS、JS）のリクエストで Worker を起動したくありません。
                <span class="font-mono text-zinc-200">run_worker_first = false</span> を設定することで、Worker の前に Assets Binding（CDN）がリクエストを処理します。
              </p>
              <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-400">
                <p>
                  これにより、静的ファイルへのアクセスは Worker 呼び出しコストが発生せず、高速かつ安価（または無料）になります。
                </p>
              </div>
              <CodeBlock
                title="wrangler.toml"
                lang="toml"
                htmlKey="wrangler_toml"
                code={`[assets]
directory = "dist/client"
binding = "ASSETS"
run_worker_first = false # Important!`}
              />
            </section>

            <section id="env">
              <h2>Env Injection (Global Scope)</h2>
              <p class="mt-3">
                一般的な Node.js フレームワークと異なり、Workers では環境変数（Env）はリクエストごとに渡されます。
                これをコンポーネントツリーの深部までバケツリレーするのは苦痛です。
              </p>
              <p class="mt-3">
                vitrio-start では、リクエスト処理の冒頭で Env をグローバルスコープに注入するパターンを推奨しています。
                これは Workers 環境特有の割り切り（Pragmatism）ですが、開発体験を劇的に改善します。
              </p>
              <CodeBlock
                title="src/server/workers.ts"
                lang="ts"
                htmlKey="worker_env_ts"
                code={`// src/server/workers.ts
export default {
  fetch(request: Request, env: Env, ctx: any) {
    // Inject env into global scope
    ;(globalThis as any).__VITRIO_ENV = env
    
    // Pass to app
    return app.fetch(request, env, ctx)
  },
}`}
              />
            </section>

            <section id="wrangler">
              <h2>Wrangler Configuration</h2>
              <p class="mt-3">
                CI/CD 環境でデプロイする場合、アカウントIDの自動検出が失敗することがあります。
                <span class="font-mono text-zinc-200">wrangler.toml</span> に <span class="font-mono text-zinc-200">account_id</span> を明記することをお勧めします。
              </p>
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
