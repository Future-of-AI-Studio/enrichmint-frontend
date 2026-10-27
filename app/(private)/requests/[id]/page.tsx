import { notFound } from 'next/navigation'
import { RequestStateBadge } from '@/app/components/RequestStateBadge'
import { PageHeader } from '@/app/components/ui'
import { myFeedback, planHistory } from '@/app/lib/services/learner.service'
import { getMyRequest } from '@/app/lib/services/requests.service'
import { paypalConfig } from '@/app/lib/utils/paypalConfig'
import { RequestView } from './RequestView'

export const metadata = { title: 'Request' }

export default async function RequestPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ paid?: string }>
}): Promise<React.JSX.Element> {
  const [{ id }, { paid }] = await Promise.all([params, searchParams])
  const result = await getMyRequest(id)
  if (result.error !== null) notFound()
  const request = result.data
  const delivered = Boolean(request.response)
  const [plans, feedback] = await Promise.all([
    delivered ? planHistory(id) : null,
    delivered ? myFeedback('RESPONSE', id) : null
  ])

  return (
    <div className='mx-auto max-w-3xl'>
      <PageHeader
        badge={<RequestStateBadge state={request.state} />}
        title={`Ask ${request.contributor.user.displayName}`}
        description={request.contributor.headline}
      />
      <RequestView
        request={request}
        paypal={paypalConfig()}
        justPaid={Boolean(paid)}
        plans={plans?.data ?? []}
        feedbackGiven={feedback?.data?.map((row) => row.phase) ?? []}
      />
    </div>
  )
}
