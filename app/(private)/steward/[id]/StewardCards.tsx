'use client'
import { AnswerBlocks } from '@/app/components/AnswerBlocks'
import { LocalTime } from '@/app/components/LocalTime'
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  ErrorNote,
  Notice,
  SandboxBadge
} from '@/app/components/ui'
import { SOURCE_TITLES } from '@/app/lib/constants/sections'
import type {
  StewardCard,
  StewardEvent,
  StewardView
} from '@/app/lib/types/steward.type'
import { formatUsd, hours } from '@/app/lib/utils/format'
import { ApproveAndPay } from '../../checkout/ApproveAndPay'

type Props = {
  event: StewardEvent
  view: StewardView
  paypal: { clientId: string | undefined; env: 'sandbox' | 'live' }
  onSend: (text: string) => void
  busy: boolean
}

/** Every card is a proposal. Money moves only through the approve tick and PayPal, never from the steward. */
export function StewardCardView({
  event,
  view,
  paypal,
  onSend,
  busy
}: Props): React.JSX.Element | null {
  const card = event.payload as StewardCard
  const { snapshot } = view
  const activeRequest = snapshot.activeRequest

  switch (card.type) {
    case 'guide_picks': {
      const { data } = card
      return (
        <Card className='space-y-4'>
          <p className='text-sm text-ink-700'>{data.message}</p>
          {data.picks.length === 0 ? (
            <ButtonLink href='/guides' variant='secondary' size='sm'>
              Browse all guides
            </ButtonLink>
          ) : (
            <ul className='space-y-3'>
              {data.picks.map((pick) => (
                <li key={pick.guideId} className='rounded-2xl bg-ink-50 p-4'>
                  <div className='flex flex-wrap items-start justify-between gap-3'>
                    <div className='min-w-0 flex-1'>
                      <p className='font-medium text-ink-900'>{pick.title}</p>
                      <p className='text-xs text-ink-500'>
                        by {pick.contributorName} · {formatUsd(pick.priceCents)}
                      </p>
                    </div>
                    <div className='flex flex-wrap gap-1'>
                      {pick.newContributor && (
                        <Badge tone='mint'>New contributor</Badge>
                      )}
                      {pick.owned && (
                        <Badge tone='human'>In your library</Badge>
                      )}
                      {pick.overBudget && (
                        <Badge tone='danger'>Over budget</Badge>
                      )}
                      {!pick.agentAssistAllowed && <Badge>No AI help</Badge>}
                    </div>
                  </div>
                  <p className='mt-2 text-sm text-ink-700'>
                    <span className='font-semibold'>Why it fits: </span>
                    {pick.reason}
                  </p>
                  {pick.caution && (
                    <p className='mt-1 text-sm text-ink-500'>
                      Keep in mind: {pick.caution}
                    </p>
                  )}
                  <div className='mt-3 flex flex-wrap gap-2'>
                    <ButtonLink
                      href={`/guides/${pick.slug}?goal=${view.goalId}`}
                      variant='secondary'
                      size='sm'
                    >
                      Read the preview
                    </ButtonLink>
                    {!pick.owned && !pick.overBudget && (
                      <Button
                        size='sm'
                        variant='ghost'
                        disabled={busy}
                        onClick={() =>
                          onSend(`I’m interested in “${pick.title}”.`)
                        }
                      >
                        I’m interested
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )
    }

    case 'guide_checkout': {
      const { data } = card
      const owned =
        snapshot.activeGuide?.id === data.guideId && snapshot.activeGuide.owned
      return (
        <Card className='space-y-4'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <p className='font-semibold'>Review purchase: {data.title}</p>
            <SandboxBadge />
          </div>
          <dl className='grid grid-cols-2 gap-2 text-sm'>
            <dt className='text-ink-500'>Price</dt>
            <dd className='text-right font-semibold'>
              {formatUsd(data.priceCents)}
            </dd>
            <dt className='text-ink-500'>AI help</dt>
            <dd className='text-right'>
              {data.agentAssistAllowed
                ? '10 grounded questions, 30 days'
                : 'Not allowed by the author'}
            </dd>
            <dt className='text-ink-500'>Budget after</dt>
            <dd className='text-right'>
              {formatUsd(snapshot.goal.remainingCents - data.priceCents)}
            </dd>
          </dl>
          {owned ? (
            <Notice tone='mint'>Bought. It is in your library.</Notice>
          ) : data.priceCents > snapshot.goal.remainingCents ? (
            <ErrorNote
              message={`This costs more than the ${formatUsd(snapshot.goal.remainingCents)} left in your budget. Only you can change your budget.`}
            />
          ) : (
            <ApproveAndPay
              {...paypal}
              label={`I approve paying ${formatUsd(data.priceCents)} for this guide.`}
              body={{
                kind: 'GUIDE',
                guideId: data.guideId,
                goalId: view.goalId
              }}
              successHref={`/steward/${view.id}`}
            />
          )}
        </Card>
      )
    }

    case 'guide_answer':
      return (
        <Card className='space-y-3'>
          <AnswerBlocks
            blocks={card.data.blocks}
            contributorName={card.data.contributorName}
            sourceTitles={SOURCE_TITLES}
          />
          <ButtonLink
            href={`/library/${card.data.guideId}?goal=${view.goalId}`}
            variant='ghost'
            size='sm'
          >
            Open the guide
          </ButtonLink>
        </Card>
      )

    case 'human_help_offer': {
      const { data } = card
      return (
        <Card className='space-y-2'>
          <p className='text-sm font-semibold text-ink-900'>
            A person can answer this
          </p>
          <p className='text-sm text-ink-700'>
            {data.contributorName} answers personal questions for{' '}
            {formatUsd(data.priceCents)}. They have {hours(data.acceptanceH)} to
            accept, then deliver within {hours(data.deliveryH)} of your payment.
          </p>
          {data.remainingBudgetCents !== null && (
            <Badge tone={data.withinBudget ? 'mint' : 'danger'}>
              {data.withinBudget
                ? `Fits your remaining ${formatUsd(data.remainingBudgetCents)}`
                : `Over your remaining ${formatUsd(data.remainingBudgetCents)}`}
            </Badge>
          )}
        </Card>
      )
    }

    case 'people_picks': {
      const { data } = card
      return (
        <Card className='space-y-4'>
          <div>
            <p className='text-sm font-semibold text-ink-900'>
              People who have lived this
            </p>
            <p className='text-xs text-ink-500'>
              From the EnrichMINT network. They answer personal questions for a
              fee, and you only pay if they accept.
            </p>
          </div>
          {data.people.length === 0 ? (
            <p className='text-sm text-ink-700'>
              No one in the network has shared this experience yet.
            </p>
          ) : (
            <ul className='space-y-3'>
              {data.people.map((person) => (
                <li
                  key={person.contributorId}
                  className='rounded-2xl bg-ink-50 p-4'
                >
                  <div className='flex flex-wrap items-start justify-between gap-3'>
                    <div className='flex min-w-0 flex-1 items-center gap-3'>
                      <Avatar name={person.name} size='sm' />
                      <div className='min-w-0'>
                        <p className='font-medium text-ink-900'>
                          {person.name}
                        </p>
                        <p className='text-xs text-ink-500'>
                          {person.headline}
                        </p>
                      </div>
                    </div>
                    <Badge tone={person.withinBudget ? 'mint' : 'danger'}>
                      {formatUsd(person.priceCents)}
                      {person.withinBudget ? ' fits budget' : ' over budget'}
                    </Badge>
                  </div>
                  <p className='mt-2 text-sm text-ink-700'>
                    <span className='font-semibold'>Why them: </span>
                    {person.reason}
                  </p>
                  <p className='mt-1 text-xs text-ink-500'>
                    Delivers within {hours(person.deliveryH)} of your payment.
                  </p>
                  {person.withinBudget && (
                    <Button
                      size='sm'
                      variant='secondary'
                      className='mt-3'
                      disabled={busy}
                      onClick={() =>
                        onSend(`Please draft a question to ${person.name}.`)
                      }
                    >
                      Ask {person.name}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )
    }

    case 'agent_exchange': {
      const { data } = card
      const fit = {
        FITS: ['Fits what they take on', 'mint'],
        UNSURE: ['Not sure it fits', 'warn'],
        OUTSIDE: ['Outside what they take on', 'danger']
      } as const
      const [fitLabel, fitTone] = fit[data.fit]
      return (
        <Card className='space-y-4'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <p className='text-sm font-semibold text-ink-900'>
                Your steward asked {data.contributorName}’s agent
              </p>
              <p className='text-xs text-ink-500'>
                Two AI agents checked the fit before anyone’s time or money is
                spent. Nothing was sent, accepted or paid.
              </p>
            </div>
            <Badge tone={fitTone}>{fitLabel}</Badge>
          </div>
          <div className='space-y-3'>
            <div className='mr-8 rounded-2xl bg-ink-50 p-3'>
              <p className='text-xs font-semibold text-ink-500'>Your steward</p>
              <p className='mt-1 text-sm text-ink-800'>{data.stewardMessage}</p>
            </div>
            <div className='ml-8 rounded-2xl bg-mint-50 p-3 ring-1 ring-mint-200'>
              <p className='flex items-center gap-2 text-xs font-semibold text-mint-800'>
                <Avatar name={data.contributorName} size='sm' />
                {data.contributorName}’s agent
              </p>
              <p className='mt-2 text-sm text-ink-800'>{data.reply}</p>
              {data.suggestedFocus && (
                <p className='mt-2 text-sm text-ink-700'>
                  <span className='font-semibold'>
                    To get a better answer:{' '}
                  </span>
                  {data.suggestedFocus}
                </p>
              )}
            </div>
          </div>
          {data.priceCents !== null && (
            <dl className='grid gap-2 rounded-2xl bg-ink-50 p-3 text-sm sm:grid-cols-3'>
              <div>
                <dt className='text-xs text-ink-500'>Their price</dt>
                <dd className='font-semibold'>
                  {formatUsd(data.priceCents)}
                  {data.withinBudget === false && (
                    <span className='font-normal text-danger-600'>
                      {' '}
                      over budget
                    </span>
                  )}
                </dd>
              </div>
              {data.acceptanceH !== null && (
                <div>
                  <dt className='text-xs text-ink-500'>They reply within</dt>
                  <dd className='font-semibold'>{hours(data.acceptanceH)}</dd>
                </div>
              )}
              {data.deliveryH !== null && (
                <div>
                  <dt className='text-xs text-ink-500'>Answer after payment</dt>
                  <dd className='font-semibold'>{hours(data.deliveryH)}</dd>
                </div>
              )}
            </dl>
          )}
          <p className='text-xs text-ink-400'>
            {data.aiUsed
              ? `The agent is AI reading ${data.contributorName}’s published profile and boundaries.`
              : 'The agent could not run, so this shows their published terms only.'}{' '}
            Price and deadlines are {data.contributorName}’s own settings.{' '}
            {data.contributorName} decides whether to accept, and you pay only
            after that.
          </p>
        </Card>
      )
    }

    case 'request_draft': {
      const { data } = card
      const state =
        activeRequest?.id === data.requestId ? activeRequest.state : null
      return (
        <Card className='space-y-3 ring-mint-300'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <p className='font-semibold'>
              Drafted request to {data.contributorName}
            </p>
            <Badge tone={state === 'DRAFT' ? 'warn' : 'mint'}>
              {state === 'DRAFT' || !state
                ? 'Not sent'
                : state.toLowerCase().replace('_', ' ')}
            </Badge>
          </div>
          <p className='text-sm text-ink-900'>“{data.question}”</p>
          <p className='text-xs text-ink-500'>
            {formatUsd(data.priceCents)} if accepted · {data.sharedCount}{' '}
            personal detail(s) currently set to share
          </p>
          {state === 'DRAFT' && (
            <ButtonLink href={`/requests/${data.requestId}`} size='sm'>
              Review, choose what to share, and send
            </ButtonLink>
          )}
        </Card>
      )
    }

    case 'request_checkout': {
      const { data } = card
      const payable =
        activeRequest?.id === data.requestId &&
        activeRequest.state === 'ACCEPTED'
      return (
        <Card className='space-y-4'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <p className='font-semibold'>
              Pay for {data.contributorName}’s answer
            </p>
            <SandboxBadge />
          </div>
          {payable ? (
            <>
              <p className='text-sm text-ink-700'>
                {formatUsd(data.priceCents)}, due{' '}
                <LocalTime iso={data.payBy} mode='relative' />. The delivery
                clock starts when PayPal confirms.
              </p>
              <ApproveAndPay
                {...paypal}
                label={`I approve paying ${formatUsd(data.priceCents)} for ${data.contributorName}’s personal answer.`}
                body={{ kind: 'REQUEST', requestId: data.requestId }}
                successHref={`/steward/${view.id}`}
              />
            </>
          ) : (
            <p className='text-sm text-ink-500'>
              No longer waiting for payment.
            </p>
          )}
        </Card>
      )
    }

    case 'response_ready': {
      const { data } = card
      const applied =
        activeRequest?.id === data.requestId && activeRequest.planCount > 0
      return (
        <Card className='flex flex-wrap items-center justify-between gap-3'>
          <p className='text-sm text-ink-900'>
            {data.contributorName}’s answer is ready.
          </p>
          <div className='flex gap-2'>
            <ButtonLink
              href={`/requests/${data.requestId}`}
              variant='secondary'
              size='sm'
            >
              Read it
            </ButtonLink>
            {data.aiAllowed && !applied && (
              <Button
                size='sm'
                disabled={busy}
                onClick={() =>
                  onSend(
                    `Help me apply ${data.contributorName}’s answer to my situation.`
                  )
                }
              >
                Turn it into next steps
              </Button>
            )}
          </div>
        </Card>
      )
    }

    case 'plan':
      return (
        <Card className='space-y-3'>
          <p className='font-semibold'>Suggested next steps</p>
          <p className='text-xs text-ink-500'>
            Review these before acting. They separate what{' '}
            {card.data.contributorName} said from AI suggestions.
          </p>
          <AnswerBlocks
            blocks={card.data.blocks}
            contributorName={card.data.contributorName}
            sourceTitles={SOURCE_TITLES}
          />
          <ButtonLink
            href={`/requests/${card.data.requestId}`}
            variant='ghost'
            size='sm'
          >
            Leave feedback on the answer
          </ButtonLink>
        </Card>
      )

    default:
      return null
  }
}
