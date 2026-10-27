import { Badge, Card, EmptyState, PageHeader } from '@/app/components/ui'
import {
  adminRefunds,
  adminReports,
  attentionRequests
} from '@/app/lib/services/admin.service'
import { deadline, formatUsd, relative } from '@/app/lib/utils/format'
import {
  FastForward,
  RefundActions,
  ReportActions,
  RequestCaseActions
} from '../AdminActions'

export const metadata = { title: 'Cases' }

export default async function CasesPage({
  searchParams
}: {
  searchParams: Promise<{ request?: string }>
}): Promise<React.JSX.Element> {
  const { request: demoRequestId } = await searchParams
  const [refunds, reports, requests] = await Promise.all([
    adminRefunds(),
    adminReports(),
    attentionRequests()
  ])
  const open =
    refunds.data?.filter((refund) =>
      ['REQUESTED', 'FAILED'].includes(refund.status)
    ) ?? []

  return (
    <div className='space-y-10'>
      <PageHeader title='Refunds, reports and late requests' />

      <section className='space-y-3'>
        <h2 className='font-display text-xl font-semibold'>Refund requests</h2>
        {open.length === 0 ? (
          <EmptyState title='No refunds waiting.' />
        ) : (
          open.map((refund) => (
            <Card
              key={refund.id}
              className='flex flex-wrap items-center justify-between gap-4'
            >
              <div>
                <p className='font-medium'>
                  {formatUsd(refund.amountCents)} ·{' '}
                  {refund.order.kind.toLowerCase()} ·{' '}
                  {relative(refund.createdAt)}
                </p>
                <p className='text-sm text-ink-700'>{refund.reason}</p>
                {refund.status === 'FAILED' && (
                  <p className='text-sm text-danger-700'>
                    {refund.decisionNote}
                  </p>
                )}
              </div>
              {refund.status === 'REQUESTED' && (
                <RefundActions id={refund.id} />
              )}
            </Card>
          ))
        )}
      </section>

      <section className='space-y-3'>
        <h2 className='font-display text-xl font-semibold'>
          Requests needing attention
        </h2>
        {!requests.data?.length ? (
          <EmptyState title='Nothing overdue or disputed.' />
        ) : (
          requests.data.map((request) => (
            <Card key={request.id} className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Badge tone='danger'>{request.state.toLowerCase()}</Badge>
                <span className='text-sm text-ink-500'>
                  {formatUsd(request.priceCents)} · due{' '}
                  {deadline(request.deliverBy)}
                </span>
              </div>
              <p className='text-sm'>{request.question}</p>
              <RequestCaseActions id={request.id} state={request.state} />
            </Card>
          ))
        )}
      </section>

      <section className='space-y-3'>
        <h2 className='font-display text-xl font-semibold'>Reports</h2>
        {!reports.data?.length ? (
          <EmptyState title='No reports.' />
        ) : (
          reports.data.map((report) => (
            <Card key={report.id} className='space-y-2'>
              <div className='flex items-center gap-2 text-sm'>
                <Badge tone={report.status === 'OPEN' ? 'warn' : 'neutral'}>
                  {report.status.toLowerCase()}
                </Badge>
                {report.targetType.toLowerCase()} · from{' '}
                {report.reporter.displayName} · {relative(report.createdAt)}
              </div>
              <p className='text-sm'>{report.reason}</p>
              {report.status === 'OPEN' ? (
                <ReportActions id={report.id} />
              ) : (
                <p className='text-sm text-ink-500'>{report.resolution}</p>
              )}
            </Card>
          ))
        )}
      </section>

      <DemoTools requestId={demoRequestId} />
    </div>
  )
}

function DemoTools({ requestId }: { requestId?: string }): React.JSX.Element {
  return (
    <section className='space-y-2 rounded-2xl border border-dashed border-warn-600/40 p-5'>
      <h2 className='font-semibold text-warn-600'>
        Demo tools (simulated, off in production)
      </h2>
      <p className='text-sm text-ink-500'>
        To show expiry and missed-delivery handling without waiting days, paste
        a request id (from its URL) and simulate its current deadline passing.
        Every simulated step is written to the request history as SIMULATED.
      </p>
      <DemoForm />
      {requestId && (
        <div className='flex items-center gap-3 text-sm'>
          <span className='font-mono text-xs'>{requestId}</span>
          <FastForward id={requestId} />
        </div>
      )}
    </section>
  )
}

function DemoForm(): React.JSX.Element {
  return (
    <form action='/admin/cases' className='flex gap-2'>
      <input
        name='request'
        placeholder='Request id'
        className='rounded-lg px-3 py-2 text-sm ring-1 ring-ink-200'
      />
      <button className='rounded-lg px-3 text-sm ring-1 ring-ink-200'>
        Open
      </button>
    </form>
  )
}
