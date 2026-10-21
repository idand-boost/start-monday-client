import { createFileRoute, Link } from '@tanstack/react-router'
import { FileText, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GreetButton } from '@/features/greeting/components/greet-button'
import { ContextCard } from '@/features/home/components/context-card'
import { CourseHighlights } from '@/features/home/components/course-highlights'
import { useMondayContext } from '@/lib/monday/context'
import { isInsideMonday } from '@/lib/monday/sdk'

export const Route = createFileRoute('/_app/')({
  component: HomePage,
})

function HomePage() {
  const context = useMondayContext()

  return (
    <div className="space-y-10">
      <section className="grid gap-6 md:grid-cols-[1fr_300px] md:items-start">
        <div className="space-y-5">
          <h1 className="text-3xl font-semibold sm:text-4xl">Your starting point for monday client apps</h1>
          <p className="max-w-prose text-muted-foreground">
            Everything the course builds, already wired: the SDK in two worlds, the API without leaking a token, a queue
            that survives rate limits, a route per feature, and a deploy pipeline. Replace the examples with your own
            app.
          </p>
          <div className="flex flex-wrap gap-2">
            <GreetButton />
            <Button variant="outline" size="lg" asChild>
              <Link to="/board">
                <LayoutGrid /> Board view
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/item">
                <FileText /> Item view
              </Link>
            </Button>
          </div>
        </div>
        <ContextCard context={context} isInsideMonday={isInsideMonday} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">What&apos;s inside</h2>
        <CourseHighlights />
      </section>
    </div>
  )
}
