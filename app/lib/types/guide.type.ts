export type Category = {
  id: string
  slug: string
  name: string
  description: string | null
}

export type FeedbackStats = {
  responses: number
  foundRelevant: number
  foundNextStep: number
  reportedMissing: number
  followUps: number
  triedIt: number
  usefulAfterTrying: number
}

/** Mirrors enrichmint-api `GuidesService.toPublic`: never contains section bodies. */
export type PublicGuide = {
  id: string
  slug: string
  title: string
  priceCents: number
  currency: string
  topics: string[]
  agentAssistAllowed: boolean
  isDemo: boolean
  category: { slug: string; name: string }
  contributor: {
    id: string
    headline: string
    background: string
    acceptingRequests: boolean
    responsePriceCents: number | null
    deliveryH: number
    user: { displayName: string; isDemo: boolean }
  }
  currentVersion: {
    id: string
    number: number
    summary: string
    preview: string
    audience: string
    limitations: string
    claimLabel: string
    publishedAt: string | null
    outline: string[]
  } | null
  feedback: FeedbackStats
}

export type GuideDetail = PublicGuide & {
  status: 'PUBLISHED' | 'UNPUBLISHED'
  owned: boolean
  isOwn: boolean
}

export type GuideSection = {
  id: string
  key: string
  title: string
  body: string
}
export type GuideGap = { key: string; question: string }

export type GuideContent = {
  guideId: string
  title: string
  contributorName: string
  agentAssistAllowed: boolean
  version: {
    id: string
    number: number
    summary: string
    sections: GuideSection[]
    audience: string
    limitations: string
    claimLabel: string
    publishedAt: string | null
  }
  isLatest: boolean
  ai: {
    allowed: boolean
    questionsLimit: number
    questionsUsed: number
    expiresAt: string
  } | null
}

export type LibraryItem = {
  entitlementId: string
  purchasedAt: string
  ai: {
    allowed: boolean
    questionsLimit: number
    questionsUsed: number
    expiresAt: string
  }
  guide: PublicGuide
}

export type ReviewStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'
export type GuideStatus =
  'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'UNPUBLISHED' | 'REMOVED'

export type StudioGuideRow = {
  id: string
  slug: string
  title: string
  status: GuideStatus
  priceCents: number
  agentAssistAllowed: boolean
  currentVersionId: string | null
  category: { name: string }
  versions: {
    id: string
    number: number
    reviewStatus: ReviewStatus
    reviewNote: string | null
  }[]
  _count: { entitlements: number }
}

export type OwnedGuide = {
  id: string
  slug: string
  title: string
  status: GuideStatus
  priceCents: number
  topics: string[]
  agentAssistAllowed: boolean
  currentVersionId: string | null
  category: { id: string; name: string }
  permissionChanges: {
    id: string
    field: string
    oldValue: string
    newValue: string
    createdAt: string
  }[]
  draft: {
    id: string
    number: number
    summary: string
    preview: string
    audience: string
    limitations: string
    sections: GuideSection[]
    gaps: GuideGap[]
    reviewStatus: ReviewStatus
    reviewNote: string | null
  } | null
}

export type InterviewQuestion = { key: string; question: string }

export type Interview = {
  id: string
  status: 'IN_PROGRESS' | 'COMPLETED' | 'DRAFTED'
  guideId: string | null
  questions: InterviewQuestion[]
  answers: {
    key: string
    question: string
    answer: string
    followUp?: { question: string; answer: string | null }
  }[]
  pendingFollowUp: { key: string; question: string } | null
  nextQuestion: InterviewQuestion | null
  aiAvailable: boolean
}
