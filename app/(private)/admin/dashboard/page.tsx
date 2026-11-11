import { ErrorNote, PageHeader } from '@/app/components/ui'
import { adminPayments } from '@/app/lib/services/admin.service'
import { toDashboardData } from '@/app/lib/utils/dashboardData'
import { DashboardLoader } from './DashboardLoader'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const payments = await adminPayments()
  if (payments.error !== null) return <ErrorNote message={payments.error} />

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Dashboard'
        description='Sales, PayPal fees, webhooks and payouts from the server’s own records. Built with AG Studio. Sandbox data: no real money.'
      />
      <DashboardLoader rows={toDashboardData(payments.data)} />
    </div>
  )
}
