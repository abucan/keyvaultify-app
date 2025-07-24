/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FieldValues, Path, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '../ui/button'
import { Button as StatefulButton } from '../ui/stateful-button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { AuthFormConfig } from '@/lib/config/auth-forms'
import { Eye, EyeOff, User } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

interface AuthFormProps<T extends FieldValues> {
  schema: z.ZodSchema<T>
  config: AuthFormConfig<T>
  onSubmit: (values: T) => Promise<void> | void
  isLoading?: boolean
}

export function AuthForm<T extends FieldValues>({ schema, config, onSubmit, isLoading = false }: AuthFormProps<T>) {
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})

  const form = useForm<T>({
    resolver: zodResolver(schema as any),
    defaultValues: config.fields.reduce((acc, field) => {
      acc[field.name as keyof T] = '' as T[keyof T]
      return acc
    }, {} as any),
  })

  const handleSubmit = async (values: T) => {
    try {
      await onSubmit(values)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPassword(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold font-poppins">{config.title}</CardTitle>
            <CardDescription className="text-muted-foreground text-sm text-balance font-poppins">
              {config.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {config.fields.map(fieldConfig => (
                <FormField
                  key={fieldConfig.name as string}
                  control={form.control}
                  name={fieldConfig.name as Path<T>}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldConfig.label}</FormLabel>
                      <FormControl>
                        <div className="flex rounded-md border items-start justify-center relative">
                          <User width={24} className="ml-2 mr-1.5 self-center" />
                          <Input
                            {...field}
                            type={
                              fieldConfig.type === 'password' && showPassword[fieldConfig.name as string]
                                ? 'text'
                                : fieldConfig.type
                            }
                            placeholder={fieldConfig.placeholder}
                            disabled={isLoading}
                            className={fieldConfig.type === 'password' ? 'pr-10' : ''}
                          />
                          {fieldConfig.type === 'password' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => togglePasswordVisibility(fieldConfig.name as string)}
                              disabled={isLoading}
                            >
                              {showPassword[fieldConfig.name as string] ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      {fieldConfig.description && <FormDescription>{fieldConfig.description}</FormDescription>}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <StatefulButton type="submit" className="w-full" disabled={isLoading}>
                {config.submitText}
              </StatefulButton>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-background text-muted-foreground relative z-10 px-2">Or continue with</span>
              </div>
              <Button variant="outline" className="w-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                    fill="currentColor"
                  />
                </svg>
                Login with GitHub
              </Button>
            </div>
          </CardContent>
          <div className="text-center text-sm">
            {config.footerText}{' '}
            <a href={config.footerLinkHref} className="underline underline-offset-4">
              {config.footerLinkText}
            </a>
          </div>
        </Card>
      </form>
    </Form>
  )
}
