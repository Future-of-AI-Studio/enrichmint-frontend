import Link from 'next/link'

export default function NotFound(): React.JSX.Element {
  return (
    <div className='mx-auto max-w-md px-4 py-24 text-center'>
      <p className='font-display text-8xl font-semibold tracking-tight text-ink-200'>
        404
      </p>
      <h1 className='font-display text-3xl font-semibold tracking-tight'>
        Not found
      </h1>
      <p className='mt-2 text-ink-500'>
        This page doesn’t exist, or you don’t have access to it.
      </p>
      <Link
        href='/'
        className='mt-8 inline-flex rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mint-700'
      >
        Go home
      </Link>
    </div>
  )
}
