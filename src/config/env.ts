import { z } from 'zod'

// The VITE_ variables, parsed once. They are public: Vite puts them in the browser bundle.
// The monday API token is not here on purpose: it only exists in the dev server (see .env.example).
// All of them are for local development in a plain browser tab. Inside monday, the context decides.

const optionalId = z
  .string()
  .trim()
  .regex(/^\d*$/, 'must be the number from the monday URL')
  .transform((value) => value || undefined)
  .optional()

const EnvSchema = z.object({
  VITE_DEV_BOARD_ID: optionalId,
  VITE_DEV_ITEM_ID: optionalId,
  VITE_DEV_TOKEN: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .optional(),
  VITE_DEV_BACKEND_URL: z.url().default('http://localhost:8080'),
})

// Read only in `npm run dev`. In a build, `import.meta.env.DEV` is false, so import.meta.env is never
// touched and Vite inlines none of these values: your test ids and dev token never ship.
const parsed = EnvSchema.safeParse(import.meta.env.DEV ? import.meta.env : {})
if (!parsed.success) {
  throw new Error(`Invalid .env:\n${z.prettifyError(parsed.error)}`)
}

export const env = parsed.data
