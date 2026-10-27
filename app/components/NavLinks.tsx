'use client'
import classNames from 'classnames'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isPathWithin } from '@/app/lib/utils/authRouting'

/** Pill links that highlight the section the visitor is in. */
export function NavLinks({
  items,
  exact = [],
  className
}: {
  items: ReadonlyArray<readonly [href: string, label: string]>
  exact?: string[]
  className?: string
}): React.JSX.Element {
  const pathname = usePathname()
  return (
    <div className={classNames('flex items-center gap-1', className)}>
      {items.map(([href, label]) => {
        const active = exact.includes(href)
          ? pathname === href
          : isPathWithin(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={classNames(
              'rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
              active
                ? 'bg-ink-900 text-white'
                : 'text-ink-700 hover:bg-ink-100 hover:text-ink-900'
            )}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
