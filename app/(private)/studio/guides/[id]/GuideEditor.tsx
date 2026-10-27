'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Badge,
  Button,
  Card,
  ErrorNote,
  Field,
  fieldStyles,
  Notice,
  PageHeader
} from '@/app/components/ui'
import { LocalTime } from '@/app/components/LocalTime'
import type { Category, OwnedGuide } from '@/app/lib/types/guide.type'
import {
  setGuideListed,
  submitGuide,
  updateDraft,
  updateGuideSettings
} from '@/app/lib/services/studio.service'
import { formatUsd } from '@/app/lib/utils/format'

const REVIEW_LABEL = {
  DRAFT: ['Draft', 'neutral'],
  PENDING: ['In review', 'warn'],
  APPROVED: ['Published version', 'mint'],
  REJECTED: ['Changes requested', 'danger']
} as const

export function GuideEditor({
  guide,
  categories
}: {
  guide: OwnedGuide
  categories: Category[]
}): React.JSX.Element {
  const router = useRouter()
  const draft = guide.draft!
  const frozen = draft.reviewStatus !== 'DRAFT'
  const [title, setTitle] = useState(guide.title)
  const [summary, setSummary] = useState(draft.summary)
  const [preview, setPreview] = useState(draft.preview)
  const [limitations, setLimitations] = useState(draft.limitations)
  const [audience, setAudience] = useState(draft.audience)
  const [sections, setSections] = useState(draft.sections)
  const [gaps, setGaps] = useState(draft.gaps)
  const [price, setPrice] = useState(String(guide.priceCents / 100))
  const [agentAssist, setAgentAssist] = useState(guide.agentAssistAllowed)
  const [topics, setTopics] = useState(guide.topics.join(', '))
  const [categoryId, setCategoryId] = useState(guide.category.id)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const saveDraft = async (): Promise<boolean> => {
    const result = await updateDraft(guide.id, {
      title,
      summary,
      preview,
      audience,
      limitations,
      sections: sections.map(({ key, title: sectionTitle, body }) => ({
        key,
        title: sectionTitle,
        body
      })),
      gaps
    })
    if (result.error !== null) {
      setError(result.error)
      return false
    }
    return true
  }

  const saveSettings = async (): Promise<boolean> => {
    const result = await updateGuideSettings(guide.id, {
      priceCents: Math.round(Number(price) * 100),
      agentAssistAllowed: agentAssist,
      topics: topics
        .split(',')
        .map((topic) => topic.trim())
        .filter(Boolean),
      categoryId
    })
    if (result.error !== null) {
      setError(result.error)
      return false
    }
    return true
  }

  const run = (work: () => Promise<boolean>, success: string): void => {
    setError(null)
    startTransition(async () => {
      if (await work()) {
        toast.success(success)
        router.refresh()
      }
    })
  }

  const [label, tone] = REVIEW_LABEL[draft.reviewStatus]

  return (
    <div className='grid gap-8 lg:grid-cols-[1fr_340px]'>
      <div className='space-y-6'>
        <PageHeader
          badge={
            <Badge tone={tone}>{`${label} · version ${draft.number}`}</Badge>
          }
          title={guide.title}
          actions={
            guide.status === 'PUBLISHED' ? (
              <Link
                className='text-sm text-mint-700'
                href={`/guides/${guide.slug}`}
              >
                View public page
              </Link>
            ) : null
          }
        />
        {draft.reviewStatus === 'REJECTED' && (
          <Notice tone='warn' title='Changes requested by the reviewer'>
            {draft.reviewNote}. Editing starts a new version.
          </Notice>
        )}
        {draft.reviewStatus === 'PENDING' && (
          <Notice>
            This version is being reviewed. You can edit it after the decision.
          </Notice>
        )}
        {draft.reviewStatus === 'APPROVED' && (
          <Notice>
            This version is live. Saving changes creates a new version, which is
            reviewed before buyers see it.
          </Notice>
        )}
        {error && <ErrorNote message={error} />}

        <Card className='space-y-4'>
          <Field label='Title'>
            <input
              className={fieldStyles}
              value={title}
              disabled={draft.reviewStatus === 'PENDING'}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label='Summary'>
            <textarea
              className={`${fieldStyles} min-h-20`}
              value={summary}
              disabled={draft.reviewStatus === 'PENDING'}
              onChange={(e) => setSummary(e.target.value)}
            />
          </Field>
          <Field
            label='Free preview'
            hint='Anyone can read this before buying. Describe what it covers without giving away the steps.'
          >
            <textarea
              className={`${fieldStyles} min-h-20`}
              value={preview}
              disabled={draft.reviewStatus === 'PENDING'}
              onChange={(e) => setPreview(e.target.value)}
            />
          </Field>
          <div className='grid gap-4 sm:grid-cols-2'>
            <Field label='Who it’s for'>
              <textarea
                className={`${fieldStyles} min-h-20`}
                value={audience}
                disabled={draft.reviewStatus === 'PENDING'}
                onChange={(e) => setAudience(e.target.value)}
              />
            </Field>
            <Field label='When it may not apply'>
              <textarea
                className={`${fieldStyles} min-h-20`}
                value={limitations}
                disabled={draft.reviewStatus === 'PENDING'}
                onChange={(e) => setLimitations(e.target.value)}
              />
            </Field>
          </div>
        </Card>

        {sections.map((section, index) => (
          <Card key={section.key} className='space-y-2'>
            <input
              className='w-full font-display text-lg font-semibold outline-none'
              value={section.title}
              disabled={draft.reviewStatus === 'PENDING'}
              onChange={(e) =>
                setSections(
                  sections.map((s, i) =>
                    i === index ? { ...s, title: e.target.value } : s
                  )
                )
              }
            />
            <textarea
              className={`${fieldStyles} min-h-28`}
              value={section.body}
              disabled={draft.reviewStatus === 'PENDING'}
              placeholder='Empty: buyers won’t see this section.'
              onChange={(e) =>
                setSections(
                  sections.map((s, i) =>
                    i === index ? { ...s, body: e.target.value } : s
                  )
                )
              }
            />
          </Card>
        ))}

        {draft.reviewStatus !== 'PENDING' && (
          <Button
            disabled={pending}
            onClick={() =>
              run(
                saveDraft,
                frozen ? 'New version saved as a draft' : 'Draft saved'
              )
            }
          >
            Save draft
          </Button>
        )}
      </div>

      <aside className='space-y-6 lg:sticky lg:top-24 lg:self-start'>
        <Card className='space-y-3'>
          <h2 className='font-semibold'>Gaps to fill</h2>
          {gaps.length === 0 ? (
            <p className='text-sm text-ink-500'>No open gaps.</p>
          ) : (
            <ul className='space-y-2 text-sm'>
              {gaps.map((gap, index) => (
                <li
                  key={index}
                  className='flex gap-2 rounded-lg bg-warn-50 px-3 py-2 text-warn-600'
                >
                  <span className='flex-1'>{gap.question}</span>
                  {draft.reviewStatus !== 'PENDING' && (
                    <button
                      className='text-xs underline'
                      onClick={() =>
                        setGaps(gaps.filter((_, i) => i !== index))
                      }
                    >
                      Done
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className='text-xs text-ink-400'>
            These are questions, not text added to your guide. Answer them in
            the sections.
          </p>
        </Card>

        <Card className='space-y-4'>
          <h2 className='font-semibold'>Price and permissions</h2>
          <Field
            label='Price (USD)'
            hint='Minimum $5.00. You keep 85%; EnrichMINT pays the PayPal fee from its 15%.'
          >
            <input
              className={fieldStyles}
              inputMode='decimal'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </Field>
          <p className='text-xs text-ink-500'>
            At {formatUsd(Math.round(Number(price || 0) * 100))}: you get{' '}
            {formatUsd(Math.round(Number(price || 0) * 100 * 0.85))} per sale.
          </p>
          <label className='flex items-start gap-3 text-sm'>
            <input
              type='checkbox'
              className='mt-0.5 h-4 w-4 accent-mint-600'
              checked={agentAssist}
              onChange={(e) => setAgentAssist(e.target.checked)}
            />
            <span>
              Let AI read this guide to help people who bought it
              <span className='block text-xs text-ink-500'>
                Separate from reading access, which buyers always get. Turning
                this off applies immediately to existing buyers; answers already
                given stay with them. Buying never grants rights to train AI
                models.
              </span>
            </span>
          </label>
          <Field label='Topics (comma separated)'>
            <input
              className={fieldStyles}
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
            />
          </Field>
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
            variant='secondary'
            disabled={pending}
            onClick={() => run(saveSettings, 'Settings saved')}
          >
            Save settings
          </Button>
          {guide.permissionChanges.length > 0 && (
            <details className='text-xs text-ink-500'>
              <summary className='cursor-pointer'>Change history</summary>
              <ul className='mt-2 space-y-1'>
                {guide.permissionChanges.map((change) => (
                  <li key={change.id}>
                    <LocalTime iso={change.createdAt} mode='date' />:{' '}
                    {change.field.replaceAll('_', ' ')} {change.oldValue} →{' '}
                    {change.newValue}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </Card>

        <Card className='space-y-3'>
          {draft.reviewStatus === 'DRAFT' && (
            <>
              <Button
                className='w-full'
                disabled={pending}
                onClick={() =>
                  run(async () => {
                    if (!(await saveDraft()) || !(await saveSettings()))
                      return false
                    const result = await submitGuide(guide.id)
                    if (result.error !== null) {
                      setError(result.error)
                      return false
                    }
                    return true
                  }, 'Submitted for review')
                }
              >
                Approve and submit for review
              </Button>
              <p className='text-xs text-ink-400'>
                By submitting you confirm this describes your own experience. It
                will be labelled self-reported.
              </p>
            </>
          )}
          {guide.currentVersionId && (
            <Button
              variant='ghost'
              className='w-full'
              disabled={pending}
              onClick={() =>
                run(
                  async () => {
                    const result = await setGuideListed(
                      guide.id,
                      guide.status !== 'PUBLISHED'
                    )
                    if (result.error !== null) {
                      setError(result.error)
                      return false
                    }
                    return true
                  },
                  guide.status === 'PUBLISHED' ? 'Unlisted' : 'Listed'
                )
              }
            >
              {guide.status === 'PUBLISHED'
                ? 'Stop selling (buyers keep access)'
                : 'List again'}
            </Button>
          )}
        </Card>
      </aside>
    </div>
  )
}
