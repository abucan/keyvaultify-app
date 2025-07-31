'use client'
import { StepTitle } from './step-title'
import { TerminalWindow } from './terminal-window'
import { StepIndicator } from './step-indicator'
import { useTerminalAnimation } from '@/lib/hooks/use-terminal-animation'
import { getTerminalTheme } from '@/lib/utils/terminal-formatters'
import { steps } from '@/data/terminal-steps'

interface Step {
  title: string
  description: string
  command: {
    input: string
    output: string[]
    delay: number
  }
}

interface KeyVaultifyTerminalProps {
  theme?: 'dark' | 'light'
}

export default function KeyVaultifyTerminal({
  theme = 'dark'
}: KeyVaultifyTerminalProps) {
  const { state, currentStep, getCurrentInput, getCurrentOutput, jumpToStep } =
    useTerminalAnimation(steps)
  const terminalTheme = getTerminalTheme(theme)

  return (
    <div className="w-full min-w-md mx-auto space-y-8 flex flex-col items-center justify-center relative">
      <StepTitle
        title={currentStep.title}
        description={currentStep.description}
        theme={terminalTheme}
        showContent={state.showContent}
      />

      <TerminalWindow
        theme={terminalTheme}
        currentInput={getCurrentInput()}
        currentOutput={getCurrentOutput()}
        isTypingInput={state.isTypingInput}
        showCursor={state.showCursor}
        showContent={state.showContent}
      />
      <div className="absolute bottom-8 left-0 right-0">
        <StepIndicator
          steps={steps}
          currentStepIndex={state.currentStepIndex}
          theme={terminalTheme}
          showContent={state.showContent}
          onStepClick={jumpToStep}
        />
      </div>
    </div>
  )
}
