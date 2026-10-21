import { toast } from 'sonner'
import { isInsideMonday, monday } from './sdk'

// A message to the user (monday-sdk lecture: monday.execute('notice')).
// Inside monday, monday shows it at the top of the page, like its own messages.
// In a plain browser tab there is no monday page around the app, so a toast stands in for it.

export type NoticeType = 'success' | 'error' | 'info'

interface Notice {
  message: string
  type?: NoticeType
  /** Milliseconds before it disappears. */
  timeout?: number
}

export async function notify({ message, type = 'info', timeout = 5000 }: Notice): Promise<void> {
  if (isInsideMonday) {
    await monday.execute('notice', { message, type, timeout })
    return
  }
  toast[type](message, {
    duration: timeout,
    description: 'Inside monday this is a monday.execute("notice") message.',
  })
  await monday.execute('notice', { message, type, timeout }) // The mock logs it.
}
