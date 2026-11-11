'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  Button,
  Card,
  ErrorNote,
  Field,
  fieldStyles
} from '@/app/components/ui'
import { applyAsContributor } from '@/app/lib/services/studio.service'

export function ApplyForm(): React.JSX.Element {
  const router = useRouter()
  const [headline, setHeadline] = useState('')
  const [background, setBackground] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <Card className='space-y-4'>
      {error && <ErrorNote message={error} />}
      <Field
        label='One line about you'
        hint='e.g. “Former support lead, now a freelance onboarding consultant”'
      >
        <input
          className={fieldStyles}
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
        />
      </Field>
      <Field
        label='Your background, in your own words'
        hint='Shown on your guides. Only include what you are happy to share.'
      >
        <textarea
          className={`${fieldStyles} min-h-28`}
          value={background}
          onChange={(e) => setBackground(e.target.value)}
        />
      </Field>
      <p className='rounded-xl bg-ink-50 px-3 py-2 text-sm text-ink-700'>
        Every new contributor profile is reviewed by an admin before anything
        you write goes on sale. You can start writing your first guide while you
        wait, and you will see the review status in your studio.
      </p>
      <Button
        disabled={pending || !headline.trim() || !background.trim()}
        onClick={() =>
          startTransition(async () => {
            const result = await applyAsContributor(headline, background)
            if (result.error !== null) return setError(result.error)
            router.refresh()
          })
        }
      >
        Become a contributor
      </Button>
    </Card>
  )
}
