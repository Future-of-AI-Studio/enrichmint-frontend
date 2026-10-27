export type RequestState =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'PAYMENT_EXPIRED'
  | 'PAID'
  | 'OVERDUE'
  | 'DELIVERED'
  | 'CLOSED'
  | 'DISPUTED'
  | 'REFUNDED'
  | 'RESOLVED_REFUNDED'
  | 'RESOLVED_UPHELD'

export type ContextItem = {
  key: string
  label: string
  value: string
  share: boolean
}

export type RequestResponse = {
  id: string
  body: string
  aiUseAllowed: boolean
  createdAt: string
}

/** Mirrors enrichmint-api `RequestsService.learnerView`. */
export type LearnerRequest = {
  id: string
  state: RequestState
  question: string
  desiredResponse: string
  contextItems: ContextItem[]
  priceCents: number
  priceLabel: string
  deliveryH: number
  acceptanceH: number
  goalId: string | null
  sentAt: string | null
  acceptBy: string | null
  acceptedAt: string | null
  payBy: string | null
  paidAt: string | null
  deliverBy: string | null
  deliveredAt: string | null
  declineReason: string | null
  response: RequestResponse | null
  guide: { id: string; title: string; slug: string } | null
  contributor: { id: string; headline: string; user: { displayName: string } }
  orders: { id: string; status: string; amountCents: number }[]
  transitions: {
    id: string
    fromState: RequestState
    toState: RequestState
    actor: string
    reason: string | null
    createdAt: string
  }[]
}

export type LearnerRequestRow = {
  id: string
  state: RequestState
  question: string
  priceCents: number
  acceptBy: string | null
  payBy: string | null
  deliverBy: string | null
  updatedAt: string
  guide: { title: string } | null
  contributor: { user: { displayName: string } }
}

/** Mirrors `RequestsService.contributorView`: only the details the learner shared. */
export type ContributorRequest = {
  id: string
  state: RequestState
  question: string
  desiredResponse: string
  sharedContext: { label: string; value: string }[]
  learnerFirstName: string
  guide: { id: string; title: string } | null
  priceCents: number
  deliveryH: number
  sentAt: string | null
  acceptBy: string | null
  acceptedAt: string | null
  payBy: string | null
  paidAt: string | null
  deliverBy: string | null
  deliveredAt: string | null
  declineReason: string | null
  response: RequestResponse | null
  warnings?: string[]
}
