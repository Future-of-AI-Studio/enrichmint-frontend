'use client'
import { CoinLoader } from '@/app/components/CoinLoader'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  Button,
  Card,
  ErrorNote,
  Field,
  fieldStyles,
  Notice
} from '@/app/components/ui'
import type { Category, Interview } from '@/app/lib/types/guide.type'
import { answerInterview, draftGuide } from '@/app/lib/services/studio.service'

export function InterviewFlow({
  interview: initial,
  categories
}: {
  interview: Interview
  categories: Category[]
}): React.JSX.Element {
  const router = useRouter()
  const [interview, setInterview] = useState(initial)
  const [answer, setAnswer] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const current =
    interview.pendingFollowUp ??
    (interview.nextQuestion
      ? {
          key: interview.nextQuestion.key,
          question: interview.nextQuestion.question
        }
      : null)
  const isFollowUp = Boolean(interview.pendingFollowUp)
  const answeredCount = interview.answers.length
  const total = interview.questions.length

  const submit = (text: string): void => {
    if (!current) return
    setError(null)
    startTransition(async () => {
      const result = await answerInterview(
        interview.id,
        current.key,
        text,
        isFollowUp
      )
      if (result.error !== null) return setError(result.error)
      setInterview(result.data)
      setAnswer('')
    })
  }

  return (
    <div className='space-y-6'>
      <div className='h-2 overflow-hidden rounded-full bg-ink-100'>
        <div
          className='h-full bg-mint-500 transition-all'
          style={{ width: `${(answeredCount / total) * 100}%` }}
        />
      </div>
      {error && <ErrorNote message={error} />}
      {interview.status === 'DRAFTED' ? (
        <Notice tone='mint'>This interview became a guide.</Notice>
      ) : current ? (
        <Card className='space-y-4'>
          <p className='text-xs font-semibold text-ink-400'>
            {isFollowUp
              ? 'Follow-up question'
              : `Question ${answeredCount + 1} of ${total}`}
          </p>
          <h2 className='font-display text-xl font-semibold'>
            {current.question}
          </h2>
          <textarea
            className={`${fieldStyles} min-h-36`}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder='Write it the way you would tell a friend. Leave out other people’s names.'
          />
          <div className='flex gap-2'>
            <Button
              disabled={pending || !answer.trim()}
              onClick={() => submit(answer)}
            >
              {pending ? 'Saving…' : 'Next'}
            </Button>
            {isFollowUp && (
              <Button
                variant='ghost'
                disabled={pending}
                onClick={() => submit('(Skipped)')}
              >
                Skip follow-up
              </Button>
            )}
          </div>
          {!interview.aiAvailable && (
            <p className='text-xs text-ink-400'>
              AI follow-up questions are unavailable right now; the fixed
              questions still work.
            </p>
          )}
        </Card>
      ) : null}

      {answeredCount >= 3 && interview.status !== 'DRAFTED' && (
        <Card className='space-y-4'>
          <h2 className='font-semibold'>
            {interview.nextQuestion
              ? 'Ready early? You can draft now and fill gaps later.'
              : 'All questions answered.'}
          </h2>
          <Field label='Category'>
            <select
              className={fieldStyles}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Button
            disabled={pending || !categoryId}
            onClick={() =>
              startTransition(async () => {
                setError(null)
                const result = await draftGuide(interview.id, categoryId)
                if (result.error !== null) return setError(result.error)
                router.push(
                  `/studio/guides/${result.data.guideId}?drafted=${result.data.aiUsed ? 'ai' : 'verbatim'}`
                )
              })
            }
          >
            {pending ? (
              <>
                <CoinLoader size={18} /> Drafting… this can take a minute
              </>
            ) : (
              'Draft my guide'
            )}
          </Button>
          <p className='text-xs text-ink-400'>
            Nothing is published. You review and edit the draft, then an admin
            reviews it.
          </p>
        </Card>
      )}

      {interview.answers.length > 0 && (
        <details className='rounded-xl bg-card p-4 ring-1 ring-ink-100'>
          <summary className='cursor-pointer text-sm font-medium'>
            Your answers so far
          </summary>
          <dl className='mt-3 space-y-3 text-sm'>
            {interview.answers.map((item) => (
              <div key={item.key}>
                <dt className='text-ink-500'>{item.question}</dt>
                <dd className='whitespace-pre-line'>{item.answer}</dd>
                {item.followUp?.answer && (
                  <dd className='mt-1 text-ink-700'>
                    <span className='text-ink-500'>
                      {item.followUp.question}{' '}
                    </span>
                    {item.followUp.answer}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </details>
      )}
    </div>
  )
}
