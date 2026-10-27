import { notFound } from 'next/navigation'
import { NavLinks } from '@/app/components/NavLinks'
import { getSession } from '@/app/lib/services/auth.service'

const TABS: Array<readonly [string, string]> = [
  ['/admin', 'Overview'],
  ['/admin/reviews', 'Reviews'],
  ['/admin/cases', 'Refunds, reports and late requests'],
  ['/admin/payments', 'Payments']
]

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const { user } = await getSession()
  if (user?.role !== 'ADMIN') notFound()
  return (
    <div className='space-y-8'>
      <nav
        aria-label='Admin'
        className='w-fit max-w-full overflow-x-auto rounded-full bg-card p-1 shadow-card ring-1 ring-ink-100'
      >
        <NavLinks items={TABS} exact={['/admin']} />
      </nav>
      {children}
    </div>
  )
}
