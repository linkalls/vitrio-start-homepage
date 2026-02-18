import { z } from 'zod'
import type { TocLink } from '../../../app/reference'
import { CodeBlock, DocArticle, RefChrome } from '../../../app/reference'

export const client = true

export const loader = () => ({ version: 'v1' })

export default function Page({ data }: { data: unknown }) {
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
            code={`type RouteDef = {\n  path: string\n  client?: boolean\n  loader?: (ctx: LoaderCtx) => unknown | Promise<unknown>\n  action?: (ctx: LoaderCtx, formData: FormData) => unknown | Promise<unknown>\n  component: (props: {\n    data: unknown\n    action: ActionApi<FormData, unknown>\n    csrfToken: string\n  }) => unknown\n}`}
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
              <li>
                <span class="font-mono text-zinc-200">/users/123</span> : static segments
              </li>
              <li>
                <span class="font-mono text-zinc-200">/users/:id</span> : dynamic segment (captures{' '}
                <span class="font-mono">id</span>)
              </li>
              <li>
                <span class="font-mono text-zinc-200">/dashboard/*</span> : prefix match (layout-style)
              </li>
              <li>
                <span class="font-mono text-zinc-200">*</span> : catch-all (UI 404 route)
              </li>
            </ul>
          </div>
          <CodeBlock
            title="Dynamic segment"
            lang="ts"
            htmlKey="routing_param_ts"
            code={`defineRoute({\n  path: '/users/:id',\n  loader: ({ params }) => ({ userId: params.id }),\n  component: ({ data }) => <div>User {data.userId}</div>,\n})`}
          />
        </section>

        <section id="params">
          <h2>Params (and merging)</h2>
          <p class="mt-3">
            <span class="font-mono text-zinc-200">:param</span> でキャプチャした値は <span class="font-mono text-zinc-200">ctx.params</span>{' '}
            に入ります。さらに vitrio-start は「prefix route を layout として使う」ために、<strong>親 → 子の順で params を merge</strong> します。
          </p>
          <CodeBlock
            title="Params merging (concept)"
            lang="ts"
            htmlKey="routing_merge_params_ts"
            code={`// matched: /orgs/:orgId/*  and  /orgs/:orgId/repos/:repoId\n// ctx.params becomes: { orgId: 'acme', repoId: 'vitrio' }\nloader: ({ params }) => {\n  params.orgId\n  params.repoId\n}`}
          />
          <p class="mt-3 text-sm text-zinc-400">ルールは「同名キーがあれば後勝ち」。つまり leaf 側が上書きします。</p>
        </section>

        <section id="prefix-layouts">
          <h2>Prefix routes (layouts)</h2>
          <p class="mt-3">
            <span class="font-mono text-zinc-200">/parent/*</span> みたいな prefix route を作ると、<span class="font-mono text-zinc-200">/parent/child</span>{' '}
            の GET で <strong>両方の loader</strong> が走ります（親 → 子）。これは React でいう「Layout が data を読み、Leaf が追加で読む」構造に近い。
          </p>
          <CodeBlock
            title="Prefix route + leaf route"
            lang="ts"
            htmlKey="routing_prefix_ts"
            code={`export const routes = [\n  defineRoute({\n    path: '/dashboard/*',\n    loader: async ({ env }) => ({ viewer: await getViewer(env) }),\n    component: ({ data }) => <DashboardLayout viewer={data.viewer} />,\n  }),\n  defineRoute({\n    path: '/dashboard/settings',\n    loader: async () => ({ tab: 'settings' }),\n    component: ({ data }) => <Settings tab={data.tab} />,\n  }),\n]`}
          />
        </section>

        <section id="normalization">
          <h2>URL normalization</h2>
          <p class="mt-3">
            ドキュメントリクエストでは末尾スラッシュを正規化します。<span class="font-mono text-zinc-200">/foo/</span> へのアクセスは{' '}
            <span class="font-mono text-zinc-200">/foo</span> に 301 で寄せます（root の <span class="font-mono">/</span> は例外）。
          </p>
        </section>

        <section id="status">
          <h2>
            404 vs the <span class="font-mono text-zinc-200">*</span> route
          </h2>
          <p class="mt-3">vitrio-start は「HTTP ステータス」と「UI」の責務を分けています。</p>
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
}
