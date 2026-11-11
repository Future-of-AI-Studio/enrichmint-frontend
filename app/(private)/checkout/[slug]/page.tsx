import { notFound, redirect } from 'next/navigation'
import {
  Card,
  ErrorNote,
  Notice,
  PageHeader,
  SandboxBadge
} from '@/app/components/ui'
import { getGuide } from '@/app/lib/services/guides.service'
import { getGoal } from '@/app/lib/services/learner.service'
import { formatUsd } from '@/app/lib/utils/format'
import { paypalConfig } from '@/app/lib/utils/paypalConfig'
import { ApproveAndPay } from '../ApproveAndPay'

export const metadata = { title: 'Review purchase' }

export default async function CheckoutPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ goal?: string }>
}): Promise<React.JSX.Element> {
  const [{ slug }, { goal: goalId }] = await Promise.all([params, searchParams])
  const guideResult = await getGuide(slug)
  if (guideResult.error !== null) notFound()
  const guide = guideResult.data
  if (guide.owned) redirect(`/library/${guide.id}`)
  const goal = goalId ? (await getGoal(goalId)).data : null
  const overBudget = goal ? guide.priceCents > goal.remainingCents : false

  return (
    <div className='mx-auto max-w-2xl'>
      <PageHeader
        title={guide.title}
        description={`by ${guide.contributor.user.displayName}`}
      />
      <Card className='space-y-5'>
        <dl className='space-y-2 text-sm'>
          <Row label='Price' value={formatUsd(guide.priceCents)} strong />
          <Row label='You get' value='The full guide to read any time' />
          <Row
            label='AI assistance'
            value={
              guide.agentAssistAllowed
                ? 'Up to 10 grounded questions for 30 days'
                : 'Not included: the contributor does not allow AI to read this guide'
            }
          />
          {goal && (
            <Row
              label='Budget after this'
              value={`${formatUsd(goal.remainingCents - guide.priceCents)} of ${formatUsd(goal.budgetCents)}`}
            />
          )}
        </dl>
        <Notice>
          Contributor share: {formatUsd(Math.round(guide.priceCents * 0.85))}.
          EnrichMINT commission:{' '}
          {formatUsd(guide.priceCents - Math.round(guide.priceCents * 0.85))},
          from which we pay PayPal’s fee.
        </Notice>
        {guide.status !== 'PUBLISHED' || guide.isOwn ? (
          <ErrorNote message='This guide cannot be bought right now.' />
        ) : overBudget ? (
          <ErrorNote
            message={`This guide costs ${formatUsd(guide.priceCents)}, and you have ${formatUsd(goal!.remainingCents)} left in this goal’s budget. Change your budget on the Learn page if you want to go ahead.`}
          />
        ) : (
          <>
            <div className='flex items-center gap-2 text-xs text-ink-500'>
              <SandboxBadge /> Test payment: use a PayPal sandbox buyer account
              or a sandbox test card.
            </div>
            <ApproveAndPay
              {...paypalConfig()}
              label={`I approve paying ${formatUsd(guide.priceCents)} for this guide.`}
              body={{
                kind: 'GUIDE',
                guideId: guide.id,
                ...(goal ? { goalId: goal.id } : {})
              }}
              successHref={`/library/${guide.id}?purchased=1${goal ? `&goal=${goal.id}` : ''}`}
            />
          </>
        )}
      </Card>
    </div>
  )
}

function Row({
  label,
  value,
  strong
}: {
  label: string
  value: string
  strong?: boolean
}): React.JSX.Element {
  return (
    <div className='flex justify-between gap-4'>
      <dt className='text-ink-500'>{label}</dt>
      <dd
        className={strong ? 'text-lg font-semibold' : 'text-right text-ink-900'}
      >
        {value}
      </dd>
    </div>
  )
}
