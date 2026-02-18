import { z } from 'zod'
import type { TocLink } from '../../app/reference'
import { DocArticle, REF_PAGES, RefChrome } from '../../app/reference'

export const loader = () => ({ version: 'v1' })

export default function Page({ data }: { data: unknown }) {
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
            vitrio-start は “server actions をRPC化する魔法” を作りません。代わりに{' '}
            <span class="font-mono text-zinc-200">action</span> を普通のHTTPとして扱い、結果は redirect で戻します。
          </p>
          <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-300">
            <div class="font-semibold text-zinc-200">Key ideas</div>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>
                Routes are data: <span class="font-mono">path / loader / action / component</span>
              </li>
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
              <a href={p.path} class="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 hover:bg-zinc-950/60">
                <div class="text-sm font-semibold text-zinc-100">{p.title}</div>
                <div class="mt-1 text-sm text-zinc-400">{p.short}</div>
              </a>
            ))}
          </div>
        </section>

        <section id="quickstart">
          <h2>Quickstart</h2>
          <p class="mt-3">
            最短の流れ。まずはスターターを clone して動かすのが早いです。スターター（Next.js / TanStack Start の代替ポジション）:
            <a
              class="ml-2 underline text-indigo-200 hover:text-indigo-100"
              href="https://github.com/linkalls/vitrio-start"
              target="_blank"
              rel="noreferrer"
            >
              github.com/linkalls/vitrio-start
            </a>
          </p>
          <div class="mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60">
            <pre class="overflow-x-auto p-4 text-[12px] leading-relaxed text-zinc-200">
              <code>{`git clone https://github.com/linkalls/vitrio-start\ncd vitrio-start\nbun install\nbun run build\nbunx wrangler deploy`}</code>
            </pre>
          </div>
          <p class="mt-3 text-sm text-zinc-400">
            ※ドキュメントサイト（このサイト）のコードはこちら:
            <a
              class="ml-2 underline text-indigo-200 hover:text-indigo-100"
              href="https://github.com/linkalls/vitrio-start-homepage"
              target="_blank"
              rel="noreferrer"
            >
              github.com/linkalls/vitrio-start-homepage
            </a>
          </p>
        </section>
      </DocArticle>
    </RefChrome>
  )
}
