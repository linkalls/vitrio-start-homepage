import { z } from 'zod'
import { CodeBlock } from '../app/reference'

export const client = true

export const loader = () => ({ now: Date.now() })

export default function Page({ data }: { data: unknown }) {
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
              <li>
                <span class="font-mono text-zinc-200">src/**/**/*.client.tsx</span> を置く
              </li>
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
          <CodeBlock
            title="wrangler.toml"
            lang="toml"
            htmlKey="wrangler_toml"
            code={`[assets]\ndirectory = "dist/client"\nbinding = "ASSETS"\nrun_worker_first = false`}
          />
        </section>

        <section class="mt-16" id="project-structure">
          <h2 class="text-xl font-semibold">Project structure (Reactっぽく説明すると)</h2>
          <p class="mt-3 text-zinc-300 leading-7">
            vitrio-start は「routes をデータとして扱う」思想はそのままに、入口のDXとして <strong>file router</strong> も用意したのだ。
            Next.js みたいに <span class="font-mono text-zinc-200">src/pages/**/page.tsx</span> を置くだけでルートが生える。
            その裏では結局 <span class="font-mono text-zinc-200">defineRoute()</span> の配列に変換してるだけ。
          </p>
          <CodeBlock
            title="Typical tree"
            lang="text"
            htmlKey="project_tree_text"
            code={`src/\n  pages/\n    page.tsx                 # /\n    users/\n      [id]/\n        page.tsx             # /users/:id\n  routes.manual.tsx          # 手書きルート（テスト/デモなど）\n  routes.fs.gen.ts           # file router から自動生成\n  routes.tsx                 # 2つを合成\n  client/\n    entry.tsx\n    islands.tsx\n    islands.gen.ts\n  server/\n    framework.tsx\n    island.tsx\n  components/\n    Counter.client.tsx`}
          />
        </section>

        <div class="mt-16 flex items-center justify-between border-t border-zinc-900/80 py-8 text-xs text-zinc-500">
          <div>© {new Date().getUTCFullYear()} vitrio-start</div>
          <div class="flex items-center gap-3">
            <a class="hover:text-zinc-300" href="#quickstart">
              Quickstart
            </a>
            <a class="hover:text-zinc-300" href="/reference">
              Reference
            </a>
            <a class="hover:text-zinc-300" href="https://github.com/linkalls/vitrio-start" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
