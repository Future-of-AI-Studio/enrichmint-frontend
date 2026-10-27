import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FeedbackCounts } from '@/app/components/FeedbackCounts'
import {
  ArrowIcon,
  Avatar,
  Badge,
  ButtonLink,
  Card,
  CheckIcon,
  DemoBadge,
  Notice
} from '@/app/components/ui'
import { getSession } from '@/app/lib/services/auth.service'
import { getGuide } from '@/app/lib/services/guides.service'
import { formatUsd, hours } from '@/app/lib/utils/format'

export default async function GuidePage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ goal?: string }>
}): Promise<React.JSX.Element> {
  const [{ slug }, { goal }] = await Promise.all([params, searchParams])
  const [result, session] = await Promise.all([getGuide(slug), getSession()])
  if (result.error !== null) notFound()
  const guide = result.data
  const version = guide.currentVersion!
  const checkoutHref = `/checkout/${guide.slug}${goal ? `?goal=${goal}` : ''}`
  const name = guide.contributor.user.displayName

  return (
    <div className='mx-auto max-w-page px-4 sm:px-6 lg:px-8 py-10'>
      <Link
        href={goal ? `/start?goal=${goal}` : '/guides'}
        className='mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900'
      >
        <ArrowIcon className='rotate-180' />
        {goal ? 'Back to your goal' : 'All guides'}
      </Link>
      <div className='grid gap-10 lg:grid-cols-[1fr_360px]'>
        <div className='space-y-10'>
          <div className='space-y-5'>
            <div className='flex flex-wrap gap-2'>
              <Badge tone='mint'>{guide.category.name}</Badge>
              {guide.isDemo && <DemoBadge />}
              <Badge tone='neutral' title='Not independently verified.'>
                Self-reported experience
              </Badge>
            </div>
            <h1 className='font-display text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl'>
              {guide.title}
            </h1>
            <p className='text-lg text-ink-500'>{version.summary}</p>
            <div className='flex items-center gap-3'>
              <Avatar name={name} size='lg' />
              <div>
                <p className='font-semibold'>{name}</p>
                <p className='text-sm text-ink-500'>
                  {guide.contributor.headline}
                </p>
              </div>
            </div>
          </div>

          <Card className='relative overflow-hidden'>
            <span className='mb-4 inline-flex rounded-full bg-zest-300 px-3 py-1 text-xs font-semibold text-ink-900'>
              Free preview
            </span>
            <p className='leading-relaxed whitespace-pre-line text-ink-700'>
              {version.preview}
            </p>
          </Card>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='rounded-3xl bg-mint-50 p-6 ring-1 ring-mint-200'>
              <h2 className='mb-2 font-display text-lg font-semibold'>
                Who it’s for
              </h2>
              <p className='text-sm text-ink-700'>{version.audience}</p>
            </div>
            <div className='rounded-3xl bg-warn-50 p-6 ring-1 ring-warn-600/15'>
              <h2 className='mb-2 font-display text-lg font-semibold'>
                When it may not apply
              </h2>
              <p className='text-sm text-ink-700'>{version.limitations}</p>
            </div>
          </div>

          <div>
            <h2 className='mb-4 font-display text-2xl font-semibold tracking-tight'>
              What you get
            </h2>
            <ol className='grid gap-2 sm:grid-cols-2'>
              {version.outline.map((title, index) => (
                <li
                  key={title}
                  className='flex items-center gap-3 rounded-2xl bg-card px-4 py-3 text-sm shadow-card ring-1 ring-ink-100'
                >
                  <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink-50 text-xs font-semibold text-ink-500'>
                    {index + 1}
                  </span>
                  {title}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className='mb-4 font-display text-2xl font-semibold tracking-tight'>
              What buyers said
            </h2>
            <FeedbackCounts stats={guide.feedback} />
          </div>

          <Card className='flex flex-col gap-4 sm:flex-row'>
            <Avatar name={name} size='lg' />
            <div className='space-y-1'>
              <h2 className='font-display text-lg font-semibold'>
                About {name}
              </h2>
              <p className='text-sm text-ink-500'>
                {guide.contributor.headline}
              </p>
              <p className='pt-2 text-sm text-ink-700'>
                {guide.contributor.background}
              </p>
            </div>
          </Card>
        </div>

        <aside className='lg:sticky lg:top-24 lg:self-start'>
          <div className='space-y-5 rounded-3xl bg-ink-950 p-6 text-white shadow-lift'>
            <div>
              <p className='text-sm text-ink-300'>One-time purchase</p>
              <p className='font-display text-5xl font-semibold tracking-tight'>
                {formatUsd(guide.priceCents)}
              </p>
            </div>
            <ul className='space-y-3 text-sm text-ink-200'>
              <PerkItem>Read the full guide, any time</PerkItem>
              <PerkItem off={!guide.agentAssistAllowed}>
                {guide.agentAssistAllowed
                  ? 'Up to 10 AI questions grounded in this guide, for 30 days'
                  : 'No AI assistance: the contributor has not allowed AI to read this guide'}
              </PerkItem>
              <PerkItem
                off={
                  !(
                    guide.contributor.acceptingRequests &&
                    guide.contributor.responsePriceCents
                  )
                }
              >
                {guide.contributor.acceptingRequests &&
                guide.contributor.responsePriceCents
                  ? `Personal written answers available from ${name} for ${formatUsd(guide.contributor.responsePriceCents)} (delivered within ${hours(guide.contributor.deliveryH)} of payment)`
                  : 'Personal answers are not available right now'}
              </PerkItem>
            </ul>
            {guide.owned ? (
              <ButtonLink
                href={`/library/${guide.id}`}
                variant='accent'
                size='lg'
                className='w-full'
              >
                Open in your library
              </ButtonLink>
            ) : guide.isOwn ? (
              <Notice>This is your guide.</Notice>
            ) : guide.status !== 'PUBLISHED' ? (
              <Notice>This guide is not for sale right now.</Notice>
            ) : session.user ? (
              <ButtonLink
                href={checkoutHref}
                variant='accent'
                size='lg'
                className='w-full'
              >
                Review purchase
                <ArrowIcon />
              </ButtonLink>
            ) : (
              <ButtonLink
                href={`/login?next=${encodeURIComponent(checkoutHref)}`}
                variant='accent'
                size='lg'
                className='w-full'
              >
                Sign in to buy
              </ButtonLink>
            )}
            <p className='text-xs text-ink-400'>
              You approve the payment in PayPal (sandbox). Buying gives you
              reading access and the AI help above; it does not grant any rights
              to train AI models on this guide.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function PerkItem({
  off = false,
  children
}: {
  off?: boolean
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <li className='flex gap-3'>
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${off ? 'bg-white/10 text-ink-400' : 'bg-zest-300 text-ink-900'}`}
      >
        {off ? (
          <span className='h-0.5 w-2 rounded-full bg-current' />
        ) : (
          <CheckIcon className='h-3 w-3' />
        )}
      </span>
      <span className={off ? 'text-ink-400' : undefined}>{children}</span>
    </li>
  )
}
