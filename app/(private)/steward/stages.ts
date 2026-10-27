import type { StewardStage } from '@/app/lib/types/steward.type'

export const STAGE_LABELS: Record<StewardStage, string> = {
  GOAL: 'Getting started',
  FINDING_GUIDANCE: 'Finding guidance',
  DECIDING_PURCHASE: 'Choosing a guide',
  USING_GUIDE: 'Using the guide',
  GAP_FOUND: 'Gap found',
  REQUEST_DRAFT: 'Request drafted',
  AWAITING_ACCEPTANCE: 'Waiting for acceptance',
  AWAITING_PAYMENT: 'Waiting for your payment',
  AWAITING_DELIVERY: 'Waiting for delivery',
  APPLYING_RESPONSE: 'Answer delivered',
  DONE: 'Plan ready',
  ENDED: 'Request ended'
}

export const RAIL_STEPS = [
  'Goal',
  'Guidance',
  'Purchase',
  'Question',
  'Human help',
  'Payment',
  'Delivery',
  'Plan'
] as const

/** How many rail steps are complete at each stage. */
export const STAGE_PROGRESS: Record<StewardStage, number> = {
  GOAL: 0,
  FINDING_GUIDANCE: 1,
  DECIDING_PURCHASE: 2,
  USING_GUIDE: 3,
  GAP_FOUND: 4,
  REQUEST_DRAFT: 4,
  AWAITING_ACCEPTANCE: 4,
  AWAITING_PAYMENT: 5,
  AWAITING_DELIVERY: 6,
  APPLYING_RESPONSE: 7,
  DONE: 8,
  ENDED: 4
}

/** Stages where someone else (contributor, PayPal) acts next, so the page polls. */
export const WAITING_STAGES: StewardStage[] = [
  'AWAITING_ACCEPTANCE',
  'AWAITING_PAYMENT',
  'AWAITING_DELIVERY'
]
