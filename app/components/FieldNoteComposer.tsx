'use client'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  draftFieldNote,
  myFieldNote,
  publishFieldNote,
  updateFieldNote
} from '@/app/lib/services/learner.service'
import type { FieldNote, FieldNoteSource } from '@/app/lib/types/learner.type'
import { Button, Card, fieldStyles, Notice } from './ui'

/**
 * The enrichment loop: after trying the guidance, the learner can turn what
 * happened into a field note for the next person, and earn a share of later
 * sales of the guide once they approve publishing it.
 */
export function FieldNoteComposer({
  source,
  sourceId
}: {
  source: FieldNoteSource
  sourceId: string
}): React.JSX.Element | null {
  const [note, setNote] = useState<FieldNote | null | undefined>(undefined)
  const [body, setBody] = useState('')
  const [approved, setApproved] = useState(false)
  const [payoutEmail, setPayoutEmail] = useState('')
  const [unavailable, setUnavailable] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    let cancelled = false
    void myFieldNote(source, sourceId).then((result) => {
      if (cancelled) return
      if (result.error !== null) {
        // A personal answer with no guide behind it has nowhere to attach a note.
        if (result.code === 'no_guide') setUnavailable(result.error)
        setNote(null)
        return
      }
      setNote(result.data.note)
      setBody(result.data.note?.body ?? '')
    })
    return () => {
      cancelled = true
    }
  }, [source, sourceId])

  if (note === undefined || unavailable) return null

  if (note?.status === 'PUBLISHED') {
    return (
      <Notice tone='mint' title='Your field note is published'>
        It appears on “{note.guide.title}”, and you earn a share of each later
        sale of that guide, paid from the platform’s commission. See it under
        Share, then Earnings.
      </Notice>
    )
  }

  if (!note) {
    return (
      <Card className='space-y-3'>
        <h3 className='font-semibold'>Help the next person</h3>
        <p className='text-sm text-ink-500'>
          Turn what happened into a short field note on the guide. Once you
          approve it, you earn a share of each later sale of that guide.
        </p>
        <Button
          variant='secondary'
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await draftFieldNote(source, sourceId)
              if (result.error !== null) return void toast.error(result.error)
              setNote(result.data)
              setBody(result.data.body)
            })
          }
        >
          Draft my field note
        </Button>
      </Card>
    )
  }

  const publish = (): void =>
    startTransition(async () => {
      if (body.trim() !== note.body) {
        const saved = await updateFieldNote(note.id, body)
        if (saved.error !== null) return void toast.error(saved.error)
      }
      const result = await publishFieldNote(
        note.id,
        payoutEmail.trim() || undefined
      )
      if (result.error !== null) return void toast.error(result.error)
      toast.success('Field note published')
      for (const warning of result.data.warnings ?? []) toast.warning(warning)
      setNote(result.data)
    })

  return (
    <Card className='space-y-3'>
      <div>
        <h3 className='font-semibold'>Your field note (draft)</h3>
        <p className='text-xs text-ink-500'>
          Drafted by AI from your own words. Edit anything, and remove anything
          personal. Nothing is published until you approve it.
        </p>
      </div>
      <label className='sr-only' htmlFor={`note-${note.id}`}>
        Field note
      </label>
      <textarea
        id={`note-${note.id}`}
        className={`${fieldStyles} min-h-28`}
        maxLength={1200}
        value={body}
        onChange={(event) => setBody(event.target.value)}
      />
      <label className='block text-sm'>
        <span className='text-ink-700'>
          PayPal sandbox email for your shares (optional, you can add it later)
        </span>
        <input
          type='email'
          className={`${fieldStyles} mt-1`}
          value={payoutEmail}
          onChange={(event) => setPayoutEmail(event.target.value)}
          autoComplete='email'
        />
      </label>
      <label className='flex items-start gap-2 text-sm text-ink-700'>
        <input
          type='checkbox'
          className='mt-0.5 h-4 w-4 accent-mint-600'
          checked={approved}
          onChange={(event) => setApproved(event.target.checked)}
        />
        I approve publishing this note on the guide page, shown with my first
        name, and letting the guide’s AI assistant mention it.
      </label>
      <Button
        disabled={pending || !approved || body.trim().length < 20}
        onClick={publish}
      >
        Publish field note
      </Button>
    </Card>
  )
}
