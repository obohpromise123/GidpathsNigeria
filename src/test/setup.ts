import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

// Unmount rendered components between tests (not automatic without vitest globals).
afterEach(cleanup)

// Lazily loaded pages (admin, school) can take over the 1s default to appear
// when the machine is busy; wait up to 5s before failing a findBy* query.
configure({ asyncUtilTimeout: 5000 })

// jsdom does not implement scrolling; the app calls it on navigation.
if (typeof window !== 'undefined') {
  window.scrollTo = () => {}
}
