import { formatDistanceToNowStrict } from 'date-fns'

export const formatUsd = (cents: number): string =>
  `${cents < 0 ? '-' : ''}$${(Math.abs(cents) / 100).toFixed(2)}`

export const relative = (iso: string | null | undefined): string =>
  iso ? formatDistanceToNowStrict(new Date(iso), { addSuffix: true }) : ''

/** "in 2 days" for a future deadline, "3 hours ago" for a past one. */
export const deadline = (iso: string | null | undefined): string =>
  iso ? relative(iso) : '—'

export const hours = (h: number): string =>
  h % 24 === 0 ? `${h / 24} day${h === 24 ? '' : 's'}` : `${h} hours`
