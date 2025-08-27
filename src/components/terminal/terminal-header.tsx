import type { TerminalTheme } from '@/types/terminal'

interface TerminalHeaderProps {
  theme: TerminalTheme
}

export function TerminalHeader({ theme }: TerminalHeaderProps) {
  return (
    <div
      className={`${theme.headerBg} px-4 py-3 flex items-center border-b relative ${theme.borderColor}`}
    >
      <div className="flex items-center justify-start w-full">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span
          className={`${theme.textColor} text-sm font-roboto-mono absolute left-1/2 transform -translate-x-1/2`}
        >
          KeyVaultify Demo Terminal
        </span>
      </div>
    </div>
  )
}
