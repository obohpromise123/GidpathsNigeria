import type { CareerCategory } from '../types.ts'

export const categories: CareerCategory[] = [
  {
    id: 'technology',
    name: 'Technology & Data',
    description: 'Building software, working with computers and networks, and using data to answer questions.',
    interests: ['tech', 'logic'],
    sort_order: 1,
  },
  {
    id: 'health',
    name: 'Health & Life Sciences',
    description: 'Caring for people’s health and studying living things, medicines and disease.',
    interests: ['life', 'people', 'logic'],
    sort_order: 2,
  },
  {
    id: 'engineering',
    name: 'Engineering & the Built Environment',
    description: 'Designing, building and maintaining roads, buildings, machines, power and property.',
    interests: ['build', 'logic', 'practical'],
    sort_order: 3,
  },
  {
    id: 'business',
    name: 'Business, Finance & Enterprise',
    description: 'Managing money, running organisations, starting businesses and understanding the economy.',
    interests: ['organise', 'logic', 'people'],
    sort_order: 4,
  },
  {
    id: 'law-society',
    name: 'Law, Government & Society',
    description: 'Understanding laws, rights, government and how society works, and helping it work better.',
    interests: ['people', 'communicate', 'organise'],
    sort_order: 5,
  },
  {
    id: 'media',
    name: 'Media, Writing & Communication',
    description: 'Telling stories, sharing information and creating content for newspapers, radio, TV and online.',
    interests: ['communicate', 'creative', 'tech'],
    sort_order: 6,
  },
  {
    id: 'education-care',
    name: 'Education & Social Care',
    description: 'Teaching, guiding and supporting children, families and communities.',
    interests: ['people', 'communicate'],
    sort_order: 7,
  },
  {
    id: 'agriculture',
    name: 'Agriculture, Food & Environment',
    description: 'Growing food, caring for animals and land, processing food safely and protecting the environment.',
    interests: ['nature', 'life', 'practical'],
    sort_order: 8,
  },
  {
    id: 'creative',
    name: 'Creative Arts & Design',
    description: 'Art, fashion, film, performance and design that people can see, wear and experience.',
    interests: ['creative', 'build', 'communicate'],
    sort_order: 9,
  },
  {
    id: 'technical',
    name: 'Technical & Vocational Trades',
    description: 'Skilled hands-on work such as electrical installation, laboratory work and other practical trades.',
    interests: ['practical', 'build', 'tech'],
    sort_order: 10,
  },
]
