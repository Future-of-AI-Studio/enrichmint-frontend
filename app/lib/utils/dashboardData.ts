import type { AdminPayments } from '@/app/lib/types/earnings.type'

export type DashboardRow = Record<string, string | number | null>

export type DashboardData = {
  orders: DashboardRow[]
  sales: DashboardRow[]
  webhooks: DashboardRow[]
  payouts: DashboardRow[]
}

const day = (iso: string): string => iso.slice(0, 10)
const dollars = (cents: number | null): number => (cents ?? 0) / 100
const label = (value: string): string =>
  value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ')

/** Flattens the admin payments payload into plain rows for the dashboard's data sources. */
export function toDashboardData(payments: AdminPayments): DashboardData {
  const orders = payments.orders.map((order) => ({
    order_id: order.id,
    day: day(order.createdAt),
    buyer: order.buyer.displayName,
    kind: order.kind === 'GUIDE' ? 'Guide' : 'Personal request',
    status: label(order.status),
    amount: dollars(order.amountCents),
    paypal_fee: dollars(order.paypalFeeCents),
    paypal_order_id: order.paypalOrderId,
    paypal_capture_id: order.paypalCaptureId
  }))
  return {
    orders,
    // Money widgets count only what PayPal confirmed as captured.
    sales: orders.filter((order) => order.status === 'Completed'),
    webhooks: payments.webhookEvents.map((event) => ({
      event_id: event.paypalEventId,
      day: day(event.createdAt),
      type: event.type,
      verified: event.verified ? 'Verified' : 'Not verified',
      outcome: event.outcome ?? 'Not processed yet'
    })),
    payouts: payments.payouts.map((payout) => ({
      payout_id: payout.id,
      day: day(payout.createdAt),
      contributor: payout.contributor.user.displayName,
      status: label(payout.status),
      requested: dollars(payout.amountCents),
      // Only a payout PayPal reports as SUCCESS counts as transferred.
      transferred:
        payout.status === 'SUCCESS' ? dollars(payout.amountCents) : 0,
      paypal_batch_id: payout.paypalBatchId
    }))
  }
}
