import { Lock } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

/** Shown instead of every screen to someone who may not use the app. */
export function AccessDenied({ reason }: { reason: string }) {
  return (
    <Alert variant="destructive">
      <Lock />
      <AlertTitle>You can&apos;t use this app</AlertTitle>
      <AlertDescription>
        <p>{reason}</p>
        <p>Ask an admin of this monday account to give you member access.</p>
      </AlertDescription>
    </Alert>
  )
}
