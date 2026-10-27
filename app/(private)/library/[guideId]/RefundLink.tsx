'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button, fieldStyles } from '@/app/components/ui'
import { requestRefund } from '@/app/lib/services/learner.service'

export function RefundLink({
  orderId
}: {
  orderId: string
}): React.JSX.Element {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [pending, startTransition] = useTransition()

  if (!open) {
    return (
      <button
        className='text-xs text-ink-400 underline hover:text-ink-700'
        onClick={() => setOpen(true)}
      >
        Something wrong? Ask for a refund
      </button>
    )
  }
  return (
    <div className='space-y-2 rounded-xl bg-ink-100/50 p-4'>
      <p className='text-sm text-ink-700'>
        An admin reviews refund requests. If approved, PayPal returns the money
        and the guide leaves your library.
      </p>
      <textarea
        className={fieldStyles}
        placeholder='What went wrong?'
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <Button
        variant='secondary'
        disabled={pending || !reason.trim()}
        onClick={() =>
          startTransition(async () => {
            const result = await requestRefund(orderId, reason)
            if (result.error !== null) return void toast.error(result.error)
            toast.success(
              result.data.status === 'COMPLETED'
                ? 'Refunded'
                : 'Refund requested'
            )
            setOpen(false)
            router.refresh()
          })
        }
      >
        Request refund
      </Button>
    </div>
  )
}
