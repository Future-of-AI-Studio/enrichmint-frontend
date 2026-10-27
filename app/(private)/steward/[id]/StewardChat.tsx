'use client'
import classNames from 'classnames'
import { useEffect, useRef, useState, useTransition } from 'react'
import {
  Badge,
  Button,
  Card,
  CheckIcon,
  ErrorNote,
  fieldStyles
} from '@/app/components/ui'
import type { StewardEvent, StewardView } from '@/app/lib/types/steward.type'
import { getSteward, messageSteward } from '@/app/lib/services/steward.service'
import { formatUsd } from '@/app/lib/utils/format'
import {
  RAIL_STEPS,
  STAGE_LABELS,
  STAGE_PROGRESS,
  WAITING_STAGES
} from '../stages'
import { StewardCardView } from './StewardCards'
import { CoinLoader } from '@/app/components/CoinLoader'
import { LocalTime } from '@/app/components/LocalTime'

const POLL_MS = 10_000

export function StewardChat({
  initial,
  paypal
}: {
  initial: StewardView
  paypal: { clientId: string | undefined; env: 'sandbox' | 'live' }
}): React.JSX.Element {
  const [view, setView] = useState(initial)
  const [text, setText] = useState('')
  const [pendingText, setPendingText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)

  const waiting = WAITING_STAGES.includes(view.stage)

  // Someone else acts next (contributor or PayPal): pick up their changes without a reload.
  useEffect(() => {
    if (!waiting) return
    const timer = setInterval(async () => {
      const result = await getSteward(view.id)
      if (result.error === null) setView(result.data)
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [waiting, view.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [view.events.length, pendingText])

  const send = (message: string): void => {
    const trimmed = message.trim()
    if (!trimmed || pending) return
    setError(null)
    setPendingText(trimmed)
    setText('')
    startTransition(async () => {
      const result = await messageSteward(view.id, trimmed)
      setPendingText(null)
      if (result.error !== null) {
        setError(result.error)
        const refreshed = await getSteward(view.id)
        if (refreshed.error === null) setView(refreshed.data)
        return
      }
      setView(result.data)
    })
  }

  const lastAgent = [...view.events]
    .reverse()
    .find((event) => event.kind === 'AGENT_MESSAGE')
  const suggestions = !pending
    ? (lastAgent?.payload.suggestedReplies ?? [])
    : []

  return (
    <div className='grid gap-8 lg:grid-cols-[1fr_320px]'>
      <section className='flex min-h-[70vh] flex-col'>
        <div className='mb-6 space-y-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge tone='ai'>Steward</Badge>
            <Badge>{STAGE_LABELS[view.stage]}</Badge>
          </div>
          <h1 className='font-display text-3xl font-semibold tracking-tight'>
            {view.snapshot.goal.text}
          </h1>
        </div>

        <div className='flex-1 space-y-4'>
          {view.events.length === 0 && (
            <Card className='text-sm text-ink-700'>
              Say hello, or ask the steward to find guidance for your goal. It
              will show every step it takes and stop whenever a decision is
              yours.
            </Card>
          )}
          {view.events.map((event) => (
            <EventView
              key={event.id}
              event={event}
              view={view}
              paypal={paypal}
              onSend={send}
              busy={pending}
            />
          ))}
          {pendingText && (
            <>
              <UserBubble text={pendingText} />
              <p className='flex items-center gap-2 text-sm text-ink-500'>
                <CoinLoader size={28} />
                The steward is working…
              </p>
            </>
          )}
          {error && <ErrorNote message={error} />}
          <div ref={bottomRef} />
        </div>

        <div className='sticky bottom-0 mt-6 space-y-3 bg-paper/95 pt-3 pb-2 backdrop-blur'>
          {suggestions.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {suggestions.map((reply) => (
                <button
                  key={reply}
                  onClick={() => send(reply)}
                  className='rounded-full bg-card px-3 py-1 text-sm text-ink-700 ring-1 ring-ink-200 hover:ring-mint-300'
                >
                  {reply}
                </button>
              ))}
            </div>
          )}
          <form
            className='flex gap-2'
            onSubmit={(event) => {
              event.preventDefault()
              send(text)
            }}
          >
            <input
              className={fieldStyles}
              placeholder='Ask the steward…'
              value={text}
              disabled={pending}
              onChange={(event) => setText(event.target.value)}
            />
            <Button type='submit' disabled={pending || !text.trim()}>
              Send
            </Button>
          </form>
          <p className='text-xs text-ink-400'>
            The steward can search, read your guides, check prices and draft
            requests. Only you can buy, send or pay.
          </p>
        </div>
      </section>

      <StatusRail view={view} />
    </div>
  )
}

function UserBubble({ text }: { text: string }): React.JSX.Element {
  return (
    <div className='ml-auto max-w-[85%] rounded-3xl rounded-br-md bg-ink-900 px-4 py-3 text-sm text-white'>
      {text}
    </div>
  )
}

function EventView({
  event,
  view,
  paypal,
  onSend,
  busy
}: {
  event: StewardEvent
  view: StewardView
  paypal: { clientId: string | undefined; env: 'sandbox' | 'live' }
  onSend: (text: string) => void
  busy: boolean
}): React.JSX.Element | null {
  switch (event.kind) {
    case 'USER_MESSAGE':
      return <UserBubble text={event.summary} />
    case 'AGENT_MESSAGE':
      return (
        <div className='flex max-w-[90%] gap-3'>
          <img
            src='/brand/enrichmint-coin.webp'
            alt=''
            width={28}
            height={28}
            className='h-7 w-7 shrink-0'
          />
          <div className='rounded-3xl rounded-tl-md bg-card px-4 py-3 text-sm text-ink-900 shadow-card ring-1 ring-ink-100'>
            {event.summary}
          </div>
        </div>
      )
    case 'TOOL_STEP':
      return (
        <p className='ml-10 flex items-start gap-2 text-xs text-ink-500'>
          <span className='mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ai-600' />
          {event.summary}
        </p>
      )
    case 'SYSTEM_UPDATE':
      return (
        <div className='rounded-2xl bg-mint-50 px-4 py-3 text-sm text-mint-900 ring-1 ring-mint-200'>
          <span className='mr-2 text-xs font-semibold uppercase'>Update</span>
          {event.summary}
        </div>
      )
    case 'PROPOSAL':
      return event.payload.type ? (
        <div className='ml-10'>
          <StewardCardView
            event={event}
            view={view}
            paypal={paypal}
            onSend={onSend}
            busy={busy}
          />
        </div>
      ) : null
  }
}

function StatusRail({ view }: { view: StewardView }): React.JSX.Element {
  const done = STAGE_PROGRESS[view.stage]
  const { goal, activeGuide, activeRequest } = view.snapshot
  const used = goal.budgetCents
    ? Math.min(100, (goal.committedCents / goal.budgetCents) * 100)
    : 100
  const nextDeadline =
    activeRequest?.state === 'SENT'
      ? ['Acceptance due', activeRequest.acceptBy]
      : activeRequest?.state === 'ACCEPTED'
        ? ['Payment due', activeRequest.payBy]
        : activeRequest && ['PAID', 'OVERDUE'].includes(activeRequest.state)
          ? ['Delivery due', activeRequest.deliverBy]
          : null

  return (
    <aside className='space-y-4 lg:sticky lg:top-24 lg:self-start'>
      <Card className='space-y-4'>
        <h2 className='text-sm font-semibold text-ink-500'>
          Where things stand
        </h2>
        <ol className='space-y-2'>
          {RAIL_STEPS.map((step, index) => {
            const complete = index < done
            const current = index === done && view.stage !== 'DONE'
            return (
              <li key={step} className='flex items-center gap-3 text-sm'>
                <span
                  className={classNames(
                    'grid h-6 w-6 place-items-center rounded-full text-xs',
                    complete
                      ? 'bg-mint-600 text-white'
                      : current
                        ? 'bg-zest-300 text-ink-900'
                        : 'bg-ink-100 text-ink-400'
                  )}
                >
                  {complete ? <CheckIcon /> : index + 1}
                </span>
                <span
                  className={
                    complete || current ? 'text-ink-900' : 'text-ink-400'
                  }
                >
                  {step}
                </span>
              </li>
            )
          })}
        </ol>
        {view.stage === 'ENDED' && (
          <p className='text-sm text-ink-500'>
            The last request ended. Ask the steward for other options.
          </p>
        )}
        <div className='rounded-2xl bg-ink-50 p-3 text-sm'>
          <p className='font-semibold'>Next</p>
          <p className='text-ink-700'>{view.nextStep}</p>
          {nextDeadline && nextDeadline[1] && (
            <p className='mt-1 text-xs text-ink-500'>
              {nextDeadline[0]}{' '}
              <LocalTime iso={nextDeadline[1]} mode='relative' />
            </p>
          )}
          {WAITING_STAGES.includes(view.stage) && (
            <p className='mt-1 text-xs text-ink-400'>
              This page checks for updates every 10 seconds.
            </p>
          )}
        </div>
      </Card>
      <Card className='space-y-2'>
        <div className='flex justify-between text-sm'>
          <span className='text-ink-500'>Budget left</span>
          <span className='font-semibold'>
            {formatUsd(goal.remainingCents)} of {formatUsd(goal.budgetCents)}
          </span>
        </div>
        <div className='h-2 overflow-hidden rounded-full bg-ink-100'>
          <div className='h-full bg-mint-500' style={{ width: `${used}%` }} />
        </div>
        <p className='text-xs text-ink-400'>
          Spent or promised: {formatUsd(goal.committedCents)}. Only you can
          change the budget.
        </p>
      </Card>
      {activeGuide && (
        <Card className='space-y-1 text-sm'>
          <p className='text-ink-500'>Guide</p>
          <p className='font-medium'>{activeGuide.title}</p>
          <p className='text-xs text-ink-500'>
            {activeGuide.owned
              ? activeGuide.agentAssistAllowed
                ? `In your library · ${activeGuide.questionsLeft} AI questions left`
                : 'In your library · AI not allowed by the author'
              : `Not bought · ${formatUsd(activeGuide.priceCents)}`}
          </p>
        </Card>
      )}
    </aside>
  )
}
