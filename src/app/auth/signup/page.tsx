'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp'
import { authClient } from '@/lib/auth-client'
import { ChevronRight, MoveLeft, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

type Step = 'email' | 'otp'

export default function SignUp() {
  const [step, setStep] = useState<Step>('otp')
  const [otp, setOtp] = useState('')

  const handleEmailSubmit = async () => {
    await authClient.emailOtp.sendVerificationOtp({
      email: 'ante.bucan.st@gmail.com',
      type: 'sign-in'
    })
    setStep('otp')
  }

  const handleOtpSubmit = async () => {
    try {
      await authClient.signIn.emailOtp({
        email: 'ante.bucan.st@gmail.com',
        otp: otp
      })
      // Redirect to dashboard or success page
      // window.location.href = '/dashboard'
    } catch (error) {
      console.error('Failed to verify OTP:', error)
      // Add error handling/toast here
    } finally {
    }
  }

  return (
    <div className="flex h-screen">
      <div className="flex flex-col w-[60%] relative">
        <div className="absolute flex flex-row justify-between items-center py-4 px-6">
          <h1 className="font-spectral text-xl font-semibold flex flex-row items-center justify-center gap-[4px]">
            <ShieldCheck />
            Keyvaultify
          </h1>
        </div>
        <div className="flex h-screen justify-center items-center">
          {/* Form */}
          {step === 'email' && (
            <div className="container max-w-sm space-y-8">
              <div className="flex flex-col gap-2">
                <h1 className="font-spectral text-3xl font-semibold">
                  Sign up
                </h1>
                <p className="font-roboto-mono font-[400] text-muted-foreground text-sm">
                  Already have an account?{' '}
                  <Link href="/auth/signin" className="text-primary underline">
                    Sign in
                  </Link>
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Button
                  className="justify-between rounded-full font-roboto-mono"
                  size={'lg'}
                  variant={'outline'}
                >
                  <Image
                    src={'/icons/google.svg'}
                    alt="Google"
                    width={16}
                    height={16}
                  />
                  Continue with Google
                  <ChevronRight className="text-muted-foreground" />
                </Button>
                <Button
                  className="justify-between rounded-full font-roboto-mono"
                  size={'lg'}
                  variant={'outline'}
                >
                  <Image
                    src={'/icons/github_light.svg'}
                    alt="Google"
                    width={16}
                    height={16}
                  />
                  Continue with Google
                  <ChevronRight className="text-muted-foreground" />
                </Button>
              </div>
              <div className="flex flex-col gap-4">
                <p className="font-roboto-mono font-[400] text-muted-foreground text-sm">
                  Or sign up with email
                </p>
                <Input placeholder="mail@example.com" />
                <Button
                  className="w-full font-roboto-mono text-background"
                  size={'lg'}
                  onClick={handleEmailSubmit}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
          {step === 'otp' && (
            <div className="container max-w-sm space-y-8">
              <div className="flex flex-col gap-2">
                <h1 className="font-spectral text-3xl font-semibold">
                  Verify your email
                </h1>
                <p className="font-roboto-mono font-[400] text-muted-foreground text-sm">
                  We sent a verification code to your email. Enter it below.
                </p>
              </div>
              <InputOTP
                maxLength={6}
                onChange={value => setOtp(value)}
                value={otp}
                // className="w-full"
              >
                <InputOTPGroup className="w-full gap-4">
                  <InputOTPSlot index={0} className="" />
                  <InputOTPSlot index={1} className="w-full" />
                  <InputOTPSlot index={2} className="w-full" />
                  <InputOTPSlot index={3} className="w-full" />
                  <InputOTPSlot index={4} className="w-full" />
                  <InputOTPSlot index={5} className="w-full" />
                </InputOTPGroup>
              </InputOTP>
              <Button
                className="w-full font-roboto-mono"
                size={'lg'}
                variant={'link'}
                onClick={handleOtpSubmit}
              >
                <MoveLeft />
                Go Back
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="flex w-[40%] bg-primary"></div>
    </div>
  )
}
