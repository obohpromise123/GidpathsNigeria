// Turns database/network errors into safe, human-friendly messages.
// We never show raw SQL, stack traces or internal details to users.

interface MaybeDbError {
  code?: string
  message?: string
}

export class AppError extends Error {}

export function friendlyError(error: unknown): string {
  if (error instanceof AppError) return error.message
  const e = (error ?? {}) as MaybeDbError
  const message = e.message ?? ''

  if (/verified_needs_source/.test(message)) {
    return 'To mark a record as verified, choose a source and enter the date it was last verified.'
  }
  if (/Only platform administrators/.test(message)) return 'Only platform administrators can change that.'
  if (/No account exists for that email/.test(message)) {
    return 'No account exists for that email. Invite the user in Supabase Auth first, then try again.'
  }
  switch (e.code) {
    case '42501':
      return 'You do not have permission to do that.'
    case '23505':
      return 'A record with the same name or ID already exists.'
    case '23503':
      return 'This record is linked to other records. Remove or change those first.'
    case '23514':
    case '22P02':
    case '23502':
      return 'Some of the values are not allowed. Please check the form and try again.'
    case 'PGRST301':
    case 'PGRST303':
      return 'Your session has expired. Please sign in again.'
  }
  if (/Failed to fetch|NetworkError|network/i.test(message)) {
    return 'We could not reach the server. Check your internet connection and try again.'
  }
  return 'Something went wrong. Please try again.'
}
