export function IslandMarker(p: {
  name: string
  props: unknown
  fallback?: unknown
}) {
  // Keep it simple: JSON in attribute.
  // (Props should be JSON-serializable.)
  const json = JSON.stringify(p.props ?? null)

  return (
    <div data-island={p.name} data-props={json}>
      {p.fallback ?? null}
    </div>
  )
}
