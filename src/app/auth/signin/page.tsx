'use client'

import { AuthForm } from '@/components/forms/auth-form'
import { signInConfig } from '@/lib/config/auth-forms'
import { SignInFormData, signInSchema } from '@/lib/schemas/form-schema'

export default function SignIn() {
  const handleSignIn = async (values: SignInFormData) => {
    console.log(values)
  }

  return <AuthForm<SignInFormData> schema={signInSchema} config={signInConfig} onSubmit={handleSignIn} />
}
