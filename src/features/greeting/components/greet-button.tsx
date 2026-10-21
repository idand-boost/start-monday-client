import { useQueryClient } from '@tanstack/react-query'
import { Hand } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toUserMessage } from '@/lib/monday/errors'
import { meQueryOptions } from '@/lib/monday/me'
import { notify } from '@/lib/monday/notify'

/** Reads the user (API) and greets them with monday's own notice (SDK: monday.execute). */
export function GreetButton() {
  const queryClient = useQueryClient()
  const [isGreeting, setIsGreeting] = useState(false)

  async function greet() {
    setIsGreeting(true)
    const me = await queryClient.fetchQuery(meQueryOptions()).catch((error: unknown) => {
      console.warn(`[greeting] Greeting without a name: ${toUserMessage(error)}`)
      return null
    })
    await notify({ message: me ? `Hello, ${me.name} 👋` : 'Hello there 👋', type: 'success' })
    setIsGreeting(false)
  }

  return (
    <Button size="lg" onClick={greet} disabled={isGreeting}>
      <Hand /> Greet me
    </Button>
  )
}
