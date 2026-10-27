export type PayoutStatus =
  | 'REQUESTED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'UNCLAIMED'
  | 'RETURNED'
  | 'BLOCKED'

export type Payout = {
  id: string
  amountCents: number
  currency: string
  receiverEmail: string
  status: PayoutStatus
  paypalBatchId: string | null
  failureReason: string | null
  createdAt: string
}

export type Earnings = {
  balances: {
    currency: string
    earnedCents: number
    availableCents: number
    payoutPendingCents: number
    transferredCents: number
  }
  commissionBps: number
  paymentEnvironment: 'sandbox' | 'live'
  sales: {
    id: string
    kind: 'GUIDE' | 'REQUEST'
    status: string
    amountCents: number
    commissionCents: number
    contributorShareCents: number
    processingFeePaidByPlatformCents: number
    completedAt: string | null
    guide: { title: string } | null
    request: { id: string; question: string } | null
  }[]
  entries: {
    id: string
    account: string
    amountCents: number
    memo: string
    createdAt: string
  }[]
  payouts: Payout[]
}

export type AdminOverview = {
  paymentEnvironment: string
  queues: Record<string, number>
  money: Record<string, number | string>
  ai: {
    spentTodayUsd: number
    dailyBudgetUsd: number
    byPurpose: { purpose: string; calls: number; costUsd: number }[]
  }
}

export type ReviewQueueItem = {
  id: string
  number: number
  summary: string
  preview: string
  audience: string
  limitations: string
  sections: { id: string; title: string; body: string }[]
  flags: string[]
  submittedAt: string | null
  guide: {
    id: string
    title: string
    priceCents: number
    agentAssistAllowed: boolean
    status: string
    category: { name: string }
    contributor: {
      id: string
      status: string
      headline: string
      user: { displayName: string }
    }
  }
}

export type AdminPayments = {
  orders: {
    id: string
    kind: string
    status: string
    amountCents: number
    paypalFeeCents: number | null
    paypalOrderId: string | null
    paypalCaptureId: string | null
    failureReason: string | null
    createdAt: string
    buyer: { displayName: string }
  }[]
  webhookEvents: {
    id: string
    paypalEventId: string
    type: string
    verified: boolean
    outcome: string | null
    createdAt: string
  }[]
  payouts: (Payout & { contributor: { user: { displayName: string } } })[]
}

export type AdminRefund = {
  id: string
  amountCents: number
  reason: string
  status: string
  decisionNote: string | null
  createdAt: string
  order: { id: string; kind: string; amountCents: number }
}

export type AdminContributor = {
  id: string
  headline: string
  background: string
  status: string
  createdAt: string
  user: { id: string; displayName: string; isDemo: boolean }
  _count: { guides: number }
}

export type AdminReport = {
  id: string
  targetType: string
  targetId: string
  reason: string
  status: 'OPEN' | 'RESOLVED'
  resolution: string | null
  createdAt: string
  reporter: { displayName: string }
}

export type AttentionRequest = {
  id: string
  state: string
  question: string
  priceCents: number
  deliverBy: string | null
  orders: { id: string; status: string; amountCents: number }[]
}
