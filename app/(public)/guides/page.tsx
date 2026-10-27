import Link from 'next/link'
import classNames from 'classnames'
import { GuideCard } from '@/app/components/GuideCard'
import { EmptyState, ErrorNote, PageHeader } from '@/app/components/ui'
import { listCategories, listGuides } from '@/app/lib/services/guides.service'

export const metadata = { title: 'Browse guides' }

export default async function BrowsePage({
  searchParams
}: {
  searchParams: Promise<{ search?: string; category?: string }>
}): Promise<React.JSX.Element> {
  const query = await searchParams
  const [guides, categories] = await Promise.all([
    listGuides(query),
    listCategories()
  ])
  const searchSuffix = query.search
    ? `search=${encodeURIComponent(query.search)}`
    : ''

  return (
    <div className='mx-auto max-w-page px-4 sm:px-6 lg:px-8 py-12'>
      <PageHeader
        title='Guides from people who have been through it'
        description='Every guide is firsthand, self-reported experience, reviewed by our team before publishing. Read the free preview before you decide.'
      />
      <form
        className='mb-5 flex items-center gap-2 rounded-full bg-card p-1.5 shadow-card ring-1 ring-ink-200 focus-within:ring-2 focus-within:ring-mint-500'
        action='/guides'
        role='search'
      >
        {query.category && (
          <input type='hidden' name='category' value={query.category} />
        )}
        <svg
          viewBox='0 0 20 20'
          fill='none'
          aria-hidden='true'
          className='ml-3 h-5 w-5 shrink-0 text-ink-400'
        >
          <circle
            cx='9'
            cy='9'
            r='5.5'
            stroke='currentColor'
            strokeWidth='1.8'
          />
          <path
            d='m13.5 13.5 3 3'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
          />
        </svg>
        <label htmlFor='guide-search' className='sr-only'>
          Search guides
        </label>
        <input
          id='guide-search'
          name='search'
          defaultValue={query.search}
          placeholder='Search by topic or situation'
          className='min-w-0 flex-1 bg-transparent py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none'
        />
        <button className='shrink-0 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mint-700'>
          Search
        </button>
      </form>
      <nav
        aria-label='Categories'
        className='-mx-4 mb-10 flex gap-2 overflow-x-auto px-4 pb-1'
      >
        <CategoryLink
          href={`/guides${searchSuffix ? `?${searchSuffix}` : ''}`}
          active={!query.category}
          label='All'
        />
        {categories.data?.map((category) => (
          <CategoryLink
            key={category.slug}
            href={`/guides?category=${category.slug}${searchSuffix ? `&${searchSuffix}` : ''}`}
            active={query.category === category.slug}
            label={category.name}
          />
        ))}
      </nav>
      {guides.error !== null ? (
        <ErrorNote message={guides.error} />
      ) : guides.data.data.length === 0 ? (
        <EmptyState title='No guides match yet.'>
          Try another search or category.
        </EmptyState>
      ) : (
        <>
          <p className='mb-4 text-sm text-ink-500'>
            {guides.data.meta.total}{' '}
            {guides.data.meta.total === 1 ? 'guide' : 'guides'}
            {query.search && <> for “{query.search}”</>}
          </p>
          <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
            {guides.data.data.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function CategoryLink({
  href,
  active,
  label
}: {
  href: string
  active: boolean
  label: string
}): React.JSX.Element {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={classNames(
        'shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
        active
          ? 'bg-ink-900 text-white'
          : 'bg-card text-ink-700 ring-1 ring-ink-200 hover:bg-zest-100 hover:ring-ink-300'
      )}
    >
      {label}
    </Link>
  )
}
