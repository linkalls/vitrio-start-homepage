// Client-side component for Copy button
// This will be hydrated
import { v, use } from '@potetotown/vitrio'

export function CopyButton(props: { text: string }) {
  const copied = v(false)
  const [isCopied, setCopied] = use(copied)

  const copy = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return
    }

    // Fallback for older browsers / permission issues
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
    if (!ok) throw new Error('copy failed')
  }

  const handleClick = async () => {
    try {
      await copy(props.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // keep silent; UI stays "Copy"
    }
  }

  return (
    <button
      type="button"
      class="rounded-md border border-zinc-800 bg-zinc-950/40 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-950 cursor-pointer"
      onClick={handleClick}
    >
      {() => (isCopied ? 'Copied' : 'Copy')}
    </button>
  )
}
