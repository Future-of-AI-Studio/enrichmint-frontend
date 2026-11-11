import type { PublicFieldNote } from '@/app/lib/types/learner.type'
import { relative } from '@/app/lib/utils/format'
import { Avatar, Badge, DemoBadge } from './ui'

/** What other learners reported after trying this guide. Self-reported, never the author's words. */
export function FieldNotesList({
  notes
}: {
  notes: PublicFieldNote[]
}): React.JSX.Element {
  return (
    <section className='space-y-3'>
      <div>
        <h2 className='font-display text-xl font-semibold'>
          Field notes from people who tried this
        </h2>
        <p className='text-xs text-ink-500'>
          Self-reported outcomes from buyers, published with their approval. Not
          verified, and not the author’s words. Each note’s author earns a small
          share of later sales.
        </p>
      </div>
      {notes.length === 0 ? (
        <p className='text-sm text-ink-500'>
          No field notes yet. Buyers can add one after they try the guide.
        </p>
      ) : (
        <ul className='space-y-3'>
          {notes.map((note) => (
            <li
              key={note.id}
              className='rounded-2xl bg-card p-4 ring-1 ring-ink-100'
            >
              <div className='flex flex-wrap items-center gap-2'>
                <Avatar name={note.authorFirstName} size='sm' />
                <span className='text-sm font-medium'>
                  {note.authorFirstName}
                </span>
                <Badge tone='human'>
                  {note.source === 'RESPONSE'
                    ? 'After a personal answer'
                    : 'After the guide'}
                </Badge>
                {note.isDemo && <DemoBadge />}
                <span className='text-xs text-ink-400'>
                  {relative(note.publishedAt)}
                </span>
              </div>
              <p className='mt-2 text-sm whitespace-pre-line text-ink-700'>
                {note.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
