import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface WrongViewAlertProps {
  /** The feature this screen is built for, as the Developer Center names it: "Board view". */
  featureName: string
  /** The route the feature should point at: "/board". */
  path: string
  /** What the context says the app is running in right now. */
  currentInstanceType: string | undefined
}

/** A tip, not an error: the screen is fine, it is just open in the wrong place. */
export function WrongViewAlert({ featureName, path, currentInstanceType }: WrongViewAlertProps) {
  return (
    <Alert className="border-warning/50 bg-warning/10 text-warning-foreground">
      <TriangleAlert />
      <AlertTitle>
        This screen is meant to run as {article(featureName)} {featureName}
      </AlertTitle>
      <AlertDescription className="text-warning-foreground/90">
        <p>
          Right now the app is running{' '}
          {currentInstanceType ? `as ${currentInstanceType}` : 'outside any monday feature'}. In the Developer Center,
          add {article(featureName)} <strong>{featureName}</strong> feature to your app and point it at{' '}
          <code className="rounded bg-background/60 px-1 py-0.5 font-mono text-xs">http://localhost:5173{path}</code>.
        </p>
      </AlertDescription>
    </Alert>
  )
}

const article = (word: string) => (/^[aeiou]/i.test(word) ? 'an' : 'a')
