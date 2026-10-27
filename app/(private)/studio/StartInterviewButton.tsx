'use client'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/app/components/ui'
import { startInterview } from '@/app/lib/services/studio.service'

export function StartInterviewButton(): React.JSX.Element {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <Button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await startInterview()
          if (result.error !== null) return void toast.error(result.error)
          router.push(`/studio/interview/${result.data.id}`)
        })
      }
    >
      Share my experience
    </Button>
  )
}
