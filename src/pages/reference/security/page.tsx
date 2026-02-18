import type { TocLink } from '../../../app/reference'
import { CodeBlock, DocArticle, RefChrome } from '../../../app/reference'

export const client = true

export const loader = () => ({})

export default function Page() {
  const toc: TocLink[] = [
    { href: '#baseline', label: 'Baseline headers' },
    { href: '#csp', label: 'CSP' },
  ]

  return (
    <RefChrome path="/reference/security" title="Security" subtitle="最低限のヘッダ + CSPは現実的に。" toc={toc}>
      <DocArticle>
        <section id="baseline">
          <h2>Baseline headers</h2>
          <p class="mt-3">まずはこれだけでだいぶマシになる。</p>
          <CodeBlock
            title="headers"
            lang="text"
            htmlKey="headers_text"
            code={`X-Content-Type-Options: nosniff\nReferrer-Policy: strict-origin-when-cross-origin\nContent-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'`}
          />
        </section>
        <section id="csp">
          <h2>CSP</h2>
          <p class="mt-3">プロダクトに合わせて締める前提。最初から完璧はしんどいので段階的にやる。</p>
        </section>
      </DocArticle>
    </RefChrome>
  )
}
