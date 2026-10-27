import { notFound } from 'next/navigation'
import { RequestStateBadge } from '@/app/components/RequestStateBadge'
import { PageHeader } from '@/app/components/ui'
import { getInboxRequest } from '@/app/lib/services/requests.service'
import { InboxRequestView } from './InboxRequestView'

export const metadata = { title: 'Request' }

export default async function InboxRequestPage({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<React.JSX.Element> {
  const { id } = await params
  const result = await getInboxRequest(id)
  if (result.error !== null) notFound()
  return (
    <div className='mx-auto max-w-3xl'>
      <PageHeader
        badge={<RequestStateBadge state={result.data.state} />}
        title={`Request from ${result.data.learnerFirstName}`}
        description={
          result.data.guide
            ? `About your guide “${result.data.guide.title}”`
            : undefined
        }
      />
      <InboxRequestView request={result.data} />
    </div>
  )
}
