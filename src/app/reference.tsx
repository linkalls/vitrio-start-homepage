import { HIGHLIGHT } from '../server/highlight'
import { CopyButtonIsland } from '../server/islands.gen'

export type TocLink = { href: string; label: string }

export type RefPage = {
  path: string
  title: string
  short: string
  client?: boolean
}

export const REF_PAGES: RefPage[] = [
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
    path: '/reference/file-router',
    title: 'File router',
    short: 'src/pages/**/page.tsx → routes',
    client: false,
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

export function getRefNav(path: string): { prev?: RefPage; next?: RefPage } {
  const idx = REF_PAGES.findIndex((p) => p.path === path)
  if (idx === -1) return {}
  return {
    prev: REF_PAGES[idx - 1],
    next: REF_PAGES[idx + 1],
  }
}

export function Brand() {
  return (
    <a href="/" class="flex items-center gap-2">
      <span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-sm font-black text-zinc-950">V</span>
      <span class="text-sm font-semibold tracking-tight text-zinc-100">vitrio-start</span>
    </a>
  )
}

export function RefChrome(p: {
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
        <div class="flex items-center justify-between gap-3">
          <Brand />
          <div class="flex items-center gap-2">
            {/* Mobile: hamburger to jump to other reference pages */}
            <details class="relative lg:hidden">
              <summary class="list-none cursor-pointer rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-950">
                Menu
              </summary>
              <div class="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-xl">
                <div class="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Reference</div>
                <nav class="grid">
                  {REF_PAGES.filter((x) => x.path !== p.path).map((x) => (
                    <a class="px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/60" href={x.path}>
                      <div class="font-medium">{x.title}</div>
                      <div class="text-xs text-zinc-500">{x.short}</div>
                    </a>
                  ))}
                </nav>
              </div>
            </details>
            <a href="/" class="text-sm text-zinc-300 hover:text-zinc-100">← Back</a>
          </div>
        </div>

        <div class="mt-10 grid gap-10 lg:grid-cols-[260px_1fr]">
          <details class="lg:hidden rounded-3xl border border-zinc-800 bg-zinc-900/30 p-4">
            <summary class="cursor-pointer select-none text-sm font-semibold text-zinc-100">
              On this page
              <span class="ml-2 text-xs font-normal text-zinc-400">(tap to expand)</span>
            </summary>
            <nav class="mt-4 grid gap-1 text-sm">
              {p.toc.map((l) => (
                <a
                  data-toc-link
                  class="rounded-xl px-3 py-2 text-zinc-300 hover:bg-zinc-950/60 data-[active=1]:bg-zinc-950/60 data-[active=1]:text-zinc-100"
                  href={l.href}
                >
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
                  <a
                    data-toc-link
                    class="rounded-xl px-3 py-2 text-zinc-300 hover:bg-zinc-950/60 data-[active=1]:bg-zinc-950/60 data-[active=1]:text-zinc-100"
                    href={l.href}
                  >
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

export function DocArticle(p: { children: unknown }) {
  return (
    <article
      class={
        'space-y-10 ' +
        '[\&_h2]:scroll-mt-24 [\&_h2]:text-xl [\&_h2]:font-semibold ' +
        '[\&_p]:break-words [\&_p]:leading-7 [\&_p]:text-zinc-300 ' +
        '[\&_pre]:leading-relaxed ' +
        '[\&_a]:text-indigo-200 [\&_a:hover]:text-indigo-100'
      }
    >
      {p.children}
    </article>
  )
}

export function CodeBlock(p: { title: string; lang: string; htmlKey?: keyof typeof HIGHLIGHT; code: string }) {
  const html = p.htmlKey ? HIGHLIGHT[p.htmlKey] : undefined

  return (
    <div class="mt-4 min-w-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60">
      <div class="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 py-2">
        <div class="text-xs font-semibold text-zinc-300">{p.title}</div>
        <div class="flex items-center gap-3">
          <CopyButtonIsland
            props={{ text: p.code }}
            fallback={
              <button
                type="button"
                class="rounded-md border border-zinc-800 bg-zinc-950/40 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-950"
                data-copy={p.code}
                aria-label="Copy code"
              >
                Copy
              </button>
            }
          />
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
