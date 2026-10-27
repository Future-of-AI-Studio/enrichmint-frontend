import { redirect } from 'next/navigation'
import { PageHeader } from '@/app/components/ui'
import { getMyProfile } from '@/app/lib/services/studio.service'
import { SettingsForm } from './SettingsForm'

export const metadata = { title: 'Contributor settings' }

export default async function SettingsPage(): Promise<React.JSX.Element> {
  const profile = await getMyProfile()
  if (profile.error !== null) redirect('/studio')
  return (
    <div className='mx-auto max-w-2xl'>
      <PageHeader
        title='Settings'
        description='Your profile, personal-request terms and payout email.'
      />
      <SettingsForm profile={profile.data} />
    </div>
  )
}
