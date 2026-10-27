'use server'
import type { StewardSessionRow, StewardView } from '../types/steward.type'
import { apiCall } from '../utils/apiCall'

type StartBody = { goalId?: string; text?: string; budgetCents?: number }

export const startSteward = async (body: StartBody) =>
  apiCall<StewardView, StartBody>('/steward/sessions', 'Starting the steward', {
    method: 'POST',
    body
  })

export const listStewardSessions = async () =>
  apiCall<StewardSessionRow[]>('/steward/sessions', 'Loading conversations')

/** Also syncs payment, acceptance and deadline changes made since the last look. */
export const getSteward = async (id: string) =>
  apiCall<StewardView>(`/steward/sessions/${id}`, 'Loading the conversation')

export const messageSteward = async (id: string, text: string) =>
  apiCall<StewardView, { text: string }>(
    `/steward/sessions/${id}/messages`,
    'Talking to the steward',
    { method: 'POST', body: { text } }
  )
