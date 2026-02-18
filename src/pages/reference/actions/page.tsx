import type { LoaderCtx } from '@potetotown/vitrio'
import type { TocLink } from '../../../app/reference'
import { CodeBlock, DocArticle, RefChrome } from '../../../app/reference'

export const client = true

export const loader = () => ({})

export const action = async (_ctx: LoaderCtx, fd: FormData) => {
  // Demo: return a payload that becomes flash.newCount
  if (fd.get('intent') === 'inc') return { newCount: Math.floor(Math.random() * 1000) }
  return { ok: true }
}

export default function Page({ csrfToken }: { csrfToken: string }) {
  const toc: TocLink[] = [
    { href: '#overview', label: 'Overview (PRG)' },
    { href: '#signature', label: 'Signature' },
    { href: '#result', label: 'Return values' },
    { href: '#csrf', label: 'CSRF integration' },
    { href: '#flash', label: 'Flash + redirect back' },
    { href: '#explicit-redirect', label: 'Explicit redirects' },
    { href: '#patterns', label: 'Patterns' },
    { href: '#demo', label: 'Demo form' },
  ]

  return (
    <RefChrome
      path="/reference/actions"
      title="Actions (PRG)"
      subtitle="React の onSubmit を “HTTP に戻す”。POST は副作用、結果は 303 で GET に戻す。"
      toc={toc}
    >
      <DocArticle>
        <section id="overview">
          <h2>Overview (PRG)</h2>
          <p class="mt-3">
            <span class="font-mono text-zinc-200">action</span> は POST 専用。HTML フォームで送られた{' '}
            <span class="font-mono text-zinc-200">FormData</span> を受け取り、副作用（DB更新など）を起こします。そして <strong>POST → 303 → GET</strong>
            で “画面” に戻る。
          </p>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div class="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
              <div class="text-sm font-semibold text-indigo-300">Why PRG?</div>
              <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                <li>リロードで二重送信しない</li>
                <li>戻る/進むが素直</li>
                <li>URL と表示が一致する</li>
              </ul>
            </div>
            <div class="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
              <div class="text-sm font-semibold text-emerald-300">What you write</div>
              <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                <li>validate</li>
                <li>mutate</li>
                <li>redirect (or return plain object)</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="signature">
          <h2>Signature</h2>
          <p class="mt-3">
            action は <span class="font-mono text-zinc-200">(ctx, formData)</span> を受け取ります。<span class="font-mono text-zinc-200">formData</span>
            は framework が先にパースして渡します。
          </p>
          <CodeBlock
            title="Action signature"
            lang="ts"
            htmlKey="action_signature_ts"
            code={`action: async (ctx: LoaderCtx, formData: FormData) => {\n  // ctx.params / ctx.search / ctx.location\n  const intent = formData.get('intent')\n  return { ok: true }\n}`}
          />
          <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
            <div class="text-sm font-semibold text-zinc-100">CSRF hidden input</div>
            <p class="mt-2 text-sm text-zinc-400">
              <span class="font-mono text-zinc-200">csrfToken</span> は SSR で props として渡されます。これを <span class="font-mono text-zinc-200">_csrf</span>{' '}
              に入れるだけ。
            </p>
            <CodeBlock
              title="form"
              lang="html"
              htmlKey="form_html"
              code={`<form method="post">\n  <input type="hidden" name="_csrf" value={csrfToken} />\n  ...\n</form>`}
            />
          </div>
        </section>

        <section id="result">
          <h2>Return values</h2>
          <p class="mt-3">action は 3 通りの返し方があります（=フレームワークが扱える “プロトコル”）。</p>
          <CodeBlock
            title="ActionResult"
            lang="ts"
            htmlKey="action_result_ts"
            code={`// 1) redirect(to): explicit redirect (no automatic flash)\nreturn redirect('/posts', 303)\n\n// 2) notFound(): treated as failure (flash ok=false), then redirect back\nreturn notFound()\n\n// 3) plain object: treated as success (flash ok=true), then redirect back\nreturn { ok: true, newCount: 123 }`}
          />
        </section>

        <section id="csrf">
          <h2>CSRF integration</h2>
          <p class="mt-3">
            action 実行前に CSRF を検証します。失敗した場合は action 自体が実行されず、失敗 flash をセットして 303 で同じページに戻ります。
          </p>
          <CodeBlock
            title="CSRF verify (double submit cookie)"
            lang="ts"
            htmlKey="csrf_verify_ts"
            code={`function verifyCsrf(c: Context, formData: FormData): boolean {\n  const cookieTok = getCookie(c, 'vitrio_csrf')\n  const bodyTok = String(formData.get('_csrf') ?? '')\n  return !!cookieTok && cookieTok === bodyTok\n}`}
          />
        </section>

        <section id="flash">
          <h2>Flash + redirect back</h2>
          <p class="mt-3">
            vitrio-start の default は「成功/失敗を 1-shot cookie に入れて、同じ URL に 303 で戻す」です。React でいうと “navigate 後に toast を出す” の最小機構。
          </p>
          <CodeBlock
            title="Framework POST flow (simplified)"
            lang="ts"
            htmlKey="framework_post_ts"
            code={`if (method === 'POST') {\n  const r = await runMatchedAction(c, routes, path, url)\n\n  if (r.kind === 'redirect') return c.redirect(r.to, r.status)\n\n  setFlash(c, { ok: r.kind === 'ok', at: Date.now() })\n  return c.redirect(path, 303)\n}`}
          />
        </section>

        <section id="explicit-redirect">
          <h2>Explicit redirects</h2>
          <p class="mt-3">
            「成功したら別ページへ」みたいなケースは、action から <span class="font-mono text-zinc-200">redirect()</span> を返します。これは “PRG の Redirect”
            を action が明示するパターン。
          </p>
          <CodeBlock
            title="Explicit redirect"
            lang="ts"
            htmlKey="action_prg_ts"
            code={`import { redirect } from './server/response'\n\naction: async ({ request, env }) => {\n  const fd = await request.formData()\n  const email = fd.get('email')\n\n  if (typeof email !== 'string' || !email.includes('@')) {\n    return { ok: false, error: 'invalid email' }\n  }\n\n  await env.DB.prepare('INSERT INTO users(email) VALUES (?)').bind(email).run()\n  return redirect('/thanks', 303)\n}`}
          />
        </section>

        <section id="patterns">
          <h2>Patterns</h2>
          <p class="mt-3">
            <strong>Intent pattern</strong>（同じフォームで複数ボタン）などは <span class="font-mono text-zinc-200">formData.get('intent')</span> で分岐します。JS を書かなくても十分戦える。
          </p>
          <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-400">
            <div class="font-semibold text-zinc-200">Tip</div>
            返す plain object に <span class="font-mono text-zinc-200">newCount</span> などを入れると、このサイトのフレームワーク実装では flash に同梱されます。
          </div>
        </section>

        <section id="demo">
          <h2>Demo form</h2>
          <p class="mt-3">このページにも CSRF hidden input が入っている。POST すると 303 で戻って flash が出る。</p>
          <form method="post" class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
            <input type="hidden" name="_csrf" value={csrfToken} />
            <div class="flex flex-wrap items-center gap-3">
              <button class="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-white" name="intent" value="inc">
                Submit (inc)
              </button>
              <div class="text-sm text-zinc-400">Try reloading after submit: no “resubmit form” warning.</div>
            </div>
          </form>
        </section>
      </DocArticle>
    </RefChrome>
  )
}
