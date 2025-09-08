// src/components/auth-form/index.tsx
import Link from 'next/link'
import { Loader } from 'lucide-react'
import { Control } from 'react-hook-form'

import { AuthFormConfig } from '@/lib/config/auth-forms'
import { AuthFormData } from '@/lib/zod-schemas/form-schema'

import { Button } from '../ui/button'
import { FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { Input } from '../ui/input'

import { OAuthButton } from './OAuthButton'

type SignUpFormProps = {
  config: AuthFormConfig
  control: Control<AuthFormData>
  loading: boolean
  disabled?: boolean
}

export function AuthForm({
  config,
  control,
  loading,
  disabled
}: SignUpFormProps) {
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
        />
        <OAuthButton
          provider="github"
          text="Continue with Github"
          icon="github_light"
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
