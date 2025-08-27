import { Card } from '@/components/ui/card'
import type { TerminalTheme } from '@/types/terminal'

import { TerminalContent } from './terminal-content'
import { TerminalHeader } from './terminal-header'

interface TerminalWindowProps {
  theme: TerminalTheme
  currentInput: string
  currentOutput: string[]
  isTypingInput: boolean
  showCursor: boolean
  showContent: boolean
}

export function TerminalWindow({
  theme,
  currentInput,
  currentOutput,
  isTypingInput,
  showCursor,
  showContent
}: TerminalWindowProps) {
  return (
    <div
      className={`transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <Card
        className={`${theme.terminalBg} ${theme.borderColor} max-w-md overflow-hidden py-0`}
      >
        <TerminalHeader theme={theme} />
        <TerminalContent
          theme={theme}
          currentInput={currentInput}
          currentOutput={currentOutput}
          isTypingInput={isTypingInput}
          showCursor={showCursor}
        />
      </Card>
    </div>
  )
}
