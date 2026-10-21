import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { useRouter, type ErrorComponentProps } from '@tanstack/react-router'
import { CircleAlert, RotateCw } from 'lucide-react'
import { useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { toUserMessage } from '@/lib/monday/errors'

/** A screen failed to load. A short message for the user, the details in the console, and a way to retry. */
export function RouteError({ error }: Pick<ErrorComponentProps, 'error'>) {
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  useEffect(() => {
    console.error('[route] failed to load:', error)
    queryErrorResetBoundary.reset()
  }, [error, queryErrorResetBoundary])

  return (
    <Alert variant="destructive">
      <CircleAlert />
      <AlertTitle>This screen couldn&apos;t load</AlertTitle>
      <AlertDescription className="gap-3">
        <p>{toUserMessage(error)}</p>
        <Button variant="outline" size="sm" onClick={() => void router.invalidate()}>
          <RotateCw /> Try again
        </Button>
      </AlertDescription>
    </Alert>
  )
}
