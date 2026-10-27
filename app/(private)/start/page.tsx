import Link from 'next/link'
import classNames from 'classnames'
import { PageHeader } from '@/app/components/ui'
import { getGoal, listGoals } from '@/app/lib/services/learner.service'
import { formatUsd, relative } from '@/app/lib/utils/format'
import { StartFlow } from './StartFlow'

export const metadata = { title: 'Learn' }

export default async function StartPage({
  searchParams
}: {
  searchParams: Promise<{ goal?: string; q?: string }>
}): Promise<React.JSX.Element> {
  const { goal: goalId, q } = await searchParams
  const [goal, goals] = await Promise.all([
    goalId ? getGoal(goalId) : null,
    listGoals()
  ])

  return (
    <div className='grid gap-10 lg:grid-cols-[1fr_280px]'>
      <div className='min-w-0'>
        <PageHeader
          title='What are you trying to figure out?'
          description='Describe your situation in your own words. Leave out names, employers and contact details; you decide later what any contributor sees.'
        />
        <StartFlow
          key={goalId ?? 'new'}
          goal={goal?.data ?? null}
          initialText={q ?? ''}
        />
      </div>
      <aside className='space-y-3 lg:pt-2'>
        <h2 className='text-xs font-semibold tracking-wide text-ink-500 uppercase'>
          Your goals
        </h2>
        <Link
          href='/start'
          className='flex items-center gap-2 rounded-2xl bg-zest-300 px-4 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-zest-400'
        >
          <span className='grid h-6 w-6 place-items-center rounded-full bg-ink-900 text-zest-300'>
            +
          </span>
          Start a new goal
        </Link>
        {goals.data?.map((row) => (
          <Link
            key={row.id}
            href={`/start?goal=${row.id}`}
            aria-current={row.id === goalId ? 'page' : undefined}
            className={classNames(
              'block rounded-2xl px-4 py-3 text-sm ring-1 transition-all',
              row.id === goalId
                ? 'bg-ink-900 text-white ring-ink-900'
                : 'bg-card ring-ink-100 hover:ring-mint-300'
            )}
          >
            <span
              className={classNames(
                'line-clamp-2',
                row.id === goalId ? 'text-white' : 'text-ink-700'
              )}
            >
              {row.text}
            </span>
            <span
              className={classNames(
                'mt-1 block text-xs',
                row.id === goalId ? 'text-ink-300' : 'text-ink-400'
              )}
            >
              Budget {formatUsd(row.budgetCents)} · {relative(row.createdAt)}
            </span>
          </Link>
        ))}
      </aside>
    </div>
  )
}
