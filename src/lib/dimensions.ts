import type { DimensionId } from '../data/types'

export interface DimensionInfo {
  id: DimensionId
  label: string
  description: string
}

/** The ten interest areas, described in student-friendly language. */
export const DIMENSIONS: Record<DimensionId, DimensionInfo> = {
  logic: { id: 'logic', label: 'Maths & logic', description: 'Solving mathematical or logical problems' },
  life: { id: 'life', label: 'Living things & health', description: 'Understanding the human body, health and living things' },
  build: { id: 'build', label: 'Building & designing', description: 'Building, repairing or designing things' },
  communicate: { id: 'communicate', label: 'Writing & communicating', description: 'Writing, speaking and creating content' },
  people: { id: 'people', label: 'Helping people & society', description: 'Helping people and understanding society' },
  organise: { id: 'organise', label: 'Organising & money', description: 'Organising activities or managing money' },
  tech: { id: 'tech', label: 'Technology', description: 'Working with computers and technology' },
  nature: { id: 'nature', label: 'Plants, animals & environment', description: 'Working with plants, animals or the environment' },
  creative: { id: 'creative', label: 'Art, fashion & design', description: 'Creating art, fashion, music or designs' },
  practical: { id: 'practical', label: 'Hands-on technical work', description: 'Practical, hands-on work with tools' },
}

export const DIMENSION_IDS = Object.keys(DIMENSIONS) as DimensionId[]
