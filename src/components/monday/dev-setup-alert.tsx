import { Wrench } from 'lucide-react'
import type { ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

/** Something is missing from the local setup (usually .env). Only shows up in a plain browser tab. */
export function DevSetupAlert({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Alert>
      <Wrench />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  )
}
