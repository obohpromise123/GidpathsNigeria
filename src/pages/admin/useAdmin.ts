import { useCallback, useEffect, useState } from 'react'
import { useCatalog } from '../../data/CatalogProvider'
import { friendlyError } from '../../data/errors'
import { getRepository, type ListOptions, type Row, type TableName } from '../../data/repository'
import type { Lookups } from './resources'

/** Loads rows from one table, with loading and error states. */
export function useRows(table: TableName | null, options?: ListOptions) {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const key = JSON.stringify(options ?? {})

  const load = useCallback(async () => {
    if (!table) return
    setError(null)
    try {
      setRows(await (await getRepository()).list(table, JSON.parse(key) as ListOptions))
    } catch (e) {
      setError(friendlyError(e))
    }
  }, [table, key])

  useEffect(() => {
    setRows(null)
    void load()
  }, [load])

  return { rows, error, reload: load }
}

/** Data the admin forms need for dropdowns. */
export function useLookups(): Lookups | null {
  const catalog = useCatalog()
  const { rows: schools } = useRows('schools', { order: 'name' })
  return schools ? { catalog, schools } : null
}
