import {
  Badge,
  Card,
  EmptyState,
  ErrorNote,
  Notice,
  PageHeader,
  SandboxBadge
} from '@/app/components/ui'
import { getEarnings, getMyProfile } from '@/app/lib/services/studio.service'
import { formatUsd, relative } from '@/app/lib/utils/format'
import { PayoutButton } from './PayoutButton'

export const metadata = { title: 'Earnings' }

const PAYOUT_LABEL: Record<
  string,
  [string, 'mint' | 'warn' | 'danger' | 'neutral']
> = {
  REQUESTED: ['Requested', 'warn'],
  PENDING: ['Sent to PayPal, not confirmed yet', 'warn'],
  SUCCESS: ['Transferred', 'mint'],
  FAILED: ['Failed, returned to your balance', 'danger'],
  UNCLAIMED: ['Unclaimed by receiver', 'warn'],
  RETURNED: ['Returned to your balance', 'danger'],
  BLOCKED: ['Blocked by PayPal, returned to balance', 'danger']
}

export default async function EarningsPage(): Promise<React.JSX.Element> {
  const [earnings, profile] = await Promise.all([getEarnings(), getMyProfile()])
  if (earnings.error !== null) return <ErrorNote message={earnings.error} />
  const { balances, sales, payouts } = earnings.data

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Earnings'
        description='Each sale with its fee breakdown, and where the money actually is. An earned balance is money owed to you; only “Transferred” has reached your PayPal.'
        actions={<SandboxBadge />}
      />
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Tile
          label='Earned'
          hint='Your share of completed sales, minus refunds'
          value={balances.earnedCents}
        />
        <Tile
          label='Available to pay out'
          hint='Earned, past the refund hold, not yet requested'
          value={balances.availableCents}
        />
        <Tile
          label='Payout pending'
          hint='Sent to PayPal, not confirmed'
          value={balances.payoutPendingCents}
        />
        <Tile
          label='Transferred'
          hint='Confirmed by PayPal'
          value={balances.transferredCents}
          strong
        />
      </div>

      <Card className='space-y-3'>
        <h2 className='font-semibold'>Pay out</h2>
        {profile.data?.payoutEmail ? (
          <>
            <p className='text-sm text-ink-700'>
              Payouts go to{' '}
              <span className='font-medium'>{profile.data.payoutEmail}</span>{' '}
              through PayPal Payouts (sandbox).
            </p>
            <PayoutButton
              disabled={balances.availableCents < 100}
              amountCents={balances.availableCents}
            />
          </>
        ) : (
          <Notice>
            Add your PayPal (sandbox) email in Settings to receive payouts.
          </Notice>
        )}
      </Card>

      <section className='space-y-3'>
        <h2 className='font-display text-xl font-semibold'>Sales</h2>
        {sales.length === 0 ? (
          <EmptyState title='No sales yet.' />
        ) : (
          <div className='overflow-x-auto rounded-2xl bg-card ring-1 ring-ink-100'>
            <table className='w-full text-sm'>
              <thead className='text-left text-xs text-ink-500'>
                <tr>
                  <th className='px-4 py-3'>Sale</th>
                  <th className='px-4 py-3 text-right'>Price</th>
                  <th className='px-4 py-3 text-right'>
                    Commission ({earnings.data.commissionBps / 100}%)
                  </th>
                  <th className='px-4 py-3 text-right'>Your share</th>
                  <th className='px-4 py-3 text-right'>
                    PayPal fee (paid by platform)
                  </th>
                  <th className='px-4 py-3'>Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className='border-t border-ink-100'>
                    <td className='px-4 py-3'>
                      <p className='font-medium'>
                        {sale.guide?.title ?? 'Personal response'}
                      </p>
                      <p className='text-xs text-ink-400'>
                        {relative(sale.completedAt)}
                      </p>
                    </td>
                    <td className='px-4 py-3 text-right'>
                      {formatUsd(sale.amountCents)}
                    </td>
                    <td className='px-4 py-3 text-right'>
                      -{formatUsd(sale.commissionCents)}
                    </td>
                    <td className='px-4 py-3 text-right font-semibold'>
                      {formatUsd(sale.contributorShareCents)}
                    </td>
                    <td className='px-4 py-3 text-right text-ink-500'>
                      {formatUsd(sale.processingFeePaidByPlatformCents)}
                    </td>
                    <td className='px-4 py-3'>
                      <Badge
                        tone={sale.status === 'COMPLETED' ? 'mint' : 'danger'}
                      >
                        {sale.status === 'COMPLETED'
                          ? 'Paid by buyer'
                          : sale.status.toLowerCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className='space-y-3'>
        <h2 className='font-display text-xl font-semibold'>Payouts</h2>
        {payouts.length === 0 ? (
          <EmptyState title='No payouts yet.' />
        ) : (
          <ul className='space-y-2'>
            {payouts.map((payout) => {
              const [label, tone] = PAYOUT_LABEL[payout.status]
              return (
                <li
                  key={payout.id}
                  className='flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-ink-100'
                >
                  <span className='text-sm'>
                    {formatUsd(payout.amountCents)} to {payout.receiverEmail} ·{' '}
                    {relative(payout.createdAt)}
                    {payout.failureReason && (
                      <span className='block text-xs text-ink-400'>
                        Reason: {payout.failureReason.replaceAll('_', ' ')}
                      </span>
                    )}
                  </span>
                  <Badge tone={tone}>{label}</Badge>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function Tile({
  label,
  hint,
  value,
  strong
}: {
  label: string
  hint: string
  value: number
  strong?: boolean
}): React.JSX.Element {
  return (
    <Card className={strong ? 'ring-mint-300' : ''}>
      <p className='text-sm font-medium text-ink-700'>{label}</p>
      <p className='mt-1 text-3xl font-semibold'>{formatUsd(value)}</p>
      <p className='mt-1 text-xs text-ink-400'>{hint}</p>
    </Card>
  )
}
