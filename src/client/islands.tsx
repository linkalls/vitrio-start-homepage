import { render } from '@potetotown/vitrio/client'

export type IslandComponent = (props: any) => unknown
export type IslandRegistry = Record<string, IslandComponent>

export function hydrateIslands(registry: IslandRegistry, root: ParentNode = document) {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-island]'))

  for (const el of nodes) {
    const name = el.getAttribute('data-island') ?? ''
    const Component = registry[name]
    if (!Component) continue

    if (el.getAttribute('data-hydrated') === '1') continue
    el.setAttribute('data-hydrated', '1')

    const raw = el.getAttribute('data-props')
    let props: any = null
    try {
      props = raw ? JSON.parse(raw) : null
    } catch {
      props = null
    }

    // mount/replace (current approach)
    render(() => (Component as any)(props ?? {}), el)
  }
}
