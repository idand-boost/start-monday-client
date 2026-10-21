import { Button } from '@/components/ui/button'

/** The last line of defense: something broke outside any screen. Reloading starts over. */
export function MainErrorFallback() {
  return (
    <div role="alert" className="grid min-h-screen place-items-center p-6 text-center">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">The details are in the browser console.</p>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </div>
    </div>
  )
}
