// src/components/auth-form/OTPForm.tsx
import { MoveLeft } from 'lucide-react'
import { Control } from 'react-hook-form'

import { AuthFormConfig } from '@/lib/config/auth-forms'
import { AuthFormData } from '@/lib/zod-schemas/form-schema'

import { Button } from '../ui/button'
import { FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { InputOTPGroup, InputOTPSlot } from '../ui/input-otp'
import { InputOTP } from '../ui/input-otp'

type OTPFormProps = {
  config: AuthFormConfig
  control: Control<AuthFormData>
  handleOtpSubmit: () => void
  goBackToEmail: () => void
}

export function OTPForm({
  config,
  control,
  handleOtpSubmit,
  goBackToEmail
}: OTPFormProps) {
  return (
    <div className="container max-w-sm space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-spectral text-3xl font-semibold">{config.title}</h1>
        <p className="font-roboto-mono font-[400] text-muted-foreground text-sm">
          {config.subtitle}
        </p>
      </div>
      {config.fields.map(cfg => {
        return (
          <FormField
            key={cfg.name}
            name={cfg.name}
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    {...field}
                    onComplete={handleOtpSubmit}
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      })}
      <div className="flex flex-col gap-2">
        <Button
          className="w-full font-roboto-mono text-background"
          size={'lg'}
          onClick={goBackToEmail}
          type="submit"
        >
          {config.submitText}
        </Button>
        <Button
          className="w-full font-roboto-mono"
          size={'lg'}
          variant={'link'}
          onClick={goBackToEmail}
        >
          <MoveLeft />
          {config.footerLinkText}
        </Button>
      </div>
    </div>
  )
}
