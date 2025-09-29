import { CardContent } from '@/components/ui/card'
import { formatOutputLine } from '@/components/terminal/terminal-formatters'
import type { TerminalTheme } from '@/types/terminal'

interface TerminalContentProps {
  theme: TerminalTheme
  currentInput: string
  currentOutput: string[]
  isTypingInput: boolean
  showCursor: boolean
}

export function TerminalContent({
  theme,
  currentInput,
  currentOutput,
  isTypingInput,
  showCursor
}: TerminalContentProps) {
  return (
    <CardContent
      className={`${theme.terminalBg} font-mono text-sm h-[200px] min-w-md overflow-hidden`}
    >
      <div className="space-y-2 h-full flex flex-col justify-start">
        <div className="space-y-1">
          <div className="flex items-center">
            <span className={`${theme.promptColor} mr-2`}>$</span>
            <span className={theme.inputTextColor}>{currentInput}</span>
            {isTypingInput && showCursor && (
              <span
                className={`${theme.inputTextColor} ${theme.cursorBg} w-2 h-4 ml-1 inline-block animate-pulse`}
              >
                _
              </span>
            )}
          </div>
          {currentOutput.map((line, index) => (
            <div key={index} className="ml-4">
              {formatOutputLine(line, theme.isDark)}
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  )
}
