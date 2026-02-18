import type { TocLink } from '../../../app/reference'
import { DocArticle, RefChrome } from '../../../app/reference'

export const loader = () => ({})

export default function Page() {
  const toc: TocLink[] = [
    { href: '#islands', label: 'Islands (mount/replace)' },
    { href: '#use-client', label: 'use client の考え方' },
    { href: '#naming', label: 'Islands naming' },
    { href: '#assets', label: 'Assets binding / cache' },
    { href: '#wrangler', label: 'Wrangler auth (CI)' },
    { href: '#shiki', label: 'Shiki / Workers' },
    { href: '#overflow', label: 'Mobile overflow' },
    { href: '#migrate', label: 'Next.js / Start から移行' },
  ]

  return (
    <RefChrome path="/reference/faq" title="FAQ" subtitle="ハマりどころを雑に全部メモる場所。" toc={toc}>
      <DocArticle>
        <section id="islands">
          <h2>Islands は true hydration じゃない（いまは mount/replace）</h2>
          <p class="mt-3 text-zinc-300 leading-7">
            vitrio-start の Islands は、いわゆる React の hydration みたいに DOM を再利用して差分だけ当てるやつではないのだ。いまの実装は「
            <span class="font-mono text-zinc-200">data-island</span> の箱に対して Vitrio を mount する」＝<strong>mount/replace</strong>。
          </p>
          <div class="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
            <div class="text-sm font-semibold text-emerald-300">OKなケース</div>
            <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
              <li>Counter / Copy button / Tabs / Tooltip みたいな小さいUI</li>
              <li>初期HTMLは「見た目」だけで、状態は client 側で作る前提の部品</li>
            </ul>
          </div>
          <div class="mt-3 rounded-2xl border border-amber-800/50 bg-amber-950/10 p-4">
            <div class="text-sm font-semibold text-amber-300">注意なケース</div>
            <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
              <li>ユーザーが入力した内容（フォーム途中入力）を島が置換して消す</li>
              <li>SSRのHTMLに依存したDOM操作（既存ノード参照）</li>
            </ul>
            <p class="mt-2 text-sm text-zinc-400">
              こういうのが必要なら、島を「入力の外側」に置く、もしくは true hydration を将来入れる、のどっちかなのだ。
            </p>
          </div>
        </section>

        <section id="use-client">
          <h2>"use client" の思想：ルート単位 + islandsで最小JS</h2>
          <p class="mt-3 text-zinc-300 leading-7">
            vitrio-start の <span class="font-mono text-zinc-200">client: true</span> は、Next.js の "use client" と似てるけど単位が違う。「このルートだけ client entry を読む」= まず<strong>ルート単位</strong>。その上で islands を使うと「ページの一部だけ」を動かせる。
          </p>
          <div class="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-400">
            <div class="font-semibold text-zinc-200">覚え方</div>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>
                <span class="font-mono text-zinc-200">client: true</span> = "このページは JS が必要"
              </li>
              <li>
                <span class="font-mono text-zinc-200">island()</span> = "この部分は TSX で動かす"
              </li>
              <li>
                <span class="font-mono text-zinc-200">*.client.tsx</span> = "この部品は client 側で使う"
              </li>
            </ul>
          </div>
        </section>

        <section id="naming">
          <h2>Islands naming がズレる問題（minify / function.name）</h2>
          <p class="mt-3 text-zinc-300 leading-7">
            production build だと関数名が潰れるので、<span class="font-mono text-zinc-200">function.name</span> を信じると事故る。だから vitrio-start は <strong>ファイル名 stem</strong>（例: <span class="font-mono">Counter.client.tsx</span> → <span class="font-mono">"Counter"</span>）を島名の基本にしてる。
          </p>
          <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-400">
            <div class="font-semibold text-zinc-200">ルール（ざっくり）</div>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>基本は default export 推奨</li>
              <li>島名は file stem</li>
              <li>
                どうしても変えたい時だけ <span class="font-mono text-zinc-200">export const ISLAND_NAME</span>
              </li>
            </ul>
          </div>
        </section>

        <section id="assets">
          <h2>Assets binding / cache の罠</h2>
          <p class="mt-3 text-zinc-300 leading-7">
            Workers は HTML は毎回SSRできるけど、静的アセットまで Worker で捌くとコストも遅延も読めなくなる。なので <span class="font-mono text-zinc-200">[assets]</span> + <span class="font-mono text-zinc-200">run_worker_first=false</span> を基本にする。
          </p>
          <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-400">
            <div class="font-semibold text-zinc-200">チェックリスト</div>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>
                CSS/JS のパスが <span class="font-mono">/assets/...</span> で揃ってる？
              </li>
              <li>キャッシュで「直したのに反映されない」時はファイル名ハッシュ化 or purge</li>
              <li>
                Worker側で assets を触る設計にしてない？（触るなら run_worker_first=true が必要）
              </li>
            </ul>
          </div>
        </section>

        <section id="wrangler">
          <h2>Wrangler auth (CI)</h2>
          <p class="mt-3 text-zinc-300 leading-7">
            ローカルは <span class="font-mono text-zinc-200">wrangler login</span> で通るけど、CI は API Token が必要。さらに「whoami は通るのに deploy/delete で memberships が死ぬ」系は <span class="font-mono">account_id</span> 明示で回避できることがある。
          </p>
        </section>

        <section id="shiki">
          <h2>Shiki / Workers</h2>
          <p class="mt-3 text-zinc-300 leading-7">
            Workers runtime で <span class="font-mono text-zinc-200">import('shiki')</span> すると落ちることがある。だからこのサイトは Node で <strong>事前に HTML を生成</strong>して <span class="font-mono">src/server/highlight.ts</span> に埋め込んでる。
          </p>
        </section>

        <section id="overflow">
          <h2>Mobile overflow</h2>
          <p class="mt-3 text-zinc-300 leading-7">
            2カラムの中にコードブロックがあると、親が <span class="font-mono text-zinc-200">min-w-0</span> じゃないせいで全体が横スクロールになる。なので grid の子には <span class="font-mono text-zinc-200">min-w-0</span> を付ける、CodeBlock は横スクロールを内側に閉じ込める。
          </p>
        </section>

        <section id="migrate">
          <h2>Next.js / TanStack Start から移行する時の読み替え</h2>
          <div class="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/40">
            <div class="grid grid-cols-1 sm:grid-cols-3">
              <div class="p-4 text-sm font-semibold text-zinc-200">やりたいこと</div>
              <div class="p-4 text-sm font-semibold text-zinc-200 border-t border-zinc-800 sm:border-t-0 sm:border-l">Next / Start</div>
              <div class="p-4 text-sm font-semibold text-zinc-200 border-t border-zinc-800 sm:border-t-0 sm:border-l">vitrio-start</div>

              <div class="p-4 text-sm text-zinc-400 border-t border-zinc-800">GETでデータ取得</div>
              <div class="p-4 text-sm text-zinc-400 border-t border-zinc-800 sm:border-l">loader / server component fetch</div>
              <div class="p-4 text-sm text-zinc-400 border-t border-zinc-800 sm:border-l">
                <span class="font-mono text-zinc-200">loader()</span>
              </div>

              <div class="p-4 text-sm text-zinc-400 border-t border-zinc-800">POSTで副作用</div>
              <div class="p-4 text-sm text-zinc-400 border-t border-zinc-800 sm:border-l">server actions / mutations</div>
              <div class="p-4 text-sm text-zinc-400 border-t border-zinc-800 sm:border-l">
                <span class="font-mono text-zinc-200">action()</span> + PRG
              </div>

              <div class="p-4 text-sm text-zinc-400 border-t border-zinc-800">client側のUIだけ動かす</div>
              <div class="p-4 text-sm text-zinc-400 border-t border-zinc-800 sm:border-l">use client / islands / client components</div>
              <div class="p-4 text-sm text-zinc-400 border-t border-zinc-800 sm:border-l">
                <span class="font-mono text-zinc-200">client: true</span> + <span class="font-mono text-zinc-200">island()</span> +{' '}
                <span class="font-mono text-zinc-200">*.client.tsx</span>
              </div>
            </div>
          </div>
        </section>
      </DocArticle>
    </RefChrome>
  )
}
