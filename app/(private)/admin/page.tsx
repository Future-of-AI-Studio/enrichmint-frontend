import { Card, ErrorNote, Notice, PageHeader } from '@/app/components/ui'
import {
  adminOverview,
  listContributors
} from '@/app/lib/services/admin.service'
import { formatUsd } from '@/app/lib/utils/format'
import { ContributorActions } from './AdminActions'

export const metadata = { title: 'Admin' }

const QUEUE_LABELS: Record<string, string> = {
  pendingContributors: 'Contributors to approve',
  pendingReviews: 'Guides to review',
  openReports: 'Open reports',
  overdueRequests: 'Overdue requests',
  disputedRequests: 'Disputed requests',
  openRefunds: 'Refunds to decide or retry',
  unverifiedWebhooks: 'Unverified webhooks (ignored)',
  amountMismatches: 'Amount mismatches (refund needed)'
}

export default async function AdminPage(): Promise<React.JSX.Element> {
  const [overview, pending] = await Promise.all([
    adminOverview(),
    listContributors('PENDING')
  ])
  if (overview.error !== null) return <ErrorNote message={overview.error} />
  const { queues, money, ai } = overview.data

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Overview'
        description={`Payments environment: ${overview.data.paymentEnvironment}`}
      />
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {Object.entries(queues).map(([key, value]) => (
          <Card key={key} className={value > 0 ? 'ring-warn-600/30' : ''}>
            <p className='text-sm text-ink-500'>{QUEUE_LABELS[key] ?? key}</p>
            <p className='text-2xl font-semibold'>{value}</p>
          </Card>
        ))}
      </div>
      <Card className='space-y-3'>
        <h2 className='font-semibold'>Money (ledger)</h2>
        <dl className='grid gap-3 text-sm sm:grid-cols-3'>
          {Object.entries(money)
            .filter(([key]) => key !== 'note')
            .map(([key, value]) => (
              <div key={key}>
                <dt className='text-ink-500'>
                  {key
                    .replace(/Cents$/, '')
                    .replace(/([A-Z])/g, ' $1')
                    .toLowerCase()}
                </dt>
                <dd className='font-semibold'>{formatUsd(Number(value))}</dd>
              </div>
            ))}
        </dl>
        <Notice>{String(money.note)}</Notice>
      </Card>
      <Card className='space-y-2'>
        <h2 className='font-semibold'>AI cost</h2>
        <p className='text-sm'>
          Today ${ai.spentTodayUsd.toFixed(4)} of ${ai.dailyBudgetUsd} daily
          cap.
        </p>
        <ul className='text-sm text-ink-500'>
          {ai.byPurpose.map((row) => (
            <li key={row.purpose}>
              {row.purpose}: {row.calls} calls, ${row.costUsd.toFixed(4)}
            </li>
          ))}
        </ul>
      </Card>
      <section className='space-y-3'>
        <h2 className='font-display text-xl font-semibold'>
          Contributors waiting for approval
        </h2>
        {!pending.data?.length ? (
          <p className='text-sm text-ink-500'>None.</p>
        ) : (
          pending.data.map((contributor) => (
            <Card
              key={contributor.id}
              className='flex flex-wrap items-start justify-between gap-4'
            >
              <div className='max-w-xl'>
                <p className='font-medium'>{contributor.user.displayName}</p>
                <p className='text-sm text-ink-500'>{contributor.headline}</p>
                <p className='mt-2 text-sm'>{contributor.background}</p>
              </div>
              <ContributorActions id={contributor.id} />
            </Card>
          ))
        )}
      </section>
    </div>
  )
}
