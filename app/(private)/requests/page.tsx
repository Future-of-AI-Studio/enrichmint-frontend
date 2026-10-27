import Link from 'next/link'
import { RequestStateBadge } from '@/app/components/RequestStateBadge'
import {
  EmptyState,
  ErrorNote,
  PageHeader,
  linkCardStyles
} from '@/app/components/ui'
import { listMyRequests } from '@/app/lib/services/requests.service'
import { formatUsd, relative } from '@/app/lib/utils/format'

export const metadata = { title: 'Requests' }

export default async function RequestsPage(): Promise<React.JSX.Element> {
  const requests = await listMyRequests()
  return (
    <div>
      <PageHeader
        title='Personal answers you asked for'
        description='Requests are private between you and the contributor. You only pay after they accept.'
      />
      {requests.error !== null ? (
        <ErrorNote message={requests.error} />
      ) : requests.data.length === 0 ? (
        <EmptyState title='No requests yet.'>
          When a guide doesn’t answer your question, the assistant can prepare a
          request to its author.
        </EmptyState>
      ) : (
        <ul className='space-y-3'>
          {requests.data.map((request) => (
            <li key={request.id}>
              <Link
                href={`/requests/${request.id}`}
                className={`${linkCardStyles} flex flex-wrap items-center justify-between gap-3`}
              >
                <div className='min-w-0 flex-1'>
                  <p className='line-clamp-1 font-medium'>{request.question}</p>
                  <p className='text-sm text-ink-500'>
                    To {request.contributor.user.displayName} ·{' '}
                    {formatUsd(request.priceCents)} · updated{' '}
                    {relative(request.updatedAt)}
                  </p>
                </div>
                <RequestStateBadge state={request.state} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
