import Link from 'next/link'
import {
  Badge,
  ButtonLink,
  EmptyState,
  ErrorNote,
  PageHeader,
  linkCardStyles
} from '@/app/components/ui'
import { getLibrary } from '@/app/lib/services/guides.service'
import { relative } from '@/app/lib/utils/format'

export const metadata = { title: 'Library' }

export default async function LibraryPage(): Promise<React.JSX.Element> {
  const library = await getLibrary()
  return (
    <div>
      <PageHeader title='Guides you have bought' />
      {library.error !== null ? (
        <ErrorNote message={library.error} />
      ) : library.data.length === 0 ? (
        <EmptyState title='Nothing here yet.'>
          <ButtonLink href='/steward' className='mt-3'>
            Find guidance
          </ButtonLink>
        </EmptyState>
      ) : (
        <ul className='grid gap-4 md:grid-cols-2'>
          {library.data.map((item) => (
            <li key={item.entitlementId}>
              <Link
                href={`/library/${item.guide.id}`}
                className={`${linkCardStyles} block`}
              >
                <h2 className='font-display text-lg font-semibold'>
                  {item.guide.title}
                </h2>
                <p className='text-sm text-ink-500'>
                  by {item.guide.contributor.user.displayName} · bought{' '}
                  {relative(item.purchasedAt)}
                </p>
                <div className='mt-3'>
                  {item.ai.allowed ? (
                    <Badge tone='ai'>
                      AI questions:{' '}
                      {item.ai.questionsLimit - item.ai.questionsUsed} of{' '}
                      {item.ai.questionsLimit} left
                    </Badge>
                  ) : (
                    <Badge>No AI assistance</Badge>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
