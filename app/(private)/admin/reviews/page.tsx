import {
  Badge,
  Card,
  EmptyState,
  ErrorNote,
  Notice,
  PageHeader
} from '@/app/components/ui'
import { reviewQueue } from '@/app/lib/services/admin.service'
import { formatUsd } from '@/app/lib/utils/format'
import { ReviewActions } from '../AdminActions'

export const metadata = { title: 'Reviews' }

export default async function ReviewsPage(): Promise<React.JSX.Element> {
  const queue = await reviewQueue()
  return (
    <div className='space-y-6'>
      <PageHeader
        title='Guides waiting for review'
        description='Check that claims read as self-reported experience, nothing looks like instructions to an AI, and no one else’s private details appear.'
      />
      {queue.error !== null ? (
        <ErrorNote message={queue.error} />
      ) : queue.data.length === 0 ? (
        <EmptyState title='Nothing to review.' />
      ) : (
        queue.data.map((item) => (
          <Card key={item.id} className='space-y-4'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge tone='mint'>{item.guide.category.name}</Badge>
              <Badge>Version {item.number}</Badge>
              <Badge>{formatUsd(item.guide.priceCents)}</Badge>
              <Badge tone={item.guide.agentAssistAllowed ? 'ai' : 'neutral'}>
                AI assistance{' '}
                {item.guide.agentAssistAllowed ? 'allowed' : 'off'}
              </Badge>
              {item.guide.contributor.status !== 'APPROVED' && (
                <Badge tone='warn'>Contributor not approved</Badge>
              )}
            </div>
            <h2 className='font-display text-xl font-semibold'>
              {item.guide.title}
            </h2>
            <p className='text-sm text-ink-500'>
              {item.guide.contributor.user.displayName} ·{' '}
              {item.guide.contributor.headline}
            </p>
            {item.flags.map((flag) => (
              <Notice key={flag} tone='warn'>
                {flag}
              </Notice>
            ))}
            <details>
              <summary className='cursor-pointer text-sm font-medium'>
                Read the guide
              </summary>
              <div className='mt-3 space-y-3 text-sm'>
                <p>
                  <span className='font-semibold'>Summary:</span> {item.summary}
                </p>
                <p>
                  <span className='font-semibold'>Preview:</span> {item.preview}
                </p>
                <p>
                  <span className='font-semibold'>Limitations:</span>{' '}
                  {item.limitations}
                </p>
                {item.sections
                  .filter((s) => s.body.trim())
                  .map((section) => (
                    <div key={section.id}>
                      <p className='font-semibold'>{section.title}</p>
                      <p className='whitespace-pre-line text-ink-700'>
                        {section.body}
                      </p>
                    </div>
                  ))}
              </div>
            </details>
            <ReviewActions
              versionId={item.id}
              contributorId={item.guide.contributor.id}
              contributorApproved={item.guide.contributor.status === 'APPROVED'}
            />
          </Card>
        ))
      )}
    </div>
  )
}
