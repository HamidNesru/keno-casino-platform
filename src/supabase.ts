import { createClient } from '@supabase/supabase-js'

// Clean up common mistakes: quotes, spaces, trailing slash, or a pasted path like /rest/v1/ or /dashboard/...
function cleanUrl(raw?: string) {
  if (!raw) return undefined
  try { return new URL(raw.trim().replace(/^["']|["']$/g, '')).origin } catch { return undefined }
}

const url = cleanUrl(import.meta.env.VITE_SUPABASE_URL as string | undefined)
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim().replace(/^["']|["']$/g, '')

export const supabase = url && anon ? createClient(url, anon) : null
export const supabaseConfigured = Boolean(supabase)
