'use server'
import type {
  AdminContributor,
  AdminOverview,
  AdminPayments,
  AdminRefund,
  AdminReport,
  AttentionRequest,
  ReviewQueueItem
} from '../types/earnings.type'
import { apiCall } from '../utils/apiCall'

export const adminOverview = async () =>
  apiCall<AdminOverview>('/admin/overview', 'Loading overview')

export const reviewQueue = async () =>
  apiCall<ReviewQueueItem[]>('/admin/review-queue', 'Loading the review queue')

export const approveVersion = async (versionId: string) =>
  apiCall<{ id: string }>(
    `/admin/guide-versions/${versionId}/approve`,
    'Approving the guide',
    {
      method: 'POST'
    }
  )

export const rejectVersion = async (versionId: string, note: string) =>
  apiCall<{ id: string }, { note: string }>(
    `/admin/guide-versions/${versionId}/reject`,
    'Rejecting the guide',
    { method: 'POST', body: { note } }
  )

export const listContributors = async (status?: string) =>
  apiCall<AdminContributor[]>(
    `/admin/contributors${status ? `?status=${status}` : ''}`,
    'Loading contributors'
  )

export const setContributorStatus = async (id: string, approve: boolean) =>
  apiCall<{ id: string }>(
    `/admin/contributors/${id}/${approve ? 'approve' : 'suspend'}`,
    approve ? 'Approving the contributor' : 'Suspending the contributor',
    { method: 'POST' }
  )

export const adminPayments = async () =>
  apiCall<AdminPayments>('/admin/payments', 'Loading payments')

export const adminRefunds = async () =>
  apiCall<AdminRefund[]>('/admin/refunds', 'Loading refunds')

export const decideRefund = async (
  id: string,
  approve: boolean,
  note?: string
) =>
  apiCall<AdminRefund, { approve: boolean; note?: string }>(
    `/admin/refunds/${id}/decision`,
    'Deciding the refund',
    { method: 'POST', body: { approve, ...(note ? { note } : {}) } }
  )

export const adminReports = async () =>
  apiCall<AdminReport[]>('/admin/reports', 'Loading reports')

export const resolveReport = async (id: string, resolution: string) =>
  apiCall<AdminReport, { resolution: string }>(
    `/admin/reports/${id}/resolve`,
    'Resolving the report',
    {
      method: 'POST',
      body: { resolution }
    }
  )

export const attentionRequests = async () =>
  apiCall<AttentionRequest[]>(
    '/admin/requests',
    'Loading requests that need attention'
  )

export const upholdRequest = async (id: string, reason: string) =>
  apiCall<{ id: string }, { reason: string }>(
    `/admin/requests/${id}/uphold`,
    'Closing the dispute',
    {
      method: 'POST',
      body: { reason }
    }
  )

/** Demo builds only: makes the request's current deadline pass now. Labelled as simulated in the UI. */
export const fastForwardRequest = async (id: string) =>
  apiCall<{ moved: number; simulated: true }>(
    `/admin/demo/requests/${id}/fast-forward`,
    'Simulating the deadline',
    { method: 'POST' }
  )
