// src/app/(auth)/signin/components/SignInForm.tsx
import Link from 'next/link'
import { Loader } from 'lucide-react'
import { Control } from 'react-hook-form'

import { OAuthButton } from '@/app/(auth)/signin/components/OAuthButton'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { AuthFormConfig } from '@/lib/config/auth-config'
import { AuthFormData } from '@/lib/zod-schemas/form-schema'

type SignInFormProps = {
  config: AuthFormConfig
  control: Control<AuthFormData>
  loading: boolean
  disabled?: boolean
}

export function SignInForm({
  config,
  control,
  loading,
  disabled
}: SignInFormProps) {
  const handleLastUsed = (provider: 'google' | 'github' | 'email') => {
    localStorage.setItem('lastUsedProvider', provider)
  }

  return (
    <div className="container max-w-sm space-y-8">
      {/* Title and subtitle */}
      <div className="flex flex-col gap-2">
        <h1 className="font-bricolage-grotesque text-3xl font-semibold">
          {config.title}
        </h1>
        <p className="font-bricolage-grotesque font-[400] text-muted-foreground text-sm">
          {config.subtitle}{' '}
          <Link
            href={config.linkHref || '#'}
            className="text-primary underline"
          >
            {config.linkText}
          </Link>
        </p>
      </div>
      {/* OAuth buttons */}
      <div className="flex flex-col gap-4">
        <OAuthButton
          provider="google"
          text="Continue with Google"
          icon="google"
          handleLastUsed={handleLastUsed}
        />
        <OAuthButton
          provider="github"
          text="Continue with Github"
          icon="github_light"
          handleLastUsed={handleLastUsed}
        />
      </div>
      {/* Email input */}
      <div className="flex flex-col gap-2">
        <p className="font-bricolage-grotesque font-[400] text-muted-foreground text-sm">
          {config.middleText}
        </p>
        {config.fields.map(cfg => {
          return (
            <FormField
              key={cfg.name}
              name={cfg.name}
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder={cfg.placeholder}
                      type={cfg.type}
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )
        })}
        <Button
          type="submit"
          className="w-full font-bricolage-grotesque text-background"
          size={'lg'}
          disabled={loading || disabled}
        >
          {loading ? (
            <div className="flex flex-row items-center justify-center gap-2">
              <Loader className="animate-spin" />
              <span>Sending...</span>
            </div>
          ) : (
            <span>{config.submitText}</span>
          )}
        </Button>
      </div>
    </div>
  )
}
