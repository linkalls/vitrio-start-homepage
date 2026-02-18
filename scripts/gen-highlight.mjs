import { createHighlighter } from 'shiki'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SNIPS = [
  {
    key: 'routes_ts',
    lang: 'ts',
    code: `defineRoute({
  path: '/reference',
  loader: (ctx) => ({ /* ... */ }),
  action: (ctx, formData) => ({ /* ... */ }),
  component: ({ data, csrfToken }) => <Page />,
})`,
  },
  {
    key: 'action_ts',
    lang: 'ts',
    code: `import { redirect } from './server/response'

export const action = async (ctx, formData) => {
  const email = formData.get('email')
  
  // 1. Validation
  if (!email || typeof email !== 'string') {
    // Return redirect with flash (handled by framework)
    // Note: framework.tsx handles the actual cookie setting based on return value
    // or you can set it manually if you modify framework.
    // In default starter:
    return { ok: false, error: 'Email is required' }
  }

  // 2. Mutation (e.g. D1, KV)
  await ctx.env.DB.prepare('INSERT INTO users...').run()

  // 3. Success (PRG)
  return redirect('/thanks', { status: 303 })
}`,
  },
  {
    key: 'framework_post_ts',
    lang: 'ts',
    code: `// src/server/framework.tsx (Simplified)
if (method === 'POST') {
  const r = await runMatchedAction(c, routes, path, url)

  if (r.kind === 'redirect') {
    return c.redirect(r.to, r.status)
  }
  
  // Set flash cookie based on result
  setFlash(c, { ok: r.kind === 'ok', at: Date.now() })
  return c.redirect(path, 303)
}`,
  },
  {
    key: 'form_html',
    lang: 'html',
    code: `<form method="post">\n  <input type="hidden" name="_csrf" value={csrfToken} />\n  ...\n</form>`,
  },
  {
    key: 'headers_text',
    lang: 'text',
    code: `X-Content-Type-Options: nosniff\nReferrer-Policy: strict-origin-when-cross-origin\nContent-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'`,
  },
  {
    key: 'wrangler_toml',
    lang: 'toml',
    code: `[assets]\ndirectory = "dist/client"\nbinding = "ASSETS"\nrun_worker_first = false`,
  },
  {
    key: 'project_tree_text',
    lang: 'text',
    code: `src/
  pages/
    page.tsx                 # /
    users/
      [id]/
        page.tsx             # /users/:id
  routes.manual.tsx          # hand-written routes (tests/demos/etc)
  routes.fs.gen.ts           # auto-generated from src/pages/**/page.tsx
  routes.tsx                 # composes fsRoutes + manualRoutes
  client/
    entry.tsx                # only loaded on routes with client: true
    islands.tsx              # runtime that mounts islands into [data-island]
    islands.gen.ts           # auto-generated islands registry (build step)
  server/
    framework.tsx            # request handling (GET/POST, CSRF, flash, SSR)
    island.tsx               # island() helper
  components/
    Counter.client.tsx       # client island (TSX) — file suffix declares "use client"` ,
  },
  {
    key: 'route_simple_ts',
    lang: 'ts',
    code: `import { defineRoute } from '@potetotown/vitrio-start'

export const routes = [
  defineRoute({
    path: '/',
    loader: () => ({ message: 'hello' }),
    component: ({ data }) => <h1>{data.message}</h1>,
  }),
]`,
  },
  {
    key: 'loader_parallel_ts',
    lang: 'ts',
    code: `loader: async ({ params, request, env }) => {
  // params: from the URL (e.g. /posts/:slug)
  // request: the incoming Request
  // env: Cloudflare bindings (D1/KV/R2/etc)

  // Parallelize I/O (Workers likes this)
  const [post, user] = await Promise.all([
    getPost(env.DB, params.slug),
    getViewer(request),
  ])

  if (!post) return { notFound: true }

  // Return plain JSON-ish data (serialization-safe)
  return { post, user }
}`, 
  },
  {
    key: 'action_prg_ts',
    lang: 'ts',
    code: `import { redirect } from './server/response'

action: async ({ request, env }) => {
  const fd = await request.formData()
  const email = fd.get('email')

  if (typeof email !== 'string' || !email.includes('@')) {
    // framework will set flash cookie and redirect back (303)
    return { ok: false, error: 'invalid email' }
  }

  await env.DB.prepare('INSERT INTO users(email) VALUES (?)').bind(email).run()

  // Explicit redirect (still PRG)
  return redirect('/thanks', 303)
}`,
  },
  {
    key: 'file_router_page_tsx',
    lang: 'tsx',
    code: `export const client = true

export const loader = async ({ params, env }) => {
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
    .bind(params.id).first()
  if (!user) return { notFound: true }
  return { user }
}

export default function Page({ data, csrfToken }) {
  return <div>User: {data.user.name}</div>
}`,
  },
  {
    key: 'commands_bash',
    lang: 'bash',
    code: `bun run dev\nbun run build\nbunx wrangler deploy`,
  },
  {
    key: 'hero_route_ts',
    lang: 'ts',
    code: `defineRoute({
  path: '/posts/:slug',
  // 1. Loader: Fetch data on GET (runs before SSR)
  loader: async ({ params, env }) => {
    const post = await env.DB.prepare('SELECT * FROM posts WHERE slug = ?')
      .bind(params.slug).first()
    if (!post) return { notFound: true }
    return { post }
  },
  // 2. Action: Handle POST (PRG pattern)
  action: async ({ params, request, env }) => {
    const fd = await request.formData()
    await env.DB.prepare('UPDATE posts SET likes = likes + 1 WHERE slug = ?')
      .bind(params.slug).run()
    return redirect(\`/posts/\${params.slug}\`, 303)
  },
  // 3. Component: Render HTML (SSR)
  component: ({ data, csrfToken }) => (
    <article>
      <h1>{data.post.title}</h1>
      <form method="post">
        <input type="hidden" name="_csrf" value={csrfToken} />
        <button>Like ({data.post.likes})</button>
      </form>
    </article>
  ),
})`,
  },
  {
    key: 'routing_param_ts',
    lang: 'ts',
    code: `defineRoute({
  path: '/users/:id', // matches /users/123
  loader: ({ params }) => {
    // params.id is "123"
    return { userId: params.id }
  },
  component: ({ data }) => <div>User {data.userId}</div>
})`,
  },
  {
    key: 'loader_example_ts',
    lang: 'ts',
    code: `loader: async ({ params, env }) => {
  // Parallel fetch
  const [user, posts] = await Promise.all([
    fetchUser(params.id),
    fetchPosts(params.id),
  ])
  
  // Return plain object (serialization-safe)
  // This is passed to component as 'data' prop
  return { user, posts }
}`,
  },
  {
    key: 'worker_env_ts',
    lang: 'ts',
    code: `// src/server/workers.ts
export default {
  fetch(request: Request, env: Env, ctx: any) {
    // Inject env into global scope for deep access without prop drilling
    // (A pragmatic tradeoff for SSR frameworks on Workers)
    ;(globalThis as any).__VITRIO_ENV = env
    return app.fetch(request, env, ctx)
  },
}`,
  },
  {
    key: 'island_server_ts',
    lang: 'ts',
    code: `// routes.tsx (SSR)
import { island } from './server/island'
import { Counter } from './components/Counter'

export function Page() {
  return (
    <div>
      {island(Counter, { initial: 1 }, { name: 'Counter' })}
    </div>
  )
}`,
  },
  {
    key: 'island_client_ts',
    lang: 'ts',
    code: `// client/entry.tsx
import { hydrateIslands } from './islands'

async function main() {
  // generated by scripts/gen-islands.ts
  const { islands } = await import('./islands.gen')
  hydrateIslands(islands)
}

main()`,
  },
  {
    key: 'route_def_ts',
    lang: 'ts',
    code: `type RouteDef = {
  path: string
  client?: boolean
  loader?: (ctx: LoaderCtx) => unknown | Promise<unknown>
  action?: (ctx: LoaderCtx, formData: FormData) => unknown | Promise<unknown>
  component: (props: {
    data: unknown
    action: ActionApi<FormData, unknown>
    csrfToken: string
  }) => unknown
}`,
  },
  {
    key: 'routing_merge_params_ts',
    lang: 'ts',
    code: `// matched: /orgs/:orgId/*  and  /orgs/:orgId/repos/:repoId
// ctx.params becomes: { orgId: 'acme', repoId: 'vitrio' }
loader: ({ params }) => {
  params.orgId
  params.repoId
}`,
  },
  {
    key: 'routing_prefix_ts',
    lang: 'ts',
    code: `export const routes = [
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
]`,
  },
  {
    key: 'loader_to_component_ts',
    lang: 'ts',
    code: `import { notFound } from './server/response'

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
})`,
  },
  {
    key: 'loader_ctx_ts',
    lang: 'ts',
    code: `type LoaderCtx = {
  params: Record<string, string>
  search: URLSearchParams
  location: { path: string; query: string; hash: string }
}`,
  },
  {
    key: 'loader_cache_prime_ts',
    lang: 'ts',
    code: `// Pseudocode
const key = makeRouteCacheKey(route.path, ctx)
cacheMap.set(key, { status: 'fulfilled', value: out })
// later: Route() reads from the cache instead of calling loader again`,
  },
  {
    key: 'loader_redirect_ts',
    lang: 'ts',
    code: `import { redirect, notFound } from './server/response'

loader: async ({ params, search }) => {
  if (!params.slug) return notFound()
  if (search.get('legacy') === '1') {
    return redirect('/posts/' + params.slug, 302)
  }
  return { ok: true }
}`,
  },
  {
    key: 'action_signature_ts',
    lang: 'ts',
    code: `action: async (ctx: LoaderCtx, formData: FormData) => {
  // ctx.params / ctx.search / ctx.location
  const intent = formData.get('intent')
  return { ok: true }
}`,
  },
  {
    key: 'action_result_ts',
    lang: 'ts',
    code: `// 1) redirect(to): explicit redirect (no automatic flash)
return redirect('/posts', 303)

// 2) notFound(): treated as failure (flash ok=false), then redirect back
return notFound()

// 3) plain object: treated as success (flash ok=true), then redirect back
return { ok: true, newCount: 123 }`,
  },
  {
    key: 'csrf_verify_ts',
    lang: 'ts',
    code: `function verifyCsrf(c: Context, formData: FormData): boolean {
  const cookieTok = getCookie(c, 'vitrio_csrf')
  const bodyTok = String(formData.get('_csrf') ?? '')
  return !!cookieTok && cookieTok === bodyTok
}`,
  },
  {
    key: 'flash_readclear_ts',
    lang: 'ts',
    code: `// Write (on POST)
setCookie(c, 'vitrio_flash', JSON.stringify({ ok: true, at: Date.now() }), {
  path: '/', httpOnly: true, sameSite: 'Lax'
})

// Read + clear (on GET)
const raw = getCookie(c, 'vitrio_flash')
setCookie(c, 'vitrio_flash', '', { path: '/', maxAge: 0 })`,
  },
  {
    key: 'flash_client_ts',
    lang: 'ts',
    code: `// in client entry
const flash = (globalThis as any).__VITRIO_FLASH__
if (flash?.ok) {
  console.log('success at', flash.at)
}`,
  },
  {
    key: 'client_true_ts',
    lang: 'ts',
    code: `defineRoute({
  path: '/reference/routing',
  client: true,
  loader: () => ({}),
  component: () => <Page />,
})`,
  },
  {
    key: 'enable_client_ts',
    lang: 'ts',
    code: `const enableClient = !!bestMatch.client
return html(
  '<body>...'+(enableClient ? '<script src="/assets/entry.js"></script>' : '')+'</body>'
)`,
  },
  {
    key: 'islands_gen_ts',
    lang: 'ts',
    code: `// AUTO-GENERATED
import Counter from '../components/Counter.client'
import SearchBox from '../routes/search/SearchBox.client'

export const islands = {
  Counter,
  SearchBox,
} as const`,
  },
  {
    key: 'worker_entry_ts',
    lang: 'ts',
    code: `import { Hono } from 'hono'
import { handleDocumentRequest } from './framework'

type Env = { ASSETS: { fetch(req: Request): Promise<Response> } }
const app = new Hono<{ Bindings: Env }>()

app.get('/assets/*', (c) => c.env.ASSETS.fetch(c.req.raw))
app.all('*', (c) => handleDocumentRequest(c, compiledRoutes, {
  title: 'vitrio-start',
  entrySrc: '/assets/entry.js',
}))

export default { fetch: (req: Request, env: Env, ctx: any) => app.fetch(req, env, ctx) }`,
  },
]

const h = await createHighlighter({
  themes: ['github-dark'],
  langs: ['ts', 'tsx', 'html', 'toml', 'bash', 'text'],
})

const out = {}
for (const s of SNIPS) {
  out[s.key] = h.codeToHtml(s.code, { lang: s.lang, theme: 'github-dark' })
}

const file = `// AUTO-GENERATED by scripts/gen-highlight.mjs\n// Do not edit manually.\n\nexport const HIGHLIGHT = ${JSON.stringify(out, null, 2)} as const\n`
writeFileSync(join(process.cwd(), 'src/server/highlight.ts'), file, 'utf8')
console.log('[gen-highlight] wrote src/server/highlight.ts')
