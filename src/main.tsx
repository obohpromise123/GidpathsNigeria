import '@fontsource-variable/plus-jakarta-sans'
import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { AuthProvider } from './auth/AuthProvider'
import { CatalogProvider } from './data/CatalogProvider'
import { JourneyProvider } from './features/JourneyProvider'
import { createRouter } from './router'

const router = createRouter()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CatalogProvider>
        <JourneyProvider>
          <RouterProvider router={router} />
        </JourneyProvider>
      </CatalogProvider>
    </AuthProvider>
  </StrictMode>,
)
