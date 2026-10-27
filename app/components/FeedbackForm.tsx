'use client'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { sendFeedback } from '@/app/lib/services/learner.service'
import { Button, Card, fieldStyles } from './ui'

type Choice = boolean | undefined

/**
 * Immediate and later feedback, asked separately. It informs matching and is
 * shown as counts. It never affects whether a contributor is paid.
 */
export function FeedbackForm({
  targetType,
  targetId,
  given
}: {
  targetType: 'GUIDE' | 'RESPONSE'
  targetId: string
  given: ('IMMEDIATE' | 'FOLLOW_UP')[]
}): React.JSX.Element {
  const [phase, setPhase] = useState<'IMMEDIATE' | 'FOLLOW_UP'>(
    given.includes('IMMEDIATE') ? 'FOLLOW_UP' : 'IMMEDIATE'
  )
  const [done, setDone] = useState(given.includes('FOLLOW_UP'))
  const [relevant, setRelevant] = useState<Choice>()
  const [nextStep, setNextStep] = useState<Choice>()
  const [tried, setTried] = useState<Choice>()
  const [usefulAfter, setUsefulAfter] = useState<Choice>()
  const [text, setText] = useState('')
  const [pending, startTransition] = useTransition()

  if (done)
    return <p className='text-sm text-ink-500'>Thanks, your feedback is in.</p>

  const submit = (): void =>
    startTransition(async () => {
      const result = await sendFeedback(
        phase === 'IMMEDIATE'
          ? {
              targetType,
              targetId,
              phase,
              relevant,
              nextStep,
              missingOrMisleading: text || undefined
            }
          : {
              targetType,
              targetId,
              phase,
              tried,
              usefulAfter,
              outcome: text || undefined
            }
      )
      if (result.error !== null) return void toast.error(result.error)
      toast.success('Thank you')
      setText('')
      if (phase === 'IMMEDIATE') setPhase('FOLLOW_UP')
      else setDone(true)
    })

  return (
    <Card className='space-y-4'>
      <div>
        <h3 className='font-semibold'>
          {phase === 'IMMEDIATE'
            ? 'Was this useful?'
            : 'Later: did you try it?'}
        </h3>
        <p className='text-xs text-ink-500'>
          {phase === 'IMMEDIATE'
            ? 'Your first impression. Feedback never affects whether the contributor is paid.'
            : 'Come back after you have tried the guidance. This is shown separately from first impressions.'}
        </p>
      </div>
      {phase === 'IMMEDIATE' ? (
        <>
          <YesNo
            label='Was it relevant to you?'
            value={relevant}
            onChange={setRelevant}
          />
          <YesNo
            label='Did it help you find a next step?'
            value={nextStep}
            onChange={setNextStep}
          />
        </>
      ) : (
        <>
          <YesNo
            label='Did you try the guidance?'
            value={tried}
            onChange={setTried}
          />
          {tried && (
            <YesNo
              label='Was it useful after trying it?'
              value={usefulAfter}
              onChange={setUsefulAfter}
            />
          )}
        </>
      )}
      <textarea
        className={`${fieldStyles} min-h-16`}
        placeholder={
          phase === 'IMMEDIATE'
            ? 'Anything missing or misleading? (optional)'
            : 'What happened? (optional)'
        }
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <Button variant='secondary' disabled={pending} onClick={submit}>
        Send feedback
      </Button>
    </Card>
  )
}

function YesNo({
  label,
  value,
  onChange
}: {
  label: string
  value: Choice
  onChange: (v: boolean) => void
}): React.JSX.Element {
  return (
    <div className='flex flex-wrap items-center justify-between gap-2 text-sm'>
      <span>{label}</span>
      <span className='flex gap-1'>
        {[true, false].map((option) => (
          <button
            key={String(option)}
            type='button'
            onClick={() => onChange(option)}
            className={`rounded-lg px-3 py-1 ring-1 ${value === option ? 'bg-mint-600 text-white ring-mint-600' : 'ring-ink-200'}`}
          >
            {option ? 'Yes' : 'No'}
          </button>
        ))}
      </span>
    </div>
  )
}
