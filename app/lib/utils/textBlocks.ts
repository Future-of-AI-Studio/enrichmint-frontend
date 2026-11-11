export type TextBlock =
  { kind: 'paragraph'; text: string } | { kind: 'checklist'; items: string[] }

const LIST_ITEM = /^\s*(?:[-*•]\s+(?:\[[ xX]?\]\s*)?|\d+[.)]\s+|\[[ xX]?\]\s+)/

/**
 * Splits model or person-written text into paragraphs and step lists, so a
 * line that starts with "- ", "* ", "1." or "[ ]" renders as a checklist item.
 */
export function toTextBlocks(text: string): TextBlock[] {
  const blocks: TextBlock[] = []
  let paragraph: string[] = []
  const flush = (): void => {
    if (paragraph.length > 0) {
      blocks.push({ kind: 'paragraph', text: paragraph.join(' ') })
      paragraph = []
    }
  }
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) {
      flush()
      continue
    }
    if (LIST_ITEM.test(line)) {
      flush()
      const item = line.replace(LIST_ITEM, '').trim()
      const last = blocks[blocks.length - 1]
      if (last?.kind === 'checklist') last.items.push(item)
      else blocks.push({ kind: 'checklist', items: [item] })
      continue
    }
    paragraph.push(line)
  }
  flush()
  return blocks
}
