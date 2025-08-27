'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optional: send to your logger
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-12">
      <Image
        src={`/server-error.svg`}
        alt={`server-error`}
        width={600}
        height={600}
      />
      <div className="flex flex-col items-center justify-center gap-1">
        <h1 className="text-3xl font-bold font-bricolage-grotesque">
          Something went wrong
        </h1>
        <p className="text-muted-foreground font-bricolage-grotesque">
          If the problem persists, contact support.
        </p>
      </div>
      <Button onClick={() => reset()} className="font-bricolage-grotesque">
        Try again
      </Button>
      <Button asChild className="font-bricolage-grotesque">
        <span className="flex flex-row items-center gap-2">
          <ArrowLeft />
          <Link href="/">Go back to home</Link>
        </span>
      </Button>
    </div>
  )
}
