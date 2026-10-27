export function AuthHeading({
  title,
  description
}: {
  title: string
  description: string
}): React.JSX.Element {
  return (
    <div className='mb-8'>
      <h1 className='font-display text-4xl font-semibold tracking-tight text-ink-900'>
        {title}
      </h1>
      <p className='mt-2 text-ink-500'>{description}</p>
    </div>
  )
}
