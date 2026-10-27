import { redirect } from 'next/navigation'
import { Footer, TopBar } from '@/app/components/TopBar'
import { getSession } from '@/app/lib/services/auth.service'
import { ErrorNote } from '@/app/components/ui'
import { LOGIN_PATH } from '@/app/lib/utils/authRouting'

export default async function PrivateLayout({
  children
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const session = await getSession()
  if (session.reason === 'unauthenticated') redirect(LOGIN_PATH)
  if (session.reason === 'unavailable') {
    return (
      <div className='mx-auto max-w-xl px-4 py-24'>
        <ErrorNote message='EnrichMINT is unreachable right now. Refresh in a moment.' />
      </div>
    )
  }
  return (
    <>
      <TopBar user={session.user} />
      <main className='mx-auto max-w-page px-4 sm:px-6 lg:px-8 py-10'>
        {children}
      </main>
      <Footer />
    </>
  )
}
