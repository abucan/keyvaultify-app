export interface Step {
  title: string
  description: string
  command: {
    input: string
    output: string[]
    delay: number
  }
}

export interface TerminalTheme {
  isDark: boolean
  terminalBg: string
  headerBg: string
  borderColor: string
  textColor: string
  promptColor: string
  inputTextColor: string
  cursorBg: string
}

export interface TerminalState {
  currentStepIndex: number
  currentCharIndex: number
  currentOutputIndex: number
  isTypingInput: boolean
  showCursor: boolean
  isTransitioning: boolean
  showContent: boolean
}
