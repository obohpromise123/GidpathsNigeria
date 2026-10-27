import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Unmount rendered components between tests (not automatic without vitest globals).
afterEach(cleanup)

// jsdom does not implement scrolling; the app calls it on navigation.
if (typeof window !== 'undefined') {
  window.scrollTo = () => {}
}
