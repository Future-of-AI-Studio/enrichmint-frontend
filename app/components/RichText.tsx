'use client'
import { useId, useState } from 'react'
import { toTextBlocks } from '@/app/lib/utils/textBlocks'

/** Paragraphs plus real checklists; ticks are only a reading aid and are not saved. */
export function RichText({
  text,
  className
}: {
  text: string
  className?: string
}): React.JSX.Element {
  const id = useId()
  const [done, setDone] = useState<Record<string, boolean>>({})
  return (
    <div className={className ?? 'space-y-2'}>
      {toTextBlocks(text).map((block, blockIndex) =>
        block.kind === 'paragraph' ? (
          <p key={blockIndex}>{block.text}</p>
        ) : (
          <ul key={blockIndex} className='space-y-1.5'>
            {block.items.map((item, itemIndex) => {
              const key = `${blockIndex}-${itemIndex}`
              const inputId = `${id}-${key}`
              return (
                <li key={key} className='flex items-start gap-2'>
                  <input
                    id={inputId}
                    type='checkbox'
                    checked={done[key] ?? false}
                    onChange={(event) =>
                      setDone((prev) => ({
                        ...prev,
                        [key]: event.target.checked
                      }))
                    }
                    className='mt-0.5 h-4 w-4 shrink-0 accent-mint-600'
                  />
                  <label
                    htmlFor={inputId}
                    className={done[key] ? 'text-ink-400 line-through' : ''}
                  >
                    {item}
                  </label>
                </li>
              )
            })}
          </ul>
        )
      )}
    </div>
  )
}
