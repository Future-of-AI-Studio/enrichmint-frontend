import Link from 'next/link'
import {
  ArrowIcon,
  Badge,
  ButtonLink,
  EmptyState,
  linkCardStyles,
  Notice,
  PageHeader,
  StatTile
} from '@/app/components/ui'
import { getSession } from '@/app/lib/services/auth.service'
import {
  getEarnings,
  listInterviews,
  myGuides
} from '@/app/lib/services/studio.service'
import { inbox } from '@/app/lib/services/requests.service'
import { formatUsd, relative } from '@/app/lib/utils/format'
import { ApplyForm } from './ApplyForm'
import { StartInterviewButton } from './StartInterviewButton'

export const metadata = { title: 'Share' }

const STATUS: Record<string, [string, 'mint' | 'warn' | 'neutral' | 'danger']> =
  {
    DRAFT: ['Draft', 'neutral'],
    IN_REVIEW: ['In review', 'warn'],
    PUBLISHED: ['Published', 'mint'],
    UNPUBLISHED: ['Unlisted', 'neutral'],
    REMOVED: ['Removed', 'danger']
  }

export default async function StudioPage(): Promise<React.JSX.Element> {
  const { user } = await getSession()
  const profile = user?.contributorProfile

  if (!profile) {
    return (
      <div className='mx-auto max-w-2xl'>
        <PageHeader
          title='Share my experience'
          description='Turn something you have lived through into a guide others can buy, and get paid when they ask you for personal advice. Free to join; EnrichMINT keeps 15% of each sale.'
        />
        <ApplyForm />
      </div>
    )
  }

  const [guides, interviews, requests, earnings] = await Promise.all([
    myGuides(),
    listInterviews(),
    inbox(),
    profile.status === 'APPROVED' ? getEarnings() : null
  ])
  const waiting =
    requests.data?.filter((request) =>
      ['SENT', 'PAID', 'OVERDUE'].includes(request.state)
    ) ?? []
  const openInterviews =
    interviews.data?.filter((interview) => interview.status !== 'DRAFTED') ?? []

  return (
    <div className='space-y-10'>
      <PageHeader
        title='Your studio'
        description={profile.headline}
        actions={
          <>
            <ButtonLink href='/studio/settings' variant='secondary'>
              Settings
            </ButtonLink>
            <StartInterviewButton />
          </>
        }
      />
      {profile.status === 'PENDING' && (
        <Notice
          tone='warn'
          title='Your contributor profile is waiting for review'
        >
          You can write guides now. An admin approves new contributors before
          anything is sold.
        </Notice>
      )}
      <div className='grid gap-4 sm:grid-cols-3'>
        <StatTile
          tone='zest'
          href='/studio/requests'
          label='Requests needing you'
          value={waiting.length}
        />
        <StatTile
          tone='lilac'
          href='/studio/earnings'
          label='Earned (owed to you)'
          value={formatUsd(earnings?.data?.balances.earnedCents ?? 0)}
        />
        <StatTile
          tone='mint'
          href='/studio/earnings'
          label='Transferred to you'
          value={formatUsd(earnings?.data?.balances.transferredCents ?? 0)}
        />
      </div>

      {openInterviews.length > 0 && (
        <section className='space-y-3'>
          <h2 className='font-display text-2xl font-semibold tracking-tight'>
            Interviews in progress
          </h2>
          {openInterviews.map((interview) => (
            <Link
              key={interview.id}
              href={`/studio/interview/${interview.id}`}
              className={`${linkCardStyles} flex items-center justify-between gap-3 text-sm`}
            >
              <span>
                <span className='font-medium'>Continue interview</span>
                <span className='text-ink-500'>
                  {' '}
                  · {relative(interview.updatedAt)}
                </span>
              </span>
              <ArrowIcon className='text-ink-400' />
            </Link>
          ))}
        </section>
      )}

      <section className='space-y-3'>
        <h2 className='font-display text-2xl font-semibold tracking-tight'>
          Your guides
        </h2>
        {!guides.data?.length ? (
          <EmptyState title='No guides yet.'>
            Start with “Share my experience”: a short interview turns your
            answers into a draft.
          </EmptyState>
        ) : (
          <ul className='space-y-3'>
            {guides.data.map((guide) => {
              const [label, tone] = STATUS[guide.status]
              const latest = guide.versions[0]
              return (
                <li key={guide.id}>
                  <Link
                    href={`/studio/guides/${guide.id}`}
                    className={`${linkCardStyles} flex flex-wrap items-center justify-between gap-3`}
                  >
                    <div>
                      <p className='font-display text-lg font-semibold tracking-tight'>
                        {guide.title}
                      </p>
                      <p className='text-sm text-ink-500'>
                        {guide.category.name} · {formatUsd(guide.priceCents)} ·{' '}
                        {guide._count.entitlements} buyer(s) ·{' '}
                        {guide.agentAssistAllowed
                          ? 'AI assistance allowed'
                          : 'AI assistance off'}
                      </p>
                      {latest?.reviewStatus === 'REJECTED' && (
                        <p className='mt-1 text-sm text-danger-700'>
                          Changes requested: {latest.reviewNote}
                        </p>
                      )}
                    </div>
                    <Badge tone={tone}>{label}</Badge>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
