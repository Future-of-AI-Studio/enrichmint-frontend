'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Button,
  Card,
  ErrorNote,
  Field,
  fieldStyles,
  Notice
} from '@/app/components/ui'
import { LocalTime } from '@/app/components/LocalTime'
import type { ContributorRequest } from '@/app/lib/types/request.type'
import {
  acceptRequest,
  declineRequest,
  deliverRequest
} from '@/app/lib/services/requests.service'
import { formatUsd, hours } from '@/app/lib/utils/format'

export function InboxRequestView({
  request
}: {
  request: ContributorRequest
}): React.JSX.Element {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [declineReason, setDeclineReason] = useState('')
  const [body, setBody] = useState('')
  const [aiUse, setAiUse] = useState(true)
  const [pending, startTransition] = useTransition()

  const act = (
    work: () => Promise<{ error: string | null; data?: unknown }>,
    success: string
  ): void => {
    setError(null)
    startTransition(async () => {
      const result = await work()
      if (result.error !== null) return setError(result.error)
      toast.success(success)
      const data = result.data as ContributorRequest | undefined
      if (data?.warnings?.length) setWarnings(data.warnings)
      router.refresh()
    })
  }

  return (
    <div className='space-y-6'>
      {error && <ErrorNote message={error} />}
      {warnings.map((warning) => (
        <Notice key={warning} tone='warn'>
          {warning}
        </Notice>
      ))}
      <Card className='space-y-4'>
        <div>
          <h2 className='text-sm font-semibold text-ink-500'>Question</h2>
          <p className='mt-1 whitespace-pre-line'>{request.question}</p>
        </div>
        <div>
          <h2 className='text-sm font-semibold text-ink-500'>
            What would help
          </h2>
          <p className='mt-1'>{request.desiredResponse}</p>
        </div>
        <div>
          <h2 className='text-sm font-semibold text-ink-500'>
            What {request.learnerFirstName} chose to share
          </h2>
          {request.sharedContext.length === 0 ? (
            <p className='mt-1 text-sm text-ink-500'>
              Nothing beyond the question.
            </p>
          ) : (
            <ul className='mt-1 list-disc pl-5 text-sm'>
              {request.sharedContext.map((item) => (
                <li key={item.label}>
                  {item.label}: {item.value}
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className='text-sm text-ink-700'>
          Pays {formatUsd(request.priceCents)} (you receive{' '}
          {formatUsd(Math.round(request.priceCents * 0.85))}). Deliver within{' '}
          {hours(request.deliveryH)} of payment.
        </p>
      </Card>

      {request.state === 'SENT' && (
        <Card className='space-y-4'>
          <p className='text-sm'>
            Accept or decline by <LocalTime iso={request.acceptBy} /> (
            <LocalTime iso={request.acceptBy} mode='relative' />
            ). If you accept, {request.learnerFirstName} is asked to pay; the
            delivery clock starts only once PayPal confirms it.
          </p>
          <div className='flex flex-wrap gap-2'>
            <Button
              disabled={pending}
              onClick={() => act(() => acceptRequest(request.id), 'Accepted')}
            >
              Accept
            </Button>
          </div>
          <Field label='Or decline (optional reason)'>
            <div className='flex gap-2'>
              <input
                className={fieldStyles}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
              />
              <Button
                variant='secondary'
                disabled={pending}
                onClick={() =>
                  act(
                    () =>
                      declineRequest(request.id, declineReason || undefined),
                    'Declined'
                  )
                }
              >
                Decline
              </Button>
            </div>
          </Field>
        </Card>
      )}

      {request.state === 'ACCEPTED' && (
        <Notice>
          Waiting for {request.learnerFirstName} to pay (by{' '}
          <LocalTime iso={request.payBy} mode='relative' />
          ). Don’t start writing until it shows as paid.
        </Notice>
      )}

      {(request.state === 'PAID' || request.state === 'OVERDUE') && (
        <Card className='space-y-4'>
          <Notice
            tone={request.state === 'OVERDUE' ? 'warn' : 'mint'}
            title={
              request.state === 'OVERDUE'
                ? 'Past the delivery time'
                : 'Paid. Your turn.'
            }
          >
            {request.state === 'OVERDUE' ? (
              <>
                This was due{' '}
                <LocalTime iso={request.deliverBy} mode='relative' />. You can
                still deliver, but {request.learnerFirstName} can now get a
                refund.
              </>
            ) : (
              <>
                Deliver by <LocalTime iso={request.deliverBy} /> (
                <LocalTime iso={request.deliverBy} mode='relative' />
                ).
              </>
            )}
          </Notice>
          <Field
            label='Your response'
            hint='Share what you actually did or would do, and say where you are unsure. Avoid promising results.'
          >
            <textarea
              className={`${fieldStyles} min-h-48`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </Field>
          <label className='flex items-start gap-3 text-sm'>
            <input
              type='checkbox'
              className='mt-0.5 h-4 w-4 accent-mint-600'
              checked={aiUse}
              onChange={(e) => setAiUse(e.target.checked)}
            />
            <span>
              Let {request.learnerFirstName}’s AI assistant read this response
              to help them apply it.
              <span className='block text-xs text-ink-500'>
                It stays private to the two of you either way, and is never
                reused for anyone else.
              </span>
            </span>
          </label>
          <Button
            disabled={pending || body.trim().length < 20}
            onClick={() =>
              act(() => deliverRequest(request.id, body, aiUse), 'Delivered')
            }
          >
            Deliver response
          </Button>
        </Card>
      )}

      {request.response && (
        <Card className='space-y-2'>
          <h2 className='font-semibold'>Your delivered response</h2>
          <p className='whitespace-pre-line text-sm'>{request.response.body}</p>
          <p className='text-xs text-ink-400'>
            AI use: {request.response.aiUseAllowed ? 'allowed' : 'not allowed'}
          </p>
        </Card>
      )}

      {[
        'DECLINED',
        'EXPIRED',
        'PAYMENT_EXPIRED',
        'CANCELLED',
        'REFUNDED',
        'RESOLVED_REFUNDED',
        'DISPUTED',
        'RESOLVED_UPHELD',
        'CLOSED'
      ].includes(request.state) && (
        <Notice>
          {request.state === 'DISPUTED'
            ? 'The learner reported a problem. An admin will review it; your payment for agreed work does not depend on ratings.'
            : `This request is ${request.state.toLowerCase().replaceAll('_', ' ')}.`}
        </Notice>
      )}
    </div>
  )
}
