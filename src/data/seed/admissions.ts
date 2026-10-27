import type { AdmissionRequirement } from '../types.ts'

const GENERAL_NOTE =
  'Typical pattern seen across many institutions. Not verified for any specific institution or admission cycle — confirm on JAMB IBASS and the institution’s official website before applying.'

type General = Pick<AdmissionRequirement, 'course_id' | 'olevel_requirements' | 'utme_subjects'> & { direct_entry?: string; extra?: string }

// General (institution_id = null) guidance, all "unverified".
const general: General[] = [
  { course_id: 'computer-science', olevel_requirements: 'Five credits usually including English Language, Mathematics and Physics, plus two other science subjects.', utme_subjects: ['Use of English', 'Mathematics', 'Physics', 'One of Biology, Chemistry, Agricultural Science, Economics or Geography'] },
  { course_id: 'software-engineering', olevel_requirements: 'Five credits usually including English Language, Mathematics and Physics, plus two other science subjects.', utme_subjects: ['Use of English', 'Mathematics', 'Physics', 'One other science subject'] },
  { course_id: 'statistics', olevel_requirements: 'Five credits usually including English Language and Mathematics, plus three relevant subjects such as Physics, Chemistry or Economics.', utme_subjects: ['Use of English', 'Mathematics', 'Two of Physics, Chemistry, Economics or Geography'] },
  { course_id: 'medicine', olevel_requirements: 'Five credits usually including English Language, Mathematics, Physics, Chemistry and Biology, often at a single sitting.', utme_subjects: ['Use of English', 'Biology', 'Chemistry', 'Physics'], extra: 'Medicine is highly competitive and many institutions set higher scores than other courses.' },
  { course_id: 'nursing', olevel_requirements: 'Five credits usually including English Language, Mathematics, Physics, Chemistry and Biology.', utme_subjects: ['Use of English', 'Biology', 'Chemistry', 'Physics'] },
  { course_id: 'pharmacy', olevel_requirements: 'Five credits usually including English Language, Mathematics, Physics, Chemistry and Biology.', utme_subjects: ['Use of English', 'Biology', 'Chemistry', 'Physics'] },
  { course_id: 'medical-lab-science', olevel_requirements: 'Five credits usually including English Language, Mathematics, Physics, Chemistry and Biology.', utme_subjects: ['Use of English', 'Biology', 'Chemistry', 'Physics'] },
  { course_id: 'microbiology', olevel_requirements: 'Five credits usually including English Language, Mathematics, Biology, Chemistry and Physics.', utme_subjects: ['Use of English', 'Biology', 'Chemistry', 'Physics or Mathematics'] },
  { course_id: 'civil-engineering', olevel_requirements: 'Five credits usually including English Language, Mathematics, Physics and Chemistry, plus one other science or technical subject.', utme_subjects: ['Use of English', 'Mathematics', 'Physics', 'Chemistry'] },
  { course_id: 'electrical-engineering', olevel_requirements: 'Five credits usually including English Language, Mathematics, Physics and Chemistry, plus one other science or technical subject.', utme_subjects: ['Use of English', 'Mathematics', 'Physics', 'Chemistry'] },
  { course_id: 'mechanical-engineering', olevel_requirements: 'Five credits usually including English Language, Mathematics, Physics and Chemistry, plus one other science or technical subject.', utme_subjects: ['Use of English', 'Mathematics', 'Physics', 'Chemistry'] },
  { course_id: 'architecture', olevel_requirements: 'Five credits usually including English Language, Mathematics and Physics, plus subjects such as Chemistry, Fine Arts, Geography or Technical Drawing.', utme_subjects: ['Use of English', 'Mathematics', 'Physics', 'One of Chemistry, Geography, Fine Arts, Biology or Economics'] },
  { course_id: 'estate-management', olevel_requirements: 'Five credits usually including English Language, Mathematics and Economics, plus two other relevant subjects.', utme_subjects: ['Use of English', 'Mathematics', 'Economics', 'One other subject'] },
  { course_id: 'accounting', olevel_requirements: 'Five credits usually including English Language, Mathematics and Economics, plus two other relevant subjects.', utme_subjects: ['Use of English', 'Mathematics', 'Economics', 'One other social science or commercial subject'] },
  { course_id: 'economics', olevel_requirements: 'Five credits usually including English Language, Mathematics and Economics, plus two other relevant subjects.', utme_subjects: ['Use of English', 'Mathematics', 'Economics', 'One other social science subject'] },
  { course_id: 'business-administration', olevel_requirements: 'Five credits usually including English Language, Mathematics and Economics, plus two other relevant subjects.', utme_subjects: ['Use of English', 'Mathematics', 'Economics', 'One other subject'] },
  { course_id: 'banking-finance', olevel_requirements: 'Five credits usually including English Language, Mathematics and Economics, plus two other relevant subjects.', utme_subjects: ['Use of English', 'Mathematics', 'Economics', 'One other subject'] },
  { course_id: 'law', olevel_requirements: 'Five credits usually including English Language and Literature in English, and at many institutions Mathematics, plus arts or social science subjects.', utme_subjects: ['Use of English', 'Literature in English (at many institutions)', 'Two other arts or social science subjects'] },
  { course_id: 'political-science', olevel_requirements: 'Five credits usually including English Language, Mathematics and Government or History.', utme_subjects: ['Use of English', 'Government or History', 'Two other arts or social science subjects'] },
  { course_id: 'psychology', olevel_requirements: 'Varies widely — some institutions place Psychology in the Social Sciences, others in the Sciences. Many ask for English Language, Mathematics and Biology.', utme_subjects: ['Use of English', 'Varies by institution — check IBASS'] },
  { course_id: 'sociology', olevel_requirements: 'Five credits usually including English Language and Mathematics, plus social science subjects.', utme_subjects: ['Use of English', 'Three arts or social science subjects'] },
  { course_id: 'mass-communication', olevel_requirements: 'Five credits usually including English Language, Literature in English and Mathematics, plus arts or social science subjects.', utme_subjects: ['Use of English', 'Literature in English', 'Two other arts or social science subjects'] },
  { course_id: 'english-literary', olevel_requirements: 'Five credits usually including English Language and Literature in English, plus other arts subjects.', utme_subjects: ['Use of English', 'Literature in English', 'Two other arts or social science subjects'] },
  { course_id: 'theatre-arts', olevel_requirements: 'Five credits usually including English Language and Literature in English, plus other arts subjects.', utme_subjects: ['Use of English', 'Literature in English', 'Two other arts or social science subjects'] },
  { course_id: 'agriculture', olevel_requirements: 'Five credits usually including English Language, Mathematics, Chemistry, Biology or Agricultural Science, and Physics.', utme_subjects: ['Use of English', 'Chemistry', 'Biology or Agricultural Science', 'Mathematics or Physics'] },
  { course_id: 'food-science', olevel_requirements: 'Five credits usually including English Language, Mathematics, Chemistry, Physics and Biology or Agricultural Science.', utme_subjects: ['Use of English', 'Chemistry', 'Mathematics or Physics', 'Biology or Agricultural Science'] },
  { course_id: 'education', olevel_requirements: 'Depends on the teaching subject. Usually five credits including English Language, Mathematics and the subject you want to teach.', utme_subjects: ['Use of English', 'Subjects related to your teaching subject'] },
  { course_id: 'fine-applied-arts', olevel_requirements: 'Five credits usually including English Language and Fine Arts, plus other relevant subjects.', utme_subjects: ['Use of English', 'Fine Arts', 'Two other subjects'] },
  { course_id: 'fashion-design', olevel_requirements: 'Requirements for ND programmes vary. Credits in English Language, Mathematics and subjects such as Fine Arts or Garment Making are common.', utme_subjects: ['Use of English', 'Varies by polytechnic — check IBASS'] },
  { course_id: 'science-lab-technology', olevel_requirements: 'Credits for ND programmes commonly include English Language, Mathematics, Chemistry and Physics or Biology.', utme_subjects: ['Use of English', 'Chemistry', 'Biology or Physics', 'One other science subject'] },
  {
    course_id: 'electrical-installation',
    olevel_requirements: 'Technical colleges usually admit students after junior secondary school (BECE). This is not a UTME course.',
    utme_subjects: [],
    extra: 'Entry rules are set by each technical college and state. Polytechnic ND programmes in electrical engineering use UTME.',
  },
]

export const admissions: AdmissionRequirement[] = [
  ...general.map(
    (g): AdmissionRequirement => ({
      id: `adm-general-${g.course_id}`,
      course_id: g.course_id,
      institution_id: null,
      admission_cycle: null,
      olevel_requirements: g.olevel_requirements,
      utme_subjects: g.utme_subjects,
      direct_entry: g.direct_entry ?? null,
      notes: g.extra ? `${g.extra} ${GENERAL_NOTE}` : GENERAL_NOTE,
      verification_status: 'unverified',
      source_id: null,
      last_verified_at: null,
    }),
  ),
  // Demonstration records for the fictional institution.
  {
    id: 'adm-sample-cs',
    course_id: 'computer-science',
    institution_id: 'sample-university',
    admission_cycle: '2026/2027 (sample)',
    olevel_requirements: 'SAMPLE: Five credits including English Language, Mathematics and Physics.',
    utme_subjects: ['Use of English', 'Mathematics', 'Physics', 'Chemistry'],
    direct_entry: null,
    notes: 'Fictional demonstration record. It shows how an institution-specific requirement will look once verified data is added.',
    verification_status: 'sample',
    source_id: null,
    last_verified_at: null,
  },
  {
    id: 'adm-sample-law',
    course_id: 'law',
    institution_id: 'sample-university',
    admission_cycle: null,
    olevel_requirements: null,
    utme_subjects: [],
    direct_entry: null,
    notes: 'Fictional demonstration record with missing details, showing the “Verification required” state.',
    verification_status: 'sample',
    source_id: null,
    last_verified_at: null,
  },
]
