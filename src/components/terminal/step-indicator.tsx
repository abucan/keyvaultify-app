import type { Step, TerminalTheme } from '../../../types/terminal'

interface StepIndicatorProps {
  steps: Step[]
  currentStepIndex: number
  theme: TerminalTheme
  showContent: boolean
}

export function StepIndicator({
  steps,
  currentStepIndex,
  theme,
  showContent
}: StepIndicatorProps) {
  return (
    <div className={`flex justify-center space-x-2`}>
      {steps.map((_, index) => (
        <div
          key={index}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            index === currentStepIndex
              ? theme.isDark
                ? 'bg-primary'
                : 'bg-primary'
              : index < currentStepIndex
                ? theme.isDark
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
                : theme.isDark
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  )
}
