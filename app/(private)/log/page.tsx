import { Badge, EmptyState, ErrorNote, PageHeader } from '@/app/components/ui'
import { stewardshipLog } from '@/app/lib/services/learner.service'
import { relative } from '@/app/lib/utils/format'

export const metadata = { title: 'Stewardship log' }

const SOURCE = {
  LOCAL: 'EnrichMINT rules',
  HCAI: 'HCAI',
  HCAI_UNAVAILABLE: 'Local rules (HCAI unavailable)'
}

export default async function LogPage(): Promise<React.JSX.Element> {
  const log = await stewardshipLog()
  return (
    <div className='mx-auto max-w-3xl'>
      <PageHeader
        title='When the system stepped in for you'
        description='Every time a budget, permission or approval rule stopped or changed something, it is recorded here in plain language.'
      />
      {log.error !== null ? (
        <ErrorNote message={log.error} />
      ) : log.data.length === 0 ? (
        <EmptyState title='Nothing yet.'>
          Interventions such as a blocked over-budget purchase will appear here.
        </EmptyState>
      ) : (
        <ul className='space-y-3'>
          {log.data.map((entry) => (
            <li
              key={entry.id}
              className='rounded-2xl bg-card p-4 ring-1 ring-ink-100'
            >
              <div className='mb-1 flex flex-wrap items-center gap-2 text-xs'>
                <Badge
                  tone={
                    entry.outcome === 'DENY'
                      ? 'danger'
                      : entry.outcome === 'WARN'
                        ? 'warn'
                        : 'mint'
                  }
                >
                  {entry.outcome === 'DENY'
                    ? 'Stopped'
                    : entry.outcome === 'WARN'
                      ? 'Warning'
                      : 'Noted'}
                </Badge>
                <span className='text-ink-400'>
                  {SOURCE[entry.source]} · {relative(entry.createdAt)}
                </span>
              </div>
              <p className='text-sm text-ink-900'>{entry.plainReason}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
