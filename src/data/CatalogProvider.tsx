import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { ErrorState, LoadingState } from '../components/ui/States'
import { friendlyError } from './errors'
import { getRepository } from './repository'
import type { Catalog } from './types'

interface CatalogState {
  catalog: Catalog | null
  error: string | null
  reload: () => Promise<void>
}

const CatalogContext = createContext<CatalogState | null>(null)

/** Loads all public educational content once and shares it with every page. */
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      setError(null)
      const repo = await getRepository()
      setCatalog(await repo.loadCatalog())
    } catch (e) {
      setError(friendlyError(e))
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return <CatalogContext.Provider value={{ catalog, error, reload }}>{children}</CatalogContext.Provider>
}

function useCatalogState(): CatalogState {
  const state = useContext(CatalogContext)
  if (!state) throw new Error('useCatalog must be used inside <CatalogProvider>')
  return state
}

/** Shows loading/error states until the catalog is ready. */
export function CatalogGate({ children }: { children: ReactNode }) {
  const { catalog, error, reload } = useCatalogState()
  if (error) return <ErrorState title="We couldn’t load the course library" message={error} onRetry={() => void reload()} />
  if (!catalog) return <LoadingState label="Loading courses and careers…" />
  return <>{children}</>
}

/** The loaded catalog. Only call inside <CatalogGate>. */
export function useCatalog(): Catalog {
  const { catalog } = useCatalogState()
  if (!catalog) throw new Error('useCatalog called before the catalog loaded; wrap the page in <CatalogGate>')
  return catalog
}

export function useReloadCatalog() {
  return useCatalogState().reload
}
