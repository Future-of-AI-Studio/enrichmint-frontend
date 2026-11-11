'use client'
import dynamic from 'next/dynamic'
import type { DashboardData } from '@/app/lib/utils/dashboardData'

// AG Studio needs the browser, so it loads on the client only and keeps other pages light.
const AdminDashboard = dynamic(
  () => import('./AdminDashboard').then((module) => module.AdminDashboard),
  {
    ssr: false,
    loading: () => <p className='text-sm text-ink-500'>Loading dashboard…</p>
  }
)

export function DashboardLoader({
  rows
}: {
  rows: DashboardData
}): React.JSX.Element {
  return <AdminDashboard rows={rows} />
}
