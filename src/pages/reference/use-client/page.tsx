import type { TocLink } from '../../../app/reference'
import { CodeBlock, DocArticle, RefChrome } from '../../../app/reference'

export const client = true

export const loader = () => ({})

export default function Page() {
  const toc: TocLink[] = [
    { href: '#concept', label: 'Concept (route-level JS)' },
    { href: '#what-loads', label: 'What gets loaded' },
    { href: '#progressive', label: 'Progressive Enhancement' },
    { href: '#islands', label: 'Islands (*.client.tsx)' },
    { href: '#autogen', label: 'Auto-generated registry' },
  ]

  return (
    <RefChrome
      path="/reference/use-client"
      title="“use client”"
      subtitle="必要なページだけ JS。さらに island 単位なら TSX をそのまま mount。"
      toc={toc}
    >
      <DocArticle>
        <section id="concept">
          <h2>Concept (route-level JS)</h2>
          <p class="mt-3">デフォルトは SSR のみ（No client JS）。でも UI をちょっとだけ便利にしたいページ（目次ハイライト、Copy ボタン、toast など）もある。</p>
          <p class="mt-3">
            vitrio-start はルートに <span class="font-mono text-zinc-200">client: true</span> を付けると、そのページにだけクライアントエントリ（例:{' '}
            <span class="font-mono text-zinc-200">/assets/entry.js</span>）を読み込みます。
          </p>
          <CodeBlock
            title="client: true"
            lang="ts"
            htmlKey="client_true_ts"
            code={`defineRoute({\n  path: '/reference/routing',\n  client: true,\n  loader: () => ({}),\n  component: () => <Page />,\n})`}
          />
        </section>

        <section id="what-loads">
          <h2>What gets loaded</h2>
          <p class="mt-3">
            client が有効なページでは、SSR の HTML に加えて 1 本だけ script を足します。HTML 自体は常に完全に表示できる（JS は “後付け”）。
          </p>
          <CodeBlock
            title="SSR adds entry script"
            lang="ts"
            htmlKey="enable_client_ts"
            code={`const enableClient = !!bestMatch.client\nreturn html(\n  '<body>...'+(enableClient ? '<script src="/assets/entry.js"></script>' : '')+'</body>'\n)`}
          />
        </section>

        <section id="progressive">
          <h2>Progressive Enhancement</h2>
          <p class="mt-3">
            JS が遅い/無効でもページは動く。その上で JS がある時だけ「コピーできる」「スクロール位置で目次が光る」などを足す。React の “render is pure, effects enhance” みたいな感覚に近い。
          </p>
        </section>

        <section id="islands">
          <h2>Islands (*.client.tsx)</h2>
          <p class="mt-3">
            ページ全体を hydrate するのではなく「必要な部分だけ TSX を mount」できます。vitrio-start は <span class="font-mono text-zinc-200">src/**/**/*.client.tsx</span>
            を island として扱う設計。
          </p>
          <CodeBlock
            title="Server call-site (island helper)"
            lang="ts"
            htmlKey="island_server_ts"
            code={`import { island } from './server/island'\nimport Counter from './components/Counter.client'\n\nexport function Page() {\n  return <div>{island(Counter, { initial: 1 })}</div>\n}`}
          />
        </section>

        <section id="autogen">
          <h2>Auto-generated registry</h2>
          <p class="mt-3">
            island を手で登録するのは面倒なので、ビルド時に registry を自動生成します。いまの vitrio-start は <span class="font-mono text-zinc-200">src/**/**/*.client.tsx</span> をスキャンして{' '}
            <span class="font-mono text-zinc-200">islands.gen.ts</span> を吐く方式。
          </p>
          <CodeBlock
            title="src/client/islands.gen.ts (example output)"
            lang="ts"
            htmlKey="islands_gen_ts"
            code={`// AUTO-GENERATED\nimport Counter from '../components/Counter.client'\nimport SearchBox from '../routes/search/SearchBox.client'\n\nexport const islands = {\n  Counter,\n  SearchBox,\n} as const`}
          />
          <CodeBlock
            title="client entry"
            lang="ts"
            htmlKey="island_client_ts"
            code={`import { hydrateIslands } from './islands'\n\nasync function main() {\n  const { islands } = await import('./islands.gen')\n  hydrateIslands(islands)\n}\n\nmain()`}
          />
        </section>
      </DocArticle>
    </RefChrome>
  )
}
