import classNames from 'classnames'
import type { AnswerBlock } from '@/app/lib/types/learner.type'

const styles = {
  CONTRIBUTOR_SAID: {
    box: 'bg-human-50 ring-human-600/20',
    label: 'text-human-600'
  },
  AI_SUGGESTION: { box: 'bg-ai-50 ring-ai-600/20', label: 'text-ai-600' },
  UNKNOWN: { box: 'bg-unknown-50 ring-ink-200', label: 'text-unknown-600' }
}

/**
 * Keeps the three kinds of statement visibly apart: what the contributor
 * actually said (with its source), what the AI is suggesting, and what is unknown.
 */
export function AnswerBlocks({
  blocks,
  contributorName,
  sourceTitles
}: {
  blocks: AnswerBlock[]
  contributorName: string
  sourceTitles: Record<string, string>
}): React.JSX.Element {
  return (
    <div className='space-y-2'>
      {blocks.map((block, index) => {
        const label =
          block.type === 'CONTRIBUTOR_SAID'
            ? `${contributorName} said`
            : block.type === 'AI_SUGGESTION'
              ? 'AI suggestion'
              : 'Not covered'
        return (
          <div
            key={index}
            className={classNames(
              'rounded-2xl px-4 py-3 text-sm ring-1',
              styles[block.type].box
            )}
          >
            <div
              className={classNames(
                'mb-1.5 text-xs font-semibold tracking-wide uppercase',
                styles[block.type].label
              )}
            >
              {label}
              {block.sourceIds.length > 0 && (
                <span className='ml-2 font-normal normal-case'>
                  {block.sourceIds
                    .map((id) => sourceTitles[id] ?? id)
                    .join(', ')}
                </span>
              )}
            </div>
            <p className='text-ink-900'>{block.text}</p>
            {block.quote && (
              <blockquote className='mt-1 border-l-2 border-human-600/40 pl-2 text-xs text-ink-500'>
                “{block.quote}”
              </blockquote>
            )}
            {block.unverified && (
              <p className='mt-1 text-xs text-ink-400'>
                The AI attributed this to {contributorName}, but we could not
                find it in the source, so it is shown as a suggestion.
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
