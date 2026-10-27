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
type PayPalInstance = {
  findEligibleMethods: (options: {
    currencyCode: string
  }) => Promise<{ isEligible: (method: string) => boolean }>
  createPayPalOneTimePaymentSession: (options: {
    onApprove: (data: { orderId: string }) => Promise<void>
    onCancel: () => void
    onError: (error: unknown) => void
  }) => PayPalSession
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
declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'paypal-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { type?: string }
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
 * PayPal checkout (JS SDK v6). The server creates the order with its own
 * price, and the server captures and confirms it. This component never
 * decides whether a payment succeeded; it only shows what the server says.
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
  const buttonRef = useRef<HTMLElement>(null)
  const sessionRef = useRef<PayPalSession | null>(null)
  const orderIdRef = useRef<string | null>(null)
  const approvedRef = useRef(approved)
  const bodyRef = useRef(body)
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
        const instance = await window.paypal!.createInstance({
          clientId,
          components: ['paypal-payments'],
          pageType: 'checkout'
        })
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
        sessionRef.current = instance.createPayPalOneTimePaymentSession({
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
        })
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
    const button = buttonRef.current
    if (!button || phase.name !== 'ready') return
    const onClick = async (): Promise<void> => {
      setError(null)
      if (!approvedRef.current) {
        setError('Tick the box to approve this payment first.')
        return
      }
      const order = startCheckout({ ...bodyRef.current, approved: true }).then(
        (result) => {
          if (result.error !== null) {
            setError(result.error)
            throw new Error(result.code ?? 'checkout_failed')
          }
          orderIdRef.current = result.data.orderId
          return { orderId: result.data.paypalOrderId }
        }
      )
      try {
        await sessionRef.current!.start({ presentationMode: 'auto' }, order)
      } catch {
        // The error is already shown from the order promise or onError.
      }
    }
    button.addEventListener('click', onClick)
    return () => button.removeEventListener('click', onClick)
  }, [phase.name])

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
      <div className={phase.name === 'ready' ? '' : 'hidden'}>
        <paypal-button ref={buttonRef} type='pay' />
      </div>
    </div>
  )
}
