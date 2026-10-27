import classNames from 'classnames'
import type { CSSProperties } from 'react'

/**
 * The spinning mint coin, used wherever the app or the steward is working.
 * With a label it announces itself to screen readers as a status.
 */
export function CoinLoader({
  size = 28,
  label,
  showLabel = false,
  className
}: {
  size?: number
  label?: string
  showLabel?: boolean
  className?: string
}): React.JSX.Element {
  const coin = (
    <span
      aria-hidden='true'
      className='coin-loader'
      style={{ '--coin-size': `${size}px` } as CSSProperties}
    />
  )
  if (!label) return coin
  return (
    <span
      role='status'
      className={classNames('inline-flex items-center gap-2.5', className)}
    >
      {coin}
      <span className={showLabel ? 'text-sm text-ink-500' : 'sr-only'}>
        {label}
      </span>
    </span>
  )
}

/** Centred loader for a whole page or panel. */
export function CoinLoaderBlock({
  label = 'Loading…'
}: {
  label?: string
}): React.JSX.Element {
  return (
    <div className='grid min-h-[40vh] place-items-center'>
      <div className='flex flex-col items-center gap-3'>
        <CoinLoader size={64} />
        <p role='status' className='text-sm text-ink-500'>
          {label}
        </p>
      </div>
    </div>
  )
}
