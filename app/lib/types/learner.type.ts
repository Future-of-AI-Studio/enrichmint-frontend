import type { PublicGuide } from './guide.type'

export type Goal = {
  id: string
  text: string
  messages: { role: 'learner' | 'assistant'; text: string }[]
  budgetCents: number
  committedCents: number
  remainingCents: number
  currency: string
  status: 'ACTIVE' | 'CLOSED'
  pendingQuestion: string | null
  createdAt: string
}

export type GoalRow = Pick<
  Goal,
  'id' | 'text' | 'budgetCents' | 'status' | 'createdAt'
>

export type Recommendation = {
  rank: number
  slot: 'STANDARD' | 'NEW_CONTRIBUTOR'
  reason: string
  caution: string | null
  owned: boolean
  overBudget: boolean
  guide: PublicGuide
}

export type Recommendations = {
  goalId: string
  aiUsed: boolean
  message: string
  noneSuitable: boolean
  remainingBudgetCents: number
  recommendations: Recommendation[]
}

export type OrderStatus =
  | 'CREATED'
  | 'APPROVED'
  | 'CAPTURE_PENDING'
  | 'COMPLETED'
  | 'DENIED'
  | 'FAILED'
  | 'REFUNDED'
  | 'REVERSED'
  | 'VOIDED'

export type CheckoutStart = {
  orderId: string
  paypalOrderId: string
  amountCents: number
  currency: string
  status: OrderStatus
}

export type OrderSummary = {
  id: string
  kind: 'GUIDE' | 'REQUEST'
  status: OrderStatus
  amountCents: number
  currency: string
  guideId: string | null
  requestId: string | null
  goalId: string | null
  failureReason: string | null
  completedAt: string | null
  createdAt: string
  guide: { id: string; title: string; slug: string } | null
}

export type BlockType = 'CONTRIBUTOR_SAID' | 'AI_SUGGESTION' | 'UNKNOWN'

export type AnswerBlock = {
  type: BlockType
  text: string
  sourceIds: string[]
  quote: string | null
  unverified?: boolean
}

export type RequestOffer =
  | { available: false; contributorName: string }
  | {
      available: true
      contributorId: string
      contributorName: string
      priceCents: number
      deliveryH: number
      acceptanceH: number
      remainingBudgetCents: number | null
      withinBudget: boolean
    }

export type AssistantMessage = {
  id: string
  role: 'user' | 'assistant'
  content: {
    text?: string
    blocks?: AnswerBlock[]
    gap?: { question: string; reason: string | null } | null
    requestOffer?: RequestOffer | null
    warnings?: string[]
  }
  flags: string[]
  createdAt: string
}

export type AskResult = {
  message: AssistantMessage
  quota: { limit: number; used: number }
  sources: { id: string; title: string }[]
  contributorName: string
}

export type ApplyResult = {
  message: AssistantMessage
  sources: { id: string; title: string }[]
  contributorName: string
  remaining: number
}

export type { PublicGuide }
