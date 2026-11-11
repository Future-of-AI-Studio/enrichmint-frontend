import Link from 'next/link'
import { GuideCard } from '@/app/components/GuideCard'
import {
  ArrowIcon,
  Avatar,
  Badge,
  ButtonLink,
  CheckIcon,
  SandboxBadge
} from '@/app/components/ui'
import { listCategories, listGuides } from '@/app/lib/services/guides.service'
import { formatUsd } from '@/app/lib/utils/format'

const steps = [
  {
    title: 'Tell the AI what you need help with',
    body: 'Describe your situation, your constraints and your budget. It asks only what it needs.'
  },
  {
    title: 'Learn from someone who has been through it',
    body: 'It finds guides written from real experience, explains why each fits, and says so when nothing does.'
  },
  {
    title: 'Ask the person when the guide runs out',
    body: 'If you need a more personal answer, it finds the right person and prepares a paid request. You approve every step.'
  },
  {
    title: 'Pass on what happened',
    body: 'Tried the advice? Publish a short field note on how it went. You earn a share each time the next person buys that guide.'
  }
]

const notAChatbot = [
  [
    'Lived, not averaged',
    'A chatbot gives you what usually works. Here every answer comes from a named person who went through it, with what they actually said kept apart from AI suggestions.'
  ],
  [
    'A person you can ask',
    'When the guide does not cover your case, the AI does not guess. It finds someone who has lived it and drafts a paid question to them.'
  ],
  [
    'Outcomes, not opinions',
    'Field notes from people who tried the advice show what happened next, so you see results, not just recommendations.'
  ],
  [
    'Everyone who helps gets paid',
    'Authors keep 85% of each sale. Learners who add field notes earn a share of later sales. All of it runs through PayPal.'
  ]
]

const moneySteps = [
  [
    'PayPal Checkout',
    'You approve in PayPal (PayPal, Venmo, Pay Later or card). Our server creates the order with the price from our database.'
  ],
  [
    'Server-side capture',
    'Access is granted only after PayPal reports a completed capture for the exact amount. Webhooks are signature-verified.'
  ],
  [
    'Shared ledger',
    'Each sale is split: 85% to the author, field note shares to learners who added outcomes, the rest to the platform.'
  ],
  [
    'PayPal Payouts',
    'People withdraw to their own PayPal account. Refunds go back through PayPal and reverse every share.'
  ]
]

const promises = [
  [
    'You approve every payment',
    'Nothing is bought or sent on your behalf. Budgets are enforced by the system, not just suggested.'
  ],
  [
    'Contributors stay in control',
    'They set prices, availability and whether AI may read their work. Those rules are enforced in code.'
  ],
  [
    'Clear attribution',
    'Answers separate what the contributor actually said from what the AI suggests and what is unknown.'
  ],
  [
    'Private by default',
    'You choose which details a contributor sees. Personal answers stay between the two of you.'
  ]
]

const chipStyles =
  'shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors'

export default async function HomePage(): Promise<React.JSX.Element> {
  const [guides, categories] = await Promise.all([
    listGuides({}),
    listCategories()
  ])
  const featured = guides.data?.data.slice(0, 6) ?? []

  return (
    <div>
      <section className='mx-auto max-w-page px-4 sm:px-6 lg:px-8 pt-4'>
        <div className='grid items-center gap-12 overflow-hidden rounded-[2rem] bg-linear-to-br from-ink-50 via-card to-mint-50 px-6 py-16 ring-1 ring-ink-100 sm:px-12 lg:grid-cols-[1.05fr_1fr] lg:py-20'>
          <div className='max-w-xl'>
            <h1 className='font-display text-5xl leading-[1.02] font-semibold tracking-tight text-ink-900 sm:text-6xl'>
              Earn from your experience. Learn from someone else’s.
            </h1>
            <p className='mt-6 text-lg text-ink-500'>
              A network of people helping each other, with AI as the matchmaker.
              Tell it what you are facing. It finds people who have lived it,
              connects you when you need a personal answer, and pays everyone
              whose experience helped.
            </p>
            <div className='mt-9 flex flex-wrap gap-3'>
              <ButtonLink href='/steward' size='lg'>
                Find guidance
                <ArrowIcon />
              </ButtonLink>
              <ButtonLink href='/studio' variant='secondary' size='lg'>
                Share my experience
              </ButtonLink>
            </div>
            <p className='mt-8 flex items-center gap-2 text-sm text-ink-500'>
              <span className='grid h-5 w-5 place-items-center rounded-full bg-mint-600 text-white'>
                <CheckIcon className='h-3 w-3' />
              </span>
              You approve every payment. Contributors keep 85%. Payments,
              refunds and payouts run on PayPal.
            </p>
          </div>
          <HeroVisual />
        </div>
      </section>

      {featured.length > 0 && (
        <section className='mx-auto max-w-page px-4 sm:px-6 lg:px-8 pt-24'>
          <div className='mx-auto max-w-xl text-center'>
            <h2 className='font-display text-4xl font-semibold tracking-tight sm:text-5xl'>
              Curated for you
            </h2>
            <p className='mt-4 text-ink-500'>
              Firsthand guides, reviewed before publishing. Every one has a free
              preview, so you can decide before you buy.
            </p>
          </div>
          <nav
            aria-label='Categories'
            className='-mx-4 mt-8 mb-10 flex gap-2 overflow-x-auto px-4 pb-1 sm:justify-center'
          >
            <Link
              href='/guides'
              className={`${chipStyles} bg-ink-900 text-white`}
            >
              All guides
            </Link>
            {categories.data?.slice(0, 6).map((category) => (
              <Link
                key={category.slug}
                href={`/guides?category=${category.slug}`}
                className={`${chipStyles} bg-ink-50 text-ink-700 hover:bg-ink-100`}
              >
                {category.name}
              </Link>
            ))}
          </nav>
          <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
            {featured.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
          {guides.data && guides.data.meta.total > featured.length && (
            <div className='mt-10 text-center'>
              <ButtonLink href='/guides' variant='secondary'>
                See all {guides.data.meta.total} guides
                <ArrowIcon />
              </ButtonLink>
            </div>
          )}
        </section>
      )}

      <section className='mx-auto max-w-page px-4 sm:px-6 lg:px-8 pt-28'>
        <h2 className='text-center font-display text-4xl font-semibold tracking-tight sm:text-5xl'>
          How it works
        </h2>
        <ol className='mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4'>
          {steps.map((step, index) => (
            <li key={step.title} className='border-t border-ink-200 pt-6'>
              <span className='font-display text-sm font-semibold text-mint-700'>
                0{index + 1}
              </span>
              <h3 className='mt-3 font-display text-xl leading-snug font-semibold tracking-tight'>
                {step.title}
              </h3>
              <p className='mt-2 text-ink-500'>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className='mx-auto max-w-page px-4 sm:px-6 lg:px-8 pt-28'>
        <h2 className='text-center font-display text-4xl font-semibold tracking-tight sm:text-5xl'>
          Why not just ask a chatbot?
        </h2>
        <dl className='mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2'>
          {notAChatbot.map(([title, body]) => (
            <div key={title}>
              <dt className='font-display text-xl font-semibold'>{title}</dt>
              <dd className='mt-2 text-ink-500'>{body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className='mx-auto max-w-page px-4 sm:px-6 lg:px-8 pt-28'>
        <div className='rounded-[2rem] bg-ink-50 px-6 py-12 ring-1 ring-ink-100 sm:px-12'>
          <div className='flex flex-wrap items-baseline justify-between gap-3'>
            <h2 className='font-display text-3xl font-semibold tracking-tight sm:text-4xl'>
              How the money moves
            </h2>
            <SandboxBadge />
          </div>
          <ol className='mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
            {moneySteps.map(([title, body], index) => (
              <li key={title}>
                <span className='font-display text-sm font-semibold text-mint-700'>
                  0{index + 1}
                </span>
                <h3 className='mt-2 font-semibold'>{title}</h3>
                <p className='mt-1 text-sm text-ink-500'>{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className='mx-auto max-w-page px-4 sm:px-6 lg:px-8 pt-28'>
        <div className='grid gap-12 lg:grid-cols-[1fr_1.4fr]'>
          <div>
            <h2 className='font-display text-4xl font-semibold tracking-tight sm:text-5xl'>
              How we keep it fair
            </h2>
            <p className='mt-5 text-ink-500'>
              Contributors keep 85% of each sale; EnrichMINT keeps a 15%
              commission and pays the PayPal processing fee and field note
              shares from it. EnrichMINT does not promise income or career
              outcomes. Shared experience is self-reported.
            </p>
          </div>
          <dl className='grid gap-x-10 gap-y-8 sm:grid-cols-2'>
            {promises.map(([title, body]) => (
              <div key={title}>
                <dt className='flex items-center gap-3 font-semibold'>
                  <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mint-50 text-mint-700 ring-1 ring-mint-200'>
                    <CheckIcon className='h-3.5 w-3.5' />
                  </span>
                  {title}
                </dt>
                <dd className='mt-2 text-sm text-ink-500'>{body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className='mx-auto max-w-page px-4 sm:px-6 lg:px-8 pt-28'>
        <div className='flex flex-col items-center rounded-[2rem] bg-ink-950 px-6 py-16 text-center text-white sm:py-20'>
          <h2 className='max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl'>
            Lived through something others are facing?
          </h2>
          <p className='mt-4 max-w-xl text-ink-300'>
            A short interview turns your experience into a guide. Set your own
            price, and choose whether AI may read it.
          </p>
          <ButtonLink
            href='/studio'
            variant='accent'
            size='lg'
            className='mt-9'
          >
            Share my experience
            <ArrowIcon />
          </ButtonLink>
        </div>
      </section>
    </div>
  )
}

/** Illustrative product shot built from UI pieces; static and labelled so it never quotes a real contributor. */
function HeroVisual(): React.JSX.Element {
  const name = 'Example contributor'
  return (
    <div aria-hidden='true' className='relative mx-auto w-full max-w-md py-6'>
      <div className='absolute inset-x-6 top-10 bottom-0 rounded-[2rem] bg-mint-100/60 blur-2xl' />
      <div className='relative rotate-[-2deg] rounded-3xl bg-card p-6 shadow-lift ring-1 ring-ink-100'>
        <div className='flex items-center justify-between gap-3'>
          <Badge tone='mint'>Career change</Badge>
          <span className='text-xs text-ink-400'>Example</span>
        </div>
        <p className='mt-4 line-clamp-2 font-display text-2xl leading-snug font-semibold tracking-tight'>
          How I moved from support work to freelancing
        </p>
        <div className='mt-4 flex items-center gap-2.5'>
          <Avatar name={name} size='sm' />
          <span className='text-sm font-medium'>{name}</span>
        </div>
        <div className='mt-6 flex items-end justify-between border-t border-ink-100 pt-4'>
          <span className='font-display text-3xl font-semibold tracking-tight'>
            {formatUsd(1500)}
          </span>
          <span className='grid h-10 w-10 place-items-center rounded-full bg-zest-300'>
            <ArrowIcon />
          </span>
        </div>
      </div>
      <div className='relative -mt-4 ml-auto w-[85%] rotate-[1.5deg] space-y-2 rounded-3xl bg-card p-4 shadow-lift ring-1 ring-ink-100'>
        <div className='rounded-2xl bg-human-50 px-4 py-3 ring-1 ring-human-600/20'>
          <p className='text-xs font-semibold tracking-wide text-human-600 uppercase'>
            {name} said
          </p>
          <p className='mt-1 text-sm text-ink-900'>
            Start with one paid project before you quit anything.
          </p>
        </div>
        <div className='rounded-2xl bg-ai-50 px-4 py-3 ring-1 ring-ai-600/20'>
          <p className='text-xs font-semibold tracking-wide text-ai-600 uppercase'>
            AI suggestion
          </p>
          <p className='mt-1 text-sm text-ink-900'>
            Your weekends could fit two small projects a month.
          </p>
        </div>
      </div>
    </div>
  )
}
