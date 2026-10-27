'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button, fieldStyles } from '@/app/components/ui'
import {
  approveVersion,
  decideRefund,
  fastForwardRequest,
  rejectVersion,
  resolveReport,
  setContributorStatus,
  upholdRequest
} from '@/app/lib/services/admin.service'
import type { ActionResult } from '@/app/lib/types/utils.type'

function useAction(): [
  boolean,
  (work: () => Promise<ActionResult<unknown>>, success: string) => void
] {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return [
    pending,
    (work, success) =>
      startTransition(async () => {
        const result = await work()
        if (result.error !== null) return void toast.error(result.error)
        toast.success(success)
        router.refresh()
      })
  ]
}

export function ContributorActions({ id }: { id: string }): React.JSX.Element {
  const [pending, run] = useAction()
  return (
    <div className='flex gap-2'>
      <Button
        disabled={pending}
        onClick={() =>
          run(() => setContributorStatus(id, true), 'Contributor approved')
        }
      >
        Approve
      </Button>
      <Button
        variant='danger'
        disabled={pending}
        onClick={() =>
          run(() => setContributorStatus(id, false), 'Contributor suspended')
        }
      >
        Suspend
      </Button>
    </div>
  )
}

export function ReviewActions({
  versionId,
  contributorId,
  contributorApproved
}: {
  versionId: string
  contributorId: string
  contributorApproved: boolean
}): React.JSX.Element {
  const [pending, run] = useAction()
  const [note, setNote] = useState('')
  return (
    <div className='space-y-2'>
      {!contributorApproved && (
        <Button
          variant='secondary'
          disabled={pending}
          onClick={() =>
            run(
              () => setContributorStatus(contributorId, true),
              'Contributor approved'
            )
          }
        >
          Approve contributor first
        </Button>
      )}
      <div className='flex flex-wrap gap-2'>
        <Button
          disabled={pending || !contributorApproved}
          onClick={() => run(() => approveVersion(versionId), 'Published')}
        >
          Approve and publish
        </Button>
        <input
          className={`${fieldStyles} max-w-xs`}
          placeholder='What should change?'
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button
          variant='danger'
          disabled={pending || !note.trim()}
          onClick={() =>
            run(() => rejectVersion(versionId, note), 'Sent back with notes')
          }
        >
          Request changes
        </Button>
      </div>
    </div>
  )
}

export function RefundActions({ id }: { id: string }): React.JSX.Element {
  const [pending, run] = useAction()
  return (
    <div className='flex gap-2'>
      <Button
        disabled={pending}
        onClick={() =>
          run(() => decideRefund(id, true), 'Refund sent to PayPal')
        }
      >
        Approve refund
      </Button>
      <Button
        variant='secondary'
        disabled={pending}
        onClick={() =>
          run(() => decideRefund(id, false, 'Not eligible'), 'Refund rejected')
        }
      >
        Reject
      </Button>
    </div>
  )
}

export function ReportActions({ id }: { id: string }): React.JSX.Element {
  const [pending, run] = useAction()
  const [resolution, setResolution] = useState('')
  return (
    <div className='flex gap-2'>
      <input
        className={fieldStyles}
        placeholder='Resolution'
        value={resolution}
        onChange={(e) => setResolution(e.target.value)}
      />
      <Button
        variant='secondary'
        disabled={pending || !resolution.trim()}
        onClick={() => run(() => resolveReport(id, resolution), 'Resolved')}
      >
        Resolve
      </Button>
    </div>
  )
}

export function RequestCaseActions({
  id,
  state
}: {
  id: string
  state: string
}): React.JSX.Element {
  const [pending, run] = useAction()
  return (
    <div className='flex flex-wrap gap-2'>
      {state === 'DISPUTED' && (
        <Button
          variant='secondary'
          disabled={pending}
          onClick={() =>
            run(
              () => upholdRequest(id, 'Delivery reviewed and accepted'),
              'Dispute closed'
            )
          }
        >
          Uphold delivery
        </Button>
      )}
    </div>
  )
}

/** Demo builds only. Clearly labelled as a simulation in the UI. */
export function FastForward({ id }: { id: string }): React.JSX.Element {
  const [pending, run] = useAction()
  return (
    <Button
      variant='ghost'
      disabled={pending}
      onClick={() =>
        run(() => fastForwardRequest(id), 'Simulated: deadline passed')
      }
    >
      Simulate deadline passing (demo)
    </Button>
  )
}
