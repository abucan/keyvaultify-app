import { Button, HStack } from '@chakra-ui/react'
import Link from 'next/link'

export default function Home() {
  return (
    <HStack justifyContent="center" alignItems="center" height="100vh">
      <Button asChild>
        <Link href="/auth/signin">Sign In</Link>
      </Button>
      <Button asChild>
        <Link href="/auth/signup">Sign Up</Link>
      </Button>
    </HStack>
  )
}
