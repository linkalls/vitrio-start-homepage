import { render } from '@potetotown/vitrio/client'
import { CopyButton } from './features/copy'

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

function enhanceCopyButtons() {
  // Legacy way (vanilla JS) - keep for fallback
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('button[data-copy]:not([data-hydrated])'))
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

// Experimental: Island Hydration
function hydrateIslands() {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('button[data-copy]:not([data-hydrated])'))
  
  for (const btn of buttons) {
    const text = btn.getAttribute('data-copy') ?? ''
    if (!text) continue

    // Mark as hydrated to prevent vanilla handler from attaching (if race condition)
    btn.setAttribute('data-hydrated', 'true')
    
    // Mount Vitrio component over the existing button
    // Note: In a real implementation, we would use hydration logic to attach to existing DOM.
    // Here we replace/mount into the parent for demonstration of Vitrio runtime.
    const parent = btn.parentElement
    if (parent) {
      const container = document.createElement('div')
      // Copy classes to container or handle layout... simplified here:
      container.className = "contents" 
      parent.replaceChild(container, btn)
      
      render(() => <CopyButton text={text} />, container)
    }
  }
}

function main() {
  // Try Vitrio hydration first
  hydrateIslands()

  // Fallback to vanilla for non-hydrated elements
  enhanceCopyButtons()

  // Enhance reference pages only if TOC exists (feature detection).
  if (document.querySelector('a[data-toc-link]')) {
    enhanceTocActiveSection()
  }
}

main()
