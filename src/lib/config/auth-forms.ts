import { SignInFormData, SignUpFormData } from '@/lib/schemas/form-schema'

export interface FormField<T> {
  name: keyof T
  label: string
  placeholder: string
  type: 'email' | 'password' | 'text'
  description?: string
}

export interface AuthFormConfig<T> {
  title: string
  subtitle: string
  fields: FormField<T>[]
  submitText: string
  footerText: string
  footerLinkText: string
  footerLinkHref: string
}

export const signInConfig: AuthFormConfig<SignInFormData> = {
  title: 'Welcome back',
  subtitle: 'Sign in to your KeyVaultify account',
  fields: [
    {
      name: 'email',
      label: 'Email',
      placeholder: 'Enter your email',
      type: 'email',
      description: "We'll never share your email with anyone else",
    },
    {
      name: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      type: 'password',
    },
  ],
  submitText: 'Sign In',
  footerText: "Don't have an account?",
  footerLinkText: 'Sign up',
  footerLinkHref: '/sign-up',
}

export const signUpConfig: AuthFormConfig<SignUpFormData> = {
  title: 'Create an account',
  subtitle: 'Get started with KeyVaultify today',
  fields: [
    {
      name: 'name',
      label: 'Full Name',
      placeholder: 'Enter your full name',
      type: 'text',
    },
    {
      name: 'email',
      label: 'Email',
      placeholder: 'Enter your email',
      type: 'email',
    },
    {
      name: 'password',
      label: 'Password',
      placeholder: 'Create a password',
      type: 'password',
      description: 'Must be at least 8 characters long',
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      placeholder: 'Confirm your password',
      type: 'password',
    },
  ],
  submitText: 'Create Account',
  footerText: 'Already have an account?',
  footerLinkText: 'Sign in',
  footerLinkHref: '/sign-in',
}
