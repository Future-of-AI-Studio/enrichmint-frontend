import type { RequestState } from '@/app/lib/types/request.type'
import { Badge } from './ui'

const LABELS: Record<
  RequestState,
  [string, 'mint' | 'neutral' | 'warn' | 'danger' | 'human']
> = {
  DRAFT: ['Draft, not sent', 'neutral'],
  SENT: ['Waiting for the contributor', 'warn'],
  ACCEPTED: ['Accepted, waiting for payment', 'human'],
  DECLINED: ['Declined', 'neutral'],
  EXPIRED: ['Expired, not answered in time', 'neutral'],
  CANCELLED: ['Cancelled', 'neutral'],
  PAYMENT_EXPIRED: ['Payment window closed', 'neutral'],
  PAID: ['Paid, response in progress', 'human'],
  OVERDUE: ['Overdue', 'danger'],
  DELIVERED: ['Delivered', 'mint'],
  CLOSED: ['Completed', 'mint'],
  DISPUTED: ['Problem reported', 'danger'],
  REFUNDED: ['Refunded', 'neutral'],
  RESOLVED_REFUNDED: ['Resolved: refunded', 'neutral'],
  RESOLVED_UPHELD: ['Resolved', 'neutral']
}

export function RequestStateBadge({
  state
}: {
  state: RequestState
}): React.JSX.Element {
  const [label, tone] = LABELS[state]
  return <Badge tone={tone}>{label}</Badge>
}
