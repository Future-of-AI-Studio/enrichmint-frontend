import { FeedbackForm } from '@/app/components/FeedbackForm'

export function GuideFeedback({
  guideId,
  given
}: {
  guideId: string
  given: ('IMMEDIATE' | 'FOLLOW_UP')[]
}): React.JSX.Element {
  return (
    <div className='pt-6'>
      <FeedbackForm targetType='GUIDE' targetId={guideId} given={given} />
    </div>
  )
}
