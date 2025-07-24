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
  title: 'Login to your account',
  subtitle: 'Enter your email below to login to your account',
  fields: [
    {
      name: 'email',
      label: 'Email',
      placeholder: 'mail@example.com',
      type: 'email',
      description: "We'll never share your email with anyone else",
    },
    {
      name: 'password',
      label: 'Password',
      placeholder: '',
      type: 'password',
    },
  ],
  submitText: 'Sign In',
  footerText: "Don't have an account?",
  footerLinkText: 'Sign up',
  footerLinkHref: '/sign-up',
}

export const signUpConfig: AuthFormConfig<SignUpFormData> = {
  title: 'Register for an account',
  subtitle: 'Enter your email below to register for an account',
  fields: [
    {
      name: 'name',
      label: 'Full Name',
      placeholder: '',
      type: 'text',
    },
    {
      name: 'email',
      label: 'Email',
      placeholder: 'mail@example.com',
      type: 'email',
    },
    {
      name: 'password',
      label: 'Password',
      placeholder: '',
      type: 'password',
      description: 'Must be at least 8 characters long',
    },
  ],
  submitText: 'Create Account',
  footerText: 'Already have an account?',
  footerLinkText: 'Sign in',
  footerLinkHref: '/sign-in',
}
