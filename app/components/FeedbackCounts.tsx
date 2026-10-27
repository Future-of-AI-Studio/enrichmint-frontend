import type { FeedbackStats } from '@/app/lib/types/guide.type'

/**
 * Separate counts, never a single score. Immediate reactions and reported
 * follow-through are shown apart, and nothing here is verified.
 */
export function FeedbackCounts({
  stats,
  compact = false
}: {
  stats: FeedbackStats
  compact?: boolean
}): React.JSX.Element {
  if (stats.responses === 0 && stats.followUps === 0) {
    return <span className='text-xs text-ink-400'>No feedback yet</span>
  }
  if (compact) {
    return (
      <span
        className='text-xs text-ink-500'
        title='Self-reported by buyers. Not verified.'
      >
        {stats.foundRelevant}/{stats.responses} found it relevant
      </span>
    )
  }
  return (
    <dl className='grid grid-cols-2 gap-3 text-sm sm:grid-cols-4'>
      <Stat label='Responses' value={stats.responses} />
      <Stat label='Found it relevant' value={stats.foundRelevant} />
      <Stat label='Found a next step' value={stats.foundNextStep} />
      <Stat
        label='Tried it, still useful'
        value={`${stats.usefulAfterTrying}/${stats.triedIt}`}
        hint={`${stats.followUps} follow-up answers`}
      />
      <p className='col-span-full text-xs text-ink-400'>
        Self-reported by people who bought it. Not verified, and not a measure
        of anyone’s competence.
      </p>
    </dl>
  )
}

function Stat({
  label,
  value,
  hint
}: {
  label: string
  value: number | string
  hint?: string
}): React.JSX.Element {
  return (
    <div className='rounded-2xl bg-card px-4 py-3 shadow-card ring-1 ring-ink-100'>
      <dt className='text-xs text-ink-500'>{label}</dt>
      <dd className='font-display text-2xl font-semibold tracking-tight text-ink-900'>
        {value}
      </dd>
      {hint && <dd className='text-xs text-ink-400'>{hint}</dd>}
    </div>
  )
}
