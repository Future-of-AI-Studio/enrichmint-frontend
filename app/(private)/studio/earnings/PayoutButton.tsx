'use client'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/app/components/ui'
import { requestPayout } from '@/app/lib/services/studio.service'
import { formatUsd } from '@/app/lib/utils/format'

export function PayoutButton({
  disabled,
  amountCents
}: {
  disabled: boolean
  amountCents: number
}): React.JSX.Element {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <Button
      disabled={disabled || pending}
      onClick={() =>
        startTransition(async () => {
          const result = await requestPayout()
          if (result.error !== null) return void toast.error(result.error)
          if (result.data.status === 'FAILED') {
            toast.error(
              `PayPal did not accept the payout (${result.data.failureReason?.replaceAll('_', ' ')}). The money is still in your balance.`
            )
          } else {
            toast.success(
              `Payout sent to PayPal${result.data.paypalBatchId ? ` (batch ${result.data.paypalBatchId})` : ''}. It shows as transferred once PayPal confirms.`
            )
          }
          router.refresh()
        })
      }
    >
      Pay out {formatUsd(amountCents)}
    </Button>
  )
}
