'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { captureOrder, startCheckout } from '@/app/lib/services/learner.service'
import { CoinLoader } from './CoinLoader'
import { ErrorNote, Notice } from './ui'

/** The parts of the PayPal JS SDK v6 this component uses. */
type PayPalSession = {
  start: (
    options: { presentationMode: 'auto' | 'popup' | 'modal' },
    order: Promise<{ orderId: string }>
  ) => Promise<void>
}
type SessionOptions = {
  onApprove: (data: { orderId: string }) => Promise<void>
  onCancel: () => void
  onError: (error: unknown) => void
  onComplete?: () => void
}
type EligibleMethods = {
  isEligible: (method: string) => boolean
  getDetails: (method: string) => { productCode?: string; countryCode?: string }
}
type PayPalInstance = {
  findEligibleMethods: (options: {
    currencyCode: string
  }) => Promise<EligibleMethods>
  createPayPalOneTimePaymentSession: (options: SessionOptions) => PayPalSession
  createVenmoOneTimePaymentSession?: (options: SessionOptions) => PayPalSession
  createPayLaterOneTimePaymentSession?: (
    options: SessionOptions
  ) => PayPalSession
  createPayPalGuestOneTimePaymentSession?: (
    options: SessionOptions
  ) => Promise<PayPalSession>
}
declare global {
  interface Window {
    paypal?: {
      createInstance: (options: {
        clientId: string
        components: string[]
        pageType?: string
      }) => Promise<PayPalInstance>
    }
  }
}
type SdkElement = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> & { type?: string }
declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'paypal-button': SdkElement
      'venmo-button': SdkElement
      'paypal-pay-later-button': SdkElement
      'paypal-basic-card-container': SdkElement
      'paypal-basic-card-button': SdkElement
    }
  }
}

const SDK_URL = {
  sandbox: 'https://www.sandbox.paypal.com/web-sdk/v6/core',
  live: 'https://www.paypal.com/web-sdk/v6/core'
}

let sdkPromise: Promise<void> | null = null
function loadSdk(env: 'sandbox' | 'live'): Promise<void> {
  if (window.paypal) return Promise.resolve()
  sdkPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SDK_URL[env]
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      sdkPromise = null
      reject(new Error('PayPal SDK failed to load'))
    }
    document.head.appendChild(script)
  })
  return sdkPromise
}

/** Asks for every wallet; if PayPal rejects the extra components, falls back to the PayPal button alone. */
async function createInstance(clientId: string): Promise<PayPalInstance> {
  try {
    return await window.paypal!.createInstance({
      clientId,
      components: [
        'paypal-payments',
        'venmo-payments',
        'paypal-guest-payments'
      ],
      pageType: 'checkout'
    })
  } catch {
    return window.paypal!.createInstance({
      clientId,
      components: ['paypal-payments'],
      pageType: 'checkout'
    })
  }
}

type Method = 'paypal' | 'venmo' | 'paylater' | 'card'

type Body = {
  kind: 'GUIDE' | 'REQUEST'
  guideId?: string
  requestId?: string
  goalId?: string
}

type Phase =
  | { name: 'loading' }
  | { name: 'ready' }
  | { name: 'unavailable'; message: string }
  | { name: 'confirming' }
  | { name: 'pending' }
  | { name: 'done' }

/**
 * PayPal checkout (JS SDK v6) with PayPal, Venmo, Pay Later and card buttons,
 * each shown only when PayPal says the buyer is eligible. The server creates
 * the order with its own price, and the server captures and confirms it.
 * This component never decides whether a payment succeeded.
 */
export function PayPalCheckout({
  clientId,
  env,
  body,
  approved,
  successHref
}: {
  clientId: string | undefined
  env: 'sandbox' | 'live'
  body: Body
  approved: boolean
  successHref: string
}): React.JSX.Element {
  const router = useRouter()
  const paypalRef = useRef<HTMLElement>(null)
  const venmoRef = useRef<HTMLElement>(null)
  const paylaterRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLElement>(null)
  const sessionsRef = useRef<Partial<Record<Method, PayPalSession>>>({})
  const orderIdRef = useRef<string | null>(null)
  const approvedRef = useRef(approved)
  const bodyRef = useRef(body)
  const [eligible, setEligible] = useState<Method[]>([])
  const [phase, setPhase] = useState<Phase>(() =>
    clientId
      ? { name: 'loading' }
      : {
          name: 'unavailable',
          message: 'PayPal is not configured on this server yet.'
        }
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    approvedRef.current = approved
    bodyRef.current = body
  }, [approved, body])

  useEffect(() => {
    if (!clientId) return
    let cancelled = false
    ;(async () => {
      try {
        await loadSdk(env)
        const instance = await createInstance(clientId)
        const methods = await instance.findEligibleMethods({
          currencyCode: 'USD'
        })
        if (cancelled) return
        if (!methods.isEligible('paypal')) {
          setPhase({
            name: 'unavailable',
            message: 'PayPal checkout is not available in this browser.'
          })
          return
        }

        const options: SessionOptions = {
          onApprove: async () => {
            setPhase({ name: 'confirming' })
            const result = await captureOrder(orderIdRef.current!)
            if (result.error !== null) {
              setError(result.error)
              setPhase({ name: 'ready' })
              return
            }
            if (result.data.status === 'COMPLETED') {
              setPhase({ name: 'done' })
              router.push(successHref)
              router.refresh()
            } else if (result.data.status === 'CAPTURE_PENDING') {
              setPhase({ name: 'pending' })
            } else {
              setError(
                'PayPal did not complete the payment. Nothing was charged.'
              )
              setPhase({ name: 'ready' })
            }
          },
          onCancel: () => setError('Checkout cancelled. Nothing was charged.'),
          onError: () =>
            setError(
              'PayPal reported a problem. Nothing was charged; try again.'
            )
        }

        const sessions: Partial<Record<Method, PayPalSession>> = {
          paypal: instance.createPayPalOneTimePaymentSession(options)
        }
        // Each extra wallet is optional: if one fails to set up, the others still work.
        try {
          if (
            methods.isEligible('venmo') &&
            instance.createVenmoOneTimePaymentSession
          )
            sessions.venmo = instance.createVenmoOneTimePaymentSession(options)
        } catch {
          // Venmo stays hidden.
        }
        try {
          if (
            methods.isEligible('paylater') &&
            instance.createPayLaterOneTimePaymentSession
          ) {
            sessions.paylater =
              instance.createPayLaterOneTimePaymentSession(options)
            const details = methods.getDetails('paylater')
            const button = paylaterRef.current as
              | (HTMLElement & { productCode?: string; countryCode?: string })
              | null
            if (button) {
              button.productCode = details.productCode
              button.countryCode = details.countryCode
            }
          }
        } catch {
          // Pay Later stays hidden.
        }
        try {
          if (
            methods.isEligible('card') &&
            instance.createPayPalGuestOneTimePaymentSession
          )
            sessions.card =
              await instance.createPayPalGuestOneTimePaymentSession({
                ...options,
                onComplete: () => undefined
              })
        } catch {
          // Card stays hidden; PayPal's own popup still offers card checkout.
        }
        if (cancelled) return
        sessionsRef.current = sessions
        setEligible(Object.keys(sessions) as Method[])
        setPhase({ name: 'ready' })
      } catch {
        if (!cancelled)
          setPhase({
            name: 'unavailable',
            message: 'Could not load PayPal. Check your connection and refresh.'
          })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [clientId, env, router, successHref])

  useEffect(() => {
    if (phase.name !== 'ready') return
    const cleanups: (() => void)[] = []
    for (const method of eligible) {
      const button = {
        paypal: paypalRef,
        venmo: venmoRef,
        paylater: paylaterRef,
        card: cardRef
      }[method].current
      const session = sessionsRef.current[method]
      if (!button || !session) continue
      const onClick = async (): Promise<void> => {
        setError(null)
        if (!approvedRef.current) {
          setError('Tick the box to approve this payment first.')
          return
        }
        const order = startCheckout({
          ...bodyRef.current,
          approved: true
        }).then((result) => {
          if (result.error !== null) {
            setError(result.error)
            throw new Error(result.code ?? 'checkout_failed')
          }
          orderIdRef.current = result.data.orderId
          return { orderId: result.data.paypalOrderId }
        })
        try {
          await session.start({ presentationMode: 'auto' }, order)
        } catch {
          // The error is already shown from the order promise or onError.
        }
      }
      button.addEventListener('click', onClick)
      cleanups.push(() => button.removeEventListener('click', onClick))
    }
    return () => cleanups.forEach((cleanup) => cleanup())
  }, [phase.name, eligible])

  const show = (method: Method): string =>
    eligible.includes(method) ? '' : 'hidden'

  return (
    <div className='space-y-3'>
      {error && <ErrorNote message={error} />}
      {phase.name === 'unavailable' && (
        <Notice tone='warn'>{phase.message}</Notice>
      )}
      {phase.name === 'loading' && (
        <CoinLoader label='Loading PayPal…' showLabel />
      )}
      {phase.name === 'confirming' && (
        <Notice>
          <CoinLoader label='Confirming your payment with PayPal…' showLabel />
        </Notice>
      )}
      {phase.name === 'pending' && (
        <Notice tone='warn' title='Payment pending at PayPal'>
          PayPal has not finished this payment yet. You will get access as soon
          as it confirms; check your library in a few minutes.
        </Notice>
      )}
      {phase.name === 'done' && (
        <Notice tone='mint'>Payment confirmed. Opening…</Notice>
      )}
      <div
        className={phase.name === 'ready' ? 'grid gap-2' : 'hidden'}
        aria-label='Payment options'
      >
        <div className={show('paypal')}>
          <paypal-button ref={paypalRef} type='pay' />
        </div>
        <div className={show('venmo')}>
          <venmo-button ref={venmoRef} type='pay' />
        </div>
        <div className={show('paylater')}>
          <paypal-pay-later-button ref={paylaterRef} />
        </div>
        <div className={show('card')}>
          <paypal-basic-card-container>
            <paypal-basic-card-button ref={cardRef} />
          </paypal-basic-card-container>
        </div>
        <p className='text-xs text-ink-400'>
          Options shown are the ones PayPal offers for your account and
          location. Sandbox only: no real money moves.
        </p>
      </div>
    </div>
  )
}
