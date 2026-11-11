'use client'
import { studioTheme } from 'ag-studio'
import type {
  AgDataSourcesDefinition,
  AgReportState,
  AgStudioMode
} from 'ag-studio'
import { AgStudio } from 'ag-studio-react'
import { useMemo, useState } from 'react'
import { Button } from '@/app/components/ui'
import type { DashboardData } from '@/app/lib/utils/dashboardData'

const USD = { format: '$#,##0.00' }
const text = (id: string, name: string) => ({
  id,
  name,
  format: 'textFormat' as const
})
const money = (id: string, name: string) => ({
  id,
  name,
  format: 'currencyFormat' as const,
  formatOptions: USD
})

const title = (value: string) => ({ title: { enabled: true, text: value } })
const kpi = (id: string, label: string, aggregation: 'sum' | 'count') => ({
  type: 'value' as const,
  dataMapping: { value: [{ id, aggregation }] },
  format: { style: { label: { enabled: true, text: label } } }
})

/** The report admins see first. They can rearrange it in edit mode; nothing is saved to the server. */
const REPORT: AgReportState = {
  selectedPageId: 'money',
  pages: [
    {
      id: 'money',
      layout: { rowHeight: 44 },
      widgets: {
        sales: kpi('sales.amount', 'Captured sales (PayPal)', 'sum'),
        fees: kpi('sales.paypal_fee', 'PayPal fees', 'sum'),
        transferred: kpi(
          'payouts.transferred',
          'Transferred to contributors (payout SUCCESS)',
          'sum'
        ),
        events: kpi('webhooks.event_id', 'PayPal webhook events', 'count'),
        byDay: {
          type: 'column-chart-stacked',
          dataMapping: {
            categoryKey: [{ id: 'sales.day' }],
            valueKey: [{ id: 'sales.amount', aggregation: 'sum' }],
            legendKey: [{ id: 'sales.kind' }]
          },
          format: title('Captured sales by day')
        },
        byStatus: {
          type: 'donut-chart',
          dataMapping: {
            categoryKey: [{ id: 'orders.status' }],
            valueKey: [{ id: 'orders.order_id', aggregation: 'count' }]
          },
          format: title('Orders by status')
        },
        byEvent: {
          type: 'bar-chart-grouped',
          dataMapping: {
            categoryKey: [{ id: 'webhooks.type' }],
            valueKey: [{ id: 'webhooks.event_id', aggregation: 'count' }]
          },
          format: title('Webhook events by type')
        },
        byContributor: {
          type: 'bar-chart-grouped',
          dataMapping: {
            categoryKey: [{ id: 'payouts.contributor' }],
            valueKey: [
              { id: 'payouts.requested', aggregation: 'sum' },
              { id: 'payouts.transferred', aggregation: 'sum' }
            ]
          },
          format: title('Payouts by contributor')
        },
        orders: {
          type: 'grid',
          dataMapping: {
            cols: [
              { id: 'orders.day' },
              { id: 'orders.buyer' },
              { id: 'orders.kind' },
              { id: 'orders.status' },
              { id: 'orders.amount' },
              { id: 'orders.paypal_fee' },
              { id: 'orders.paypal_order_id' },
              { id: 'orders.paypal_capture_id' }
            ]
          },
          format: title('Orders and their PayPal IDs')
        }
      },
      widgetLayout: {
        sales: { xTrack: 0, yTrack: 0, xSpan: 6, ySpan: 3 },
        fees: { xTrack: 6, yTrack: 0, xSpan: 6, ySpan: 3 },
        transferred: { xTrack: 12, yTrack: 0, xSpan: 6, ySpan: 3 },
        events: { xTrack: 18, yTrack: 0, xSpan: 6, ySpan: 3 },
        byDay: { xTrack: 0, yTrack: 3, xSpan: 14, ySpan: 8 },
        byStatus: { xTrack: 14, yTrack: 3, xSpan: 10, ySpan: 8 },
        byEvent: { xTrack: 0, yTrack: 11, xSpan: 12, ySpan: 8 },
        byContributor: { xTrack: 12, yTrack: 11, xSpan: 12, ySpan: 8 },
        orders: { xTrack: 0, yTrack: 19, xSpan: 24, ySpan: 10 }
      }
    }
  ]
}

const THEME = studioTheme.withParams({
  accentColor: '#168263',
  backgroundColor: '#f6f5f0',
  foregroundColor: '#16201c',
  borderColor: '#e9edeb',
  borderRadius: 16,
  fontFamily: 'inherit',
  chartPaletteFills1Color: '#168263',
  chartPaletteFills2Color: '#7c6cf0',
  chartPaletteFills3Color: '#f0a92e',
  chartPaletteFills4Color: '#c2410c',
  chartPaletteStrokes1Color: '#168263',
  chartPaletteStrokes2Color: '#7c6cf0',
  chartPaletteStrokes3Color: '#f0a92e',
  chartPaletteStrokes4Color: '#c2410c'
})

export function AdminDashboard({
  rows
}: {
  rows: DashboardData
}): React.JSX.Element {
  const [mode, setMode] = useState<AgStudioMode>('view')
  const data = useMemo<AgDataSourcesDefinition>(
    () => ({
      sources: [
        {
          id: 'orders',
          name: 'Orders (all)',
          data: rows.orders,
          fields: [
            text('order_id', 'Order'),
            text('day', 'Day'),
            text('buyer', 'Buyer'),
            text('kind', 'Kind'),
            text('status', 'Status'),
            money('amount', 'Amount'),
            money('paypal_fee', 'PayPal fee'),
            text('paypal_order_id', 'PayPal order ID'),
            text('paypal_capture_id', 'PayPal capture ID')
          ]
        },
        {
          id: 'sales',
          name: 'Captured sales',
          data: rows.sales,
          fields: [
            text('order_id', 'Order'),
            text('day', 'Day'),
            text('kind', 'Kind'),
            money('amount', 'Amount'),
            money('paypal_fee', 'PayPal fee')
          ]
        },
        {
          id: 'webhooks',
          name: 'PayPal webhook events',
          data: rows.webhooks,
          fields: [
            text('event_id', 'Event'),
            text('day', 'Day'),
            text('type', 'Type'),
            text('verified', 'Verified'),
            text('outcome', 'Outcome')
          ]
        },
        {
          id: 'payouts',
          name: 'Payouts',
          data: rows.payouts,
          fields: [
            text('payout_id', 'Payout'),
            text('day', 'Day'),
            text('contributor', 'Contributor'),
            text('status', 'Status'),
            money('requested', 'Requested'),
            money('transferred', 'Transferred'),
            text('paypal_batch_id', 'PayPal batch ID')
          ]
        }
      ]
    }),
    [rows]
  )

  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <p className='text-sm text-ink-500'>
          {mode === 'view'
            ? 'Click a bar or a slice to filter the rest of the page.'
            : 'Drag widgets from the left to build your own view. Changes stay in this browser tab.'}
        </p>
        <Button
          size='sm'
          variant='secondary'
          onClick={() => setMode(mode === 'view' ? 'edit' : 'view')}
        >
          {mode === 'view' ? 'Customise' : 'Done'}
        </Button>
      </div>
      <div className='h-[1420px] overflow-hidden rounded-3xl ring-1 ring-ink-100'>
        <AgStudio
          style={{ height: '100%', width: '100%' }}
          data={data}
          mode={mode}
          initialState={REPORT}
          theme={THEME}
        />
      </div>
    </div>
  )
}
