import type { DimensionId } from '../data/types'

// Options for the onboarding questions. Each option points to the interest
// areas it suggests, which gives the recommendation engine gentle "profile"
// signals alongside the quiz.

export type SchoolLevel = 'jss1' | 'jss2' | 'jss3' | 'ss1' | 'ss2' | 'ss3' | 'other'

export interface StudentProfile {
  schoolLevel: SchoolLevel | null
  /** A pathway id, or 'not-sure' / 'not-yet'. */
  pathway: string | null
  favouriteSubjects: string[]
  interests: DimensionId[]
  activities: string[]
  strengths: string[]
  /** Career category ids the student wants to explore. */
  careerAreas: string[]
  schoolCode: string | null
  shareWithSchool: boolean
}

export const emptyProfile = (): StudentProfile => ({
  schoolLevel: null,
  pathway: null,
  favouriteSubjects: [],
  interests: [],
  activities: [],
  strengths: [],
  careerAreas: [],
  schoolCode: null,
  shareWithSchool: false,
})

export interface SignalOption {
  id: string
  label: string
  dims: DimensionId[]
}

export const SCHOOL_LEVELS: { id: SchoolLevel; label: string }[] = [
  { id: 'jss1', label: 'JSS 1' },
  { id: 'jss2', label: 'JSS 2' },
  { id: 'jss3', label: 'JSS 3' },
  { id: 'ss1', label: 'SS 1' },
  { id: 'ss2', label: 'SS 2' },
  { id: 'ss3', label: 'SS 3' },
  { id: 'other', label: 'Other / not in school' },
]

export const isJunior = (level: SchoolLevel | null) => level === 'jss1' || level === 'jss2' || level === 'jss3'

export const PATHWAY_EXTRA_CHOICES = [
  { id: 'not-yet', label: 'I haven’t chosen yet' },
  { id: 'not-sure', label: 'I’m not sure' },
]

export const SUBJECTS: SignalOption[] = [
  { id: 'mathematics', label: 'Mathematics', dims: ['logic'] },
  { id: 'english', label: 'English Language', dims: ['communicate'] },
  { id: 'biology', label: 'Biology', dims: ['life'] },
  { id: 'chemistry', label: 'Chemistry', dims: ['life', 'logic'] },
  { id: 'physics', label: 'Physics', dims: ['logic', 'build'] },
  { id: 'further-maths', label: 'Further Mathematics', dims: ['logic'] },
  { id: 'basic-science', label: 'Basic Science', dims: ['life', 'logic'] },
  { id: 'basic-tech', label: 'Basic Technology', dims: ['build', 'practical'] },
  { id: 'digital-tech', label: 'Digital Technology / ICT', dims: ['tech'] },
  { id: 'agric', label: 'Agricultural Science', dims: ['nature'] },
  { id: 'geography', label: 'Geography', dims: ['nature', 'logic'] },
  { id: 'technical-drawing', label: 'Technical Drawing', dims: ['build'] },
  { id: 'literature', label: 'Literature in English', dims: ['communicate', 'creative'] },
  { id: 'government', label: 'Government', dims: ['people'] },
  { id: 'history', label: 'History', dims: ['people', 'communicate'] },
  { id: 'civic', label: 'Civic Education', dims: ['people'] },
  { id: 'religious', label: 'CRS / IRS', dims: ['people'] },
  { id: 'languages', label: 'French or Nigerian languages', dims: ['communicate'] },
  { id: 'economics', label: 'Economics', dims: ['organise', 'logic'] },
  { id: 'commerce', label: 'Commerce / Business Studies', dims: ['organise'] },
  { id: 'accounting', label: 'Financial Accounting', dims: ['organise', 'logic'] },
  { id: 'fine-arts', label: 'Fine Arts', dims: ['creative'] },
  { id: 'music', label: 'Music', dims: ['creative'] },
  { id: 'home-economics', label: 'Home Economics', dims: ['practical', 'life'] },
  { id: 'phe', label: 'Physical & Health Education', dims: ['life'] },
  { id: 'trade', label: 'A trade subject (e.g. electrical, garment making)', dims: ['practical', 'build'] },
]

export const ACTIVITIES: SignalOption[] = [
  { id: 'coding', label: 'Using computers or coding', dims: ['tech'] },
  { id: 'gaming', label: 'Playing strategy or puzzle games', dims: ['logic'] },
  { id: 'fixing', label: 'Fixing gadgets or machines', dims: ['practical', 'build'] },
  { id: 'drawing', label: 'Drawing or designing', dims: ['creative'] },
  { id: 'sewing', label: 'Sewing or styling clothes', dims: ['creative', 'practical'] },
  { id: 'music', label: 'Playing or making music', dims: ['creative'] },
  { id: 'acting', label: 'Acting or performing', dims: ['creative', 'communicate'] },
  { id: 'reading', label: 'Reading stories', dims: ['communicate'] },
  { id: 'writing', label: 'Writing stories or articles', dims: ['communicate', 'creative'] },
  { id: 'debating', label: 'Debating or public speaking', dims: ['communicate', 'people'] },
  { id: 'videos', label: 'Making videos or taking photos', dims: ['creative', 'tech'] },
  { id: 'volunteering', label: 'Volunteering or helping others', dims: ['people'] },
  { id: 'selling', label: 'Selling things or running a small business', dims: ['organise'] },
  { id: 'planning', label: 'Planning events', dims: ['organise', 'people'] },
  { id: 'experiments', label: 'Doing science experiments', dims: ['logic', 'life'] },
  { id: 'gardening', label: 'Gardening or farming', dims: ['nature', 'practical'] },
  { id: 'animals', label: 'Looking after animals', dims: ['nature', 'life'] },
  { id: 'cooking', label: 'Cooking or baking', dims: ['practical'] },
  { id: 'building', label: 'Building models or crafts', dims: ['build', 'creative'] },
  { id: 'sports', label: 'Playing sports', dims: ['life'] },
]

export const STRENGTHS: SignalOption[] = [
  { id: 'numbers', label: 'Good with numbers', dims: ['logic'] },
  { id: 'creative', label: 'Creative and imaginative', dims: ['creative'] },
  { id: 'communicator', label: 'Good at explaining things', dims: ['communicate'] },
  { id: 'caring', label: 'Patient and caring', dims: ['people', 'life'] },
  { id: 'organised', label: 'Organised', dims: ['organise'] },
  { id: 'hands', label: 'Good with my hands', dims: ['practical'] },
  { id: 'curious', label: 'Curious about how things work', dims: ['build', 'logic'] },
  { id: 'leader', label: 'A good leader', dims: ['people', 'organise'] },
  { id: 'tech-savvy', label: 'Quick to learn new technology', dims: ['tech'] },
  { id: 'observant', label: 'Observant and careful', dims: ['life', 'nature'] },
  { id: 'persistent', label: 'Hardworking and persistent', dims: [] },
]

const byId = (list: SignalOption[]) => new Map(list.map((o) => [o.id, o]))
export const SUBJECTS_BY_ID = byId(SUBJECTS)
export const ACTIVITIES_BY_ID = byId(ACTIVITIES)
export const STRENGTHS_BY_ID = byId(STRENGTHS)
