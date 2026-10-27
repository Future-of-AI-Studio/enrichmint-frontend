export type UserRole = 'USER' | 'ADMIN'
export type ContributorStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED'

/** Mirrors enrichmint-api `PUBLIC_USER_SELECT`. */
export type CurrentUser = {
  id: string
  email: string
  displayName: string
  role: UserRole
  isDemo: boolean
  contributorProfile: {
    id: string
    status: ContributorStatus
    headline: string
  } | null
}

export type LoginRes = {
  accessToken: string
  expiresIn: number
  user: CurrentUser
}

export type LoginVars = { email: string; password: string }
export type SignUpVars = {
  displayName: string
  email: string
  password: string
}

export type SessionResult =
  | { user: CurrentUser; reason: null }
  | { user: null; reason: 'unauthenticated' | 'unavailable' }

export type ContributorProfile = {
  id: string
  headline: string
  background: string
  status: ContributorStatus
  payoutEmail: string | null
  responsePriceCents: number | null
  acceptingRequests: boolean
  acceptanceWindowH: number
  deliveryH: number
  boundaries: string | null
  createdAt: string
}

export type StewardshipEntry = {
  id: string
  check: string
  outcome: 'ALLOW' | 'WARN' | 'DENY'
  source: 'LOCAL' | 'HCAI' | 'HCAI_UNAVAILABLE'
  plainReason: string
  subjectType: string
  subjectId: string | null
  createdAt: string
}
