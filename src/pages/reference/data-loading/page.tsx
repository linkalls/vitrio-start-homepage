import type { TocLink } from '../../../app/reference'
import { CodeBlock, DocArticle, RefChrome } from '../../../app/reference'

export const client = true

export const loader = () => ({})

export default function Page() {
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
            <span class="font-mono text-zinc-200">loader</span> は GET リクエストのときにサーバーで実行され、コンポーネントに渡す{' '}
            <span class="font-mono text-zinc-200">data</span> を作ります。つまり React の「Server で props を計算して渡す」モデル。
          </p>
          <CodeBlock
            title="Loader → Component data"
            lang="ts"
            htmlKey="loader_to_component_ts"
            code={`import { notFound } from './server/response'\n\ndefineRoute({\n  path: '/posts/:slug',\n  loader: async ({ params, env }) => {\n    const post = await env.DB.prepare('SELECT * FROM posts WHERE slug = ?')\n      .bind(params.slug)\n      .first()\n    if (!post) return notFound()\n    return { post }\n  },\n  component: ({ data }) => <PostPage post={data.post} />,\n})`}
          />
        </section>

        <section id="signature">
          <h2>LoaderCtx</h2>
          <p class="mt-3">
            loader が受け取るのは Web の Request そのものではなく、ルート解決に必要な情報をまとめた{' '}
            <span class="font-mono text-zinc-200">LoaderCtx</span>。依存を小さくして “React っぽく純粋に” 書けるようにしてあります。
          </p>
          <CodeBlock
            title="LoaderCtx (what you get)"
            lang="ts"
            htmlKey="loader_ctx_ts"
            code={`type LoaderCtx = {\n  params: Record<string, string>\n  search: URLSearchParams\n  location: { path: string; query: string; hash: string }\n}`}
          />
        </section>

        <section id="execution">
          <h2>Execution model</h2>
          <p class="mt-3">
            ルートが prefix マッチ（例: <span class="font-mono text-zinc-200">/dashboard/*</span>）している場合、<strong>親 → 子の順</strong>
            で複数 loader が実行されます。これは Layout + Leaf の考え方に近いです。
          </p>
          <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-400">
            <div class="font-semibold text-zinc-200">Rules of thumb</div>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>
                I/O は <span class="font-mono text-zinc-200">Promise.all</span> で並列化
              </li>
              <li>例外は 500（=バグ）として扱う</li>
              <li>
                404 は <span class="font-mono text-zinc-200">notFound()</span> を返す/投げる
              </li>
            </ul>
          </div>
        </section>

        <section id="cache">
          <h2>SSR cache priming (important)</h2>
          <p class="mt-3">
            SSR のとき、vitrio-start は先に loader を実行して結果をキャッシュに入れます。これで Vitrio の{' '}
            <span class="font-mono text-zinc-200">Route()</span> が SSR 中に loader を二重実行しない。
          </p>
          <CodeBlock
            title="SSR primes loader cache (concept)"
            lang="ts"
            htmlKey="loader_cache_prime_ts"
            code={`// Pseudocode\nconst key = makeRouteCacheKey(route.path, ctx)\ncacheMap.set(key, { status: 'fulfilled', value: out })\n// later: Route() reads from the cache instead of calling loader again`}
          />
        </section>

        <section id="redirect-notfound">
          <h2>
            <span class="font-mono text-zinc-200">redirect()</span> / <span class="font-mono text-zinc-200">notFound()</span>
          </h2>
          <p class="mt-3">
            loader は “HTTP を返す” のではなく、基本は data を返します。ただし「この GET は別 URL を見せたい」や「存在しない」は例外なので、
            <span class="font-mono text-zinc-200">redirect()</span> / <span class="font-mono text-zinc-200">notFound()</span> を使います。
          </p>
          <CodeBlock
            title="Redirect from loader"
            lang="ts"
            htmlKey="loader_redirect_ts"
            code={`import { redirect, notFound } from './server/response'\n\nloader: async ({ params, search }) => {\n  if (!params.slug) return notFound()\n  if (search.get('legacy') === '1') {\n    return redirect('/posts/' + params.slug, 302)\n  }\n  return { ok: true }\n}`}
          />
          <p class="mt-3 text-sm text-zinc-400">例外として <span class="font-mono text-zinc-200">throw redirect(...)</span> でも同じ扱いになります。</p>
        </section>

        <section id="serialization">
          <h2>Serialization rules</h2>
          <p class="mt-3">
            loader の戻り値は “JSON-ish” を推奨します。class instance / Date / Map などをそのまま返すと、将来の dehydrations で事故りやすい。
          </p>
        </section>

        <section id="patterns">
          <h2>Common patterns</h2>
          <CodeBlock
            title="Parallel I/O"
            lang="ts"
            htmlKey="loader_parallel_ts"
            code={`loader: async ({ params, request, env }) => {\n  const [post, user] = await Promise.all([\n    getPost(env.DB, params.slug),\n    getViewer(request),\n  ])\n\n  if (!post) return { notFound: true }\n  return { post, user }\n}`}
          />
        </section>
      </DocArticle>
    </RefChrome>
  )
}
