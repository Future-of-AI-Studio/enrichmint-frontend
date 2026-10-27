'use client'
import { CoinLoader } from '@/app/components/CoinLoader'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { GuideCard } from '@/app/components/GuideCard'
import {
  ArrowIcon,
  Badge,
  Button,
  ButtonLink,
  Card,
  ErrorNote,
  Field,
  fieldStyles,
  Notice
} from '@/app/components/ui'
import type { Goal, Recommendations } from '@/app/lib/types/learner.type'
import {
  answerGoal,
  recommend,
  updateBudget
} from '@/app/lib/services/learner.service'
import { startSteward } from '@/app/lib/services/steward.service'
import { formatUsd } from '@/app/lib/utils/format'

const EXAMPLE =
  'My support role is changing because of AI. I want to explore freelancing, but I don’t know where to start. I have weekends available.'

export function StartFlow({
  goal: initial,
  initialText = ''
}: {
  goal: Goal | null
  initialText?: string
}): React.JSX.Element {
  const router = useRouter()
  const [goal, setGoal] = useState(initial)
  const [text, setText] = useState(initialText)
  const [budget, setBudget] = useState('20')
  const [answer, setAnswer] = useState('')
  const [recs, setRecs] = useState<Recommendations | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const run = (work: () => Promise<void>): void => {
    setError(null)
    startTransition(work)
  }

  if (!goal) {
    return (
      <Card className='space-y-5 p-6 sm:p-8'>
        {error && <ErrorNote message={error} />}
        <Field label='Your situation and goal'>
          <textarea
            className={`${fieldStyles} min-h-40 resize-y leading-relaxed`}
            placeholder={EXAMPLE}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </Field>
        <button
          type='button'
          className='rounded-full bg-ink-50 px-3 py-1 text-xs font-medium text-ink-700 ring-1 ring-ink-100 transition-colors hover:bg-zest-100'
          onClick={() => setText(EXAMPLE)}
        >
          Use the example
        </button>
        <div className='flex flex-wrap items-end justify-between gap-4 border-t border-ink-100 pt-5'>
          <Field
            label='Total budget for this goal (USD)'
            hint='Enforced: nothing can be bought or requested past it.'
          >
            <span className='relative block w-40'>
              <span className='pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-ink-400'>
                $
              </span>
              <input
                className={`${fieldStyles} pl-7`}
                inputMode='decimal'
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
              />
            </span>
          </Field>
          <Button
            size='lg'
            disabled={pending || text.trim().length < 10}
            onClick={() =>
              run(async () => {
                const cents = Math.round(Number(budget) * 100)
                if (!Number.isFinite(cents) || cents < 0) {
                  setError('Enter a budget like 20 or 35.50.')
                  return
                }
                const result = await startSteward({ text, budgetCents: cents })
                if (result.error !== null) return setError(result.error)
                router.push(`/steward/${result.data.id}`)
              })
            }
          >
            {pending ? (
              <>
                <CoinLoader size={18} /> Thinking…
              </>
            ) : (
              'Continue'
            )}
            {!pending && <ArrowIcon />}
          </Button>
        </div>
      </Card>
    )
  }

  const asked = goal.messages.filter(
    (message) => message.role === 'assistant'
  ).length

  return (
    <div className='space-y-6'>
      {error && <ErrorNote message={error} />}
      <Card className='space-y-4'>
        <div className='ml-auto max-w-[85%] rounded-3xl rounded-br-md bg-ink-900 px-5 py-3 text-white'>
          {goal.text}
        </div>
        {goal.messages.map((message, index) => (
          <div
            key={index}
            className={
              message.role === 'assistant'
                ? 'mr-auto max-w-[85%] rounded-3xl rounded-bl-md bg-ai-50 px-5 py-3 text-ink-900 ring-1 ring-ai-600/15'
                : 'ml-auto max-w-[85%] rounded-3xl rounded-br-md bg-ink-900 px-5 py-3 text-white'
            }
          >
            {message.role === 'assistant' && (
              <span className='mb-1 block text-xs font-semibold text-ai-600 uppercase'>
                Assistant
              </span>
            )}
            {message.text}
          </div>
        ))}
        {goal.pendingQuestion && (
          <div className='flex gap-2'>
            <input
              className={fieldStyles}
              placeholder='Your answer (or skip)'
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
            />
            <Button
              disabled={pending || !answer.trim()}
              onClick={() =>
                run(async () => {
                  const result = await answerGoal(goal.id, answer)
                  if (result.error !== null) return setError(result.error)
                  setGoal(result.data)
                  setAnswer('')
                })
              }
            >
              Answer
            </Button>
          </div>
        )}
        <BudgetBar goal={goal} onChange={setGoal} onError={setError} />
        <div className='flex flex-wrap items-center gap-3'>
          <Button
            disabled={pending}
            onClick={() =>
              run(async () => {
                const result = await recommend(goal.id)
                if (result.error !== null) return setError(result.error)
                setRecs(result.data)
              })
            }
          >
            {pending
              ? 'Looking…'
              : recs
                ? 'Look again'
                : goal.pendingQuestion
                  ? 'Skip and find guidance'
                  : 'Find guidance'}
          </Button>
          {asked > 0 && (
            <span className='text-xs text-ink-400'>
              The assistant asks at most two questions.
            </span>
          )}
        </div>
      </Card>

      {recs && (
        <section className='space-y-4'>
          <Notice
            tone={recs.noneSuitable ? 'warn' : 'neutral'}
            title={recs.aiUsed ? 'Assistant' : 'Keyword matches'}
          >
            {recs.message}
          </Notice>
          {recs.noneSuitable && (
            <ButtonLink href='/guides' variant='secondary'>
              Browse all guides
            </ButtonLink>
          )}
          <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
            {recs.recommendations.map((rec) => (
              <GuideCard
                key={rec.guide.id}
                guide={rec.guide}
                href={`/guides/${rec.guide.slug}?goal=${goal.id}`}
                footer={
                  <div className='space-y-2 text-sm'>
                    <div className='flex flex-wrap gap-2'>
                      {rec.slot === 'NEW_CONTRIBUTOR' && (
                        <Badge
                          tone='mint'
                          title='One slot is kept for relevant guides with little feedback yet.'
                        >
                          New contributor
                        </Badge>
                      )}
                      {rec.owned && <Badge tone='human'>In your library</Badge>}
                      {rec.overBudget && (
                        <Badge tone='danger'>Over your remaining budget</Badge>
                      )}
                    </div>
                    <p className='text-ink-700'>
                      <span className='font-semibold'>Why it fits: </span>
                      {rec.reason}
                    </p>
                    {rec.caution && (
                      <p className='text-ink-500'>
                        <span className='font-semibold'>Keep in mind: </span>
                        {rec.caution}
                      </p>
                    )}
                    <p className='text-xs text-ink-400'>
                      {rec.guide.agentAssistAllowed
                        ? 'AI help available after purchase.'
                        : 'No AI help: the contributor does not allow it.'}{' '}
                      {rec.guide.contributor.acceptingRequests &&
                      rec.guide.contributor.responsePriceCents
                        ? `Personal answers from ${formatUsd(rec.guide.contributor.responsePriceCents)}.`
                        : ''}
                    </p>
                  </div>
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function BudgetBar({
  goal,
  onChange,
  onError
}: {
  goal: Goal
  onChange: (goal: Goal) => void
  onError: (message: string) => void
}): React.JSX.Element {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(goal.budgetCents / 100))
  const used = goal.budgetCents
    ? Math.min(100, (goal.committedCents / goal.budgetCents) * 100)
    : 100

  return (
    <div className='space-y-3 rounded-2xl bg-ink-50 p-4'>
      <div className='flex flex-wrap items-center justify-between gap-2 text-sm'>
        <span>
          <span className='font-semibold'>
            {formatUsd(goal.remainingCents)}
          </span>{' '}
          left of {formatUsd(goal.budgetCents)} budget
          {goal.committedCents > 0 && (
            <span className='text-ink-500'>
              {' '}
              ({formatUsd(goal.committedCents)} spent or promised)
            </span>
          )}
        </span>
        {editing ? (
          <span className='flex gap-2'>
            <input
              className={`${fieldStyles} w-24`}
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
            <Button
              variant='secondary'
              size='sm'
              onClick={async () => {
                const result = await updateBudget(
                  goal.id,
                  Math.round(Number(value) * 100)
                )
                if (result.error !== null) return onError(result.error)
                onChange(result.data)
                setEditing(false)
                toast.success('Budget updated')
              }}
            >
              Save
            </Button>
          </span>
        ) : (
          <button
            className='text-xs font-medium text-mint-700'
            onClick={() => setEditing(true)}
          >
            Change budget
          </button>
        )}
      </div>
      <div className='h-2.5 overflow-hidden rounded-full bg-card ring-1 ring-ink-100'>
        <div
          className='h-full rounded-full bg-mint-500 transition-[width] duration-500'
          style={{ width: `${used}%` }}
        />
      </div>
      <p className='text-xs text-ink-400'>
        Only you can change this budget. The assistant cannot.
      </p>
    </div>
  )
}
