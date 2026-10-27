import { Avatar } from '@/app/components/ui'

const menu = ['Dashboard', 'Your guides', 'Requests', 'Earnings', 'Settings']

/** Illustrative studio screenshot built from UI pieces; every value is labelled as an example. */
export function AuthVisual(): React.JSX.Element {
  return (
    <div
      aria-hidden='true'
      className='relative m-3 hidden overflow-hidden rounded-[2rem] bg-linear-to-br from-ink-950 via-ink-900 to-mint-900 lg:block'
    >
      <div className='bg-dots absolute inset-0' />
      <div className='absolute -top-32 -right-32 h-96 w-96 rounded-full bg-mint-500/20 blur-3xl' />
      <div className='absolute -bottom-40 left-10 h-96 w-96 rounded-full bg-zest-300/10 blur-3xl' />

      <div className='relative px-14 pt-16'>
        <p className='max-w-md font-display text-4xl leading-[1.08] font-semibold tracking-tight text-white'>
          Your experience, organised and earning.
        </p>
        <p className='mt-4 max-w-sm text-ink-300'>
          One account to learn from others and to share what you have lived
          through.
        </p>
      </div>

      <div className='absolute top-[44%] left-14 w-[900px] origin-top-left -rotate-6 skew-x-3'>
        <div className='absolute -top-6 left-8 h-full w-full rounded-3xl bg-white/10 ring-1 ring-white/10' />
        <div className='relative flex overflow-hidden rounded-3xl bg-card shadow-2xl ring-1 ring-white/20'>
          <div className='w-52 shrink-0 border-r border-ink-100 bg-ink-50 p-4'>
            <div className='mb-6 flex items-center gap-2 rounded-2xl bg-card p-2 shadow-sm ring-1 ring-ink-100'>
              <Avatar name='Example contributor' size='sm' />
              <span className='text-xs font-medium text-ink-900'>
                Example contributor
              </span>
            </div>
            <p className='mb-2 px-2 text-[10px] font-semibold tracking-wide text-ink-400 uppercase'>
              Studio
            </p>
            {menu.map((item, index) => (
              <p
                key={item}
                className={`mb-1 rounded-xl px-3 py-2 text-sm ${index === 0 ? 'bg-ink-900 text-white' : 'text-ink-500'}`}
              >
                {item}
              </p>
            ))}
          </div>
          <div className='flex-1 p-6'>
            <div className='flex items-center justify-between'>
              <p className='font-display text-2xl font-semibold tracking-tight text-ink-900'>
                Your studio
              </p>
              <span className='rounded-full bg-warn-50 px-2.5 py-0.5 text-xs font-medium text-warn-600'>
                Example
              </span>
            </div>
            <div className='mt-5 grid grid-cols-3 gap-3'>
              <Tile tone='bg-zest-300' label='Requests needing you' value='3' />
              <Tile tone='bg-lilac-200' label='Earned' value='$240.00' />
              <Tile tone='bg-mint-100' label='Transferred' value='$180.00' />
            </div>
            <div className='mt-4 space-y-2'>
              {[
                'Freelancing after support work',
                'Negotiating a first raise'
              ].map((title) => (
                <div
                  key={title}
                  className='flex items-center justify-between rounded-2xl bg-card px-4 py-3 ring-1 ring-ink-100'
                >
                  <span className='text-sm font-medium text-ink-900'>
                    {title}
                  </span>
                  <span className='rounded-full bg-mint-50 px-2.5 py-0.5 text-xs font-medium text-mint-800'>
                    Published
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Tile({
  tone,
  label,
  value
}: {
  tone: string
  label: string
  value: string
}): React.JSX.Element {
  return (
    <div className={`rounded-2xl p-4 ${tone}`}>
      <p className='text-xs text-ink-700'>{label}</p>
      <p className='mt-6 font-display text-2xl font-semibold tracking-tight text-ink-900'>
        {value}
      </p>
    </div>
  )
}
