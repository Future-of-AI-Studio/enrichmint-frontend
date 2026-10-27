'use server'
import type {
  ApplyResult,
  AskResult,
  AssistantMessage,
  CheckoutStart,
  Goal,
  GoalRow,
  OrderSummary,
  Recommendations
} from '../types/learner.type'
import type { StewardshipEntry } from '../types/user.type'
import { apiCall } from '../utils/apiCall'

export const createGoal = async (text: string, budgetCents: number) =>
  apiCall<Goal, { text: string; budgetCents: number }>(
    '/goals',
    'Saving your goal',
    {
      method: 'POST',
      body: { text, budgetCents }
    }
  )

export const listGoals = async () =>
  apiCall<GoalRow[]>('/goals', 'Loading your goals')

export const getGoal = async (goalId: string) =>
  apiCall<Goal>(`/goals/${goalId}`, 'Loading your goal')

export const answerGoal = async (goalId: string, text: string) =>
  apiCall<Goal, { text: string }>(
    `/goals/${goalId}/messages`,
    'Sending your answer',
    {
      method: 'POST',
      body: { text }
    }
  )

export const updateBudget = async (goalId: string, budgetCents: number) =>
  apiCall<Goal, { budgetCents: number }>(
    `/goals/${goalId}/budget`,
    'Changing your budget',
    {
      method: 'PATCH',
      body: { budgetCents }
    }
  )

export const recommend = async (goalId: string) =>
  apiCall<Recommendations>(
    `/goals/${goalId}/recommendations`,
    'Finding guidance',
    {
      method: 'POST'
    }
  )

type OrderBody = {
  kind: 'GUIDE' | 'REQUEST'
  guideId?: string
  requestId?: string
  goalId?: string
  approved: boolean
}

/** Starts a PayPal order. The amount is set by the server from its own records. */
export const startCheckout = async (body: OrderBody) =>
  apiCall<CheckoutStart, OrderBody>('/orders', 'Starting checkout', {
    method: 'POST',
    body
  })

/** Asks the server to capture and confirm with PayPal. Access depends only on this result. */
export const captureOrder = async (orderId: string) =>
  apiCall<OrderSummary>(`/orders/${orderId}/capture`, 'Confirming payment', {
    method: 'POST'
  })

export const getOrder = async (orderId: string) =>
  apiCall<OrderSummary>(`/orders/${orderId}`, 'Loading the order')

export const listOrders = async () =>
  apiCall<OrderSummary[]>('/orders', 'Loading your purchases')

export const askAssistant = async (
  guideId: string,
  question: string,
  goalId?: string
) =>
  apiCall<AskResult, { question: string; goalId?: string }>(
    `/assistant/guides/${guideId}/questions`,
    'Asking the assistant',
    { method: 'POST', body: { question, ...(goalId ? { goalId } : {}) } }
  )

export const assistantHistory = async (guideId: string) =>
  apiCall<AssistantMessage[]>(
    `/assistant/guides/${guideId}/messages`,
    'Loading the conversation'
  )

export const applyResponse = async (requestId: string) =>
  apiCall<ApplyResult>(
    `/assistant/requests/${requestId}/apply`,
    'Building your plan',
    {
      method: 'POST'
    }
  )

export const planHistory = async (requestId: string) =>
  apiCall<AssistantMessage[]>(
    `/assistant/requests/${requestId}/messages`,
    'Loading your plan'
  )

export const stewardshipLog = async () =>
  apiCall<StewardshipEntry[]>('/stewardship-log', 'Loading the stewardship log')

type FeedbackBody = {
  targetType: 'GUIDE' | 'RESPONSE'
  targetId: string
  phase: 'IMMEDIATE' | 'FOLLOW_UP'
  relevant?: boolean
  nextStep?: boolean
  missingOrMisleading?: string
  tried?: boolean
  outcome?: string
  usefulAfter?: boolean
}

export const sendFeedback = async (body: FeedbackBody) =>
  apiCall<{ id: string }, FeedbackBody>('/feedback', 'Sending feedback', {
    method: 'POST',
    body
  })

export const myFeedback = async (
  targetType: 'GUIDE' | 'RESPONSE',
  targetId: string
) =>
  apiCall<{ phase: 'IMMEDIATE' | 'FOLLOW_UP' }[]>(
    `/feedback/mine?targetType=${targetType}&targetId=${targetId}`,
    'Loading your feedback'
  )

export const requestRefund = async (orderId: string, reason: string) =>
  apiCall<{ id: string; status: string }, { orderId: string; reason: string }>(
    '/refunds',
    'Requesting a refund',
    { method: 'POST', body: { orderId, reason } }
  )

export const report = async (
  targetType: string,
  targetId: string,
  reason: string
) =>
  apiCall<
    { id: string },
    { targetType: string; targetId: string; reason: string }
  >('/reports', 'Sending the report', {
    method: 'POST',
    body: { targetType, targetId, reason }
  })
