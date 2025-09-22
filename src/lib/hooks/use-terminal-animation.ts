// src/lib/hooks/use-terminal-animation.ts
'use client'
import { useCallback, useEffect, useState } from 'react'

import type { Step, TerminalState } from '@/types/terminal'

export function useTerminalAnimation(steps: Step[]) {
  const [state, setState] = useState<TerminalState>({
    currentStepIndex: 0,
    currentCharIndex: 0,
    currentOutputIndex: 0,
    isTypingInput: false,
    showCursor: true,
    isTransitioning: false,
    showContent: true
  })

  const [isAutoPlay, setIsAutoPlay] = useState(true)

  const currentStep = steps[state.currentStepIndex]

  // Auto-start animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setState(prev => ({ ...prev, isTypingInput: true }))
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({ ...prev, showCursor: !prev.showCursor }))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const transitionToNextStep = useCallback(() => {
    setState(prev => ({ ...prev, isTransitioning: true, showContent: false }))

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        currentStepIndex:
          prev.currentStepIndex < steps.length - 1
            ? prev.currentStepIndex + 1
            : 0,
        currentCharIndex: 0,
        currentOutputIndex: 0,
        isTypingInput: true,
        showContent: true,
        isTransitioning: false
      }))
    }, 500)
  }, [steps.length])

  const jumpToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex === state.currentStepIndex) return

      setIsAutoPlay(false) // Pause auto-play when manually navigating
      setState(prev => ({ ...prev, isTransitioning: true, showContent: false }))

      setTimeout(() => {
        setState(prev => ({
          ...prev,
          currentStepIndex: stepIndex,
          currentCharIndex: 0,
          currentOutputIndex: 0,
          isTypingInput: true,
          showContent: true,
          isTransitioning: false
        }))

        // Resume auto-play after a delay
        setTimeout(() => {
          setIsAutoPlay(true)
        }, 2000)
      }, 500)
    },
    [state.currentStepIndex]
  )

  // Input typing animation
  useEffect(() => {
    if (!state.isTypingInput || state.isTransitioning) return

    const currentCommand = currentStep.command

    if (state.currentCharIndex < currentCommand.input.length) {
      const timeout = setTimeout(
        () => {
          setState(prev => ({
            ...prev,
            currentCharIndex: prev.currentCharIndex + 1
          }))
        },
        50 + Math.random() * 50
      )
      return () => clearTimeout(timeout)
    } else {
      const timeout = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isTypingInput: false,
          currentOutputIndex: 0
        }))
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [
    state.isTypingInput,
    state.currentCharIndex,
    currentStep,
    state.isTransitioning
  ])

  // Output animation
  useEffect(() => {
    if (state.isTypingInput || state.isTransitioning || !isAutoPlay) return

    const currentCommand = currentStep.command

    if (state.currentOutputIndex < currentCommand.output.length) {
      const timeout = setTimeout(
        () => {
          setState(prev => ({
            ...prev,
            currentOutputIndex: prev.currentOutputIndex + 1
          }))
        },
        300 + Math.random() * 200
      )
      return () => clearTimeout(timeout)
    } else {
      const timeout = setTimeout(() => {
        transitionToNextStep()
      }, currentCommand.delay)
      return () => clearTimeout(timeout)
    }
  }, [
    state.currentOutputIndex,
    currentStep,
    state.isTypingInput,
    state.isTransitioning,
    transitionToNextStep,
    isAutoPlay
  ])

  const getCurrentInput = () => {
    return currentStep.command.input.slice(0, state.currentCharIndex)
  }

  const getCurrentOutput = () => {
    if (state.isTypingInput) return []
    return currentStep.command.output.slice(0, state.currentOutputIndex)
  }

  return {
    state,
    currentStep,
    getCurrentInput,
    getCurrentOutput,
    jumpToStep,
    isAutoPlay
  }
}
