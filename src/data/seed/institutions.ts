import type { EducationalSource, Institution, InstitutionProgramme } from '../types.ts'

// Official bodies used as references. Homepages were confirmed reachable on
// 2026-10-23, but NO admission data has been taken from them yet, so
// accessed_at stays empty until an administrator records a real check.
export const sources: EducationalSource[] = [
  {
    id: 'jamb-ibass',
    title: 'JAMB Integrated Brochure and Syllabus System (IBASS)',
    publisher: 'Joint Admissions and Matriculation Board (JAMB)',
    url: 'https://ibass.jamb.gov.ng',
    source_type: 'official_jamb',
    accessed_at: null,
    notes: 'Primary reference for UTME subject combinations and O’Level requirements per institution and programme.',
  },
  {
    id: 'jamb',
    title: 'JAMB official website',
    publisher: 'Joint Admissions and Matriculation Board (JAMB)',
    url: 'https://www.jamb.gov.ng',
    source_type: 'official_jamb',
    accessed_at: null,
    notes: 'UTME registration, policies and announcements.',
  },
  {
    id: 'nuc',
    title: 'National Universities Commission',
    publisher: 'National Universities Commission (NUC)',
    url: 'https://www.nuc.edu.ng',
    source_type: 'official_regulator',
    accessed_at: null,
    notes: 'Lists of approved universities and accredited programmes.',
  },
  {
    id: 'nbte',
    title: 'National Board for Technical Education',
    publisher: 'National Board for Technical Education (NBTE)',
    url: 'https://web.nbte.gov.ng',
    source_type: 'official_regulator',
    accessed_at: null,
    notes: 'Regulator for polytechnics, monotechnics and technical colleges.',
  },
  {
    id: 'ncce',
    title: 'National Commission for Colleges of Education',
    publisher: 'National Commission for Colleges of Education (NCCE)',
    url: 'https://www.ncce.gov.ng',
    source_type: 'official_regulator',
    accessed_at: null,
    notes: 'Regulator for colleges of education and the NCE.',
  },
  {
    id: 'waec',
    title: 'West African Examinations Council (Nigeria)',
    publisher: 'WAEC Nigeria',
    url: 'https://www.waecnigeria.org',
    source_type: 'other',
    accessed_at: null,
    notes: 'WASSCE examination body.',
  },
  {
    id: 'neco',
    title: 'National Examinations Council',
    publisher: 'NECO',
    url: 'https://www.neco.gov.ng',
    source_type: 'other',
    accessed_at: null,
    notes: 'SSCE examination body.',
  },
  {
    id: 'nabteb',
    title: 'National Business and Technical Examinations Board',
    publisher: 'NABTEB',
    url: 'https://nabteb.gov.ng',
    source_type: 'other',
    accessed_at: null,
    notes: 'Technical and business certificate examinations.',
  },
]

const UNCHECKED = 'Name, type, ownership and website have not yet been checked against the NUC/NBTE/NCCE lists by an administrator.'

export const institutions: Institution[] = [
  { id: 'unilag', name: 'University of Lagos', short_name: 'UNILAG', type: 'university', ownership: 'federal', state: 'Lagos', website: 'https://unilag.edu.ng', verification_status: 'unverified', source_id: null, last_verified_at: null, notes: UNCHECKED },
  { id: 'ui', name: 'University of Ibadan', short_name: 'UI', type: 'university', ownership: 'federal', state: 'Oyo', website: 'https://www.ui.edu.ng', verification_status: 'unverified', source_id: null, last_verified_at: null, notes: UNCHECKED },
  { id: 'abu', name: 'Ahmadu Bello University, Zaria', short_name: 'ABU', type: 'university', ownership: 'federal', state: 'Kaduna', website: 'https://abu.edu.ng', verification_status: 'unverified', source_id: null, last_verified_at: null, notes: UNCHECKED },
  { id: 'unn', name: 'University of Nigeria, Nsukka', short_name: 'UNN', type: 'university', ownership: 'federal', state: 'Enugu', website: 'https://www.unn.edu.ng', verification_status: 'unverified', source_id: null, last_verified_at: null, notes: UNCHECKED },
  { id: 'oau', name: 'Obafemi Awolowo University', short_name: 'OAU', type: 'university', ownership: 'federal', state: 'Osun', website: 'https://oauife.edu.ng', verification_status: 'unverified', source_id: null, last_verified_at: null, notes: UNCHECKED },
  { id: 'lasu', name: 'Lagos State University', short_name: 'LASU', type: 'university', ownership: 'state', state: 'Lagos', website: 'https://lasu.edu.ng', verification_status: 'unverified', source_id: null, last_verified_at: null, notes: UNCHECKED },
  { id: 'yabatech', name: 'Yaba College of Technology', short_name: 'YABATECH', type: 'polytechnic', ownership: 'federal', state: 'Lagos', website: 'https://yabatech.edu.ng', verification_status: 'unverified', source_id: null, last_verified_at: null, notes: UNCHECKED },
  { id: 'kadpoly', name: 'Kaduna Polytechnic', short_name: 'KADPOLY', type: 'polytechnic', ownership: 'federal', state: 'Kaduna', website: 'https://kadunapolytechnic.edu.ng', verification_status: 'unverified', source_id: null, last_verified_at: null, notes: UNCHECKED },
  {
    id: 'sample-university',
    name: 'Sample University (demonstration only)',
    short_name: 'SAMPLE',
    type: 'university',
    ownership: 'other',
    state: null,
    website: null,
    verification_status: 'sample',
    source_id: null,
    last_verified_at: null,
    notes: 'A fictional institution used only to demonstrate how institution-specific records are displayed. It does not exist.',
  },
]

// Only the fictional institution has programmes. Real offerings must be
// added by an administrator after checking IBASS or the institution itself.
export const programmes: InstitutionProgramme[] = [
  { id: 'prog-sample-cs', institution_id: 'sample-university', course_id: 'computer-science', award: 'B.Sc.', verification_status: 'sample', source_id: null, last_verified_at: null, notes: 'Demonstration record.' },
  { id: 'prog-sample-acc', institution_id: 'sample-university', course_id: 'accounting', award: 'B.Sc.', verification_status: 'sample', source_id: null, last_verified_at: null, notes: 'Demonstration record.' },
  { id: 'prog-sample-law', institution_id: 'sample-university', course_id: 'law', award: 'LL.B.', verification_status: 'sample', source_id: null, last_verified_at: null, notes: 'Demonstration record.' },
]
