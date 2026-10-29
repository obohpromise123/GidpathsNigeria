import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AuthProvider } from './auth/AuthProvider'
import { CatalogProvider } from './data/CatalogProvider'
import { JourneyProvider } from './features/JourneyProvider'
import { routes } from './router'

// Key user journeys, rendered with the real routes in demo mode.

function renderApp(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <AuthProvider>
      <CatalogProvider>
        <JourneyProvider>
          <RouterProvider router={router} />
        </JourneyProvider>
      </CatalogProvider>
    </AuthProvider>,
  )
  return router
}

beforeEach(() => sessionStorage.clear())

describe('public pages', () => {
  it('shows the landing page with calls to action and a demo-mode banner', async () => {
    renderApp('/')
    expect(await screen.findByRole('heading', { level: 1, name: /Find out where your interests/ })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Discover your path/ }).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Explore courses' })).toHaveAttribute('href', '/courses')
    expect(screen.getByText(/Demo mode:/)).toBeInTheDocument()
  })

  it('searches courses from the URL', async () => {
    renderApp('/courses?q=nursing')
    expect(await screen.findByText((_, el) => el?.textContent === 'Showing 1 course')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nursing Science' })).toBeInTheDocument()
  })

  it('shows an empty state when no course matches', async () => {
    renderApp('/courses?q=zzzz')
    expect(await screen.findByText('No courses match those filters')).toBeInTheDocument()
  })

  it('labels admission information that has not been verified', async () => {
    renderApp('/courses/medicine')
    expect(await screen.findByRole('heading', { level: 1, name: 'Medicine and Surgery' })).toBeInTheDocument()
    expect(screen.getAllByText('Verification required').length).toBeGreaterThan(0)
  })

  it('shows a friendly page for unknown courses', async () => {
    renderApp('/courses/does-not-exist')
    expect(await screen.findByText('We couldn’t find that page')).toBeInTheDocument()
  })

  it('asks students to start before showing results', async () => {
    renderApp('/results')
    expect(await screen.findByText('No results yet')).toBeInTheDocument()
  })
})

describe('student journey', () => {
  it('goes from onboarding through the quiz to a roadmap', async () => {
    const user = userEvent.setup()
    renderApp('/start')

    await user.click(await screen.findByRole('button', { name: 'SS 2' }))
    expect(screen.getByRole('button', { name: 'SS 2' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Science' }))
    await user.click(screen.getByRole('button', { name: /^Next/ }))
    await user.click(await screen.findByRole('button', { name: 'Biology' }))
    await user.click(screen.getByRole('button', { name: /^Next/ }))
    await user.click(screen.getByRole('button', { name: 'Skip this step' }))
    await user.click(await screen.findByRole('button', { name: /Start the interest quiz/ }))

    // Answer every question with its first option.
    for (let i = 0; i < 16; i++) {
      const radios = await screen.findAllByRole('radio')
      await user.click(radios[0])
      const next = screen.getByRole('button', { name: /^(Next|See my results)/ })
      await user.click(next)
    }

    expect(await screen.findByRole('heading', { name: 'Career areas you might enjoy exploring' })).toBeInTheDocument()
    expect(screen.getAllByText('Why this was suggested').length).toBeGreaterThanOrEqual(3)
    expect(screen.getByText('These are ideas to explore, not a final answer')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /See my roadmap/ }))
    expect(await screen.findByRole('heading', { name: 'Your plan for exploring what’s next' })).toBeInTheDocument()
    expect(screen.getByText('Your roadmap is not saved online')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Print or save as PDF/ })).toBeInTheDocument()
  })

  it('lets students go back and change an answer', async () => {
    const user = userEvent.setup()
    renderApp('/quiz')
    const first = await screen.findAllByRole('radio')
    await user.click(first[0])
    await user.click(screen.getByRole('button', { name: /^Next/ }))
    expect(screen.getByText('Question 2 of 16')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Back/ }))
    const again = screen.getAllByRole('radio')
    expect(again[0]).toBeChecked()
    await user.click(again[1])
    expect(again[1]).toBeChecked()
  })
})

describe('school enquiry', () => {
  it('validates the form, then clearly says demo submissions are not sent', async () => {
    const user = userEvent.setup()
    renderApp('/schools')
    const submit = await screen.findByRole('button', { name: 'Request a school demonstration' })
    await user.click(submit)
    expect(await screen.findByText('Enter the school’s name')).toBeInTheDocument()
    expect(screen.getByText(/Please agree/)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/School name/), 'Bright Future College')
    await user.type(screen.getByLabelText(/Your name/), 'Ngozi Eze')
    await user.type(screen.getByLabelText(/Your role/), 'Principal')
    await user.type(screen.getByLabelText(/Work email/), 'principal@example.com')
    await user.selectOptions(screen.getByLabelText(/^State/), 'Lagos')
    await user.click(screen.getByRole('checkbox'))
    await user.click(submit)
    expect(await screen.findByText('Demo mode: your enquiry was not sent')).toBeInTheDocument()
  })
})

describe('protected areas', () => {
  it('sends signed-out visitors from the admin dashboard to sign in', async () => {
    const router = renderApp('/admin')
    expect(await screen.findByRole('heading', { name: 'Staff sign in' })).toBeInTheDocument()
    expect(router.state.location.search).toBe('?next=%2Fadmin')
  })

  it('sends signed-out visitors from the school dashboard to sign in', async () => {
    renderApp('/school')
    expect(await screen.findByRole('heading', { name: 'Staff sign in' })).toBeInTheDocument()
  })

  it('denies the admin dashboard to school staff', async () => {
    const user = userEvent.setup()
    const router = renderApp('/sign-in')
    await user.click(await screen.findByRole('button', { name: /demo guidance counsellor/ }))
    await router.navigate('/admin')
    expect(await screen.findByText('You don’t have access to this page')).toBeInTheDocument()
  })

  it('lets a demo admin manage courses with validation', async () => {
    const user = userEvent.setup()
    renderApp('/sign-in?next=/admin/courses')
    await user.click(await screen.findByRole('button', { name: /demo platform administrator/ }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Courses' })).toBeInTheDocument()
    expect(screen.getByText('Computer Science')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Add course/ }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Create course' }))
    expect(await within(dialog).findByText('Course name is required')).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText(/Course name/), 'Marine Biology')
    await user.selectOptions(within(dialog).getByLabelText(/Career area/), 'agriculture')
    await user.type(within(dialog).getByLabelText(/One-line summary/), 'Studying life in seas and rivers.')
    await user.type(within(dialog).getByLabelText(/Plain-language description/), 'A course about ocean and freshwater life.')
    await user.click(within(dialog).getByRole('button', { name: 'Create course' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(await screen.findByText(/Saved “Marine Biology”/)).toBeInTheDocument()
  })

  it('explains that password setup is unavailable in demo mode', async () => {
    renderApp('/account/password')
    expect(await screen.findByText(/isn’t available in demo mode/)).toBeInTheDocument()
  })

  it('shows the demo school dashboard with privacy-protected totals', async () => {
    const user = userEvent.setup()
    const router = renderApp('/sign-in')
    await user.click(await screen.findByRole('button', { name: /demo school administrator/ }))
    await router.navigate('/school')
    expect(await screen.findByRole('heading', { name: 'Demo Secondary School (sample)' })).toBeInTheDocument()
    expect(screen.getByText('DEMO2026')).toBeInTheDocument()
    expect(screen.getByText(/cannot see any individual student’s answers/)).toBeInTheDocument()
  })
})
