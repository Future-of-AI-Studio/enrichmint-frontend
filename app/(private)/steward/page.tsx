import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Badge, linkCardStyles, PageHeader } from '@/app/components/ui'
import {
  listStewardSessions,
  startSteward
} from '@/app/lib/services/steward.service'
import { formatUsd, relative } from '@/app/lib/utils/format'
import { StartSteward } from './StartSteward'
import { STAGE_LABELS } from './stages'

export const metadata = { title: 'Steward' }

export default async function StewardHome({
  searchParams
}: {
  searchParams: Promise<{ goal?: string }>
}): Promise<React.JSX.Element> {
  const { goal } = await searchParams
  if (goal) {
    const started = await startSteward({ goalId: goal })
    if (started.error === null) redirect(`/steward/${started.data.id}`)
  }
  const sessions = await listStewardSessions()

  return (
    <div className='grid gap-10 lg:grid-cols-[1fr_320px]'>
      <div>
        <PageHeader
          badge={<Badge tone='ai'>Steward</Badge>}
          title='What are you trying to figure out?'
          description='The steward finds guidance from people who have been through it, helps you apply it, and asks the right person when the guide runs out. It never buys or sends anything without you.'
        />
        <StartSteward />
      </div>
      <aside className='space-y-3'>
        <h2 className='text-sm font-semibold text-ink-500'>
          Your conversations
        </h2>
        {sessions.data?.length ? (
          sessions.data.map((session) => (
            <Link
              key={session.id}
              href={`/steward/${session.id}`}
              className={`block ${linkCardStyles}`}
            >
              <p className='line-clamp-2 text-sm text-ink-900'>
                {session.goal.text}
              </p>
              <p className='mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-500'>
                <Badge>{STAGE_LABELS[session.stage]}</Badge>
                Budget {formatUsd(session.goal.budgetCents)} ·{' '}
                {relative(session.updatedAt)}
              </p>
            </Link>
          ))
        ) : (
          <p className='text-sm text-ink-500'>None yet.</p>
        )}
      </aside>
    </div>
  )
}
