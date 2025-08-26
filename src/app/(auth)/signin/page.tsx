'use client'

import { useState } from 'react'
import { redirect } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { TriangleAlert } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { AuthForm } from '@/components/auth-form'
import { OTPForm } from '@/components/auth-form/otp-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Form } from '@/components/ui/form'
import { checkEmail } from '@/lib/auth/user'
import { authClient } from '@/lib/auth-client'
import { authFormConfig, otpVerificationConfig } from '@/lib/config/auth-forms'
import { AuthFormData, authFormSchema } from '@/lib/schemas/form-schema'

type Step = 'email' | 'otp'

export default function SignInPage() {
  const [currentStep, setCurrentStep] = useState<Step>('email')
  const [emailExist, setEmaiLExist] = useState<boolean>(false)
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
      const emailExists = await checkEmail(watchedEmail)
      if (emailExists) {
        setEmaiLExist(true)
        return
      }

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
      {emailExist && (
        <Alert variant="destructive">
          <AlertTitle className="flex flex-row items-center gap-2">
            <TriangleAlert size={20} />
            Email already exists
          </AlertTitle>
          <AlertDescription>
            An account with this email already exists. Please try signing in.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
