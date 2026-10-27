'use client'
import { CoinLoader } from '@/app/components/CoinLoader'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { AnswerBlocks } from '@/app/components/AnswerBlocks'
import {
  Button,
  Card,
  ErrorNote,
  fieldStyles,
  Notice
} from '@/app/components/ui'
import type {
  AssistantMessage,
  RequestOffer
} from '@/app/lib/types/learner.type'
import { askAssistant } from '@/app/lib/services/learner.service'
import { draftRequest } from '@/app/lib/services/requests.service'
import { SOURCE_TITLES } from '@/app/lib/constants/sections'
import { formatUsd, hours } from '@/app/lib/utils/format'

export function AssistantPanel({
  guideId,
  goalId,
  contributorName,
  initial,
  quota: initialQuota
}: {
  guideId: string
  goalId?: string
  contributorName: string
  initial: AssistantMessage[]
  quota: { limit: number; used: number }
}): React.JSX.Element {
  const router = useRouter()
  const [messages, setMessages] = useState(initial)
  const [quota, setQuota] = useState(initialQuota)
  const [question, setQuestion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const left = quota.limit - quota.used

  const ask = (): void => {
    const text = question.trim()
    if (!text) return
    setError(null)
    startTransition(async () => {
      const result = await askAssistant(guideId, text, goalId)
      if (result.error !== null) return setError(result.error)
      setMessages((current) => [
        ...current,
        {
          id: `local-${Date.now()}`,
          role: 'user',
          content: { text },
          flags: [],
          createdAt: new Date().toISOString()
        },
        result.data.message
      ])
      setQuota(result.data.quota)
      setQuestion('')
    })
  }

  const prepareRequest = (gapQuestion: string): void => {
    setError(null)
    startTransition(async () => {
      const result = await draftRequest(guideId, gapQuestion, goalId)
      if (result.error !== null) return setError(result.error)
      router.push(`/requests/${result.data.id}`)
    })
  }

  return (
    <Card className='flex max-h-[80vh] flex-col gap-4 p-5'>
      <div className='flex items-center justify-between'>
        <h2 className='font-semibold'>Apply this guide</h2>
        <span className='text-xs text-ink-500'>
          {left} of {quota.limit} questions left
        </span>
      </div>
      <div className='flex-1 space-y-4 overflow-y-auto'>
        {messages.length === 0 && (
          <Notice>
            Ask how the guide applies to your situation. Answers show what the
            contributor actually said, what the AI suggests, and what the guide
            does not cover.
          </Notice>
        )}
        {messages.map((message) =>
          message.role === 'user' ? (
            <div
              key={message.id}
              className='ml-8 rounded-xl bg-ink-100/60 px-3 py-2 text-sm'
            >
              {message.content.text}
            </div>
          ) : (
            <div key={message.id} className='space-y-2'>
              {message.flags.includes('source_permission_withdrawn') && (
                <p className='text-xs text-warn-600'>
                  Given before the contributor withdrew AI permission. Kept for
                  your records.
                </p>
              )}
              <AnswerBlocks
                blocks={message.content.blocks ?? []}
                contributorName={contributorName}
                sourceTitles={SOURCE_TITLES}
              />
              {message.content.warnings?.map((warning) => (
                <p key={warning} className='text-xs text-warn-600'>
                  {warning}
                </p>
              ))}
              {message.content.gap && (
                <GapOffer
                  gap={message.content.gap}
                  offer={message.content.requestOffer ?? null}
                  pending={pending}
                  onPrepare={prepareRequest}
                />
              )}
            </div>
          )
        )}
      </div>
      {error && <ErrorNote message={error} />}
      <div className='space-y-2'>
        <textarea
          className={`${fieldStyles} min-h-20`}
          placeholder={
            left > 0
              ? 'e.g. How would this work for me with only weekends free?'
              : 'No questions left'
          }
          value={question}
          disabled={left <= 0}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <Button
          className='w-full'
          disabled={pending || left <= 0 || !question.trim()}
          onClick={ask}
        >
          {pending ? (
            <>
              <CoinLoader size={18} /> Thinking…
            </>
          ) : (
            'Ask'
          )}
        </Button>
        <p className='text-xs text-ink-400'>
          Don’t include names or contact details. The AI only reads this guide
          because the contributor allows it.
        </p>
      </div>
    </Card>
  )
}

function GapOffer({
  gap,
  offer,
  pending,
  onPrepare
}: {
  gap: { question: string; reason: string | null }
  offer: RequestOffer | null
  pending: boolean
  onPrepare: (question: string) => void
}): React.JSX.Element {
  return (
    <div className='rounded-xl border border-mint-300 bg-mint-50 p-3 text-sm'>
      <p className='font-semibold text-mint-800'>
        The guide doesn’t answer this
      </p>
      {gap.reason && <p className='mt-1 text-mint-900'>{gap.reason}</p>}
      {offer?.available ? (
        <div className='mt-2 space-y-2'>
          <p className='text-mint-900'>
            You can ask {offer.contributorName} for a personal written answer
            for {formatUsd(offer.priceCents)}. They have{' '}
            {hours(offer.acceptanceH)} to accept, then deliver within{' '}
            {hours(offer.deliveryH)} of your payment.
          </p>
          {!offer.withinBudget && (
            <p className='text-danger-700'>
              This is over your remaining budget (
              {formatUsd(offer.remainingBudgetCents ?? 0)}). You can still
              prepare it, but it cannot be sent unless you raise your budget.
            </p>
          )}
          <Button
            variant='secondary'
            disabled={pending}
            onClick={() => onPrepare(gap.question)}
          >
            Prepare a request (nothing is sent yet)
          </Button>
        </div>
      ) : (
        <p className='mt-2 text-mint-900'>
          {offer?.contributorName ?? 'The contributor'} is not taking personal
          requests right now.
        </p>
      )}
    </div>
  )
}
