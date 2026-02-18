import type { TocLink } from '../../../app/reference'
import { CodeBlock, DocArticle, RefChrome } from '../../../app/reference'

export const client = true

export const loader = () => ({})

export default function Page() {
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
            vitrio-start の基本戦略は「静的アセット（CSS/JS/画像）は Assets CDN、HTML は Worker SSR」です。これでコストとパフォーマンスが読みやすくなる。
          </p>
          <CodeBlock
            title="wrangler.toml"
            lang="toml"
            htmlKey="wrangler_toml"
            code={`[assets]\ndirectory = "dist/client"\nbinding = "ASSETS"\nrun_worker_first = false`}
          />
        </section>

        <section id="worker-entry">
          <h2>Worker entry</h2>
          <p class="mt-3">
            Worker は 2 つの責務を持ちます。<strong>(1) assets を binding から返す</strong>、<strong>(2) それ以外は SSR</strong>。
          </p>
          <CodeBlock
            title="src/server/workers.ts (pattern)"
            lang="ts"
            htmlKey="worker_entry_ts"
            code={`import { Hono } from 'hono'\nimport { handleDocumentRequest } from './framework'\n\ntype Env = { ASSETS: { fetch(req: Request): Promise<Response> } }\nconst app = new Hono<{ Bindings: Env }>()\n\napp.get('/assets/*', (c) => c.env.ASSETS.fetch(c.req.raw))\napp.all('*', (c) => handleDocumentRequest(c, compiledRoutes, {\n  title: 'vitrio-start',\n  entrySrc: '/assets/entry.js',\n}))\n\nexport default { fetch: (req: Request, env: Env, ctx: any) => app.fetch(req, env, ctx) }`}
          />
        </section>

        <section id="run-worker-first">
          <h2>
            <span class="font-mono text-zinc-200">run_worker_first = false</span>
          </h2>
          <p class="mt-3">
            これが重要。<span class="font-mono text-zinc-200">false</span> にすると <span class="font-mono text-zinc-200">/assets/*</span> は CDN が先に捌くので、アセット配信で Worker を起動しません。
          </p>
          <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-400">
            Workers の課金やパフォーマンスを “HTML のみ” に寄せられるのがメリット。
          </div>
        </section>

        <section id="env">
          <h2>Env bindings</h2>
          <p class="mt-3">
            Workers の env（D1/KV/R2 など）は request ごとに渡されます。SSR フレームワークでは “深い場所まで prop drilling” しがちなので、vitrio-start では現実解として global に inject するパターンを用意しています。
          </p>
          <CodeBlock
            title="Inject env"
            lang="ts"
            htmlKey="worker_env_ts"
            code={`export default {\n  fetch(request: Request, env: Env, ctx: any) {\n    ;(globalThis as any).__VITRIO_ENV = env\n    return app.fetch(request, env, ctx)\n  },\n}`}
          />
        </section>

        <section id="wrangler">
          <h2>Wrangler deploy</h2>
          <p class="mt-3">
            ビルド → deploy の順です。CI では API token を使い、<span class="font-mono text-zinc-200">account_id</span> を <span class="font-mono">wrangler.toml</span> に入れておくと安定します。
          </p>
          <CodeBlock
            title="Commands"
            lang="bash"
            htmlKey="commands_bash"
            code={`bun run build\nbunx wrangler deploy`}
          />
        </section>
      </DocArticle>
    </RefChrome>
  )
}
