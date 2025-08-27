import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-12">
      <Image
        src={`/not-found.svg`}
        alt={`not-found`}
        width={600}
        height={600}
      />
      <div className="flex flex-col items-center justify-center gap-1">
        <h1 className="text-3xl font-bold font-bricolage-grotesque">
          Oh no! Page not found
        </h1>
        <p className="text-muted-foreground font-bricolage-grotesque">
          We couldn&apos;t find the page you were looking for.
        </p>
      </div>
      <Button asChild className="font-bricolage-grotesque">
        <span className="flex flex-row items-center gap-2">
          <ArrowLeft />
          <Link href="/">Go back to home</Link>
        </span>
      </Button>
    </div>
  )
}
