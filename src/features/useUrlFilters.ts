import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'

/**
 * Keeps filter values in the URL (?q=law&category=media), so filtered views
 * can be shared or bookmarked and the Back button works as expected.
 */
export function useUrlFilters<T extends Record<string, string>>(defaults: T) {
  const [params, setParams] = useSearchParams()

  const filters = useMemo(() => {
    const result = { ...defaults }
    for (const key of Object.keys(defaults) as (keyof T)[]) {
      const value = params.get(key as string)
      if (value !== null) result[key] = value as T[keyof T]
    }
    return result
  }, [params, defaults])

  const setFilter = useCallback(
    (key: keyof T, value: string) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value) next.set(key as string, value)
          else next.delete(key as string)
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const clear = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams])
  const active = Object.keys(defaults).some((k) => filters[k as keyof T] !== defaults[k as keyof T])

  return { filters, setFilter, clear, active }
}
