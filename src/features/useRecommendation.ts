import { useMemo } from 'react'
import { useCatalog } from '../data/CatalogProvider'
import { recommend } from '../lib/recommend'
import { useJourney } from './JourneyProvider'

export function useRecommendation() {
  const catalog = useCatalog()
  const { answers, profile } = useJourney()
  return useMemo(() => recommend(catalog, answers, profile), [catalog, answers, profile])
}
