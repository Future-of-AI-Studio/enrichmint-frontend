'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import classNames from 'classnames'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import type { ComponentProps } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { ArrowIcon, Button, CheckIcon, ErrorNote } from '@/app/components/ui'
import { login, signUp } from '@/app/lib/services/auth.service'
import { sanitizeRedirectPath } from '@/app/lib/utils/authRouting'
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_PATTERN,
  PASSWORD_RULES
} from '@/app/lib/utils/password'

// NOTE: sign-in only checks presence, so accounts made before the stricter rules still work.
const loginSchema = z.object({
  email: z.email('Enter a valid email.'),
  password: z.string().min(1, 'Enter your password.'),
  displayName: z.string().optional(),
  confirmPassword: z.string().optional()
})

const signUpSchema = loginSchema
  .extend({
    displayName: z.string().trim().min(1, 'Tell us what to call you.').max(120),
    password: z
      .string()
      .max(
        PASSWORD_MAX_LENGTH,
        `Use at most ${PASSWORD_MAX_LENGTH} characters.`
      )
      .regex(PASSWORD_PATTERN, 'Your password does not meet every rule below.'),
    confirmPassword: z.string().min(1, 'Type your password again.')
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'The passwords do not match.'
  })

type Values = z.infer<typeof loginSchema>

export function AuthForm({
  mode
}: {
  mode: 'login' | 'signup'
}): React.JSX.Element {
  const next = sanitizeRedirectPath(useSearchParams().get('next'))
  const [error, setError] = useState<string | null>(null)
  const form = useForm<Values>({
    resolver: zodResolver(mode === 'login' ? loginSchema : signUpSchema)
  })
  const errors = form.formState.errors
  const password = useWatch({ control: form.control, name: 'password' }) ?? ''

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null)
    const result =
      mode === 'login'
        ? await login({ email: values.email, password: values.password })
        : await signUp({
            displayName: values.displayName ?? '',
            email: values.email,
            password: values.password
          })
    if (result.error !== null) {
      setError(result.error)
      return
    }
    // A full load, so no page cached for a previous account survives the switch.
    window.location.assign(next)
  })

  return (
    <form onSubmit={onSubmit} noValidate className='space-y-5'>
      {error && <ErrorNote message={error} />}
      {mode === 'signup' && (
        <AuthField
          label='Your name'
          icon={<UserIcon />}
          error={errors.displayName?.message}
        >
          <input
            className={inputStyles(!!errors.displayName)}
            placeholder='What should we call you?'
            autoComplete='name'
            aria-invalid={!!errors.displayName}
            {...form.register('displayName')}
          />
        </AuthField>
      )}
      <AuthField
        label='Email address'
        icon={<MailIcon />}
        error={errors.email?.message}
      >
        <input
          className={inputStyles(!!errors.email)}
          type='email'
          placeholder='you@example.com'
          autoComplete='email'
          aria-invalid={!!errors.email}
          {...form.register('email')}
        />
      </AuthField>
      <PasswordField
        label='Password'
        error={errors.password?.message}
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        {...form.register('password')}
      />
      {mode === 'signup' && (
        <>
          <ul className='grid gap-1.5 rounded-2xl bg-ink-50 p-4 text-xs sm:grid-cols-2'>
            {PASSWORD_RULES.map((rule) => {
              const met = rule.pattern.test(password)
              return (
                <li
                  key={rule.label}
                  className={classNames(
                    'flex items-center gap-2 transition-colors',
                    met ? 'text-mint-700' : 'text-ink-500'
                  )}
                >
                  <span
                    className={classNames(
                      'grid h-4 w-4 shrink-0 place-items-center rounded-full transition-colors',
                      met ? 'bg-mint-600 text-white' : 'bg-ink-200'
                    )}
                  >
                    {met && <CheckIcon className='h-2.5 w-2.5' />}
                  </span>
                  {rule.label}
                  <span className='sr-only'>
                    {met ? ': done' : ': not yet'}
                  </span>
                </li>
              )
            })}
          </ul>
          <PasswordField
            label='Confirm password'
            error={errors.confirmPassword?.message}
            autoComplete='new-password'
            {...form.register('confirmPassword')}
          />
        </>
      )}
      <Button
        type='submit'
        size='lg'
        className='w-full'
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting
          ? 'One moment…'
          : mode === 'login'
            ? 'Sign in'
            : 'Create account'}
        {!form.formState.isSubmitting && <ArrowIcon />}
      </Button>
      <p className='text-center text-sm text-ink-500'>
        {mode === 'login' ? (
          <>
            Don’t have an account yet?{' '}
            <Link
              className='font-semibold text-mint-700 hover:text-mint-800'
              href={`/signup?next=${encodeURIComponent(next)}`}
            >
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link
              className='font-semibold text-mint-700 hover:text-mint-800'
              href={`/login?next=${encodeURIComponent(next)}`}
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  )
}

const inputStyles = (invalid: boolean): string =>
  classNames(
    'w-full rounded-2xl border-0 bg-card py-3 pr-4 pl-11 text-sm text-ink-900 shadow-sm ring-1 transition-shadow placeholder:text-ink-400 focus:ring-2 focus:outline-none',
    invalid
      ? 'ring-danger-600/50 focus:ring-danger-600'
      : 'ring-ink-200 hover:ring-ink-300 focus:ring-mint-500'
  )

function AuthField({
  label,
  icon,
  error,
  children
}: {
  label: string
  icon: React.ReactNode
  error?: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <label className='block space-y-2'>
      <span className='text-sm font-medium text-ink-900'>{label}</span>
      <span className='relative block'>
        <span className='pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-400'>
          {icon}
        </span>
        {children}
      </span>
      {error && <span className='block text-xs text-danger-700'>{error}</span>}
    </label>
  )
}

function PasswordField({
  label,
  error,
  ...input
}: ComponentProps<'input'> & {
  label: string
  error?: string
}): React.JSX.Element {
  const [visible, setVisible] = useState(false)
  return (
    <AuthField label={label} icon={<LockIcon />} error={error}>
      <input
        {...input}
        type={visible ? 'text' : 'password'}
        placeholder='••••••••••'
        aria-invalid={!!error}
        className={classNames(inputStyles(!!error), 'pr-12')}
      />
      <button
        type='button'
        onClick={() => setVisible((value) => !value)}
        aria-label={
          visible
            ? `Hide ${label.toLowerCase()}`
            : `Show ${label.toLowerCase()}`
        }
        aria-pressed={visible}
        className='absolute top-1/2 right-2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700'
      >
        <EyeIcon off={visible} />
      </button>
    </AuthField>
  )
}

const iconProps = {
  viewBox: '0 0 20 20',
  fill: 'none',
  'aria-hidden': true,
  className: 'h-[18px] w-[18px]',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
} as const

function MailIcon(): React.JSX.Element {
  return (
    <svg {...iconProps}>
      <rect x='2.5' y='4.5' width='15' height='11' rx='2.5' />
      <path d='m3.5 6 6.5 5 6.5-5' />
    </svg>
  )
}

function LockIcon(): React.JSX.Element {
  return (
    <svg {...iconProps}>
      <rect x='4' y='8.5' width='12' height='8.5' rx='2.5' />
      <path d='M6.5 8.5V6.5a3.5 3.5 0 0 1 7 0v2' />
    </svg>
  )
}

function UserIcon(): React.JSX.Element {
  return (
    <svg {...iconProps}>
      <circle cx='10' cy='7' r='3.5' />
      <path d='M3.5 17a6.5 6.5 0 0 1 13 0' />
    </svg>
  )
}

function EyeIcon({ off }: { off: boolean }): React.JSX.Element {
  return (
    <svg {...iconProps}>
      <path d='M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6Z' />
      <circle cx='10' cy='10' r='2.5' />
      {off && <path d='m3 3 14 14' />}
    </svg>
  )
}
