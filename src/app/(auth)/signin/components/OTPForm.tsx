// src/app/(auth)/signin/components/OTPForm.tsx
import { Loader, MoveLeft } from 'lucide-react'
import { Control, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import { InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { InputOTP } from '@/components/ui/input-otp'
import { AuthFormConfig } from '@/lib/config/auth-config'
import { AuthFormData } from '@/lib/zod-schemas/form-schema'

type OTPFormProps = {
  config: AuthFormConfig
  control: Control<AuthFormData>
  handleOtpSubmit: () => void
  goBackToEmail: () => void
  loading?: boolean
  disabled?: boolean
}

export function OTPForm({
  config,
  control,
  handleOtpSubmit,
  goBackToEmail,
  loading = false,
  disabled = false
}: OTPFormProps) {
  const otp = useWatch({ control, name: 'otp' })

  return (
    <div className="container max-w-sm space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-bricolage-grotesque text-3xl font-semibold">
          {config.title}
        </h1>
        <p className="font-bricolage-grotesque font-[400] text-muted-foreground text-sm">
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
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-label="One-time password"
                    {...field}
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
          onClick={handleOtpSubmit}
          type="submit"
          disabled={loading || String(otp).length !== 6 || disabled}
        >
          {loading ? (
            <div className="flex flex-row items-center justify-center gap-2">
              <Loader className="animate-spin" />
              <span>Verifying...</span>
            </div>
          ) : (
            <span>{config.submitText}</span>
          )}
        </Button>
        <Button
          className="w-full font-roboto-mono"
          size={'lg'}
          type="button"
          variant={'link'}
          onClick={goBackToEmail}
          disabled={loading}
        >
          <MoveLeft />
          {config.footerLinkText}
        </Button>
      </div>
    </div>
  )
}
