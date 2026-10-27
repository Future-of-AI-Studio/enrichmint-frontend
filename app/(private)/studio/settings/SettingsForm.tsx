'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Button,
  Card,
  ErrorNote,
  Field,
  fieldStyles
} from '@/app/components/ui'
import type { ContributorProfile } from '@/app/lib/types/user.type'
import { updateMyProfile } from '@/app/lib/services/studio.service'

export function SettingsForm({
  profile
}: {
  profile: ContributorProfile
}): React.JSX.Element {
  const router = useRouter()
  const [headline, setHeadline] = useState(profile.headline)
  const [background, setBackground] = useState(profile.background)
  const [payoutEmail, setPayoutEmail] = useState(profile.payoutEmail ?? '')
  const [accepting, setAccepting] = useState(profile.acceptingRequests)
  const [price, setPrice] = useState(
    profile.responsePriceCents ? String(profile.responsePriceCents / 100) : ''
  )
  const [acceptH, setAcceptH] = useState(String(profile.acceptanceWindowH))
  const [deliveryH, setDeliveryH] = useState(String(profile.deliveryH))
  const [boundaries, setBoundaries] = useState(profile.boundaries ?? '')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className='space-y-6'>
      {error && <ErrorNote message={error} />}
      <Card className='space-y-4'>
        <h2 className='font-semibold'>Profile</h2>
        <Field label='One line about you'>
          <input
            className={fieldStyles}
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
        </Field>
        <Field label='Background'>
          <textarea
            className={`${fieldStyles} min-h-28`}
            value={background}
            onChange={(e) => setBackground(e.target.value)}
          />
        </Field>
      </Card>
      <Card className='space-y-4'>
        <h2 className='font-semibold'>Personal requests</h2>
        <label className='flex items-center gap-3 text-sm'>
          <input
            type='checkbox'
            className='h-4 w-4 accent-mint-600'
            checked={accepting}
            onChange={(e) => setAccepting(e.target.checked)}
          />
          Accept personal written requests from people who read my guides
        </label>
        <div className='grid gap-4 sm:grid-cols-3'>
          <Field label='Price (USD)' hint='You keep 85%'>
            <input
              className={fieldStyles}
              inputMode='decimal'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </Field>
          <Field label='Hours to accept'>
            <input
              className={fieldStyles}
              inputMode='numeric'
              value={acceptH}
              onChange={(e) => setAcceptH(e.target.value)}
            />
          </Field>
          <Field label='Hours to deliver' hint='Counted from payment'>
            <input
              className={fieldStyles}
              inputMode='numeric'
              value={deliveryH}
              onChange={(e) => setDeliveryH(e.target.value)}
            />
          </Field>
        </div>
        <Field label='Boundaries' hint='Topics you will and will not answer.'>
          <textarea
            className={`${fieldStyles} min-h-20`}
            value={boundaries}
            onChange={(e) => setBoundaries(e.target.value)}
          />
        </Field>
      </Card>
      <Card className='space-y-4'>
        <h2 className='font-semibold'>Payouts</h2>
        <Field
          label='PayPal email for payouts'
          hint='Use a PayPal sandbox personal account email in this demo.'
        >
          <input
            className={fieldStyles}
            type='email'
            value={payoutEmail}
            onChange={(e) => setPayoutEmail(e.target.value)}
          />
        </Field>
      </Card>
      <Button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null)
            const result = await updateMyProfile({
              headline,
              background,
              acceptingRequests: accepting,
              responsePriceCents: price ? Math.round(Number(price) * 100) : 0,
              acceptanceWindowH: Number(acceptH),
              deliveryH: Number(deliveryH),
              boundaries,
              ...(payoutEmail ? { payoutEmail } : {})
            })
            if (result.error !== null) return setError(result.error)
            toast.success('Settings saved')
            router.refresh()
          })
        }
      >
        Save settings
      </Button>
    </div>
  )
}
