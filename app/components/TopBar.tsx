import Link from 'next/link'
import type { CurrentUser } from '@/app/lib/types/user.type'
import { NavLinks } from './NavLinks'
import { ButtonLink, SandboxBadge } from './ui'
import { UserMenu } from './UserMenu'

export function Logo({
  inverted = false
}: {
  inverted?: boolean
}): React.JSX.Element {
  return (
    <Link href='/' className='flex shrink-0 items-center gap-2.5'>
      <img
        src='/brand/enrichmint-coin.webp'
        alt=''
        width={36}
        height={36}
        className='h-9 w-9 shrink-0'
      />
      <span
        className={`font-display text-lg font-semibold tracking-tight ${inverted ? 'text-white' : 'text-ink-900'}`}
      >
        Enrich
        <span className={inverted ? 'text-mint-300' : 'text-mint-600'}>
          MINT
        </span>
      </span>
    </Link>
  )
}

export function TopBar({
  user
}: {
  user: CurrentUser | null
}): React.JSX.Element {
  const items: Array<readonly [string, string]> = [['/guides', 'Browse']]
  if (user) {
    items.push(
      ['/steward', 'Learn'],
      ['/library', 'Library'],
      ['/requests', 'Requests'],
      ['/studio', 'Share']
    )
    if (user.role === 'ADMIN') items.push(['/admin', 'Admin'])
  }

  return (
    <header className='sticky top-0 z-30 border-b border-ink-100/80 bg-paper/80 backdrop-blur-xl'>
      <div className='mx-auto flex h-16 max-w-page items-center justify-between gap-3 px-4 sm:gap-6 sm:px-6 lg:px-8'>
        <Logo />
        <nav aria-label='Main' className='hidden min-w-0 flex-1 lg:block'>
          <NavLinks items={items} />
        </nav>
        <div className='flex shrink-0 items-center gap-3 whitespace-nowrap'>
          <SandboxBadge />
          {user ? (
            <UserMenu name={user.displayName} />
          ) : (
            <>
              <Link
                href='/login'
                className='text-sm font-medium text-ink-700 transition-colors hover:text-ink-900'
              >
                Sign in
              </Link>
              {/* On phones the header only fits one link; the sign-in page links to sign-up. */}
              <ButtonLink href='/signup' size='sm' className='max-sm:hidden'>
                Join
              </ButtonLink>
            </>
          )}
        </div>
      </div>
      <nav
        aria-label='Main'
        className='overflow-x-auto border-t border-ink-100/80 px-3 py-2 lg:hidden'
      >
        <NavLinks items={items} />
      </nav>
    </header>
  )
}

export function Footer(): React.JSX.Element {
  return (
    <footer className='mt-24 bg-ink-950 text-ink-300'>
      <div className='mx-auto grid max-w-page gap-10 px-4 sm:px-6 lg:px-8 py-14 md:grid-cols-[1.2fr_1fr]'>
        <div className='space-y-4'>
          <Logo inverted />
          <p className='max-w-md text-sm'>
            Earn from your real-life experience. Learn from someone else’s.
          </p>
        </div>
        <div className='space-y-3 text-sm'>
          <p>
            EnrichMINT is a hackathon prototype. All payments run in the PayPal
            sandbox and move no real money. Experience shared here is
            self-reported and is not professional, legal or financial advice.
          </p>
          <p className='text-ink-400'>
            Profiles marked “Demo profile” are fictional.
          </p>
        </div>
      </div>
    </footer>
  )
}
