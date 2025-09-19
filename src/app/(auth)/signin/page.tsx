// src/app/(auth)/signin/page.tsx
'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { AuthForm } from '@/components/auth-form'
import { OTPForm } from '@/components/auth-form/OTPForm'
import { Form } from '@/components/ui/form'
import { authFormConfig, otpVerificationConfig } from '@/lib/config/auth-forms'
import { AuthFormData, authFormSchema } from '@/lib/zod-schemas/form-schema'
import { sendSignInWithOtp, verifySignInWithOtp } from '@/server/auth.actions'

type Step = 'email' | 'otp'

export default function SignInPage() {
  const [currentStep, setCurrentStep] = useState<Step>('email')
  const [loading, setLoading] = useState(false)

  /* redirect to the page after login */
  const sp = useSearchParams()
  const next = sp.get('next') ?? '/dashboard'

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
    formState: { isDirty, isValid }
  } = form

  const watchedEmail = watch('email')
  const watchedOtp = watch('otp')

  const handleEmailSubmit = async () => {
    const isValid = await trigger('email')
    if (!isValid) return

    setLoading(true)

    try {
      const fd = new FormData()
      fd.append('email', watchedEmail)
      fd.append('next', next)
      const res = await sendSignInWithOtp(fd)

      if (!res.ok) {
        if (res.code === 'INVALID_EMAIL') {
          setError('email', { type: 'manual', message: 'Enter a valid email.' })
        } else if (res.code === 'RATE_LIMITED') {
          setError('email', {
            type: 'manual',
            message: 'Too many attempts. Try again later.'
          })
        } else {
          setError('email', {
            type: 'manual',
            message: 'Could not send code. Please try again.'
          })
        }
        return
      }

      setCurrentStep('otp')
      clearErrors('otp')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async () => {
    const isValid = await trigger('otp')
    if (!isValid) return

    setLoading(true)

    try {
      const fd = new FormData()
      fd.append('email', watchedEmail)
      fd.append('otp', watchedOtp!)
      fd.append('next', next)
      const res = await verifySignInWithOtp(fd)

      if (!res?.ok) {
        if (res.code === 'OTP_EXPIRED') {
          setError('otp', {
            type: 'manual',
            message: 'Code expired. Request a new one.'
          })
        } else if (res.code === 'INVALID_OTP') {
          setError('otp', {
            type: 'manual',
            message: 'Invalid code. Please try again.'
          })
        } else {
          setError('otp', {
            type: 'manual',
            message: 'Could not verify code. Try again.'
          })
        }
      }
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
    <div className="flex flex-col max-w-sm w-full gap-8">
      <Form {...form}>
        <form
          className="w-full grid place-items-center"
          onSubmit={handleSubmit(onSubmit)}
        >
          {currentStep === 'email' && (
            <AuthForm
              config={authFormConfig}
              control={control}
              loading={loading}
              disabled={!isDirty || !isValid}
            />
          )}
          {currentStep === 'otp' && (
            <OTPForm
              config={otpVerificationConfig}
              control={control}
              loading={loading}
              disabled={!isDirty || !isValid}
              handleOtpSubmit={handleOtpSubmit}
              goBackToEmail={goBackToEmail}
            />
          )}
        </form>
      </Form>
    </div>
  )
}
