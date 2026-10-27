'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { logout } from '@/app/lib/services/auth.service'
import { Avatar } from './ui'

const itemStyles =
  'block w-full rounded-xl px-3 py-2 text-left text-sm text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900'

/** Account menu so secondary links do not crowd the header. */
export function UserMenu({ name }: { name: string }): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent): void => {
      // reason: pointer events on the document always target a DOM node.
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className='relative'>
      <button
        type='button'
        aria-haspopup='menu'
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
        onClick={() => setOpen((value) => !value)}
        className='flex items-center gap-2 rounded-full bg-card p-1 shadow-sm ring-1 ring-ink-100 transition-colors hover:ring-ink-300 sm:pr-3'
      >
        <Avatar name={name} size='sm' />
        <span className='hidden max-w-32 truncate text-sm font-medium text-ink-700 sm:inline'>
          {name}
        </span>
        <svg
          viewBox='0 0 20 20'
          fill='none'
          aria-hidden='true'
          className={`hidden h-4 w-4 text-ink-400 transition-transform sm:block ${open ? 'rotate-180' : ''}`}
        >
          <path
            d='m6 8 4 4 4-4'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </button>
      {open && (
        <div
          role='menu'
          className='absolute right-0 mt-2 w-56 rounded-2xl bg-card p-1.5 shadow-lift ring-1 ring-ink-100'
        >
          <p className='truncate px-3 pt-2 pb-1 text-xs text-ink-400'>
            Signed in as {name}
          </p>
          <Link
            role='menuitem'
            href='/log'
            className={itemStyles}
            onClick={() => setOpen(false)}
          >
            Stewardship log
          </Link>
          <form action={logout}>
            <button role='menuitem' className={itemStyles}>
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
