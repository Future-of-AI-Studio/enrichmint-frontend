import { notFound } from 'next/navigation'
import { getSteward } from '@/app/lib/services/steward.service'
import { paypalConfig } from '@/app/lib/utils/paypalConfig'
import { StewardChat } from './StewardChat'

export const metadata = { title: 'Steward' }

export default async function StewardPage({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<React.JSX.Element> {
  const { id } = await params
  const result = await getSteward(id)
  if (result.error !== null) notFound()
  return (
    // Remount when the server has newer events (e.g. after returning from PayPal).
    <StewardChat
      key={`${result.data.events.at(-1)?.id ?? 'empty'}-${result.data.stage}`}
      initial={result.data}
      paypal={paypalConfig()}
    />
  )
}
