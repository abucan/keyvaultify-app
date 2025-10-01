// src/app/(private)/projects/layout.tsx
import { ReactNode } from 'react'

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>
}

