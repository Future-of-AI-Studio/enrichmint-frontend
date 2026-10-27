'use server'
import type {
  GuideGap,
  GuideSection,
  Interview,
  InterviewQuestion,
  OwnedGuide,
  StudioGuideRow
} from '../types/guide.type'
import type { Earnings, Payout } from '../types/earnings.type'
import type { ContributorProfile } from '../types/user.type'
import { apiCall } from '../utils/apiCall'

export const applyAsContributor = async (
  headline: string,
  background: string
) =>
  apiCall<ContributorProfile, { headline: string; background: string }>(
    '/contributors/apply',
    'Setting up your contributor profile',
    { method: 'POST', body: { headline, background } }
  )

export const getMyProfile = async () =>
  apiCall<ContributorProfile>('/contributors/me', 'Loading your profile')

export type ProfileUpdate = Partial<
  Pick<
    ContributorProfile,
    | 'headline'
    | 'background'
    | 'responsePriceCents'
    | 'acceptingRequests'
    | 'acceptanceWindowH'
    | 'deliveryH'
    | 'boundaries'
  >
> & { payoutEmail?: string }

export const updateMyProfile = async (body: ProfileUpdate) =>
  apiCall<ContributorProfile, ProfileUpdate>(
    '/contributors/me',
    'Saving your settings',
    {
      method: 'PATCH',
      body
    }
  )

export const interviewQuestions = async () =>
  apiCall<InterviewQuestion[]>('/interviews/questions', 'Loading questions')

export const listInterviews = async () =>
  apiCall<
    { id: string; status: string; guideId: string | null; updatedAt: string }[]
  >('/interviews', 'Loading interviews')

export const startInterview = async () =>
  apiCall<Interview>('/interviews', 'Starting the interview', {
    method: 'POST'
  })

export const getInterview = async (id: string) =>
  apiCall<Interview>(`/interviews/${id}`, 'Loading the interview')

export const answerInterview = async (
  id: string,
  key: string,
  answer: string,
  isFollowUp = false
) =>
  apiCall<Interview, { key: string; answer: string; isFollowUp: boolean }>(
    `/interviews/${id}/answers`,
    'Saving your answer',
    { method: 'POST', body: { key, answer, isFollowUp } }
  )

export const draftGuide = async (id: string, categoryId: string) =>
  apiCall<
    { guideId: string; aiUsed: boolean; gaps: GuideGap[] },
    { categoryId: string }
  >(`/interviews/${id}/draft`, 'Drafting your guide', {
    method: 'POST',
    body: { categoryId }
  })

export const myGuides = async () =>
  apiCall<StudioGuideRow[]>('/studio/guides', 'Loading your guides')

export const getOwnedGuide = async (id: string) =>
  apiCall<OwnedGuide>(`/studio/guides/${id}`, 'Loading your guide')

export type DraftUpdate = {
  title?: string
  summary?: string
  preview?: string
  audience?: string
  limitations?: string
  sections?: Pick<GuideSection, 'key' | 'title' | 'body'>[]
  gaps?: GuideGap[]
}

export const updateDraft = async (id: string, body: DraftUpdate) =>
  apiCall<OwnedGuide, DraftUpdate>(
    `/studio/guides/${id}/draft`,
    'Saving your draft',
    {
      method: 'PATCH',
      body
    }
  )

export type SettingsUpdate = {
  priceCents?: number
  agentAssistAllowed?: boolean
  topics?: string[]
  categoryId?: string
}

export const updateGuideSettings = async (id: string, body: SettingsUpdate) =>
  apiCall<OwnedGuide, SettingsUpdate>(
    `/studio/guides/${id}/settings`,
    'Saving settings',
    {
      method: 'PATCH',
      body
    }
  )

export const submitGuide = async (id: string) =>
  apiCall<OwnedGuide>(`/studio/guides/${id}/submit`, 'Submitting for review', {
    method: 'POST'
  })

export const setGuideListed = async (id: string, listed: boolean) =>
  apiCall<OwnedGuide>(
    `/studio/guides/${id}/${listed ? 'republish' : 'unpublish'}`,
    listed ? 'Listing the guide' : 'Unlisting the guide',
    { method: 'POST' }
  )

export const getEarnings = async () =>
  apiCall<Earnings>('/earnings/me', 'Loading your earnings')

export const requestPayout = async () =>
  apiCall<Payout>('/payouts', 'Requesting a payout', { method: 'POST' })
