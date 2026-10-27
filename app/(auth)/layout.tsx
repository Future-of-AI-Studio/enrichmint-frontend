import { Logo } from '@/app/components/TopBar'
import { SandboxBadge } from '@/app/components/ui'
import { AuthVisual } from './AuthVisual'

export default function AuthLayout({
  children
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className='grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]'>
      <div className='flex flex-col px-6 py-6 sm:px-10'>
        <div className='flex items-center justify-between gap-4'>
          <Logo />
          <SandboxBadge />
        </div>
        <main className='mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12'>
          {children}
        </main>
        <p className='text-center text-xs text-ink-400'>
          Hackathon prototype. Payments run in the PayPal sandbox and move no
          real money.
        </p>
      </div>
      <AuthVisual />
    </div>
  )
}
