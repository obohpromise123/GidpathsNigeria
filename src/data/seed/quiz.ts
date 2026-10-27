import type { DimensionId, QuizOption, QuizQuestion } from '../types.ts'

// The career-interest quiz. It is an exploratory tool, not a validated
// psychometric test. Two kinds of question:
//  - likert: "How much do you enjoy …?" — one interest area each
//  - choice: pick the option closest to you — options point to different areas

const likert: { id: string; dimension: DimensionId; prompt: string; helper: string }[] = [
  { id: 'q-logic', dimension: 'logic', prompt: 'How much do you enjoy solving maths puzzles or logic problems?', helper: 'For example: number puzzles, chess, working out the answer step by step.' },
  { id: 'q-life', dimension: 'life', prompt: 'How much do you enjoy learning about the human body, health or living things?', helper: 'For example: how the heart works, why people fall sick, how plants grow.' },
  { id: 'q-build', dimension: 'build', prompt: 'How much do you enjoy building, designing or improving how things work?', helper: 'For example: making models, designing a room, figuring out how a bridge stands.' },
  { id: 'q-communicate', dimension: 'communicate', prompt: 'How much do you enjoy writing, speaking or creating content?', helper: 'For example: essays, debates, stories, presenting, making videos.' },
  { id: 'q-people', dimension: 'people', prompt: 'How much do you enjoy helping people and understanding how society works?', helper: 'For example: helping a friend with a problem, learning about rights and government.' },
  { id: 'q-organise', dimension: 'organise', prompt: 'How much do you enjoy organising activities or managing money?', helper: 'For example: planning an event, keeping records, selling things, budgeting.' },
  { id: 'q-tech', dimension: 'tech', prompt: 'How much do you enjoy working with computers and technology?', helper: 'For example: using apps, coding, setting up a phone or computer for someone.' },
  { id: 'q-nature', dimension: 'nature', prompt: 'How much do you enjoy working with plants, animals or the environment?', helper: 'For example: gardening, caring for animals, learning about weather and climate.' },
  { id: 'q-creative', dimension: 'creative', prompt: 'How much do you enjoy art, fashion, music or design?', helper: 'For example: drawing, styling outfits, making music, acting.' },
  { id: 'q-practical', dimension: 'practical', prompt: 'How much do you enjoy practical, hands-on work with tools?', helper: 'For example: fixing things, sewing, cooking, wiring a simple circuit.' },
]

const likertScale = [
  { key: 'love', label: 'I really enjoy this', points: 3, is_unsure: false },
  { key: 'like', label: 'I enjoy this a bit', points: 2, is_unsure: false },
  { key: 'unsure', label: 'I’m not sure yet', points: 0, is_unsure: true },
  { key: 'no', label: 'Not really', points: 0, is_unsure: false },
]

type Choice = { id: string; prompt: string; helper: string | null; options: { label: string; weights: Partial<Record<DimensionId, number>> }[] }

const choices: Choice[] = [
  {
    id: 'q-event',
    prompt: 'Your class is planning an end-of-term event. Which job would you pick?',
    helper: null,
    options: [
      { label: 'Plan the budget, schedule and who does what', weights: { organise: 2, logic: 1 } },
      { label: 'Design the posters, decorations or outfits', weights: { creative: 2, build: 1 } },
      { label: 'Set up the sound system, lights and projector', weights: { tech: 2, practical: 1 } },
      { label: 'Host the programme and make announcements', weights: { communicate: 2, people: 1 } },
      { label: 'Run the first-aid table and look after guests', weights: { life: 1, people: 2 } },
    ],
  },
  {
    id: 'q-club',
    prompt: 'Which school club sounds the most fun to you?',
    helper: null,
    options: [
      { label: 'Coding or robotics club', weights: { tech: 2, build: 1 } },
      { label: 'Press club or debate society', weights: { communicate: 2, people: 1 } },
      { label: 'JETS or science club', weights: { logic: 1, life: 1, build: 1 } },
      { label: 'Young Farmers Club', weights: { nature: 2, practical: 1 } },
      { label: 'Art, music or drama club', weights: { creative: 2, communicate: 1 } },
      { label: 'Entrepreneurship or business club', weights: { organise: 2, people: 1 } },
    ],
  },
  {
    id: 'q-documentary',
    prompt: 'Which documentary would you most like to watch?',
    helper: null,
    options: [
      { label: 'How the human body fights disease', weights: { life: 2, logic: 1 } },
      { label: 'How a huge bridge or skyscraper was built', weights: { build: 2, practical: 1 } },
      { label: 'How a young Nigerian built a successful business', weights: { organise: 2, people: 1 } },
      { label: 'How farmers are adapting to climate change', weights: { nature: 2, life: 1 } },
      { label: 'A famous court case about people’s rights', weights: { people: 2, communicate: 1 } },
      { label: 'Behind the scenes of a hit film or fashion show', weights: { creative: 2, communicate: 1 } },
    ],
  },
  {
    id: 'q-broken',
    prompt: 'Something at home stops working. What are you most likely to do?',
    helper: null,
    options: [
      { label: 'Open it up carefully and try to fix it', weights: { practical: 2, build: 1 } },
      { label: 'Search online to understand how it works', weights: { tech: 1, logic: 2 } },
      { label: 'Compare the cost of repairing it with buying a new one', weights: { organise: 2, logic: 1 } },
      { label: 'Call someone who can help and explain the problem clearly', weights: { communicate: 1, people: 1 } },
    ],
  },
  {
    id: 'q-proud',
    prompt: 'Which of these would you be proudest to have made?',
    helper: null,
    options: [
      { label: 'An app that helps students study', weights: { tech: 2, logic: 1 } },
      { label: 'A healthy farm or garden that feeds people', weights: { nature: 2, practical: 1 } },
      { label: 'The design for a beautiful new building', weights: { build: 2, creative: 1 } },
      { label: 'A story, song or video that many people love', weights: { creative: 1, communicate: 2 } },
      { label: 'A shop or business that employs people', weights: { organise: 2, people: 1 } },
      { label: 'A clinic or project that helps sick people recover', weights: { life: 2, people: 1 } },
    ],
  },
  {
    id: 'q-help',
    prompt: 'A friend is having a hard time. How do you most like to help?',
    helper: null,
    options: [
      { label: 'Listen and talk it through with them', weights: { people: 2, communicate: 1 } },
      { label: 'Help them make a clear plan', weights: { organise: 2, logic: 1 } },
      { label: 'Find accurate information that could help', weights: { logic: 1, tech: 1 } },
      { label: 'Make or fix something for them', weights: { practical: 1, creative: 1 } },
    ],
  },
]

const UNSURE_LABEL = 'I’m not sure / none of these'

export const quizQuestions: QuizQuestion[] = []
export const quizOptions: QuizOption[] = []

// Interleave the two kinds so the quiz feels varied.
const order: (string | Choice)[] = []
likert.forEach((q, i) => {
  order.push(q.id)
  if (i % 2 === 1 && choices[(i - 1) / 2]) order.push(choices[(i - 1) / 2])
})
choices.slice(5).forEach((c) => order.push(c))

order.forEach((item, index) => {
  const sort_order = index + 1
  if (typeof item === 'string') {
    const q = likert.find((l) => l.id === item)!
    quizQuestions.push({ id: q.id, prompt: q.prompt, helper: q.helper, kind: 'likert', sort_order, active: true })
    likertScale.forEach((s, i) =>
      quizOptions.push({
        id: `${q.id}-${s.key}`,
        question_id: q.id,
        label: s.label,
        weights: s.points > 0 ? { [q.dimension]: s.points } : {},
        is_unsure: s.is_unsure,
        sort_order: i + 1,
      }),
    )
  } else {
    quizQuestions.push({ id: item.id, prompt: item.prompt, helper: item.helper, kind: 'choice', sort_order, active: true })
    item.options.forEach((o, i) =>
      quizOptions.push({ id: `${item.id}-${i + 1}`, question_id: item.id, label: o.label, weights: o.weights, is_unsure: false, sort_order: i + 1 }),
    )
    quizOptions.push({ id: `${item.id}-unsure`, question_id: item.id, label: UNSURE_LABEL, weights: {}, is_unsure: true, sort_order: item.options.length + 1 })
  }
})
