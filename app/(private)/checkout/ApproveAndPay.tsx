'use client'
import { useState } from 'react'
import { PayPalCheckout } from '@/app/components/PayPalCheckout'

type Body = {
  kind: 'GUIDE' | 'REQUEST'
  guideId?: string
  requestId?: string
  goalId?: string
}

/** Explicit approval first, then PayPal. Every purchase needs this tick; nothing is bought unattended. */
export function ApproveAndPay({
  clientId,
  env,
  label,
  body,
  successHref
}: {
  clientId: string | undefined
  env: 'sandbox' | 'live'
  label: string
  body: Body
  successHref: string
}): React.JSX.Element {
  const [approved, setApproved] = useState(false)

  return (
    <div className='space-y-4'>
      <label className='flex items-start gap-3 rounded-xl bg-mint-50 px-4 py-3 text-sm text-mint-900'>
        <input
          type='checkbox'
          className='mt-0.5 h-4 w-4 accent-mint-600'
          checked={approved}
          onChange={(event) => setApproved(event.target.checked)}
        />
        <span>{label}</span>
      </label>
      <PayPalCheckout
        clientId={clientId}
        env={env}
        body={body}
        approved={approved}
        successHref={successHref}
      />
    </div>
  )
}
