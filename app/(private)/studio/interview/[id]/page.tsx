import { notFound } from 'next/navigation'
import { PageHeader } from '@/app/components/ui'
import { listCategories } from '@/app/lib/services/guides.service'
import { getInterview } from '@/app/lib/services/studio.service'
import { InterviewFlow } from './InterviewFlow'

export const metadata = { title: 'Share my experience' }

export default async function InterviewPage({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<React.JSX.Element> {
  const { id } = await params
  const [interview, categories] = await Promise.all([
    getInterview(id),
    listCategories()
  ])
  if (interview.error !== null) notFound()
  return (
    <div className='mx-auto max-w-2xl'>
      <PageHeader
        title='Tell us what happened'
        description='Answer in your own words. Your answers are kept exactly as you write them; AI only organizes them into a draft you edit and approve. Anything you leave out stays a question, never invented.'
      />
      <InterviewFlow
        interview={interview.data}
        categories={categories.data ?? []}
      />
    </div>
  )
}
