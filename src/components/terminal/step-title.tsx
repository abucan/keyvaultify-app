import type { TerminalTheme } from '../../../types/terminal'

interface StepTitleProps {
  title: string
  description: string
  theme: TerminalTheme
  showContent: boolean
}

export function StepTitle({ description, theme, showContent }: StepTitleProps) {
  return (
    <div
      className={`text-center gap-14 transition-all duration-500 ${
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      {/*       <h2
        className={`text-3xl font-spectral font-semibold ${theme.isDark ? 'text-white' : 'text-white'}`}
      >
        {title}
      </h2> */}
      <p
        className={`font-spectral font-[400] text-3xl max-w-sm ${theme.isDark ? 'text-primary' : 'text-black'}`}
      >
        {description}
      </p>
    </div>
  )
}
