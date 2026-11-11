import { Badge, ErrorNote, PageHeader } from '@/app/components/ui'
import { adminPayments } from '@/app/lib/services/admin.service'
import { formatUsd, relative } from '@/app/lib/utils/format'

export const metadata = { title: 'Payments' }

export default async function PaymentsPage(): Promise<React.JSX.Element> {
  const payments = await adminPayments()
  if (payments.error !== null) return <ErrorNote message={payments.error} />
  const { orders, webhookEvents, payouts } = payments.data

  return (
    <div className='space-y-10'>
      <PageHeader
        title='Payments'
        description='Orders, PayPal webhook events and payouts, as recorded by the server.'
      />
      <Table
        title='Orders'
        head={[
          'When',
          'Buyer',
          'Kind',
          'Amount',
          'PayPal fee',
          'Status',
          'PayPal ids'
        ]}
        rows={orders.map((order) => [
          relative(order.createdAt),
          order.buyer.displayName,
          order.kind.toLowerCase(),
          formatUsd(order.amountCents),
          order.paypalFeeCents === null ? '—' : formatUsd(order.paypalFeeCents),
          <Badge
            key='s'
            tone={
              order.status === 'COMPLETED'
                ? 'mint'
                : order.status === 'FAILED' || order.status === 'DENIED'
                  ? 'danger'
                  : 'neutral'
            }
          >
            {order.status.toLowerCase()}
            {order.failureReason ? `: ${order.failureReason}` : ''}
          </Badge>,
          <span key='i' className='font-mono text-xs'>
            {[order.paypalOrderId, order.paypalCaptureId]
              .filter(Boolean)
              .join(' / ')}
          </span>
        ])}
      />
      <Table
        title='Webhook events'
        head={['When', 'Type', 'Verified', 'Outcome', 'PayPal ids']}
        rows={webhookEvents.map((event) => [
          relative(event.createdAt),
          <span key='t' className='font-mono text-xs'>
            {event.type}
          </span>,
          <Badge key='v' tone={event.verified ? 'mint' : 'danger'}>
            {event.verified ? 'verified' : 'not verified, ignored'}
          </Badge>,
          event.outcome ?? 'not processed yet',
          <span key='i' className='font-mono text-xs'>
            {[event.paypalEventId, event.resourceId]
              .filter(Boolean)
              .join(' / ')}
          </span>
        ])}
      />
      <Table
        title='Payouts'
        head={['When', 'Contributor', 'Amount', 'Status', 'PayPal ids']}
        rows={payouts.map((payout) => [
          relative(payout.createdAt),
          payout.contributor.user.displayName,
          formatUsd(payout.amountCents),
          `${payout.status.toLowerCase()}${payout.failureReason ? `: ${payout.failureReason}` : ''}`,
          <span key='i' className='font-mono text-xs'>
            {[payout.paypalBatchId, payout.paypalItemId]
              .filter(Boolean)
              .join(' / ')}
          </span>
        ])}
      />
    </div>
  )
}

function Table({
  title,
  head,
  rows
}: {
  title: string
  head: string[]
  rows: React.ReactNode[][]
}): React.JSX.Element {
  return (
    <section className='space-y-3'>
      <h2 className='font-display text-xl font-semibold'>{title}</h2>
      <div className='overflow-x-auto rounded-2xl bg-card ring-1 ring-ink-100'>
        <table className='w-full text-sm'>
          <thead className='text-left text-xs text-ink-500'>
            <tr>
              {head.map((cell) => (
                <th key={cell} className='px-4 py-3'>
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className='px-4 py-6 text-ink-400' colSpan={head.length}>
                  Nothing yet.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={index} className='border-t border-ink-100'>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className='px-4 py-3'>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
