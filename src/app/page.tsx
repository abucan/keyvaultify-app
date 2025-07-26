import { Button, HStack } from '@chakra-ui/react'
import Image from 'next/image'

export default function Home() {
  return (
    <HStack justifyContent="center" alignItems="center" height="100vh">
      <Button>Click me</Button>
    </HStack>
  )
}
