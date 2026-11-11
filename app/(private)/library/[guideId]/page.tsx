import { redirect } from 'next/navigation'
import { PayPalReceipt } from '@/app/components/PayPalReceipt'
import { RichText } from '@/app/components/RichText'
import { Badge, ErrorNote, Notice } from '@/app/components/ui'
import { getGuideContent } from '@/app/lib/services/guides.service'
import {
  assistantHistory,
  guideFieldNotes,
  listOrders,
  myFeedback
} from '@/app/lib/services/learner.service'
import { FieldNotesList } from '@/app/components/FieldNotesList'
import { AssistantPanel } from './AssistantPanel'
import { GuideFeedback } from './GuideFeedback'
import { RefundLink } from './RefundLink'

export default async function ReaderPage({
  params,
  searchParams
}: {
  params: Promise<{ guideId: string }>
  searchParams: Promise<{ purchased?: string; goal?: string }>
}): Promise<React.JSX.Element> {
  const [{ guideId }, { purchased, goal }] = await Promise.all([
    params,
    searchParams
  ])
  const content = await getGuideContent(guideId)
  if (content.error !== null) {
    if (content.code === 'not_entitled') redirect('/library')
    return <ErrorNote message={content.error} />
  }
  const guide = content.data
  const [history, orders, feedback, notes] = await Promise.all([
    guide.ai?.allowed ? assistantHistory(guideId) : null,
    listOrders(),
    myFeedback('GUIDE', guideId),
    guideFieldNotes(guideId)
  ])
  const order = orders.data?.find(
    (row) => row.guideId === guideId && row.status === 'COMPLETED'
  )

  return (
    <div className='grid gap-8 lg:grid-cols-[1fr_420px]'>
      <article className='space-y-6'>
        {purchased && (
          <Notice tone='mint' title='Payment confirmed by PayPal (sandbox)'>
            The guide is in your library.
          </Notice>
        )}
        {order && (
          <PayPalReceipt
            amountCents={order.amountCents}
            paypalOrderId={order.paypalOrderId}
            paypalCaptureId={order.paypalCaptureId}
            completedAt={order.completedAt}
          />
        )}
        <header className='space-y-2'>
          <div className='flex flex-wrap gap-2'>
            <Badge title='Not independently verified.'>
              Self-reported experience
            </Badge>
            <Badge>Version {guide.version.number}</Badge>
            {!guide.isLatest && (
              <Badge tone='warn'>You are reading the version you bought</Badge>
            )}
          </div>
          <h1 className='font-display text-3xl font-semibold'>{guide.title}</h1>
          <p className='text-ink-500'>{guide.version.summary}</p>
        </header>
        {guide.version.sections
          .filter((section) => section.body.trim())
          .map((section) => (
            <section
              key={section.id}
              id={section.id}
              className='scroll-mt-24 space-y-2'
            >
              <h2 className='flex items-baseline gap-2 font-display text-xl font-semibold'>
                <span className='text-sm font-normal text-ink-400'>
                  §{section.id.replace('s', '')}
                </span>
                {section.title}
              </h2>
              <RichText
                text={section.body}
                className='space-y-2 text-ink-700'
              />
            </section>
          ))}
        <FieldNotesList notes={notes.data ?? []} />
        <GuideFeedback
          guideId={guideId}
          given={feedback.data?.map((row) => row.phase) ?? []}
        />
        {order && <RefundLink orderId={order.id} />}
      </article>
      <aside className='lg:sticky lg:top-24 lg:self-start'>
        {guide.ai && guide.ai.allowed ? (
          <AssistantPanel
            guideId={guideId}
            goalId={goal}
            contributorName={guide.contributorName}
            initial={history?.data ?? []}
            quota={{
              limit: guide.ai.questionsLimit,
              used: guide.ai.questionsUsed
            }}
          />
        ) : (
          <Notice title='AI assistance is off for this guide'>
            The contributor has not allowed AI to read this guide, so the
            assistant will not use it. You can still read the whole guide
            yourself.
          </Notice>
        )}
      </aside>
    </div>
  )
}
