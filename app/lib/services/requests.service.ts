'use server'
import type {
  ContextItem,
  ContributorRequest,
  LearnerRequest,
  LearnerRequestRow
} from '../types/request.type'
import { apiCall } from '../utils/apiCall'

export const draftRequest = async (
  guideId: string,
  question: string,
  goalId?: string
) =>
  apiCall<
    LearnerRequest,
    { guideId: string; question: string; goalId?: string }
  >('/requests/draft-from-gap', 'Preparing your request', {
    method: 'POST',
    body: { guideId, question, ...(goalId ? { goalId } : {}) }
  })

export const listMyRequests = async () =>
  apiCall<LearnerRequestRow[]>('/requests', 'Loading your requests')

export const getMyRequest = async (id: string) =>
  apiCall<LearnerRequest>(`/requests/${id}`, 'Loading the request')

type UpdateBody = {
  question?: string
  desiredResponse?: string
  contextItems?: ContextItem[]
}

export const updateRequest = async (id: string, body: UpdateBody) =>
  apiCall<LearnerRequest, UpdateBody>(`/requests/${id}`, 'Saving the request', {
    method: 'PATCH',
    body
  })

export const sendRequest = async (id: string) =>
  apiCall<LearnerRequest, { approved: boolean }>(
    `/requests/${id}/send`,
    'Sending the request',
    {
      method: 'POST',
      body: { approved: true }
    }
  )

export const cancelRequest = async (id: string) =>
  apiCall<LearnerRequest>(`/requests/${id}/cancel`, 'Cancelling the request', {
    method: 'POST'
  })

export const closeRequest = async (id: string) =>
  apiCall<LearnerRequest>(`/requests/${id}/close`, 'Closing the request', {
    method: 'POST'
  })

export const disputeRequest = async (id: string, reason: string) =>
  apiCall<LearnerRequest, { reason: string }>(
    `/requests/${id}/dispute`,
    'Reporting the problem',
    {
      method: 'POST',
      body: { reason }
    }
  )

export const inbox = async () =>
  apiCall<ContributorRequest[]>('/studio/requests', 'Loading your requests')

export const getInboxRequest = async (id: string) =>
  apiCall<ContributorRequest>(`/studio/requests/${id}`, 'Loading the request')

export const acceptRequest = async (id: string) =>
  apiCall<ContributorRequest>(
    `/studio/requests/${id}/accept`,
    'Accepting the request',
    {
      method: 'POST'
    }
  )

export const declineRequest = async (id: string, reason?: string) =>
  apiCall<ContributorRequest, { reason?: string }>(
    `/studio/requests/${id}/decline`,
    'Declining the request',
    { method: 'POST', body: reason ? { reason } : {} }
  )

export const deliverRequest = async (
  id: string,
  body: string,
  aiUseAllowed: boolean
) =>
  apiCall<ContributorRequest, { body: string; aiUseAllowed: boolean }>(
    `/studio/requests/${id}/deliver`,
    'Delivering your response',
    { method: 'POST', body: { body, aiUseAllowed } }
  )
