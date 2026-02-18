import { hydrateIslands } from './islands'
import { islands } from './islands.gen'

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text)
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      ta.style.top = '0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      ok ? resolve() : reject(new Error('copy failed'))
    } catch (e) {
      reject(e)
    }
  })
}

function enhanceCopyButtonsFallback() {
  // Legacy way (vanilla JS) - keep for no-island cases
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('button[data-copy]:not([data-hydrated])'),
  )

  for (const btn of buttons) {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy') ?? ''
      if (!text) return

      const prev = btn.textContent
      try {
        await copyToClipboard(text)
        btn.textContent = 'Copied'
        btn.setAttribute('data-copied', '1')
        setTimeout(() => {
          btn.textContent = prev ?? 'Copy'
          btn.removeAttribute('data-copied')
        }, 1200)
      } catch {
        btn.textContent = 'Failed'
        setTimeout(() => {
          btn.textContent = prev ?? 'Copy'
        }, 1200)
      }
    })
  }
}

function enhanceTocActiveSection() {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[data-toc-link]'))
  if (!links.length) return

  const byHash = new Map<string, HTMLAnchorElement>()
  for (const a of links) {
    const href = a.getAttribute('href') || ''
    if (href.startsWith('#')) byHash.set(href, a)
  }

  const headings = Array.from(document.querySelectorAll<HTMLElement>('h2[id]'))
  if (!headings.length) return

  const setActive = (id: string | null) => {
    for (const a of links) a.removeAttribute('data-active')
    if (!id) return
    const a = byHash.get('#' + id)
    if (a) a.setAttribute('data-active', '1')
  }

  if ('IntersectionObserver' in globalThis) {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top ?? 0) - (b.boundingClientRect.top ?? 0))
        const first = visible[0]?.target as HTMLElement | undefined
        setActive(first?.id ?? null)
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: [0, 1] },
    )

    for (const h of headings) obs.observe(h)
    setActive(headings[0].id)
    return
  }

  const onScroll = () => {
    const y = window.scrollY
    let current: HTMLElement | null = null
    for (const h of headings) {
      if (h.offsetTop - 120 <= y) current = h
      else break
    }
    setActive(current?.id ?? headings[0].id)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
}

function main() {
  hydrateIslands(islands)

  // Fallback to vanilla for any leftover non-island copy buttons
  enhanceCopyButtonsFallback()

  if (document.querySelector('a[data-toc-link]')) {
    enhanceTocActiveSection()
  }
}

main()
