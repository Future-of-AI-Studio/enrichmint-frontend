import { notFound } from 'next/navigation'
import { Notice } from '@/app/components/ui'
import { listCategories } from '@/app/lib/services/guides.service'
import { getOwnedGuide } from '@/app/lib/services/studio.service'
import { GuideEditor } from './GuideEditor'

export const metadata = { title: 'Edit guide' }

export default async function EditGuidePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ drafted?: string }>
}): Promise<React.JSX.Element> {
  const [{ id }, { drafted }] = await Promise.all([params, searchParams])
  const [guide, categories] = await Promise.all([
    getOwnedGuide(id),
    listCategories()
  ])
  if (guide.error !== null) notFound()
  return (
    <div className='space-y-6'>
      {drafted === 'ai' && (
        <Notice tone='mint' title='Draft ready'>
          AI organized your answers into this draft. Check every line is true to
          your experience, fill the gaps, then submit for review.
        </Notice>
      )}
      {drafted === 'verbatim' && (
        <Notice tone='warn' title='Draft ready (without AI)'>
          AI was unavailable, so your answers were placed into the guide as you
          wrote them. Edit and fill the gaps.
        </Notice>
      )}
      <GuideEditor
        key={guide.data.draft?.id}
        guide={guide.data}
        categories={categories.data ?? []}
      />
    </div>
  )
}
