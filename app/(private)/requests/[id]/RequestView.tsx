'use client'
import { CoinLoader } from '@/app/components/CoinLoader'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { AnswerBlocks } from '@/app/components/AnswerBlocks'
import { FeedbackForm } from '@/app/components/FeedbackForm'
import { LocalTime } from '@/app/components/LocalTime'
import {
  Button,
  Card,
  ErrorNote,
  Field,
  fieldStyles,
  Notice,
  SandboxBadge
} from '@/app/components/ui'
import type { AssistantMessage } from '@/app/lib/types/learner.type'
import type { ContextItem, LearnerRequest } from '@/app/lib/types/request.type'
import {
  applyResponse,
  requestRefund
} from '@/app/lib/services/learner.service'
import {
  cancelRequest,
  closeRequest,
  disputeRequest,
  sendRequest,
  updateRequest
} from '@/app/lib/services/requests.service'
import { SOURCE_TITLES } from '@/app/lib/constants/sections'
import { formatUsd, hours } from '@/app/lib/utils/format'
import { ApproveAndPay } from '../../checkout/ApproveAndPay'

export function RequestView({
  request,
  paypal,
  justPaid,
  plans: initialPlans,
  feedbackGiven
}: {
  request: LearnerRequest
  paypal: { clientId: string | undefined; env: 'sandbox' | 'live' }
  justPaid: boolean
  plans: AssistantMessage[]
  feedbackGiven: ('IMMEDIATE' | 'FOLLOW_UP')[]
}): React.JSX.Element {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const name = request.contributor.user.displayName

  const act = (
    work: () => Promise<{ error: string | null }>,
    success?: string
  ): void => {
    setError(null)
    startTransition(async () => {
      const result = await work()
      if (result.error !== null) return setError(result.error)
      if (success) toast.success(success)
      router.refresh()
    })
  }

  return (
    <div className='space-y-6'>
      {error && <ErrorNote message={error} />}
      {request.state === 'DRAFT' ? (
        <DraftEditor
          request={request}
          pending={pending}
          onError={setError}
          onSend={() => act(() => sendRequest(request.id), 'Request sent')}
        />
      ) : (
        <Card className='space-y-3'>
          <h2 className='text-sm font-semibold text-ink-500'>Your question</h2>
          <p className='text-ink-900'>{request.question}</p>
          <p className='text-sm text-ink-500'>
            Wanted: {request.desiredResponse}
          </p>
          <SharedSummary items={request.contextItems} name={name} />
        </Card>
      )}

      {request.state === 'SENT' && (
        <Notice title={`Waiting for ${name}`}>
          They have until <LocalTime iso={request.acceptBy} /> (
          <LocalTime iso={request.acceptBy} mode='relative' />) to accept or
          decline. You are not charged unless they accept and you then pay.
          <div className='mt-3'>
            <Button
              variant='secondary'
              disabled={pending}
              onClick={() =>
                act(() => cancelRequest(request.id), 'Request cancelled')
              }
            >
              Cancel request
            </Button>
          </div>
        </Notice>
      )}

      {request.state === 'ACCEPTED' && (
        <Card className='space-y-4'>
          <h2 className='font-semibold'>{name} accepted. Pay to confirm.</h2>
          <p className='text-sm text-ink-700'>
            Pay {request.priceLabel} by <LocalTime iso={request.payBy} /> (
            <LocalTime iso={request.payBy} mode='relative' />
            ). The
            {` ${hours(request.deliveryH)}`} delivery clock starts when PayPal
            confirms your payment.
          </p>
          <div className='flex items-center gap-2 text-xs text-ink-500'>
            <SandboxBadge /> Test payment: use a PayPal sandbox buyer account.
          </div>
          <ApproveAndPay
            {...paypal}
            label={`I approve paying ${request.priceLabel} for ${name}’s personal response.`}
            body={{ kind: 'REQUEST', requestId: request.id }}
            successHref={`/requests/${request.id}?paid=1`}
          />
        </Card>
      )}

      {request.state === 'PAID' && (
        <Notice
          tone='mint'
          title={justPaid ? 'Payment confirmed by PayPal (sandbox)' : 'Paid'}
        >
          {name} will deliver by <LocalTime iso={request.deliverBy} /> (
          <LocalTime iso={request.deliverBy} mode='relative' />
          ). If they don’t, you can get a refund straight away.
        </Notice>
      )}

      {request.state === 'OVERDUE' && (
        <Card className='space-y-3'>
          <h2 className='font-semibold text-danger-700'>
            The response is late
          </h2>
          <p className='text-sm text-ink-700'>
            It was due <LocalTime iso={request.deliverBy} mode='relative' />.
            You can wait (they can still deliver), or get a full refund now.
          </p>
          <Button
            variant='danger'
            disabled={pending}
            onClick={() => {
              const order = request.orders.find(
                (row) => row.status === 'COMPLETED'
              )
              if (order)
                act(
                  () =>
                    requestRefund(
                      order.id,
                      'The response was not delivered on time.'
                    ),
                  'Refunded'
                )
            }}
          >
            Refund me
          </Button>
        </Card>
      )}

      {[
        'DECLINED',
        'EXPIRED',
        'PAYMENT_EXPIRED',
        'CANCELLED',
        'REFUNDED',
        'RESOLVED_REFUNDED'
      ].includes(request.state) && (
        <Notice>
          {request.state === 'DECLINED' &&
            `${name} declined this request${request.declineReason ? `: “${request.declineReason}”` : '.'} You were not charged.`}
          {request.state === 'EXPIRED' &&
            `${name} did not answer in time. You were not charged.`}
          {request.state === 'PAYMENT_EXPIRED' &&
            'The payment window closed. You were not charged.'}
          {request.state === 'CANCELLED' &&
            'You cancelled this request. You were not charged.'}
          {(request.state === 'REFUNDED' ||
            request.state === 'RESOLVED_REFUNDED') &&
            'This payment was refunded through PayPal.'}
        </Notice>
      )}

      {request.response && (
        <Delivered
          request={request}
          plans={initialPlans}
          pending={pending}
          feedbackGiven={feedbackGiven}
          onClose={() =>
            act(() => closeRequest(request.id), 'Marked as received')
          }
          onDispute={(reason) =>
            act(
              () => disputeRequest(request.id, reason),
              'Reported to an admin'
            )
          }
        />
      )}

      <details className='text-sm text-ink-500'>
        <summary className='cursor-pointer'>History</summary>
        <ol className='mt-2 space-y-1'>
          {request.transitions.map((step) => (
            <li key={step.id}>
              <LocalTime iso={step.createdAt} />: {step.fromState.toLowerCase()}{' '}
              → {step.toState.toLowerCase()} by {step.actor.toLowerCase()}
              {step.reason ? ` (${step.reason})` : ''}
            </li>
          ))}
        </ol>
      </details>
    </div>
  )
}

function SharedSummary({
  items,
  name
}: {
  items: ContextItem[]
  name: string
}): React.JSX.Element {
  const shared = items.filter((item) => item.share)
  return (
    <div className='text-sm'>
      <p className='font-medium text-ink-700'>Shared with {name}:</p>
      {shared.length === 0 ? (
        <p className='text-ink-500'>Only your question.</p>
      ) : (
        <ul className='list-disc pl-5 text-ink-700'>
          {shared.map((item) => (
            <li key={item.key}>
              {item.label}: {item.value}
            </li>
          ))}
        </ul>
      )}
      {items.length > shared.length && (
        <p className='text-xs text-ink-400'>
          {items.length - shared.length} detail(s) kept private.
        </p>
      )}
    </div>
  )
}

function DraftEditor({
  request,
  pending,
  onError,
  onSend
}: {
  request: LearnerRequest
  pending: boolean
  onError: (message: string) => void
  onSend: () => void
}): React.JSX.Element {
  const router = useRouter()
  const [question, setQuestion] = useState(request.question)
  const [desired, setDesired] = useState(request.desiredResponse)
  const [items, setItems] = useState(request.contextItems)
  const [saving, startSaving] = useTransition()
  const [approved, setApproved] = useState(false)
  const name = request.contributor.user.displayName

  const save = async (): Promise<boolean> => {
    const result = await updateRequest(request.id, {
      question,
      desiredResponse: desired,
      contextItems: items
    })
    if (result.error !== null) {
      onError(result.error)
      return false
    }
    return true
  }

  return (
    <Card className='space-y-5'>
      <Notice title='The assistant prepared this draft. Nothing has been sent.'>
        Edit anything, and choose exactly which details {name} sees.
      </Notice>
      <Field label={`Your question for ${name}`}>
        <textarea
          className={`${fieldStyles} min-h-24`}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </Field>
      <Field label='What kind of answer would help'>
        <input
          className={fieldStyles}
          value={desired}
          onChange={(e) => setDesired(e.target.value)}
        />
      </Field>
      <div className='space-y-2'>
        <p className='text-sm font-medium text-ink-700'>
          Details to share (off means {name} never sees it)
        </p>
        {items.length === 0 && (
          <p className='text-sm text-ink-500'>
            No extra details. {name} will see only your question.
          </p>
        )}
        {items.map((item, index) => (
          <label
            key={item.key}
            className='flex items-start gap-3 rounded-xl px-3 py-2 ring-1 ring-ink-100'
          >
            <input
              type='checkbox'
              className='mt-1 h-4 w-4 accent-mint-600'
              checked={item.share}
              onChange={(e) =>
                setItems(
                  items.map((it, i) =>
                    i === index ? { ...it, share: e.target.checked } : it
                  )
                )
              }
            />
            <span className='flex-1 text-sm'>
              <span className='font-medium'>{item.label}</span>
              <input
                className={`${fieldStyles} mt-1`}
                value={item.value}
                onChange={(e) =>
                  setItems(
                    items.map((it, i) =>
                      i === index ? { ...it, value: e.target.value } : it
                    )
                  )
                }
              />
            </span>
            <button
              type='button'
              className='text-xs text-ink-400 hover:text-danger-700'
              onClick={() => setItems(items.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </label>
        ))}
      </div>
      <div className='rounded-xl bg-ink-100/50 p-4 text-sm text-ink-700'>
        Price {request.priceLabel}. {name} has {hours(request.acceptanceH)} to
        accept. You pay only after they accept, and they deliver within{' '}
        {hours(request.deliveryH)} of your payment. The answer stays private to
        you two; it is not reused for anyone else without a separate agreement.
      </div>
      <label className='flex items-start gap-3 text-sm'>
        <input
          type='checkbox'
          className='mt-0.5 h-4 w-4 accent-mint-600'
          checked={approved}
          onChange={(e) => setApproved(e.target.checked)}
        />
        <span>
          I approve sending this request to {name}, sharing only the ticked
          details. If they accept, I’ll be asked to pay{' '}
          {formatUsd(request.priceCents)}.
        </span>
      </label>
      <div className='flex flex-wrap gap-2'>
        <Button
          disabled={pending || saving || !approved || !question.trim()}
          onClick={() =>
            startSaving(async () => {
              if (await save()) onSend()
            })
          }
        >
          Send request
        </Button>
        <Button
          variant='secondary'
          disabled={saving}
          onClick={() =>
            startSaving(async () => {
              if (await save()) {
                toast.success('Draft saved')
                router.refresh()
              }
            })
          }
        >
          Save draft
        </Button>
      </div>
    </Card>
  )
}

function Delivered({
  request,
  plans: initialPlans,
  pending,
  feedbackGiven,
  onClose,
  onDispute
}: {
  request: LearnerRequest
  plans: AssistantMessage[]
  pending: boolean
  feedbackGiven: ('IMMEDIATE' | 'FOLLOW_UP')[]
  onClose: () => void
  onDispute: (reason: string) => void
}): React.JSX.Element {
  const [plans, setPlans] = useState(initialPlans)
  const [planning, startPlanning] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [disputing, setDisputing] = useState(false)
  const [reason, setReason] = useState('')
  const name = request.contributor.user.displayName
  const response = request.response!

  return (
    <div className='space-y-6'>
      <Card className='space-y-3 ring-human-600/30'>
        <div className='flex items-center justify-between'>
          <h2 className='font-semibold text-human-600'>
            {name}’s personal response
          </h2>
          <span className='text-xs text-ink-400'>
            <LocalTime iso={response.createdAt} mode='relative' />
          </span>
        </div>
        <p className='whitespace-pre-line text-ink-900'>{response.body}</p>
        <p className='text-xs text-ink-400'>
          Private to you and {name}. Self-reported experience, not professional
          advice.
        </p>
      </Card>

      <Card className='space-y-4'>
        <h2 className='font-semibold'>Turn it into next steps</h2>
        {!response.aiUseAllowed ? (
          <Notice>
            {name} asked that AI not use this response. You can still read and
            use it yourself.
          </Notice>
        ) : (
          <>
            {plans.map((plan) => (
              <AnswerBlocks
                key={plan.id}
                blocks={plan.content.blocks ?? []}
                contributorName={name}
                sourceTitles={SOURCE_TITLES}
              />
            ))}
            {error && <ErrorNote message={error} />}
            <Button
              variant='secondary'
              disabled={planning}
              onClick={() =>
                startPlanning(async () => {
                  setError(null)
                  const result = await applyResponse(request.id)
                  if (result.error !== null) return setError(result.error)
                  setPlans((current) => [...current, result.data.message])
                })
              }
            >
              {planning ? (
                <>
                  <CoinLoader size={18} /> Working…
                </>
              ) : plans.length ? (
                'Try another plan'
              ) : (
                'Help me apply this'
              )}
            </Button>
          </>
        )}
      </Card>

      <FeedbackForm
        targetType='RESPONSE'
        targetId={request.id}
        given={feedbackGiven}
      />

      {request.state === 'DELIVERED' && (
        <div className='flex flex-wrap gap-2'>
          <Button variant='secondary' disabled={pending} onClick={onClose}>
            Mark as received
          </Button>
          {disputing ? (
            <div className='flex w-full gap-2'>
              <input
                className={fieldStyles}
                placeholder='What is wrong with the delivery?'
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <Button
                variant='danger'
                disabled={!reason.trim() || pending}
                onClick={() => onDispute(reason)}
              >
                Report
              </Button>
            </div>
          ) : (
            <Button variant='ghost' onClick={() => setDisputing(true)}>
              Report a delivery problem
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
