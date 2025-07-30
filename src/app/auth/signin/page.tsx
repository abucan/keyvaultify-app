'use client'

import { authClient } from '@/lib/auth-client'
import { AuthFormData, authFormSchema } from '@/lib/schemas/form-schema'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { redirect } from 'next/navigation'
import { Form } from '@/components/ui/form'
import { SignUpForm } from '@/components/auth-form/sign-up-form'
import {
  otpVerificationConfig,
  signInFormConfig
} from '@/lib/config/auth-forms'
import { OTPForm } from '@/components/auth-form/otp-form'

type Step = 'email' | 'otp'

export default function SignIn() {
  const [currentStep, setCurrentStep] = useState<Step>('email')
  const [loading, setLoading] = useState(false)

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: '',
      otp: ''
    },
    mode: 'onSubmit'
  })

  const {
    handleSubmit,
    watch,
    trigger,
    clearErrors,
    setError,
    control,
    reset,
    formState: { errors }
  } = form

  const watchedEmail = watch('email')
  const watchedOtp = watch('otp')

  const handleEmailSubmit = async () => {
    const isValid = await trigger('email')
    if (!isValid) return

    setLoading(true)
    try {
      const { data, error } = await authClient.emailOtp.sendVerificationOtp({
        email: watchedEmail,
        type: 'sign-in'
      })
      console.log(data)

      setCurrentStep('otp')
    } catch (error) {
      console.error('Failed to send OTP:', error)
      setError('email', {
        type: 'manual',
        message: 'Something went wrong. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async () => {
    const isValid = await trigger('otp')
    if (!isValid) return

    setLoading(true)
    try {
      const { data, error } = await authClient.signIn.emailOtp({
        email: watchedEmail,
        otp: watchedOtp!
      })
      console.log(data)

      redirect('/dashboard')
    } catch (error) {
      console.error('Failed to verify OTP:', error)
      setError('otp', {
        type: 'manual',
        message: 'Invalid verification code. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async () => {
    if (currentStep === 'email') {
      await handleEmailSubmit()
    } else {
      await handleOtpSubmit()
    }
  }

  const goBackToEmail = () => {
    setCurrentStep('email')
    clearErrors('otp')
    reset()
  }

  return (
    <Form {...form}>
      <form
        className="w-full grid place-items-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        {currentStep === 'email' && (
          <SignUpForm
            config={signInFormConfig}
            control={control}
            loading={loading}
          />
        )}
        {currentStep === 'otp' && (
          <OTPForm
            config={otpVerificationConfig}
            control={control}
            handleOtpSubmit={handleOtpSubmit}
            goBackToEmail={goBackToEmail}
          />
        )}
      </form>
    </Form>
  )
}
