import type { TocLink } from '../../../app/reference'
import { CodeBlock, DocArticle, RefChrome } from '../../../app/reference'

export const loader = () => ({})

export default function Page() {
  const toc: TocLink[] = [
    { href: '#why', label: 'Why file router?' },
    { href: '#convention', label: 'Convention' },
    { href: '#dynamic', label: 'Dynamic params / catch-all' },
    { href: '#exports', label: 'Page exports' },
    { href: '#precedence', label: 'Precedence (fs vs manual)' },
  ]

  return (
    <RefChrome
      path="/reference/file-router"
      title="File router"
      subtitle="src/pages/**/page.tsx から defineRoute 配列を自動生成する（薄いNext互換DX）。"
      toc={toc}
    >
      <DocArticle>
        <section id="why">
          <h2>Why file router?</h2>
          <p class="mt-3 text-zinc-300 leading-7">
            vitrio-start は元々 <span class="font-mono text-zinc-200">routes.tsx</span> にルート配列を手書きするスタイルだった。これは「全部見える」強さがある一方で、Next.js / TanStack Start から来た人にとって入口が遠い。
          </p>
          <p class="mt-3 text-zinc-300 leading-7">
            そこで file router を入れた。と言っても魔法は増やさない。<strong>ファイルをスキャンして defineRoute 配列を生成するだけ</strong>。生成物が TS なので、困ったら読めるし、デバッグも楽なのだ。
          </p>
        </section>

        <section id="convention">
          <h2>Convention</h2>
          <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-400">
            <ul class="list-disc space-y-1 pl-5">
              <li>
                <span class="font-mono text-zinc-200">src/pages/**/page.tsx</span> をページとして扱う
              </li>
              <li>
                フォルダ名がそのままパスになる（<span class="font-mono">about/page.tsx</span> → <span class="font-mono">/about</span>）
              </li>
              <li>
                アンダースコアで始まるフォルダ（<span class="font-mono">_internal</span>）は無視
              </li>
            </ul>
          </div>
        </section>

        <section id="dynamic">
          <h2>Dynamic params / catch-all</h2>
          <div class="mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/40">
            <div class="grid grid-cols-1 sm:grid-cols-3">
              <div class="p-4 text-sm font-semibold text-zinc-200">File</div>
              <div class="p-4 text-sm font-semibold text-zinc-200 border-t border-zinc-800 sm:border-t-0 sm:border-l">Route</div>
              <div class="p-4 text-sm font-semibold text-zinc-200 border-t border-zinc-800 sm:border-t-0 sm:border-l">Note</div>

              <div class="p-4 text-sm text-zinc-400 border-t border-zinc-800">
                <span class="font-mono">users/[id]/page.tsx</span>
              </div>
              <div class="p-4 text-sm text-zinc-400 border-t border-zinc-800 sm:border-l">
                <span class="font-mono">/users/:id</span>
              </div>
              <div class="p-4 text-sm text-zinc-400 border-t border-zinc-800 sm:border-l">params.id で受け取る</div>

              <div class="p-4 text-sm text-zinc-400 border-t border-zinc-800">
                <span class="font-mono">blog/[...slug]/page.tsx</span>
              </div>
              <div class="p-4 text-sm text-zinc-400 border-t border-zinc-800 sm:border-l">
                <span class="font-mono">/blog/*</span>
              </div>
              <div class="p-4 text-sm text-zinc-400 border-t border-zinc-800 sm:border-l">残り全部（catch-all）</div>
            </div>
          </div>
        </section>

        <section id="exports">
          <h2>Page exports</h2>
          <p class="mt-3 text-zinc-300 leading-7">
            <span class="font-mono text-zinc-200">page.tsx</span> は「ルート定義の部品」だと思うと理解しやすい。Next の page component に loader/action が足せる感じ。
          </p>
          <CodeBlock
            title="src/pages/users/[id]/page.tsx"
            lang="tsx"
            htmlKey="file_router_page_tsx"
            code={`export const client = true\n\nexport const loader = async ({ params, env }) => {\n  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?')\n    .bind(params.id).first()\n  if (!user) return { notFound: true }\n  return { user }\n}\n\nexport default function Page({ data, csrfToken }) {\n  return <div>User: {data.user.name}</div>\n}`}
          />
          <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-400">
            <div class="font-semibold text-zinc-200">対応してるexport</div>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>
                <span class="font-mono text-zinc-200">default</span> or <span class="font-mono text-zinc-200">component</span>
              </li>
              <li>
                <span class="font-mono text-zinc-200">loader</span>
              </li>
              <li>
                <span class="font-mono text-zinc-200">action</span>
              </li>
              <li>
                <span class="font-mono text-zinc-200">client</span>
              </li>
            </ul>
          </div>
        </section>

        <section id="precedence">
          <h2>Precedence (fsRoutes vs manualRoutes)</h2>
          <p class="mt-3 text-zinc-300 leading-7">
            vitrio-start は <strong>fsRoutes（file router）→ manualRoutes（手書き）</strong> の順に合成している。つまり「同じパスが両方にあるなら file router が勝つ」。手書き側はテスト用ルートやデモ、例外処理の置き場として使う想定。
          </p>
        </section>
      </DocArticle>
    </RefChrome>
  )
}
