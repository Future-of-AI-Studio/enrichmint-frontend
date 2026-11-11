import { formatUsd, relative } from '@/app/lib/utils/format'
import { SandboxBadge } from './ui'

/** The PayPal references for one payment, so the buyer can see exactly what PayPal confirmed. */
export function PayPalReceipt({
  amountCents,
  paypalOrderId,
  paypalCaptureId,
  completedAt
}: {
  amountCents: number
  paypalOrderId: string | null
  paypalCaptureId: string | null
  completedAt: string | null
}): React.JSX.Element {
  return (
    <div className='rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-ink-100'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <p className='flex items-center gap-2 font-semibold text-ink-900'>
          Paid {formatUsd(amountCents)} with PayPal
          <SandboxBadge />
        </p>
        {completedAt && (
          <p className='text-xs text-ink-400'>{relative(completedAt)}</p>
        )}
      </div>
      <dl className='mt-2 grid gap-1 text-xs text-ink-500 sm:grid-cols-2'>
        <div>
          <dt className='inline'>PayPal order: </dt>
          <dd className='inline font-mono text-ink-700'>
            {paypalOrderId ?? 'pending'}
          </dd>
        </div>
        <div>
          <dt className='inline'>Capture: </dt>
          <dd className='inline font-mono text-ink-700'>
            {paypalCaptureId ?? 'pending'}
          </dd>
        </div>
      </dl>
      <p className='mt-2 text-xs text-ink-400'>
        Confirmed only after PayPal reported this capture as completed for the
        exact price.
      </p>
    </div>
  )
}
