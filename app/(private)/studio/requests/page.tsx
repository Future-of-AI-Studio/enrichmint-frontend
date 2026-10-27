import Link from 'next/link'
import { RequestStateBadge } from '@/app/components/RequestStateBadge'
import {
  EmptyState,
  ErrorNote,
  PageHeader,
  linkCardStyles
} from '@/app/components/ui'
import { inbox } from '@/app/lib/services/requests.service'
import { deadline, formatUsd } from '@/app/lib/utils/format'

export const metadata = { title: 'Request inbox' }

export default async function InboxPage(): Promise<React.JSX.Element> {
  const requests = await inbox()
  return (
    <div>
      <PageHeader
        title='Personal requests'
        description='People who read your guide and want your own judgment on their situation. Accept only what you can answer well.'
      />
      {requests.error !== null ? (
        <ErrorNote message={requests.error} />
      ) : requests.data.length === 0 ? (
        <EmptyState title='No requests yet.'>
          Turn on personal requests in Settings to receive them.
        </EmptyState>
      ) : (
        <ul className='space-y-3'>
          {requests.data.map((request) => (
            <li key={request.id}>
              <Link
                href={`/studio/requests/${request.id}`}
                className={`${linkCardStyles} flex flex-wrap items-center justify-between gap-3`}
              >
                <div className='min-w-0 flex-1'>
                  <p className='line-clamp-1 font-medium'>{request.question}</p>
                  <p className='text-sm text-ink-500'>
                    From {request.learnerFirstName} ·{' '}
                    {formatUsd(request.priceCents)}
                    {request.state === 'SENT' &&
                      ` · answer by ${deadline(request.acceptBy)}`}
                    {request.state === 'PAID' &&
                      ` · deliver ${deadline(request.deliverBy)}`}
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
