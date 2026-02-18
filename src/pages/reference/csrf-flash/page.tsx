import type { TocLink } from '../../../app/reference'
import { CodeBlock, DocArticle, RefChrome } from '../../../app/reference'

export const client = true

export const loader = () => ({})

export default function Page() {
  const toc: TocLink[] = [
    { href: '#csrf', label: 'CSRF (double submit cookie)' },
    { href: '#csrf-usage', label: 'How to use in forms' },
    { href: '#flash', label: 'Flash cookie' },
    { href: '#flash-read', label: 'Reading flash on client' },
    { href: '#cookie-flags', label: 'Cookie flags' },
  ]

  return (
    <RefChrome
      path="/reference/csrf-flash"
      title="CSRF / Flash"
      subtitle="cookie token + hidden input / one-shot flash cookie。Workers でも state-less に成立する最小セット。"
      toc={toc}
    >
      <DocArticle>
        <section id="csrf">
          <h2>CSRF (double submit cookie)</h2>
          <p class="mt-3">
            vitrio-start は <strong>Double Submit Cookie</strong> パターンです。セッションストアを持たずに成立するので、Workers と相性が良い。
          </p>
          <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-400">
            <ol class="list-decimal space-y-2 pl-5">
              <li>
                GET で CSRF cookie（<span class="font-mono text-zinc-200">vitrio_csrf</span>）を発行
              </li>
              <li>
                SSR で <span class="font-mono text-zinc-200">csrfToken</span> を props に渡す
              </li>
              <li>
                フォームが hidden input <span class="font-mono text-zinc-200">_csrf</span> として送る
              </li>
              <li>POST で cookie と body が一致することを確認</li>
            </ol>
          </div>
          <CodeBlock
            title="Verify logic (same as framework)"
            lang="ts"
            htmlKey="csrf_verify_ts"
            code={`const cookieTok = getCookie(c, 'vitrio_csrf')\nconst bodyTok = String(formData.get('_csrf') ?? '')\nconst ok = !!cookieTok && cookieTok === bodyTok`}
          />
        </section>

        <section id="csrf-usage">
          <h2>How to use in forms</h2>
          <p class="mt-3">
            やることは 1 行。SSR component に渡される <span class="font-mono text-zinc-200">csrfToken</span> を hidden input に入れるだけ。
          </p>
          <CodeBlock
            title="Form"
            lang="html"
            htmlKey="form_html"
            code={`<form method="post">\n  <input type="hidden" name="_csrf" value={csrfToken} />\n  ...\n</form>`}
          />
        </section>

        <section id="flash">
          <h2>Flash cookie</h2>
          <p class="mt-3">
            flash は「次の GET で 1 回だけ読める」データです。action の結果（成功/失敗や軽い payload）を cookie に入れて、GET で読む。
          </p>
          <CodeBlock
            title="Flash write/read (concept)"
            lang="ts"
            htmlKey="flash_readclear_ts"
            code={`// Write (on POST)\nsetCookie(c, 'vitrio_flash', JSON.stringify({ ok: true, at: Date.now() }), {\n  path: '/', httpOnly: true, sameSite: 'Lax'\n})\n\n// Read + clear (on GET)\nconst raw = getCookie(c, 'vitrio_flash')\nsetCookie(c, 'vitrio_flash', '', { path: '/', maxAge: 0 })`}
          />
        </section>

        <section id="flash-read">
          <h2>Reading flash on client</h2>
          <p class="mt-3">
            SSR が <span class="font-mono text-zinc-200">globalThis.__VITRIO_FLASH__</span> に埋め込むと、route を <span class="font-mono">client: true</span>{' '}
            にしたページで toast 表示などが可能です。
          </p>
          <CodeBlock
            title="Client-side read"
            lang="ts"
            htmlKey="flash_client_ts"
            code={`// in client entry\nconst flash = (globalThis as any).__VITRIO_FLASH__\nif (flash?.ok) {\n  console.log('success at', flash.at)\n}`}
          />
        </section>

        <section id="cookie-flags">
          <h2>Cookie flags</h2>
          <div class="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-400">
            <ul class="list-disc space-y-2 pl-5">
              <li>
                <span class="font-mono text-zinc-200">vitrio_csrf</span>: <strong>not HttpOnly</strong>
                （SSR でフォームに埋めるため）。ただし <span class="font-mono">SameSite=Lax</span>。
              </li>
              <li>
                <span class="font-mono text-zinc-200">vitrio_flash</span>: <strong>HttpOnly</strong>
                （JS から読ませない）。GET で即削除。
              </li>
            </ul>
          </div>
        </section>
      </DocArticle>
    </RefChrome>
  )
}
