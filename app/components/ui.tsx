import classNames from 'classnames'
import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const buttonStyles: Record<Variant, string> = {
  primary:
    'bg-ink-900 text-white shadow-sm hover:bg-mint-700 disabled:bg-ink-300',
  accent:
    'bg-zest-300 text-ink-900 shadow-sm hover:bg-zest-400 disabled:bg-zest-100 disabled:text-ink-400',
  secondary:
    'bg-card text-ink-900 ring-1 ring-ink-200 hover:bg-ink-50 hover:ring-ink-300 disabled:text-ink-400',
  ghost: 'text-mint-700 hover:bg-mint-50 disabled:text-ink-400',
  danger: 'bg-card text-danger-700 ring-1 ring-danger-600/30 hover:bg-danger-50'
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base'
}

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100'

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ComponentProps<'button'> & {
  variant?: Variant
  size?: Size
}): React.JSX.Element {
  return (
    <button
      className={classNames(
        buttonBase,
        sizeStyles[size],
        buttonStyles[variant],
        className
      )}
      {...props}
    />
  )
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: Variant
  size?: Size
}): React.JSX.Element {
  return (
    <Link
      className={classNames(
        buttonBase,
        sizeStyles[size],
        buttonStyles[variant],
        className
      )}
      {...props}
    />
  )
}

export function ArrowIcon({
  className
}: {
  className?: string
}): React.JSX.Element {
  return (
    <svg
      viewBox='0 0 20 20'
      fill='none'
      aria-hidden='true'
      className={classNames('h-4 w-4', className)}
    >
      <path
        d='M4 10h12m0 0-5-5m5 5-5 5'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function CheckIcon({
  className
}: {
  className?: string
}): React.JSX.Element {
  return (
    <svg
      viewBox='0 0 20 20'
      fill='none'
      aria-hidden='true'
      className={classNames('h-4 w-4', className)}
    >
      <path
        d='m5 10.5 3.2 3L15 6.5'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function Card({
  className,
  ...props
}: ComponentProps<'div'>): React.JSX.Element {
  return (
    <div
      className={classNames(
        'rounded-3xl bg-card p-6 shadow-card ring-1 ring-ink-100',
        className
      )}
      {...props}
    />
  )
}

/** Shared look for list rows and tiles that link somewhere; callers set the display. */
export const linkCardStyles =
  'rounded-3xl bg-card p-5 shadow-card ring-1 ring-ink-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift hover:ring-mint-300'

const avatarTones = [
  'bg-zest-300 text-ink-900',
  'bg-lilac-200 text-ink-900',
  'bg-mint-200 text-mint-900',
  'bg-human-50 text-human-600',
  'bg-warn-50 text-warn-600'
]

export function Avatar({
  name,
  size = 'md'
}: {
  name: string
  size?: 'sm' | 'md' | 'lg'
}): React.JSX.Element {
  // Drops labels like "(demo)" and stray symbols so they never become initials.
  const initials = name
    .replace(/\([^)]*\)/g, ' ')
    .split(/\s+/)
    .map((part) => part.replace(/[^\p{L}]/gu, ''))
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
  // Stable colour per name so the same person always looks the same.
  const tone =
    avatarTones[
      [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
        avatarTones.length
    ]
  return (
    <span
      aria-hidden='true'
      className={classNames(
        'grid shrink-0 place-items-center rounded-full font-semibold ring-2 ring-card',
        tone,
        {
          'h-7 w-7 text-[11px]': size === 'sm',
          'h-9 w-9 text-xs': size === 'md',
          'h-12 w-12 text-sm': size === 'lg'
        }
      )}
    >
      {initials || '?'}
    </span>
  )
}

type Tone = 'mint' | 'neutral' | 'warn' | 'danger' | 'human' | 'ai' | 'sandbox'

const toneStyles: Record<Tone, string> = {
  mint: 'bg-mint-50 text-mint-800 ring-mint-200',
  neutral: 'bg-ink-50 text-ink-700 ring-ink-200',
  warn: 'bg-warn-50 text-warn-600 ring-warn-600/20',
  danger: 'bg-danger-50 text-danger-700 ring-danger-600/20',
  human: 'bg-human-50 text-human-600 ring-human-600/20',
  ai: 'bg-ai-50 text-ai-600 ring-ai-600/20',
  sandbox: 'bg-sandbox-50 text-sandbox-600 ring-sandbox-600/30'
}

export function Badge({
  tone = 'neutral',
  children,
  title
}: {
  tone?: Tone
  children: ReactNode
  title?: string
}): React.JSX.Element {
  return (
    <span
      title={title}
      className={classNames(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset',
        toneStyles[tone]
      )}
    >
      {children}
    </span>
  )
}

export function DemoBadge(): React.JSX.Element {
  return (
    <Badge
      tone='warn'
      title='Fictional demo profile and content, not a real person.'
    >
      Demo profile
    </Badge>
  )
}

export function SandboxBadge(): React.JSX.Element {
  return (
    <Badge tone='sandbox' title='PayPal sandbox: no real money moves.'>
      <span className='h-1.5 w-1.5 rounded-full bg-sandbox-600' />
      PayPal Sandbox
    </Badge>
  )
}

export const fieldStyles =
  'w-full rounded-xl border-0 bg-card px-3.5 py-2.5 text-sm text-ink-900 shadow-sm ring-1 ring-ink-200 transition-shadow placeholder:text-ink-400 hover:ring-ink-300 focus:ring-2 focus:ring-mint-500 focus:outline-none'

export function Field({
  label,
  hint,
  error,
  children
}: {
  label: string
  hint?: ReactNode
  error?: string
  children: ReactNode
}): React.JSX.Element {
  return (
    <label className='block space-y-1.5'>
      <span className='text-sm font-medium text-ink-700'>{label}</span>
      {children}
      {hint && !error && (
        <span className='block text-xs text-ink-500'>{hint}</span>
      )}
      {error && <span className='block text-xs text-danger-700'>{error}</span>}
    </label>
  )
}

export function PageHeader({
  badge,
  title,
  description,
  actions
}: {
  badge?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}): React.JSX.Element {
  return (
    <div className='mb-10 flex flex-wrap items-end justify-between gap-6'>
      <div className='max-w-2xl space-y-3'>
        {badge && <div>{badge}</div>}
        <h1 className='font-display text-4xl leading-[1.05] font-semibold tracking-tight text-ink-900 sm:text-5xl'>
          {title}
        </h1>
        {description && (
          <p className='text-base text-ink-500 sm:text-lg'>{description}</p>
        )}
      </div>
      {actions && <div className='flex flex-wrap gap-2'>{actions}</div>}
    </div>
  )
}

type StatTone = 'zest' | 'lilac' | 'mint' | 'plain'

const statStyles: Record<StatTone, string> = {
  zest: 'bg-zest-300',
  lilac: 'bg-lilac-200',
  mint: 'bg-mint-100',
  plain: 'bg-card ring-1 ring-ink-100'
}

/** Big-number tile for dashboards; links when given an href. */
export function StatTile({
  label,
  value,
  hint,
  tone = 'plain',
  href
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: StatTone
  href?: string
}): React.JSX.Element {
  const body = (
    <>
      <div className='flex items-start justify-between gap-3'>
        <p className='text-sm font-medium text-ink-700'>{label}</p>
        {href && (
          <span className='grid h-8 w-8 place-items-center rounded-full bg-ink-900 text-white transition-transform duration-200 group-hover:-rotate-45'>
            <ArrowIcon />
          </span>
        )}
      </div>
      <div>
        <p className='font-display text-4xl font-semibold tracking-tight text-ink-900'>
          {value}
        </p>
        {hint && <p className='mt-1 text-xs text-ink-700'>{hint}</p>}
      </div>
    </>
  )
  const styles = classNames(
    'group flex min-h-40 flex-col justify-between gap-6 rounded-3xl p-6 shadow-card',
    statStyles[tone]
  )
  return href ? (
    <Link
      href={href}
      className={classNames(
        styles,
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift'
      )}
    >
      {body}
    </Link>
  ) : (
    <div className={styles}>{body}</div>
  )
}

export function EmptyState({
  title,
  children
}: {
  title: string
  children?: ReactNode
}): React.JSX.Element {
  return (
    <div className='rounded-3xl border border-dashed border-ink-200 bg-card/50 px-6 py-14 text-center'>
      <span className='mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-zest-200 text-ink-900'>
        <ArrowIcon className='-rotate-45' />
      </span>
      <p className='font-display text-lg font-semibold text-ink-900'>{title}</p>
      {children && <div className='mt-2 text-sm text-ink-500'>{children}</div>}
    </div>
  )
}

export function ErrorNote({ message }: { message: string }): React.JSX.Element {
  return (
    <div
      role='alert'
      className='rounded-2xl bg-danger-50 px-4 py-3 text-sm text-danger-700 ring-1 ring-danger-600/20'
    >
      {message}
    </div>
  )
}

export function Notice({
  tone = 'neutral',
  title,
  children
}: {
  tone?: 'neutral' | 'warn' | 'mint'
  title?: string
  children: ReactNode
}): React.JSX.Element {
  const styles = {
    neutral: 'bg-ink-50 text-ink-700 ring-ink-100',
    warn: 'bg-warn-50 text-warn-600 ring-warn-600/15',
    mint: 'bg-mint-50 text-mint-800 ring-mint-200'
  }
  return (
    <div
      className={classNames(
        'rounded-2xl px-4 py-3 text-sm ring-1',
        styles[tone]
      )}
    >
      {title && <p className='mb-0.5 font-semibold'>{title}</p>}
      <div>{children}</div>
    </div>
  )
}
