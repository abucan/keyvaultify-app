export interface FormField {
  name: string
  label: string
  placeholder: string
  type: 'email' | 'text' | 'otp'
  description?: string
}

export interface AuthFormConfig {
  title: string
  subtitle: string
  fields: FormField[]
  submitText: string
  footerText?: string
  footerLinkText?: string
  footerLinkHref?: string
}

export const emailRequestConfig: AuthFormConfig = {
  title: 'Welcome to KeyVaultify',
  subtitle: 'Enter your email to sign in or create an account',
  fields: [
    {
      name: 'email',
      label: 'Email',
      placeholder: 'Enter your email address',
      type: 'email',
      description: "We'll send you a verification code"
    }
  ],
  submitText: 'Continue'
}

export const otpVerificationConfig: AuthFormConfig = {
  title: 'Check your email',
  subtitle: 'We sent a 6-digit code to your email address',
  fields: [
    {
      name: 'email',
      label: 'Email',
      placeholder: 'your@email.com',
      type: 'email'
    },
    {
      name: 'otp',
      label: 'Verification Code',
      placeholder: '000000',
      type: 'otp',
      description: 'Enter the 6-digit code from your email'
    }
  ],
  submitText: 'Verify & Continue',
  footerText: "Didn't receive the code?",
  footerLinkText: 'Resend code',
  footerLinkHref: '#resend'
}
