import type { AnswerBlock } from './learner.type'
import type { RequestState } from './request.type'

export type StewardStage =
  | 'GOAL'
  | 'FINDING_GUIDANCE'
  | 'DECIDING_PURCHASE'
  | 'USING_GUIDE'
  | 'GAP_FOUND'
  | 'REQUEST_DRAFT'
  | 'AWAITING_ACCEPTANCE'
  | 'AWAITING_PAYMENT'
  | 'AWAITING_DELIVERY'
  | 'APPLYING_RESPONSE'
  | 'DONE'
  | 'ENDED'

/** Mirrors enrichmint-api `StewardSnapshot`. */
export type StewardSnapshot = {
  goal: {
    id: string
    text: string
    budgetCents: number
    committedCents: number
    remainingCents: number
  }
  hasAgentTurn: boolean
  recommendationsShown: boolean
  gapQuestion: string | null
  activeGuide: {
    id: string
    slug: string
    title: string
    priceCents: number
    owned: boolean
    agentAssistAllowed: boolean
    contributorName: string
    questionsLeft: number | null
  } | null
  activeRequest: {
    id: string
    state: RequestState
    priceCents: number
    contributorName: string
    acceptBy: string | null
    payBy: string | null
    deliverBy: string | null
    hasResponse: boolean
    responseAiAllowed: boolean
    planCount: number
  } | null
}

export type GuidePick = {
  guideId: string
  slug: string
  title: string
  priceCents: number
  contributorName: string
  reason: string
  caution: string | null
  overBudget: boolean
  owned: boolean
  agentAssistAllowed: boolean
  newContributor: boolean
}

export type StewardCard =
  | {
      type: 'guide_picks'
      data: {
        message: string
        aiUsed: boolean
        remainingBudgetCents: number
        picks: GuidePick[]
      }
    }
  | {
      type: 'guide_checkout'
      data: {
        guideId: string
        slug: string
        title: string
        priceCents: number
        remainingBudgetCents: number
        overBudget: boolean
        agentAssistAllowed: boolean
        contributorName: string
      }
    }
  | {
      type: 'guide_answer'
      data: {
        guideId: string
        contributorName: string
        blocks: AnswerBlock[]
        gap: { question: string; reason: string | null } | null
      }
    }
  | {
      type: 'human_help_offer'
      data: {
        guideId: string
        question: string
        contributorName: string
        priceCents: number
        deliveryH: number
        acceptanceH: number
        remainingBudgetCents: number | null
        withinBudget: boolean
      }
    }
  | {
      type: 'request_draft'
      data: {
        requestId: string
        question: string
        desiredResponse: string
        priceCents: number
        contributorName: string
        sharedCount: number
      }
    }
  | {
      type: 'request_checkout'
      data: {
        requestId: string
        priceCents: number
        payBy: string | null
        contributorName: string
      }
    }
  | {
      type: 'response_ready'
      data: { requestId: string; contributorName: string; aiAllowed: boolean }
    }
  | {
      type: 'plan'
      data: {
        requestId: string
        contributorName: string
        blocks: AnswerBlock[]
      }
    }

export type StewardEvent = {
  id: string
  kind:
    | 'USER_MESSAGE'
    | 'AGENT_MESSAGE'
    | 'TOOL_STEP'
    | 'PROPOSAL'
    | 'SYSTEM_UPDATE'
  tool: string | null
  summary: string
  payload: Partial<StewardCard> & { suggestedReplies?: string[] }
  createdAt: string
}

export type StewardView = {
  id: string
  goalId: string
  stage: StewardStage
  nextStep: string
  snapshot: StewardSnapshot
  busy: boolean
  events: StewardEvent[]
}

export type StewardSessionRow = {
  id: string
  stage: StewardStage
  updatedAt: string
  goal: { id: string; text: string; budgetCents: number }
}
