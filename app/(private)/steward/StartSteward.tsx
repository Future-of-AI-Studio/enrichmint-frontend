'use client'
import { CoinLoader } from '@/app/components/CoinLoader'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  Button,
  Card,
  ErrorNote,
  Field,
  fieldStyles
} from '@/app/components/ui'
import { startSteward } from '@/app/lib/services/steward.service'

const EXAMPLE =
  'My support role is changing because of AI. I want to explore freelancing, but I don’t know where to start. I have weekends available.'

export function StartSteward(): React.JSX.Element {
  const router = useRouter()
  const [text, setText] = useState('')
  const [budget, setBudget] = useState('20')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <Card className='space-y-4'>
      {error && <ErrorNote message={error} />}
      <Field
        label='Your situation and goal'
        hint='Leave out names, employers and contact details. You choose later what any contributor sees.'
      >
        <textarea
          className={`${fieldStyles} min-h-36`}
          placeholder={EXAMPLE}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </Field>
      <div className='flex flex-wrap items-end gap-4'>
        <Field
          label='Total budget (USD)'
          hint='Enforced: nothing can be bought or requested past it.'
        >
          <input
            className={`${fieldStyles} w-40`}
            inputMode='decimal'
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </Field>
        <Button
          disabled={pending || text.trim().length < 10}
          onClick={() =>
            startTransition(async () => {
              setError(null)
              const cents = Math.round(Number(budget) * 100)
              if (!Number.isFinite(cents) || cents < 0)
                return setError('Enter a budget like 20 or 35.50.')
              const result = await startSteward({ text, budgetCents: cents })
              if (result.error !== null) return setError(result.error)
              router.push(`/steward/${result.data.id}`)
            })
          }
        >
          {pending ? (
            <>
              <CoinLoader size={18} /> Starting…
            </>
          ) : (
            'Start with the steward'
          )}
        </Button>
      </div>
      <button
        type='button'
        className='text-xs text-mint-700'
        onClick={() => setText(EXAMPLE)}
      >
        Use the example
      </button>
    </Card>
  )
}
