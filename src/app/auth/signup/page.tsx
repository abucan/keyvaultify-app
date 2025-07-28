'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { ChevronRight, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function SignUp() {
  const handleSubmit = async () => {
    await authClient.emailOtp.sendVerificationOtp({
      email: 'ante.bucan.s@gmail.com',
      type: 'email-verification'
    })
    console.log('submit')
  }

  return (
    <div className="flex h-screen">
      <div className="flex flex-col w-[60%] relative">
        <div className="absolute flex flex-row justify-between items-center py-4 px-6">
          <h1 className="font-spectral text-xl font-semibold flex flex-row items-center gap-[4px]">
            <ShieldCheck />
            Keyvaultify
          </h1>
        </div>
        <div className="flex h-screen justify-center items-center">
          {/* Form */}
          <div className="container max-w-sm space-y-8">
            <div className="flex flex-col gap-2">
              <h1 className="font-spectral text-3xl font-semibold">Sign up</h1>
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
                onClick={handleSubmit}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-[40%] bg-primary"></div>
    </div>
  )
}
