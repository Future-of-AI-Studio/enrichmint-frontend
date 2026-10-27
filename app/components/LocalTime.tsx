import { relative } from '@/app/lib/utils/format'

/**
 * A time shown in the viewer's own locale and time zone. The server renders it
 * a moment earlier and in its own locale, so React is told to expect a difference.
 */
export function LocalTime({
  iso,
  mode = 'datetime'
}: {
  iso: string | null | undefined
  mode?: 'datetime' | 'date' | 'relative'
}): React.JSX.Element {
  if (!iso) return <>—</>
  const text =
    mode === 'relative'
      ? relative(iso)
      : mode === 'date'
        ? new Date(iso).toLocaleDateString()
        : new Date(iso).toLocaleString()
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {text}
    </time>
  )
}
