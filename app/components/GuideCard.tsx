import Link from 'next/link'
import type { PublicGuide } from '@/app/lib/types/guide.type'
import { formatUsd } from '@/app/lib/utils/format'
import { ArrowIcon, Avatar, Badge, DemoBadge } from './ui'
import { FeedbackCounts } from './FeedbackCounts'

export function GuideCard({
  guide,
  href,
  footer
}: {
  guide: PublicGuide
  href?: string
  footer?: React.ReactNode
}): React.JSX.Element {
  const name = guide.contributor.user.displayName
  return (
    <article className='group relative flex h-full flex-col rounded-3xl bg-card p-5 shadow-card ring-1 ring-ink-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-lift hover:ring-mint-300'>
      <div className='relative z-10 mb-4 flex flex-wrap items-center gap-2 self-start'>
        <Badge tone='mint'>{guide.category.name}</Badge>
        {guide.isDemo && <DemoBadge />}
        {!guide.agentAssistAllowed && (
          <Badge
            tone='neutral'
            title='The contributor does not allow AI to read this guide.'
          >
            No AI assistance
          </Badge>
        )}
      </div>
      <h3 className='font-display text-xl leading-snug font-semibold tracking-tight text-ink-900'>
        {/* The stretched link makes the whole card clickable without nesting interactive content. */}
        <Link
          href={href ?? `/guides/${guide.slug}`}
          className='after:absolute after:inset-0 after:rounded-3xl group-hover:text-mint-700'
        >
          {guide.title}
        </Link>
      </h3>
      <div className='mt-3 flex items-center gap-2.5'>
        <Avatar name={name} size='sm' />
        <p className='min-w-0 text-sm text-ink-500'>
          <span className='font-medium text-ink-900'>{name}</span>
          <span className='line-clamp-1'>{guide.contributor.headline}</span>
        </p>
      </div>
      <p className='mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-700'>
        {guide.currentVersion?.summary}
      </p>
      <div className='mt-5 flex items-end justify-between gap-3 border-t border-ink-100 pt-4'>
        <div>
          <p className='text-xs text-ink-400'>Guide price</p>
          <p className='font-display text-2xl font-semibold tracking-tight text-ink-900'>
            {formatUsd(guide.priceCents)}
          </p>
          <FeedbackCounts stats={guide.feedback} compact />
        </div>
        <span className='grid h-10 w-10 place-items-center rounded-full bg-zest-300 text-ink-900 transition-transform duration-200 group-hover:-rotate-45'>
          <ArrowIcon />
        </span>
      </div>
      {footer && (
        <div className='relative z-10 mt-4 rounded-2xl bg-ink-50 p-4'>
          {footer}
        </div>
      )}
    </article>
  )
}
