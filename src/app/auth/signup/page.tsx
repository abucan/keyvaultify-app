'use client'

import { AuthForm } from '@/components/forms/auth-form'
import { signUp } from '@/lib/auth-client'
import { signUpConfig } from '@/lib/config/auth-forms'
import { SignUpFormData, signUpSchema } from '@/lib/schemas/form-schema'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function SignUp() {
  const router = useRouter()

  const handleSignUp = async (values: SignUpFormData) => {
    toast('Event has been created.')
    try {
      /*
      const result = await signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        callbackURL: '/auth/signin',
      })

      if (result.error) {
        // toast.error(result.error.message)
      } else {
        router.push('/auth/signin')
      }
      */
    } catch (error) {
      console.error(error)
    }
  }

  return <AuthForm<SignUpFormData> schema={signUpSchema} config={signUpConfig} onSubmit={handleSignUp} />
}
