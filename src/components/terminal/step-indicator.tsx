import type { Step, TerminalTheme } from '../../../types/terminal'

interface StepIndicatorProps {
  steps: Step[]
  currentStepIndex: number
  theme: TerminalTheme
  showContent: boolean
  onStepClick?: (stepIndex: number) => void
}

export function StepIndicator({
  steps,
  currentStepIndex,
  theme,
  onStepClick
}: StepIndicatorProps) {
  return (
    <div className={`flex justify-center space-x-2`}>
      {steps.map((_, index) => (
        <button
          key={index}
          onClick={() => onStepClick?.(index)}
          className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
            index === currentStepIndex
              ? theme.isDark
                ? 'bg-primary hover:bg-purple-400'
                : 'bg-primary hover:bg-purple-500'
              : index < currentStepIndex
                ? theme.isDark
                  ? 'bg-gray-500 hover:bg-green-400'
                  : 'bg-gray-600 hover:bg-green-500'
                : theme.isDark
                  ? 'bg-gray-600 hover:bg-gray-500'
                  : 'bg-gray-300 hover:bg-gray-400'
          }`}
          aria-label={`Go to step ${index + 1}: ${steps[index].title}`}
        />
      ))}
    </div>
  )
}
