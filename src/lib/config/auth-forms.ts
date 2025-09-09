// src/lib/config/auth-forms.ts
export interface FormField {
  name: 'email' | 'otp'
  label: string
  placeholder?: string
  type: 'email' | 'otp'
}

export interface AuthFormConfig {
  title: string
  subtitle: string
  fields: FormField[]
  submitText: string
  linkText?: string
  linkHref?: string
  middleText?: string
  footerText?: string
  footerLinkText?: string
  footerLinkHref?: string
}

export const authFormConfig: AuthFormConfig = {
  title: 'Welcome to Keyvaultify',
  subtitle: 'Enter your email to sign in or to create a new account.',
  // linkText: 'Sign in',
  // linkHref: '/auth/signin',
  middleText: 'Or continue using email',
  fields: [
    {
      name: 'email',
      label: 'Email',
      placeholder: 'mail@example.com',
      type: 'email'
    }
  ],
  submitText: 'Continue with Email'
}

export const otpVerificationConfig: AuthFormConfig = {
  title: 'Verify your email',
  subtitle: 'We sent a verification code to your email. Enter it below.',
  fields: [
    {
      name: 'otp',
      label: 'Verification Code',
      type: 'otp'
    }
  ],
  submitText: 'Continue',
  footerText: "Didn't receive the code?",
  footerLinkText: 'Go back',
  footerLinkHref: '#resend'
}
