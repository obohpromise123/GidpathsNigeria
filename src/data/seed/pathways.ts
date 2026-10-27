import type { SubjectPathway } from '../types.ts'

// General educational explanations. Subject lists describe what is *common*,
// not what any particular school or exam body requires.
export const pathways: SubjectPathway[] = [
  {
    id: 'science',
    name: 'Science',
    summary: 'For students curious about how nature, the human body and machines work.',
    overview:
      'The Science pathway usually focuses on Mathematics and the natural sciences. It is the common route into health, engineering, computing and many agriculture and laboratory courses, because those courses often ask for Physics, Chemistry and Biology.',
    subjects: [
      'Mathematics',
      'English Language',
      'Physics',
      'Chemistry',
      'Biology',
      'Further Mathematics',
      'Agricultural Science',
      'Digital Technology (ICT)',
      'Technical Drawing',
      'Geography',
    ],
    skills: ['Problem solving', 'Careful observation', 'Working with numbers', 'Doing experiments safely'],
    interests: ['logic', 'life', 'tech', 'build', 'nature'],
    limitations:
      'Science courses often need strong results in three or more science subjects plus Mathematics. If you drop Physics or Chemistry early, some health and engineering courses may become harder to enter.',
    alternatives:
      'Science students can also study business, social science and some arts courses if they add the right subjects (for example Economics or Literature). Polytechnic ND programmes and technical colleges offer practical science routes.',
    sort_order: 1,
  },
  {
    id: 'arts',
    name: 'Arts & Humanities',
    summary: 'For students who enjoy language, literature, history, beliefs, culture and creative expression.',
    overview:
      'The Arts pathway builds reading, writing and thinking skills. It is a common route into law, languages, media, theatre, history, religious studies and teaching.',
    subjects: [
      'English Language',
      'Mathematics',
      'Literature in English',
      'Government',
      'History',
      'Christian Religious Studies / Islamic Studies',
      'Nigerian languages (e.g. Yoruba, Igbo, Hausa)',
      'French',
      'Fine Arts',
      'Music',
      'Civic Education',
    ],
    skills: ['Clear writing', 'Public speaking', 'Critical reading', 'Understanding people and culture'],
    interests: ['communicate', 'people', 'creative'],
    limitations:
      'Most science, health and engineering degrees are not open to students without the required science subjects. Many institutions still require a credit in Mathematics, even for arts courses.',
    alternatives:
      'Arts students can move into social sciences, education, media and creative industries. Some business courses accept arts students who also have Economics or Mathematics credits.',
    sort_order: 2,
  },
  {
    id: 'commercial',
    name: 'Commercial & Business Studies',
    summary: 'For students interested in money, trade, business and how organisations are run.',
    overview:
      'The Commercial pathway focuses on Economics, accounting, commerce and business. It leads naturally into accounting, banking, business administration, marketing and economics.',
    subjects: [
      'English Language',
      'Mathematics',
      'Economics',
      'Financial Accounting',
      'Commerce',
      'Office Practice',
      'Marketing',
      'Government',
      'Geography',
      'Data Processing',
    ],
    skills: ['Working with numbers', 'Organising information', 'Negotiation', 'Understanding markets'],
    interests: ['organise', 'logic', 'people'],
    limitations:
      'Commercial subjects alone usually do not qualify you for science, health or engineering courses. Strong Mathematics is important for accounting, banking and economics.',
    alternatives:
      'Commercial students can study many social science courses, some technology-related business courses, and entrepreneurship programmes. Professional bodies offer routes into accounting outside university.',
    sort_order: 3,
  },
  {
    id: 'social-sciences',
    name: 'Social Sciences',
    summary: 'For students who want to understand people, communities, government and the economy.',
    overview:
      'Social science courses study how people behave and how societies are organised. In many schools these subjects sit inside the Arts or Commercial classes rather than being a separate class. Courses include Economics, Political Science, Psychology, Sociology and Geography.',
    subjects: ['English Language', 'Mathematics', 'Economics', 'Government', 'Geography', 'Civic Education', 'History', 'Biology'],
    skills: ['Research', 'Analysing information', 'Debate and discussion', 'Understanding different viewpoints'],
    interests: ['people', 'communicate', 'logic', 'organise'],
    limitations:
      'Subject requirements vary a lot between social science courses. For example, Economics often needs Mathematics, while Psychology may ask for Biology at some institutions.',
    alternatives:
      'Students from Science, Arts and Commercial classes can all reach social science courses with the right subject combination.',
    sort_order: 4,
  },
  {
    id: 'technical',
    name: 'Technical & Vocational Studies',
    summary: 'For students who like practical, hands-on skills and making or fixing things.',
    overview:
      'Technical and vocational studies teach practical trades and technologies, such as electrical installation, building, automobile work, catering, fashion and computing. They are offered at technical colleges and in many secondary schools, and they can lead to polytechnic programmes, apprenticeships or self-employment.',
    subjects: [
      'English Language',
      'Mathematics',
      'Basic Technology',
      'Technical Drawing',
      'Physics',
      'Electrical Installation',
      'Building Construction',
      'Garment Making',
      'Catering Craft',
      'Digital Technology (ICT)',
    ],
    skills: ['Working safely with tools', 'Following technical drawings', 'Fault finding', 'Practical creativity'],
    interests: ['practical', 'build', 'tech', 'creative'],
    limitations:
      'Some university degrees expect academic science subjects in addition to technical subjects. Check whether your trade subjects are accepted for the course you want.',
    alternatives:
      'Technical students can continue to polytechnic ND and HND programmes, enter direct apprenticeships, or move to university through recognised routes. Trade certificates are offered by bodies such as NABTEB.',
    sort_order: 5,
  },
]
