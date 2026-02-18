// Client-side component for Copy button
// This will be hydrated
import { v, use } from '@potetotown/vitrio'

export function CopyButton(props: { text: string }) {
  const copied = v(false)
  const [isCopied, setCopied] = use(copied)

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(props.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // fallback
    }
  }

  return (
    <button
      type="button"
      class="rounded-md border border-zinc-800 bg-zinc-950/40 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-950 cursor-pointer"
      onclick={handleClick}
    >
      {() => (isCopied ? 'Copied' : 'Copy')}
    </button>
  )
}
