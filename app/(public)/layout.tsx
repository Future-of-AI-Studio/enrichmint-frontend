import { Footer, TopBar } from '@/app/components/TopBar'
import { getSession } from '@/app/lib/services/auth.service'

export default async function PublicLayout({
  children
}: {
  children: React.ReactNode
}): Promise<React.JSX.Element> {
  const { user } = await getSession()
  return (
    <>
      <TopBar user={user} />
      <main>{children}</main>
      <Footer />
    </>
  )
}
