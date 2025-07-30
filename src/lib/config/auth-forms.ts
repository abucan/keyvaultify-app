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

export const signUpFormConfig: AuthFormConfig = {
  title: 'Sign up',
  subtitle: 'Already have an account?',
  linkText: 'Sign in',
  linkHref: '/auth/signin',
  middleText: 'Or sign up with email',
  fields: [
    {
      name: 'email',
      label: 'Email',
      placeholder: 'mail@example.com',
      type: 'email'
    }
  ],
  submitText: 'Continue'
}

export const signInFormConfig: AuthFormConfig = {
  title: 'Sign in',
  subtitle: "Don't have an account?",
  linkText: 'Sign up',
  linkHref: '/auth/signup',
  middleText: 'Or sign in with email',
  fields: [
    {
      name: 'email',
      label: 'Email',
      placeholder: 'mail@example.com',
      type: 'email'
    }
  ],
  submitText: 'Continue'
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
